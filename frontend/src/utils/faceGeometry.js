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

  let process = ["Logic v6: Two-Stage Absolute Classifier"];
  
  // 1. STAGE 1: CLUSTER ASSIGNMENT
  // Thresholds calibrated for MediaPipe drift
  const isNarrow = rf < 0.785 || jawAngle < 145;
  const clusterShapes = isNarrow ? ["Oblong", "Oval"] : ["Heart", "Round", "Square"];
  
  process.push(`Cluster: ${isNarrow ? "NARROW" : "WIDE"} (rf=${rf.toFixed(3)}, angle=${jawAngle.toFixed(1)})`);

  // 2. STAGE 2: WITHIN-CLUSTER CLASSIFICATION
  let scores = {};
  clusterShapes.forEach(shape => {
    const centroid = SHAPE_CENTROIDS[shape];
    const c_rjf = centroid.rj / centroid.rf;
    const normCentroid = {
      ratioL: normalize(centroid.ratioL, ranges.ratioL),
      rf: normalize(centroid.rf, ranges.rf),
      rj: normalize(centroid.rj, ranges.rj),
      rjf: normalize(c_rjf, ranges.rjf),
      angle: normalize(centroid.angle, ranges.angle)
    };

    // Equal weighting within the cluster to allow subtle features (like length) to speak
    const weights = { ratioL: 4, rf: 1, rj: 1, rjf: 1, angle: 2 };

    const dist = Math.sqrt(
      weights.ratioL * Math.pow(target.ratioL - normCentroid.ratioL, 2) +
      weights.rf * Math.pow(target.rf - normCentroid.rf, 2) +
      weights.rj * Math.pow(target.rj - normCentroid.rj, 2) +
      weights.rjf * Math.pow(target.rjf - normCentroid.rjf, 2) +
      weights.angle * Math.pow(target.angle - normCentroid.angle, 2)
    );
    scores[shape] = dist;
  });

  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  let [firstMatch, firstDist] = sorted[0];
  let secondMatch = sorted[1] ? sorted[1][0] : firstMatch;
  let secondDist = sorted[1] ? sorted[1][1] : firstDist;

  // 3. HYBRID LOGIC (Only within cluster)
  let finalShape = `[v6] ${firstMatch}`;
  if (secondMatch !== firstMatch && secondDist < firstDist * 1.5) {
    finalShape = `[v6] ${firstMatch} / ${secondMatch}`;
    process.push("Hybrid match within cluster");
  }

  return { shape: finalShape, process, ratioL, rf, rj, rjf, jawAngle, scores };
};
