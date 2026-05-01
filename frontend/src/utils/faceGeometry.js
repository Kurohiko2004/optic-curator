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
 * Logic v5: Rank-Based Voting (De-biased)
 */
export const categorizeFaceShape = (L, Wf, Wc, Wj, angleLeft, angleRight) => {
  if (Wc === 0) return { shape: "Unknown", process: [] };
  
  const ratioL = L / Wc; 
  const rf = Wf / Wc;    
  const rj = Wj / Wc;    
  const rjf = rj / rf;
  const jawAngle = (angleLeft + angleRight) / 2;

  let process = ["Logic v5: Rank-Based Voting"];
  let votes = {};
  Object.keys(SHAPE_CENTROIDS).forEach(s => votes[s] = 0);

  const features = {
    ratioL: ratioL,
    rf: rf,
    rj: rj,
    angle: jawAngle,
    rjf: rjf
  };

  const weights = {
    ratioL: 1,
    rf: 2,
    rj: 3,
    angle: 4,
    rjf: 4
  };

  let process = ["Logic v7: Angle-Prioritized Scoring"];
  let scores = {};
  Object.keys(SHAPE_CENTROIDS).forEach(s => scores[s] = 0);

  // 1. FEATURE SIGNATURES (Hard-hitting bonuses based on your identified differentiator)
  // Feature A: Jaw Angle (Primary Differentiator)
  if (jawAngle < 139) {
    scores.Oblong += 25; scores.Oval += 25;
    process.push("Signature: Sharp jawline => OBLONG/OVAL bonus");
  } else if (jawAngle < 142) {
    scores.Heart += 15; scores.Square += 15;
    process.push("Signature: Medium jawline => HEART/SQUARE bonus");
  } else if (jawAngle > 145) {
    scores.Round += 20;
    process.push("Signature: Soft jawline => ROUND bonus");
  }

  // Feature B: Jaw Ratio (rj)
  if (rj < 0.81) {
    scores.Oblong += 15; scores.Oval += 15;
    process.push("Signature: Narrow jaw => OBLONG/OVAL bonus");
  } else if (rj > 0.84) {
    scores.Round += 10; scores.Square += 10;
  }

  // Feature C: Length Ratio (ratioL)
  if (ratioL > 1.19) {
    scores.Round += 10; scores.Oblong += 10;
  } else if (ratioL < 1.17) {
    scores.Oval += 15; scores.Heart += 10;
  }

  // Feature D: Jaw-to-Forehead Ratio (rjf)
  if (rjf < 1.075) {
    scores.Heart += 20;
    process.push("Signature: Heart structure (Low J/F)");
  }

  // 2. TIE-BREAKER: EUCLIDEAN DISTANCE (as a small adjustment)
  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    const c_rjf = centroid.rj / centroid.rf;
    const dist = Math.sqrt(
      Math.pow(ratioL - centroid.ratioL, 2) * 10 +
      Math.pow(rf - centroid.rf, 2) * 10 +
      Math.pow(rj - centroid.rj, 2) * 20 +
      Math.pow(jawAngle - centroid.angle, 2) * 0.5 // Lower weight for raw distance on angle
    );
    scores[shape] -= dist; // Penalty based on distance
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let [firstMatch, firstScore] = sorted[0];
  let [secondMatch, secondScore] = sorted[1];

  // 3. HYBRID LOGIC
  let finalShape = firstMatch;
  if (firstScore - secondScore < 10) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: High score proximity`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, rjf, jawAngle, scores };
};
