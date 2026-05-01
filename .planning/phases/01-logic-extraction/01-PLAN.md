# Plan - Phase 1: Logic Extraction

## Summary
Extract core face detection and testing logic from `FaceDetectPage.jsx` into modular utilities and custom hooks.

- **Wave 1**: Utility extraction (`src/utils/faceGeometry.js`).
- **Wave 2**: Hook extraction (`src/hooks/useFaceTracking.js`, `src/hooks/useBatchTester.js`).

---

## Wave 1: Utility Extraction

### Task 1: Create Face Geometry Utility
Extract constants and pure functions related to face shape classification.
- **Files modified**: `src/utils/faceGeometry.js`
- **Read first**: `src/pages/FaceDetectPage.jsx`
- **Action**: 
  - Create `src/utils/faceGeometry.js`.
  - Copy `TRACKED_IDS` and `isApproxEqual`.
  - Copy `categorizeFaceShape` function.
  - Export all items.
- **Acceptance criteria**:
  - `src/utils/faceGeometry.js` contains `export const TRACKED_IDS`.
  - `src/utils/faceGeometry.js` contains `export const categorizeFaceShape`.
  - The logic matches the original file exactly.

---

## Wave 2: Hook Extraction

### Task 2: Create useFaceTracking Hook
Extract MindAR and Three.js management logic.
- **Files modified**: `src/hooks/useFaceTracking.js`
- **Read first**: `src/pages/FaceDetectPage.jsx`, `src/utils/faceGeometry.js`
- **Action**:
  - Create `src/hooks/useFaceTracking.js`.
  - Implement a hook that takes a `containerRef`.
  - Move `startAR`, `stopAR`, and the animation loop logic.
  - Use `categorizeFaceShape` from the new utility.
  - Expose `isActive`, `setIsActive`, `measurements`, `predictedShape`, and `anchorDotsRef`.
  - Ensure proper cleanup of Three.js objects and MindAR instances.
- **Acceptance criteria**:
  - `src/hooks/useFaceTracking.js` exports `default useFaceTracking`.
  - Hook manages its own state for `isActive` and `measurements`.
  - `stopAR` logic is called on unmount.

### Task 3: Create useBatchTester Hook
Extract MediaPipe batch testing logic.
- **Files modified**: `src/hooks/useBatchTester.js`
- **Read first**: `src/pages/FaceDetectPage.jsx`, `src/utils/faceGeometry.js`
- **Action**:
  - Create `src/hooks/useBatchTester.js`.
  - Move `loadMediaPipeScript` and `handleBatchTest` logic.
  - Use `categorizeFaceShape` from the new utility.
  - Expose `testResults`, `isTesting`, `testProgress`, `testStats`, and `runTest`.
  - Ensure `URL.revokeObjectURL` is used for memory safety.
- **Acceptance criteria**:
  - `src/hooks/useBatchTester.js` exports `default useBatchTester`.
  - `runTest` function accepts a list of files.
  - `testStats` are calculated correctly within the hook.

---

## Verification

### must_haves
- [ ] `src/utils/faceGeometry.js` exists and is exported.
- [ ] `src/hooks/useFaceTracking.js` exists and manages AR lifecycle.
- [ ] `src/hooks/useBatchTester.js` exists and manages MediaPipe logic.
- [ ] No regression in logic (functions are identical to original).
