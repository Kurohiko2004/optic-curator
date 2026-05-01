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

  // 1. RANK-BASED VOTING
  // For each feature, rank shapes by proximity and award points (5, 4, 3, 2, 1)
  Object.entries(features).forEach(([featName, targetVal]) => {
    const list = Object.entries(SHAPE_CENTROIDS).map(([shape, centroid]) => {
      let cVal = centroid[featName];
      if (featName === "rjf") cVal = centroid.rj / centroid.rf;
      return { shape, dist: Math.abs(targetVal - cVal) };
    });

    // Sort by distance (closest first)
    list.sort((a, b) => a.dist - b.dist);

    // Award points based on rank
    const points = [5, 4, 3, 2, 1];
    list.forEach((item, index) => {
      votes[item.shape] += points[index] * (weights[featName] || 1);
    });
  });

  // 2. HARD-SIGNATURE PENALTIES (PDF & Empirical)
  if (jawAngle < 140) {
    votes.Round -= 15; // Oblong/Oval/Square zone
    process.push("Penalty: Angle too sharp for Round");
  }
  if (rf < 0.75) {
    votes.Round -= 10; votes.Square -= 10;
    process.push("Penalty: Narrow forehead favors Oval/Oblong");
  }
  if (rjf < 1.075) {
    votes.Heart += 10;
    process.push("Bonus: Heart signature (Low J/F)");
  }

  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  let [firstMatch, firstScore] = sorted[0];
  let [secondMatch, secondScore] = sorted[1];

  // 3. HYBRID LOGIC
  let finalShape = firstMatch;
  // If scores are within 10% of the max possible score (approx 70-80), it's a hybrid
  if (firstScore - secondScore < 8) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: High score proximity (${firstScore} vs ${secondScore})`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, rjf, jawAngle, scores: votes };
};
