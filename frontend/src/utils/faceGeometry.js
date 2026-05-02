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
// Centroids from Colab Stress Test
const SHAPE_CENTROIDS = {
  Heart: { ratioL: 1.183, rf: 0.859, rj: 0.931, angle: 97.3 },
  Oblong: { ratioL: 1.260, rf: 0.846, rj: 0.938, angle: 93.6 },
  Oval: { ratioL: 1.184, rf: 0.850, rj: 0.932, angle: 99.6 },
  Round: { ratioL: 1.137, rf: 0.841, rj: 0.938, angle: 105.0 },
  Square: { ratioL: 1.150, rf: 0.839, rj: 0.951, angle: 107.5 },
};

// Feature Ranges for Normalization
const RANGES = {
  ratioL: { min: 1.050, max: 1.400 },
  rf: { min: 0.800, max: 0.920 },
  rj: { min: 0.870, max: 1.000 },
  angle: { min: 80.0, max: 125.0 }
};

/**
 * Categorize face shape based on biological proportions and geometric measurements.
 */
export const categorizeFaceShape = (L, Wf, Wc, Wj, angleLeft, angleRight) => {
  if (Wc === 0) return { shape: "Unknown", process: [] };

  const ratioL = L / Wc;
  const rf = Wf / Wc;
  const rj = Wj / Wc;
  const rjf = rj / rf;
  // Jaw angle: computed at chin apex (152) between vectors to jaw points 58 and 288
  // This matches the Colab stress test method producing angles in 93-107° range
  const jawAngle = (angleLeft + angleRight) / 2;

  const normalize = (val, range) => (val - range.min) / (range.max - range.min);

  const target = {
    ratioL: normalize(ratioL, RANGES.ratioL),
    rf: normalize(rf, RANGES.rf),
    rj: normalize(rj, RANGES.rj),
    rjf: normalize(rjf, { min: 1.050, max: 1.120 }),
    angle: normalize(jawAngle, RANGES.angle)
  };

  let process = ["Logic v4: Ratio-of-Ratios & De-biasing"];

  // 1. STATISTICAL DISTANCE (Standardized)
  let scores = {};
  Object.entries(SHAPE_CENTROIDS).forEach(([shape, centroid]) => {
    const c_rjf = centroid.rj / centroid.rf;
    const normCentroid = {
      ratioL: normalize(centroid.ratioL, RANGES.ratioL),
      rf: normalize(centroid.rf, RANGES.rf),
      rj: normalize(centroid.rj, RANGES.rj),
      rjf: normalize(c_rjf, { min: 1.050, max: 1.120 }),
      angle: normalize(centroid.angle, RANGES.angle)
    };

    // Weights: ratioL is most critical (Colab ablation), rjf least reliable → drop to 1
    const weights = { ratioL: 10, rf: 4, rj: 4, rjf: 1, angle: 6 };

    const dist = Math.sqrt(
      weights.ratioL * Math.pow(target.ratioL - normCentroid.ratioL, 2) +
      weights.rf * Math.pow(target.rf - normCentroid.rf, 2) +
      weights.rj * Math.pow(target.rj - normCentroid.rj, 2) +
      weights.rjf * Math.pow(target.rjf - normCentroid.rjf, 2) +
      weights.angle * Math.pow(target.angle - normCentroid.angle, 2)
    );
    scores[shape] = dist;
  });

  // Debug: Log statistical distances before prioritization
  const distLog = Object.entries(scores).sort((a, b) => a[1] - b[1]).map(([s, d]) => `${s}:${d.toFixed(3)}`).join(', ');
  process.push(`Debug: Raw Math Distances: ${distLog}`);

  // Bonuses disabled — export new measurements.json after batch test then run node diagnose.mjs

  // 3. STATISTICAL RANKING (Re-evaluating with bonuses)
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  let [firstMatch, firstDist] = sorted[0];
  let [secondMatch, secondDist] = sorted[1];

  // 4. HYBRID LOGIC
  let finalShape = firstMatch;
  const hybridFactor = 1.3;
  if (secondDist < firstDist * hybridFactor && firstMatch !== secondMatch) {
    finalShape = `${firstMatch} / ${secondMatch}`;
    process.push(`Hybrid: Proximity match (${firstMatch} & ${secondMatch})`);
  }

  return { shape: finalShape, process, ratioL, rf, rj, rjf, jawAngle, scores };
};

export const getRecommendedGlassesShapes = (faceShape) => {
    const getBaseRecs = (shape) => {
        const s = shape.trim().toLowerCase();
        switch (s) {
            case "round":
                return { ids: [3, 5, 6], names: ["Wayfarer", "Geometric", "Square"] };
            case "square":
                return { ids: [1, 2, 4], names: ["Aviator", "Round", "Cat Eye"] };
            case "oval":
                return { ids: [1, 3, 5], names: ["Aviator", "Wayfarer", "Geometric"] };
            case "heart":
                return { ids: [1, 2], names: ["Aviator", "Round"] };
            case "oblong":
                return { ids: [3, 6], names: ["Wayfarer", "Square"] };
            default:
                return { ids: [], names: [] };
        }
    };

    if (faceShape.includes(' / ')) {
        const parts = faceShape.split(' / ');
        return parts.map(p => ({
            title: `Fit ${p.trim()} faces`,
            recs: getBaseRecs(p)
        }));
    }

    return [{
        title: `Fit ${faceShape.trim()} faces`,
        recs: getBaseRecs(faceShape)
    }];
};
