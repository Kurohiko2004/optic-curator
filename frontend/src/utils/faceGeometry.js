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
  Heart: { ratioL: 1.175, rf: 0.771, rj: 0.827 },
  Oblong: { ratioL: 1.188, rf: 0.731, rj: 0.797 },
  Oval: { ratioL: 1.160, rf: 0.738, rj: 0.798 },
  Round: { ratioL: 1.205, rf: 0.786, rj: 0.856 },
  Square: { ratioL: 1.182, rf: 0.761, rj: 0.838 },
  // Pear is distinct enough to keep a rule, or we can add a centroid if we have data
  // For now, Pear is usually Wj > Wc && Wj > Wf
};

/**
 * Categorize face shape based on biological proportions and geometric measurements.
 * 
 * @param {number} L - Vertical length from hairline to chin
 * @param {number} Wf - Forehead width
 * @param {number} Wc - Cheekbone width (baseline)
 * @param {number} Wj - Jawline width
 * @param {number} angleLeft - Left jaw angle in degrees
 * @param {number} angleRight - Right jaw angle in degrees
 * @returns {object} { shape, process, ratioL, rf, rj, jawAngle }
 */
export const categorizeFaceShape = (L, Wf, Wc, Wj, angleLeft, angleRight) => {
  if (Wc === 0) return { shape: "Unknown", process: [] };
  
  const ratioL = L / Wc; 
  const rf = Wf / Wc;    
  const rj = Wj / Wc;    
  const jawAngle = (angleLeft + angleRight) / 2;

  let primary = "Oval";
  let process = [];

  // 1. PEAR CHECK (Geometric Absolute - remains a hard rule as it's structurally unique)
  if (Wj > Wc && Wj > Wf) {
    return { shape: "Pear", process: ["Jaw is widest point => PEAR"], ratioL, rf, rj, jawAngle };
  } 

  // 2. NEAREST NEIGHBOR CLASSIFICATION
  // We calculate the Euclidean distance to each shape centroid.
  // We weight 'rj' and 'rf' higher than 'ratioL' as vertical length is more sensitive to head tilt.
  const weights = { ratioL: 1.0, rf: 1.5, rj: 2.0 };
  
  let minDistance = Infinity;
  let bestMatch = "Unknown";
  let scores = {};

  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    const dist = Math.sqrt(
      weights.ratioL * Math.pow(ratioL - centroid.ratioL, 2) +
      weights.rf * Math.pow(rf - centroid.rf, 2) +
      weights.rj * Math.pow(rj - centroid.rj, 2)
    );
    scores[shape] = dist;
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = shape;
    }
  });

  primary = bestMatch;
  process.push(`Nearest Centroid: ${bestMatch} (dist: ${minDistance.toFixed(4)})`);
  
  // Optional: Fine-tuning for Square vs Round based on Jaw Angle
  if (primary === "Square" && jawAngle > 128) {
    primary = "Round";
    process.push(`Soft jaw angle (${jawAngle.toFixed(1)}°) shifted Square to ROUND`);
  } else if (primary === "Round" && jawAngle < 120) {
    primary = "Square";
    process.push(`Sharp jaw angle (${jawAngle.toFixed(1)}°) shifted Round to SQUARE`);
  }

  return { shape: primary, process, ratioL, rf, rj, jawAngle, scores };
};
