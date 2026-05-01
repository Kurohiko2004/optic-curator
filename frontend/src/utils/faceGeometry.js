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
  const jawAngle = (angleLeft + angleRight) / 2;

  const normalize = (val, range) => (val - range.min) / (range.max - range.min);
  const target = {
    ratioL: normalize(ratioL, RANGES.ratioL),
    rf: normalize(rf, RANGES.rf),
    rj: normalize(rj, RANGES.rj),
    angle: normalize(jawAngle, RANGES.angle)
  };

  let process = [];
  let votes = {};
  Object.keys(SHAPE_CENTROIDS).forEach(s => votes[s] = 0);

  // 1. SIGNATURE VOTING SYSTEM (Refined from PDF Logic)
  // Feature A: Jaw Width (rj)
  if (rj > 0.84) votes.Round += 4;
  else if (rj > 0.825) votes.Square += 4;
  else if (rj < 0.81) { votes.Oval += 3; votes.Oblong += 3; }
  if (rj < 0.80) votes.Heart += 2;

  // Feature B: Jaw Angle
  if (jawAngle > 146) votes.Round += 5;
  else if (jawAngle < 140) { votes.Oblong += 4; votes.Oval += 4; }
  else if (jawAngle < 143) votes.Square += 5;

  // Feature C: Length Ratio (ratioL)
  if (ratioL > 1.20) votes.Round += 3;
  else if (ratioL < 1.17) votes.Oval += 4;
  else if (ratioL > 1.185) votes.Oblong += 3;

  // Feature D: Forehead (rf)
  if (rf > 0.775) votes.Heart += 4; // Heart signature: Wide forehead
  if (rf > 0.78) votes.Round += 2;
  if (rf < 0.74) { votes.Oblong += 3; votes.Oval += 3; }

  // 2. TIE-BREAKER VIA NORMALIZED EUCLIDEAN DISTANCE
  let scores = {};
  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    const normCentroid = {
      ratioL: normalize(centroid.ratioL, RANGES.ratioL),
      rf: normalize(centroid.rf, RANGES.rf),
      rj: normalize(centroid.rj, RANGES.rj),
      angle: normalize(centroid.angle, RANGES.angle)
    };
    const dist = Math.sqrt(
      Math.pow(target.ratioL - normCentroid.ratioL, 2) +
      Math.pow(target.rf - normCentroid.rf, 2) +
      Math.pow(target.rj - normCentroid.rj, 2) +
      Math.pow(target.angle - normCentroid.angle, 2)
    );
    // Distance acts as a "penalty" to the votes. Multiplier increased for more sensitivity.
    scores[shape] = votes[shape] - (dist * 4);
  });

  // 3. POST-PROCESSING RULES (from Page 75 of PDF)
  // Rule: If Oval and Round are close, check ratioL
  if (scores.Oval > scores.Round - 1 && ratioL < 1.17) {
    scores.Oval += 2;
    process.push("PDF Rule: Small ratioL favors Oval over Round");
  }
  // Rule: If Oblong and Square are close, check jawAngle
  if (scores.Oblong > scores.Square - 1 && jawAngle < 140) {
    scores.Oblong += 2;
    process.push("PDF Rule: Sharp angle favors Oblong over Square");
  }
  // Rule: Heart signature (Wide forehead + Narrow jaw)
  if (rf > 0.77 && rj < 0.83) {
    scores.Heart += 3;
    process.push("PDF Rule: Wide forehead + Narrow jaw signature => HEART bonus");
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let [firstMatch, firstScore] = sorted[0];
  let [secondMatch, secondScore] = sorted[1];

  // 4. HYBRID LOGIC
  let finalShape = firstMatch;
  if (Math.abs(firstScore - secondScore) < 1.2) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: Scores are close (${firstScore.toFixed(1)} vs ${secondScore.toFixed(1)})`);
  } else {
    process.push(`Primary Match: ${firstMatch}`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, jawAngle, scores };
};
