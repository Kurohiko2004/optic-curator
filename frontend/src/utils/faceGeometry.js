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

  // 1. CLUSTER SPLIT (Based on Jaw Angle - the strongest differentiator)
  const isNarrowCluster = jawAngle < 140.5;
  const clusterShapes = isNarrowCluster ? ["Oblong", "Oval"] : ["Heart", "Square", "Round"];
  
  process.push(`Cluster: ${isNarrowCluster ? "NARROW/LONG" : "WIDE/ANGULAR"} (Angle: ${jawAngle.toFixed(1)}°)`);

  // 2. RANK-BASED VOTING (Within Cluster)
  Object.entries(features).forEach(([featName, targetVal]) => {
    const list = Object.entries(SHAPE_CENTROIDS)
      .filter(([shape]) => clusterShapes.includes(shape)) // ONLY vote for cluster shapes
      .map(([shape, centroid]) => {
        let cVal = centroid[featName];
        if (featName === "rjf") cVal = centroid.rj / centroid.rf;
        return { shape, dist: Math.abs(targetVal - cVal) };
      });

    list.sort((a, b) => a.dist - b.dist);

    // Award points based on rank within the cluster
    // (If 2 shapes: 5, 1. If 3 shapes: 5, 3, 1)
    const points = clusterShapes.length === 2 ? [5, 1] : [5, 3, 1];
    list.forEach((item, index) => {
      votes[item.shape] += points[index] * (weights[featName] || 1);
    });
  });

  // 3. CLUSTER-SPECIFIC REFINEMENT
  if (isNarrowCluster) {
    // Oblong vs Oval differentiator: Length
    if (ratioL > 1.175) votes.Oblong += 10; else votes.Oval += 10;
  } else {
    // Wide cluster differentiator: J/F Ratio for Heart
    if (rjf < 1.076) votes.Heart += 15;
    // Angle differentiator for Round vs Square
    if (jawAngle > 145) votes.Round += 10;
  }

  const sorted = Object.entries(votes)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
    
  let [firstMatch, firstScore] = sorted[0] || ["Unknown", 0];
  let [secondMatch, secondScore] = sorted[1] || [firstMatch, 0];

  // 4. HYBRID LOGIC
  let finalShape = firstMatch;
  const threshold = isNarrowCluster ? 5 : 10; // Tighter for narrow cluster
  if (firstScore - secondScore < threshold && firstMatch !== secondMatch) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: Proximity within cluster`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, rjf, jawAngle, scores: votes };
};
