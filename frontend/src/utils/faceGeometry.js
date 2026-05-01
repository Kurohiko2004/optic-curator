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

  // 1. NARROW-FIRST PRIORITIZATION (v6)
  // If the face shows ANY narrow/sharp characteristics, we investigate Oblong/Oval first.
  const narrowSignatures = [
    rj < 0.825,    // Narrow Jaw
    rf < 0.775,    // Narrow Forehead
    jawAngle < 144 // Sharp/Moderate Angle
  ];
  
  const isPotentiallyNarrow = narrowSignatures.filter(Boolean).length >= 1;

  if (isPotentiallyNarrow) {
    process.push("Priority: Investigating NARROW shapes (Oblong/Oval) first");
    
    // Narrow Sub-Classifier: Compare only Oblong vs Oval
    const oblongDist = Math.sqrt(Math.pow(ratioL - SHAPE_CENTROIDS.Oblong.ratioL, 2) + Math.pow(jawAngle - SHAPE_CENTROIDS.Oblong.angle, 2) * 0.1);
    const ovalDist = Math.sqrt(Math.pow(ratioL - SHAPE_CENTROIDS.Oval.ratioL, 2) + Math.pow(jawAngle - SHAPE_CENTROIDS.Oval.angle, 2) * 0.1);
    
    if (oblongDist < ovalDist + 0.01) {
      scores.Oblong = 0.001; // High weight win
      scores.Oval = 0.01;
    } else {
      scores.Oval = 0.001;
      scores.Oblong = 0.01;
    }
    
    // Penalize Wide Shapes heavily to ensure Narrow wins
    scores.Round = 100;
    scores.Square = 100;
    scores.Heart = (rj < 0.81) ? 100 : scores.Heart * 2; // Keep Heart as a fallback only if jaw is wide enough
  } else {
    process.push("Priority: Investigating WIDE shapes (Round/Square/Heart)");
    scores.Oblong = 100;
    scores.Oval = 100;
    
    // Standard Wide logic
    if (jawAngle < 145) {
      scores.Round *= 3;
      process.push("Wide Logic: Angle penalizes Round");
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  let [firstMatch, firstDist] = sorted[0];
  let [secondMatch, secondDist] = sorted[1];

  // 4. SIGNATURE OVERRIDES (Specific to Heart)
  if (rjf < 1.076 && rj > 0.81 && !isPotentiallyNarrow) {
    process.push(`Override: Heart signature detected`);
    if (secondMatch === "Heart") [firstMatch, secondMatch] = [secondMatch, firstMatch];
  }

  // 5. HYBRID LOGIC
  let finalShape = firstMatch;
  const hybridFactor = isPotentiallyNarrow ? 1.8 : 1.3;
  if (secondDist < firstDist * hybridFactor && firstMatch !== secondMatch) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: Proximity match (${firstMatch} & ${secondMatch})`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, rjf, jawAngle, scores };
};
