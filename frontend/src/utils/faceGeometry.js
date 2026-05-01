/**
 * PTIT-VR Face Geometry Utilities
 * Extracted from FaceDetectPage.jsx
 */

export const TRACKED_IDS = [10, 152, 234, 454, 132, 361, 54, 284, 58, 288];

/**
 * Helper to determine if two values are approximately equal 
 * (within 12% for natural facial variations)
 */
export const isApproxEqual = (a, b) => Math.abs(a - b) / Math.max(a, b) < 0.12;

// Dataset Averages (Centroids) for each shape based on empirical testing results
const SHAPE_CENTROIDS = {
  Heart:  { ratioL: 1.175, rf: 0.771, rj: 0.827, angle: 141.7 },
  Oblong: { ratioL: 1.188, rf: 0.731, rj: 0.797, angle: 136.8 },
  Oval:   { ratioL: 1.160, rf: 0.738, rj: 0.798, angle: 137.0 },
  Round:  { ratioL: 1.205, rf: 0.786, rj: 0.856, angle: 146.8 },
  Square: { ratioL: 1.182, rf: 0.761, rj: 0.838, angle: 142.8 },
};

// Feature Ranges for Normalization
const RANGES = {
  ratioL: { min: 1.150, max: 1.210 },
  rf:     { min: 0.720, max: 0.790 },
  rj:     { min: 0.790, max: 0.860 },
  angle:  { min: 135.0, max: 148.0 }
};

/**
 * Categorize face shape based on biological proportions and geometric measurements.
 */
export const categorizeFaceShape = (L, Wf, Wc, Wj, angleLeft, angleRight) => {
  if (Wc === 0) return { shape: "Unknown", process: [] };
  
  const ratioL = L / Wc; 
  const rf = Wf / Wc;    
  const rj = Wj / Wc;    
  const rjf = rj / rf; // Ratio of Jaw to Forehead - key differentiator for this dataset
  const jawAngle = (angleLeft + angleRight) / 2;

  const normalize = (val, range) => (val - range.min) / (range.max - range.min);
  
  // Custom ranges including rjf
  const ranges = {
    ratioL: { min: 1.150, max: 1.210 },
    rf:     { min: 0.720, max: 0.790 },
    rj:     { min: 0.790, max: 0.860 },
    rjf:    { min: 1.050, max: 1.120 },
    angle:  { min: 135.0, max: 148.0 }
  };

  const target = {
    ratioL: normalize(ratioL, ranges.ratioL),
    rf: normalize(rf, ranges.rf),
    rj: normalize(rj, ranges.rj),
    rjf: normalize(rjf, ranges.rjf),
    angle: normalize(jawAngle, ranges.angle)
  };

  let process = ["Logic v4: Ratio-of-Ratios & De-biasing"];
  
  // 1. STATISTICAL DISTANCE (Standardized)
  let scores = {};
  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    const c_rjf = centroid.rj / centroid.rf;
    const normCentroid = {
      ratioL: normalize(centroid.ratioL, ranges.ratioL),
      rf: normalize(centroid.rf, ranges.rf),
      rj: normalize(centroid.rj, ranges.rj),
      rjf: normalize(c_rjf, ranges.rjf),
      angle: normalize(centroid.angle, ranges.angle)
    };

    // Feature Weights - prioritizing rjf and angle
    const weights = { ratioL: 1, rf: 2, rj: 2, rjf: 6, angle: 6 };

    const dist = Math.sqrt(
      weights.ratioL * Math.pow(target.ratioL - normCentroid.ratioL, 2) +
      weights.rf * Math.pow(target.rf - normCentroid.rf, 2) +
      weights.rj * Math.pow(target.rj - normCentroid.rj, 2) +
      weights.rjf * Math.pow(target.rjf - normCentroid.rjf, 2) +
      weights.angle * Math.pow(target.angle - normCentroid.angle, 2)
    );
    scores[shape] = dist;
  });

  // 2. CLUSTER FILTERING (Narrow/Long vs. Wide/Round)
  // Logic: First-pass forehead check, then sharp-angle safety net.
  const isNarrowForehead = rf < 0.75;
  const isSharpAngle = jawAngle < 140;

  if (isNarrowForehead || isSharpAngle) {
    process.push(`Narrow Trigger: ${isNarrowForehead ? "Low Forehead" : "Sharp Angle"} restricts to OVAL/OBLONG`);
    // Scale distance penalty: isolate from Round/Square/Heart
    scores.Round *= 4;
    scores.Square *= 4;
    scores.Heart *= 3;
    
    // Within Narrow Cluster, Length and Angle provide the split
    if (ratioL > 1.175 || jawAngle < 138) {
      scores.Oblong *= 0.4; 
      process.push("Narrow Cluster: Features suggest OBLONG");
    } else {
      scores.Oval *= 0.4;
      process.push("Narrow Cluster: Features suggest OVAL");
    }
  } else {
    // 3. WIDE CLUSTER REFINEMENT (Heart/Square/Round)
    if (jawAngle < 143) {
      scores.Round *= 2;
      process.push("Wide Cluster: Sharp angle penalizes Round");
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  let [firstMatch, firstDist] = sorted[0];
  let [secondMatch, secondDist] = sorted[1];

  // 4. SIGNATURE OVERRIDES (Hard Rules from Dataset Patterns)
  // Low J/F ratio is unique to Heart
  if (rjf < 1.076 && rj > 0.81) {
    process.push(`Override: Low J/F ratio suggests HEART`);
    if (secondMatch === "Heart") [firstMatch, secondMatch] = [secondMatch, firstMatch];
  }

  // 5. HYBRID LOGIC
  let finalShape = firstMatch;
  const hybridFactor = (rf < 0.75) ? 1.6 : 1.3;
  if (secondDist < firstDist * hybridFactor && firstMatch !== secondMatch) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: Proximity match (${firstMatch} & ${secondMatch})`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, rjf, jawAngle, scores };
};
