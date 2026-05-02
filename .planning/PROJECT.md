# PTIT-VR

## Context
PTIT-VR is a platform likely involving Virtual Reality or Augmented Reality experiences, specifically focusing on face tracking and facial shape detection for eyewear or similar applications.

## Core Value
Provide accurate facial geometry analysis and AR visualization to enhance user experience in virtual try-on or character customization.

## Current Milestone: v1.2 AR Try-On UI Restructure
**Goal:** Redesign the AR Try-On modal to maximize the camera viewport by transitioning from a 3-column layout to a streamlined top/bottom overlay layout.

**Target features:**
- Move dev mode tools to a backup file to clean up the production UI.
- Implement a top panel for variant color selection.
- Implement a bottom panel for product details, diagnostics, and AR controls.
- Increase the main camera viewport width for a better user experience.

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

## Active Requirements
- [ ] **REF-01**: Split facial shape categorization logic into a separate utility file.
- [ ] **REF-02**: Move AR (MindAR/Three.js) initialization and management into a custom hook.
- [ ] **REF-03**: Move batch testing logic (MediaPipe) into a separate service or hook.
- [ ] **REF-04**: Clean up the main Page component to focus on UI composition.
- [ ] **TEST-01**: Ensure batch testing system is robust and handles large datasets without memory leaks.

## Key Decisions
- Initial project structure for GSD initialized on 2026-05-01.
