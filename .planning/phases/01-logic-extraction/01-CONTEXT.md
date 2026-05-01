# Phase 1: Logic Extraction - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase focuses on extracting the core logic from `FaceDetectPage.jsx` into modular, reusable units. No UI changes or component splits happen in this phase; only the logic migration and hook creation.

</domain>

<decisions>
## Implementation Decisions

### Utilities
- **Face Geometry**: Move `TRACKED_IDS`, `isApproxEqual`, and `categorizeFaceShape` to `src/utils/faceGeometry.js`.
- **Standards**: Use ESM exports. Ensure `categorizeFaceShape` remains pure and takes all necessary measurements as arguments.

### Custom Hooks
- **useFaceTracking**:
  - Encapsulate `MindARThree` instance, `scene`, `camera`, `renderer`.
  - Handle `startAR` and `stopAR` with proper cleanup in `useEffect`.
  - Expose state for measurements (L, Wf, Wc, Wj, angles) and the predicted shape.
  - Manage the animation loop and Three.js object updates (red dots, yellow dot).
- **useBatchTester**:
  - Encapsulate MediaPipe `FaceMesh` initialization.
  - Handle image processing loop.
  - Expose `testResults`, `isTesting`, `testProgress`, and `testStats`.
  - Use the logic from `src/utils/faceGeometry.js` to keep calculations consistent.

### the agent's Discretion
- Exact naming of internal variables in hooks.
- How to expose Three.js refs if needed (though preference is to keep them internal to the hook).
- Error handling strategies for camera access.

</decisions>

<canonical_refs>
## Canonical References

### Source Files
- `src/pages/FaceDetectPage.jsx` — The monolithic source of truth.

### Destination Files
- `src/utils/faceGeometry.js`
- `src/hooks/useFaceTracking.js`
- `src/hooks/useBatchTester.js`

</canonical_refs>

<specifics>
## Specific Ideas
- Ensure `useFaceTracking` correctly handles the "yellow dot" (estimated hairline) offset logic as it was recently improved in the monolithic file.
- `useBatchTester` should implement the memory-safe `URL.revokeObjectURL` pattern found in the current code.

</specifics>

<deferred>
## Deferred Ideas
- Splitting the UI components (Phase 2).
- Batch tester backend integration (Future).

</deferred>

---

*Phase: 01-logic-extraction*
*Context gathered: 2026-05-01*
