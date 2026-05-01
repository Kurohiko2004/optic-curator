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

/**
 * Categorize face shape based on biological proportions and geometric measurements.
 */
export const categorizeFaceShape = (L, Wf, Wc, Wj, angleLeft, angleRight) => {
  if (Wc === 0) return { shape: "Unknown", process: [] };
  
  const ratioL = L / Wc; 
  const rf = Wf / Wc;    
  const rj = Wj / Wc;    
  const jawAngle = (angleLeft + angleRight) / 2;

  let process = [];

  // 1. NEAREST NEIGHBOR CLASSIFICATION
  // For balanced faces (Square, Round, Oval, Oblong), we use weighted Euclidean distance.
  const weights = { 
    ratioL: 0.5,  // Vertical length (reduced as it's very similar across types)
    rf: 2.0,      // Forehead width
    rj: 3.0,      // Jaw width (highest differentiator)
    angle: 4.0    // Jaw angle (crucial for Square vs Round)
  };
  
  let scores = {};
  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    // Normalizing angle distance (range 135-147) by dividing by 20 to keep it in scale with ratios (0.7-1.2)
    const dist = Math.sqrt(
      weights.ratioL * Math.pow(ratioL - centroid.ratioL, 2) +
      weights.rf * Math.pow(rf - centroid.rf, 2) +
      weights.rj * Math.pow(rj - centroid.rj, 2) +
      weights.angle * Math.pow((jawAngle - centroid.angle) / 20, 2)
    );
    scores[shape] = dist;
  });

  // Sort to find the two closest matches
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  let [firstMatch, firstDist] = sorted[0];
  let [secondMatch, secondDist] = sorted[1];

  // 2. JAW ANGLE OVERRIDE (Breaking Round Bias)
  // Apply overrides to the matches if they are Round/Square
  const applyOverride = (match) => {
    if (match === "Round" && jawAngle < 144) return "Square";
    if (match === "Square" && jawAngle > 145) return "Round";
    return match;
  };

  firstMatch = applyOverride(firstMatch);
  secondMatch = applyOverride(secondMatch);

  // 3. HYBRID LOGIC
  // If the second best match is within 15% distance of the first, return as hybrid
  let finalShape = firstMatch;
  if (secondDist < firstDist * 1.15 && firstMatch !== secondMatch) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: ${firstMatch} & ${secondMatch} are statistically close`);
  } else {
    process.push(`Primary Match: ${firstMatch} (dist: ${firstDist.toFixed(4)})`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, jawAngle, scores };
};
