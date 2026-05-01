# Plan - Improve Face Classification

## Summary
Update jaw angle calculation anchors and brainstorm/implement improvements to the classification algorithm to resolve "Round" bias.

## Tasks
- [ ] **Task 1**: Update `TRACKED_IDS` in `src/utils/faceGeometry.js` (replace 150/379 with 58/288).
- [ ] **Task 2**: Update `useFaceTracking.js` and `useBatchTester.js` to use the new anchors for angle calculation.
- [ ] **Task 3**: Brainstorm and implement a centroid-based classification system using the provided dataset averages.

---

## Verification
- Jaw angle calculation uses points 58 and 288.
- Classification logic is updated and tested against the dataset averages.
