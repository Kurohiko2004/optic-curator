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

// Feature Ranges for Normalization (based on empirical dataset boundaries)
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
  const jawAngle = (angleLeft + angleRight) / 2;

  // Helper to normalize values between 0 and 1
  const normalize = (val, range) => (val - range.min) / (range.max - range.min);

  const normTarget = {
    ratioL: normalize(ratioL, RANGES.ratioL),
    rf: normalize(rf, RANGES.rf),
    rj: normalize(rj, RANGES.rj),
    angle: normalize(jawAngle, RANGES.angle)
  };

  let process = [];
  const weights = { 
    ratioL: 1.0, 
    rf: 2.5, 
    rj: 4.0, 
    angle: 5.0 
  };
  
  let scores = {};
  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    const normCentroid = {
      ratioL: normalize(centroid.ratioL, RANGES.ratioL),
      rf: normalize(centroid.rf, RANGES.rf),
      rj: normalize(centroid.rj, RANGES.rj),
      angle: normalize(centroid.angle, RANGES.angle)
    };

    const dist = Math.sqrt(
      weights.ratioL * Math.pow(normTarget.ratioL - normCentroid.ratioL, 2) +
      weights.rf * Math.pow(normTarget.rf - normCentroid.rf, 2) +
      weights.rj * Math.pow(normTarget.rj - normCentroid.rj, 2) +
      weights.angle * Math.pow(normTarget.angle - normCentroid.angle, 2)
    );
    scores[shape] = dist;
  });

  // Sort to find the two closest matches
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  let [firstMatch, firstDist] = sorted[0];
  let [secondMatch, secondDist] = sorted[1];

  // HYBRID LOGIC
  // If the second best match is very close to the first, return as hybrid
  // Since distances are now in normalized 0-1 space, a gap of 0.2 is significant.
  let finalShape = firstMatch;
  if (secondDist < firstDist + 0.15 && firstMatch !== secondMatch) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: ${firstMatch} & ${secondMatch} are close in normalized space`);
  } else {
    process.push(`Primary Match: ${firstMatch}`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, jawAngle, scores };
};
