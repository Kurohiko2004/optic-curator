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

// Dataset Averages (Centroids) for each shape based on empirical testing
const SHAPE_CENTROIDS = {
  Heart:  { ratioL: 1.175, rf: 0.771, rj: 0.827, angle: 125 }, // Angle guessed, will be tuned by batch tester
  Oblong: { ratioL: 1.188, rf: 0.731, rj: 0.797, angle: 124 },
  Oval:   { ratioL: 1.160, rf: 0.738, rj: 0.798, angle: 126 },
  Round:  { ratioL: 1.205, rf: 0.786, rj: 0.856, angle: 132 },
  Square: { ratioL: 1.182, rf: 0.761, rj: 0.838, angle: 118 },
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

  // 1. WIDTH HIERARCHY CHECK (Structural Coarse Filter)
  // These rules are based on the "Universal Face Shape Matrix" structural hierarchy
  
  // PEAR: Jaw is the absolute widest point
  if (Wj > Wc && Wj > Wf) {
    return { shape: "Pear", process: ["Hierarchy: Jaw is widest point => PEAR"], ratioL, rf, rj, jawAngle };
  } 

  // HEART: Forehead is the widest point
  if (Wf > Wc && Wf > Wj) {
    return { shape: "Heart", process: ["Hierarchy: Forehead is widest point => HEART"], ratioL, rf, rj, jawAngle };
  }

  // DIAMOND: Cheekbones are significantly wider than both Forehead and Jaw
  if (Wc > (Wf * 1.05) && Wc > (Wj * 1.05)) {
    return { shape: "Diamond", process: ["Hierarchy: Cheekbones are dominant => DIAMOND"], ratioL, rf, rj, jawAngle };
  }

  // 2. NEAREST NEIGHBOR CLASSIFICATION (Fine-tuning)
  // For balanced faces (Square, Round, Oval, Oblong), we use weighted Euclidean distance.
  const weights = { 
    ratioL: 1.0,  // Vertical length
    rf: 1.5,      // Forehead width
    rj: 2.5,      // Jaw width (highest priority for Round vs others)
    angle: 3.0    // Jaw angle (highest priority for Round vs Square)
  };
  
  let minDistance = Infinity;
  let bestMatch = "Unknown";
  let scores = {};

  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    // Normalizing angle distance by dividing by a factor (e.g. 10) to keep it in same scale as ratios
    const dist = Math.sqrt(
      weights.ratioL * Math.pow(ratioL - centroid.ratioL, 2) +
      weights.rf * Math.pow(rf - centroid.rf, 2) +
      weights.rj * Math.pow(rj - centroid.rj, 2) +
      weights.angle * Math.pow((jawAngle - centroid.angle) / 20, 2)
    );
    scores[shape] = dist;
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = shape;
    }
  });

  process.push(`Nearest Centroid: ${bestMatch} (dist: ${minDistance.toFixed(4)})`);
  
  // 3. FINAL JAW ANGLE OVERRIDE (Breaking Round Bias)
  // Even if ratios look Round, a sharp angle is structurally a Square.
  if (bestMatch === "Round" && jawAngle < 122) {
    bestMatch = "Square";
    process.push(`Sharp jaw angle (${jawAngle.toFixed(1)}°) override => SQUARE`);
  } else if (bestMatch === "Square" && jawAngle > 128) {
    bestMatch = "Round";
    process.push(`Soft jaw angle (${jawAngle.toFixed(1)}°) override => ROUND`);
  }

  return { shape: bestMatch, process, ratioL, rf, rj, jawAngle, scores };
};
