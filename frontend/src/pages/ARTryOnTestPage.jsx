import React, { useState, useEffect, useRef } from 'react';
import { glassesItems } from '../data/shopData';
import ARFeature from '../components/ar/ARFeature';
import './ARTryOnPage.css';

const ARTryOnTestPage = () => {
  const selectedItemId = 1;
  const item = glassesItems.find(i => i.id === selectedItemId) || glassesItems[0];

  const colorVariants = [
    { name: 'Obsidian Black', hex: '#1a1a1a' },
    { name: 'Sapphire Blue', hex: '#1e40af' },
    { name: 'Rose Gold', hex: '#fb8500' },
    { name: 'Cyber Silver', hex: '#94a3b8' },
  ];

  // ── UI State ────────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState(colorVariants[0].hex);
  const [isARActive, setIsARActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [logs, setLogs] = useState([]);
  const [liveDistance, setLiveDistance] = useState(null); // cm string
  const [modelWidth, setModelWidth] = useState(null);     // Three.js units

  // ── Calibration State (passed to ARFeature) ─────────────────────────────────
  const [modelScale, setModelScale] = useState(6.0);        // fallback when autoFit is off
  const [autoFit, setAutoFit] = useState(true);             // uses FIT_RATIO=16.02 formula
  const [modelOffsetX, setModelOffsetX] = useState(0);
  const [modelOffsetY, setModelOffsetY] = useState(0.05);
  const [modelOffsetZ, setModelOffsetZ] = useState(0);
  const [autoStretch, setAutoStretch] = useState(false);
  const [modelStretchFactor, setModelStretchFactor] = useState(1.0);
  const [earAnchor1, setEarAnchor1] = useState(127);
  const [earAnchor2, setEarAnchor2] = useState(356);
  const [showAnchors, setShowAnchors] = useState(true);

  const streamRef = useRef(null);

  useEffect(() => {
    if (item) setSelectedColor(colorVariants.find(v => v.name === item.color)?.hex || colorVariants[0].hex);
  }, [selectedItemId]);

  const addLog = (msg) =>
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-20));

  // ── AR lifecycle callbacks ──────────────────────────────────────────────────
  const handleARToggle = () => {
    if (isARActive) {
      setIsARActive(false);
    } else {
      // Stop any existing webcam stream so MindAR can take over
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setIsARActive(true);
    }
  };

  const handleARStart = () => addLog('AR engine started');
  const handleARStop = () => {
    setIsARActive(false);
    setLiveDistance(null);
    setModelWidth(null);
    addLog('AR engine stopped');
  };

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Hover tooltip for anchor IDs */}
      <div id="ar-tooltip" style={{
        position: 'fixed', display: 'none', background: '#000', color: '#fff',
        padding: '5px 8px', borderRadius: '5px', fontSize: '12px', zIndex: 10000, pointerEvents: 'none'
      }} />

      <div className="ar-modal-content" style={{ width: '100%', height: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="ar-modal-layout">

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <aside className="ar-sidebar-left" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h4>Variants</h4>
            <div className="color-selection-grid">
              {colorVariants.map(variant => (
                <div
                  key={variant.hex}
                  className={`color-variant-item ${selectedColor === variant.hex ? 'active' : ''}`}
                  onClick={() => setSelectedColor(variant.hex)}
                >
                  <div className="color-circle" style={{ backgroundColor: variant.hex }}>
                    {selectedColor === variant.hex && <span className="checkmark">✓</span>}
                  </div>
                  <span className="color-name">{variant.name}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-item-info">
              <h3>{item?.name}</h3>
              <p>{item?.type}</p>
              <div className="price-tag">${item?.price}</div>
            </div>

            {/* Debugger Logs moved to LEFT panel so it's always accessible */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ fontSize: '0.8rem', marginBottom: '8px', color: '#94a3b8' }}>Debugger Logs</h4>
              <div style={{
                height: '180px', overflowY: 'auto', fontSize: '0.7rem', fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '8px', color: '#10b981',
                display: 'flex', flexDirection: 'column', gap: '3px'
              }}>
                {logs.length === 0
                  ? <span style={{ color: '#475569' }}>No logs yet...</span>
                  : logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </aside>

          {/* ── CENTER: Viewport ───────────────────────────────────────────── */}
          <main className="ar-viewport-center" style={{ overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* AR engine — always mounted so refs stay alive */}
            <ARFeature
              item={item}
              selectedColor={selectedColor}
              isActive={isARActive}
              onStart={handleARStart}
              onStop={handleARStop}
              onLog={addLog}
              onFpsUpdate={setFps}
              onDistanceUpdate={setLiveDistance}
              onModelWidthUpdate={setModelWidth}
              modelScale={modelScale}
              autoFit={autoFit}
              modelOffsetX={modelOffsetX}
              modelOffsetY={modelOffsetY}
              modelOffsetZ={modelOffsetZ}
              autoStretch={autoStretch}
              modelStretchFactor={modelStretchFactor}
              earAnchor1={earAnchor1}
              earAnchor2={earAnchor2}
              showAnchors={showAnchors}
            />

            {/* Placeholder shown when AR is OFF */}
            {!isARActive && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', background: '#0a1628',
                color: '#475569', gap: '12px'
              }}>
                <div style={{ fontSize: '4rem' }}>🕶️</div>
                <h3 style={{ color: '#64748b', margin: 0 }}>AR Inactive</h3>
                <p style={{ fontSize: '0.85rem', margin: 0, color: '#334155' }}>
                  Press <strong style={{ color: '#10b981' }}>Start AR Face Tracking</strong> to begin
                </p>
              </div>
            )}

            {/* Status badge */}
            <div className="ar-ui-overlay" style={{ zIndex: 100 }}>
              <div className={`status-badge ${isARActive ? 'ready' : ''}`}>
                {isARActive ? '● AR LIVE' : '○ AR READY'}
              </div>
            </div>
          </main>

          {/* ── RIGHT SIDEBAR: Controls & Diagnostics ─────────────────────── */}
          <aside className="ar-sidebar-right" style={{ overflowY: 'auto' }}>
            <div className="control-card glass-morphism">
              <h4>Controls</h4>

              {/* Auto Fit toggle */}
              <div style={{ marginTop: '10px', marginBottom: '12px', padding: '10px', background: autoFit ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: '8px', border: `1px solid ${autoFit ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: autoFit ? '#10b981' : '#cbd5e1' }}>
                  <input type="checkbox" checked={autoFit} onChange={e => setAutoFit(e.target.checked)} />
                  ✨ Auto Fit Face
                </label>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '6px 0 0', lineHeight: 1.4 }}>
                  Scale auto-calculated from face width<br/>
                  <code style={{ color: '#10b981' }}>scale = dist / (16.02 × baseWidth)</code>
                </p>
              </div>

              {/* Manual Scale — shown always, dimmed when autoFit is on */}
              <div style={{ marginBottom: '15px', opacity: autoFit ? 0.4 : 1, pointerEvents: autoFit ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Manual Scale{autoFit ? ' (disabled)' : ''}:</span><span>{modelScale.toFixed(1)}×</span>
                </label>
                <input type="range" min="1" max="10" step="0.1" value={modelScale}
                  onChange={e => setModelScale(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }} />
              </div>

              {/* Offsets — always active */}
              {[
                { label: 'Offset X (Left/Right)', value: modelOffsetX, set: setModelOffsetX },
                { label: 'Offset Y (Up/Down)',    value: modelOffsetY, set: setModelOffsetY },
                { label: 'Offset Z (Depth)',       value: modelOffsetZ, set: setModelOffsetZ },
              ].map(({ label, value, set }) => (
                <React.Fragment key={label}>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span>{label}:</span><span>{value.toFixed(2)}</span>
                  </label>
                  <input type="range" min="-1.5" max="1.5" step="0.01" value={value}
                    onChange={e => set(parseFloat(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }} />
                </React.Fragment>
              ))}

              {/* Anchor Dots toggle */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={showAnchors} onChange={e => setShowAnchors(e.target.checked)} />
                  Show All 468 Anchor Dots
                </label>
              </div>

              {/* Action buttons */}
              <button className="button-primary" onClick={handleARToggle}
                style={{ width: '100%', marginTop: '10px', backgroundColor: isARActive ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                {isARActive ? '⏹ Stop AR Tracking' : '▶ Start AR Face Tracking'}
              </button>
            </div>

            {/* Diagnostics */}
            <div className="control-card glass-morphism">
              <h4>Diagnostics</h4>
              <div className="diagnostic-stat">
                <span>Face Detect:</span>
                <span className={`dot ${isARActive ? 'green' : 'red'}`} />
              </div>
              <div className="diagnostic-stat">
                <span>FPS:</span>
                <span className="value">{fps}</span>
              </div>
              {/* Live distance — always shown, populated when AR is active */}
              <div className="diagnostic-stat" style={{ marginTop: '8px', padding: '8px', background: 'rgba(16,185,129,0.08)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Dist 127↔356:</span>
                <span style={{ fontFamily: 'monospace', color: liveDistance ? '#10b981' : '#475569', fontWeight: 'bold' }}>
                  {liveDistance ? `${liveDistance} units` : '--'}
                </span>
              </div>
              {/* Live model width */}
              <div className="diagnostic-stat" style={{ marginTop: '6px', padding: '8px', background: 'rgba(99,102,241,0.08)', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Model Width:</span>
                <span style={{ fontFamily: 'monospace', color: modelWidth ? '#818cf8' : '#475569', fontWeight: 'bold' }}>
                  {modelWidth ? `${modelWidth.toFixed(4)} units` : '--'}
                </span>
              </div>
              {/* Formula hint */}
              {liveDistance && modelWidth && (
                <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(251,191,36,0.08)', borderRadius: '6px', border: '1px solid rgba(251,191,36,0.2)', fontSize: '0.7rem', color: '#fbbf24', fontFamily: 'monospace' }}>
                  ratio = {(parseFloat(liveDistance) / modelWidth).toFixed(2)} dist-units / model-unit
                </div>
              )}
            </div>

            <button className="add-to-cart-btn button-primary" style={{ width: '100%' }}>
              Add to Cart
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ARTryOnTestPage;