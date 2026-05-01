# Roadmap - Milestone v1.1 Face Detection Refactor

## Summary
**3 phases** | **11 requirements mapped** | All covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Logic Extraction | Extract core logic into utilities and hooks | LOGIC-01, LOGIC-02, LOGIC-03, LOGIC-04 | ✓ |
| 2 | Component Modularization | Split UI into reusable components | UI-01, UI-02, UI-03, UI-04 | 4 |
| 3 | Integration & Validation | Connect everything and verify functionality | TEST-01, TEST-02, TEST-03 | 3 |

---

## Phase 1: Logic Extraction
**Goal:** Extract core logic into utilities and hooks.
**Requirements:** LOGIC-01, LOGIC-02, LOGIC-03, LOGIC-04
**Success criteria:**
1. `src/utils/faceGeometry.js` exists and contains the categorization logic.
2. `src/hooks/useFaceTracking.js` manages MindAR/Three.js lifecycle.
3. `src/hooks/useBatchTester.js` encapsulates MediaPipe logic.
4. All new files are exported and ready for consumption.

## Phase 2: Component Modularization
**Goal:** Split UI into reusable components.
**Requirements:** UI-01, UI-02, UI-03, UI-04
**Success criteria:**
1. `FaceMeshContainer` correctly renders the AR view.
2. `MeasurementLogs` displays real-time data from the hook.
3. `BatchTesterSection` provides the file input and results table.
4. `FaceDetectPage.jsx` is significantly reduced in size.

## Phase 3: Integration & Validation
**Goal:** Connect everything and verify functionality.
**Requirements:** TEST-01, TEST-02, TEST-03
**Success criteria:**
1. No memory leaks when starting/stopping AR multiple times.
2. Batch tester successfully processes a test folder.
3. UI remains responsive and visually identical to the original version.
