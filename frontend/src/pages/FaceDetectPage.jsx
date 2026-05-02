import React, { useState, useRef, useEffect } from 'react';
import './FaceDetectPage.css';

// Hooks
import useFaceTracking from '../hooks/useFaceTracking';
import useBatchTester from '../hooks/useBatchTester';

import BatchTesterSection from './FaceDetect/BatchTesterSection';
import RecommendedProducts from './FaceDetect/RecommendedProducts';
import Header from '../components/layout/Header';
import ARTryOnModal from './ARTryOnPage';

const FaceDetectPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const containerRef = useRef(null);
  
  // UI State
  const [showAnchors, setShowAnchors] = useState(true);
  const [showAllAnchors, setShowAllAnchors] = useState(false);
  const [arModal, setArModal] = useState({ isOpen: false, itemId: null });
  const [activeResult, setActiveResult] = useState({ shape: null, source: null });

  // AR Hook
  const {
    isActive,
    setIsActive,
    isDetecting,
    detectionStatus,
    startDetection,
    measurements,
    predictedShape,
    hoveredId,
    tooltipPos,
    cameraWarning
  } = useFaceTracking(containerRef, showAnchors, showAllAnchors);

  // Sync Live AR result to activeResult
  useEffect(() => {
    if (detectionStatus === 'completed' && predictedShape) {
      setActiveResult({ shape: predictedShape.shape, source: 'live' });
    }
  }, [detectionStatus, predictedShape]);

  // Batch Tester Hook
  const {
    testResults,
    isTesting,
    testProgress,
    testStats,
    runTest
  } = useBatchTester();

  // Sync Upload result to activeResult
  useEffect(() => {
    if (testResults.length > 0) {
      setActiveResult({ shape: testResults[0].predicted, source: 'upload' });
    }
  }, [testResults]);

  // Stop AR if testing starts
  const handleRunTest = (files) => {
    if (isActive) setIsActive(false);
    runTest(files);
  };

  const startTryOn = (itemId) => {
    if (isActive) setIsActive(false);
    setArModal({ isOpen: true, itemId });
  };

  const closeTryOn = () => {
    setArModal({ ...arModal, isOpen: false });
  };

  const getDetectionButtonText = () => {
    if (isDetecting) return 'Detecting... (20 Samples)';
    if (detectionStatus === 'completed') return 'Detect Completed. Retry?';
    return 'Start Face Detection';
  };

  return (
    <div className="face-detect-page">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        user={user}
        onLogout={onLogout}
      />
      
      <div className="detect-page-container" style={{ paddingTop: '100px' }}>
        <div className="header-controls">
        <button 
          className="toggle-btn"
          onClick={() => isDetecting ? null : startDetection()}
          style={{ 
            backgroundColor: isDetecting ? '#f59e0b' : (detectionStatus === 'completed' ? '#6366f1' : '#10b981'),
            cursor: isDetecting ? 'not-allowed' : 'pointer'
          }}
          disabled={isDetecting}
        >
          {getDetectionButtonText()}
        </button>

        {isActive && (
          <button 
            className="toggle-btn" 
            onClick={() => setIsActive(false)}
            style={{ backgroundColor: '#ef4444', marginLeft: '10px' }}
          >
            Turn off camera
          </button>
        )}

        {cameraWarning && (
          <span style={{ 
            color: '#ef4444', 
            marginLeft: '15px', 
            fontSize: '0.9rem', 
            fontWeight: 'bold',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '8px 12px',
            borderRadius: '6px'
          }}>
            ⚠️ {cameraWarning}
          </span>
        )}

        {/* Anchor display toggle hidden for UI cleanup */}
        {/* 
        <label className="toggle-label" style={{ marginLeft: '20px' }}>
          <input 
            type="checkbox" 
            checked={showAnchors}
            onChange={(e) => setShowAnchors(e.target.checked)}
            disabled={!isActive}
          />
          Show Tracked Anchors
        </label>
        */}
      </div>

      <div className="ar-container-wrapper">
        <div ref={containerRef} className="ar-container" />
        
        {detectionStatus === 'completed' && (
          <div className="detection-result-badge" style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(99, 102, 241, 0.95)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 100,
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Final Result</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{predictedShape.shape}</div>
          </div>
        )}

        {!isActive && !isTesting && (
          <div className="inactive-overlay">
            <div className="icon">📷</div>
            <h3>Camera Inactive</h3>
            <p>Press Start Face Detection to begin</p>
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

      <BatchTesterSection 
        isTesting={isTesting}
        testProgress={testProgress}
        testResults={testResults}
        testStats={testStats}
        onRunTest={handleRunTest}
      />

      <RecommendedProducts 
        faceShape={activeResult.shape} 
        onTryOnClick={startTryOn}
      />

      <ARTryOnModal
        isOpen={arModal.isOpen}
        onClose={closeTryOn}
        selectedItemId={arModal.itemId}
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
    </div>
  );
};

export default FaceDetectPage;
