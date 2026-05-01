import React, { useState, useRef } from 'react';
import './FaceDetectPage.css';

// Hooks
import useFaceTracking from '../hooks/useFaceTracking';
import useBatchTester from '../hooks/useBatchTester';

// Components
import MeasurementLogs from './FaceDetect/MeasurementLogs';
import BatchTesterSection from './FaceDetect/BatchTesterSection';

const FaceDetectPage = () => {
  const containerRef = useRef(null);
  
  // UI State
  const [showAnchors, setShowAnchors] = useState(true);
  const [showAllAnchors, setShowAllAnchors] = useState(false);

  // AR Hook
  const {
    isActive,
    setIsActive,
    measurements,
    predictedShape,
    hoveredId,
    tooltipPos
  } = useFaceTracking(containerRef, showAnchors, showAllAnchors);

  // Batch Tester Hook
  const {
    testResults,
    isTesting,
    testProgress,
    testStats,
    runTest
  } = useBatchTester();

  // Stop AR if testing starts
  const handleRunTest = (files) => {
    if (isActive) setIsActive(false);
    runTest(files);
  };

  return (
    <div className="face-detect-page">
      <div className="header-controls">
        <button 
          className="toggle-btn"
          onClick={() => setIsActive(!isActive)}
          style={{ backgroundColor: isActive ? '#ef4444' : '#10b981' }}
        >
          {isActive ? 'Stop Face Tracking' : 'Start Face Tracking'}
        </button>

        <label className="toggle-label">
          <input 
            type="checkbox" 
            checked={showAnchors}
            onChange={(e) => setShowAnchors(e.target.checked)}
            disabled={!isActive}
          />
          Show Tracked Anchors (Red Dots)
        </label>

        <label className="toggle-label" style={{ marginLeft: '20px', color: '#f59e0b' }}>
          <input 
            type="checkbox" 
            checked={showAllAnchors}
            onChange={(e) => setShowAllAnchors(e.target.checked)}
            disabled={!isActive}
          />
          Show ALL 468 Dots (Debug)
        </label>
      </div>

      <div className="ar-container-wrapper">
        <div ref={containerRef} className="ar-container" />
        
        {!isActive && !isTesting && (
          <div className="inactive-overlay">
            <div className="icon">📷</div>
            <h3>Camera Inactive</h3>
            <p>Press Start Face Tracking to begin</p>
          </div>
        )}

        {isTesting && (
          <div className="inactive-overlay" style={{ background: 'rgba(15, 23, 42, 0.9)' }}>
            <div className="icon">🧪</div>
            <h3>Batch Testing in Progress</h3>
            <p>Processing dataset via MediaPipe...</p>
          </div>
        )}
      </div>

      {/* Logic Components */}
      <MeasurementLogs 
        measurements={measurements} 
        predictedShape={predictedShape} 
      />

      <BatchTesterSection 
        isTesting={isTesting}
        testProgress={testProgress}
        testResults={testResults}
        testStats={testStats}
        onRunTest={handleRunTest}
      />

      {/* Tooltip for AR Dots */}
      {hoveredId !== null && (
        <div 
          className="tooltip"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y + 15,
          }}
        >
          ID: {hoveredId}
        </div>
      )}
    </div>
  );
};

export default FaceDetectPage;
