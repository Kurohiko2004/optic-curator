# Milestone v1.1 Requirements - Face Detection Refactor

## 1. Logic Separation (LOGIC)
- [ ] **LOGIC-01**: Extract `categorizeFaceShape` and helper functions into `src/utils/faceGeometry.js`.
- [ ] **LOGIC-02**: Ensure utility functions are pure and well-documented.
- [ ] **LOGIC-03**: Create a custom hook `useFaceTracking` in `src/hooks/useFaceTracking.js` to manage MindAR and Three.js lifecycle.
- [ ] **LOGIC-04**: Create a custom hook `useBatchTester` in `src/hooks/useBatchTester.js` to handle MediaPipe logic and dataset processing.

## 2. Component Refactoring (UI)
- [ ] **UI-01**: Create a `FaceMeshContainer` component to wrap the AR canvas and overlay.
- [ ] **UI-02**: Create a `MeasurementLogs` component to display live data and ratios.
- [ ] **UI-03**: Create a `BatchTesterSection` component for the dataset testing UI.
- [ ] **UI-04**: Simplify `FaceDetectPage.jsx` to be a container that orchestrates these components.

## 3. Testing & Robustness (TEST)
- [ ] **TEST-01**: Implement proper cleanup in `useFaceTracking` to prevent memory leaks or multiple camera instances.
- [ ] **TEST-02**: Ensure the batch tester handles errors gracefully (e.g., no face detected in an image).
- [ ] **TEST-03**: Verify that the refactored system maintains the same accuracy and functionality as the original monolithic version.

## Future Requirements
- [ ] **FUTURE-01**: Integrate with a backend to save test results.
- [ ] **FUTURE-02**: Add support for real-time model tuning.

## Out of Scope
- Changing the actual facial shape classification algorithm (this is purely a refactor).
- Adding new facial features to track.

## Traceability
- **Phase 1**: LOGIC-01, LOGIC-02, LOGIC-03, LOGIC-04
- **Phase 2**: UI-01, UI-02, UI-03, UI-04
- **Phase 3**: TEST-01, TEST-02, TEST-03
