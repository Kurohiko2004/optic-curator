---
status: investigating
trigger: "Oval and Oblong face shapes never get predicted in faceGeometry.js"
symptoms:
  expected: "Oval and Oblong should be predicted for narrow face measurements."
  actual: "Only Heart, Round, and Square are predicted."
  timeline: "Persistent since latest logic update."
  reproduction: "Run face detection on narrow/elongated faces."
created: 2026-05-01
updated: 2026-05-01
---

# Current Focus
- **Hypothesis**: The use of 3D `distanceTo` in `useFaceTracking.js` (real-time) versus 2D math in the classification dataset/logic is causing measurements to consistently exceed the "Narrow" thresholds (`rj < 0.825`, `rf < 0.775`).
- **Next Action**: Modify `useFaceTracking.js` to use 2D projected distances for widths and lengths.
- **Reasoning**: 3D distances include depth (Z), which artificially inflates widths if the face is tilted or if the mesh depth is significant, pushing the ratios into the "Wide" category.

# Evidence
- [x] Logic analysis of `categorizeFaceShape` in `faceGeometry.js`.
- [x] Comparison of `useFaceTracking.js` (3D) vs `useBatchTester.js` (2D).

# Eliminated
- None yet.

# Resolution
- **Root Cause**: TBD
- **Fix**: TBD
- **Verification**: TBD
