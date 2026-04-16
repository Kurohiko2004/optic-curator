import React, { useState, useEffect, useRef } from 'react';
import { fetchGlassById } from '../services/api';
import ARFeature from '../components/ar/ARFeature';
import GlassesModel from '../components/ar/GlassesModel';
import './ARTryOnPage.css';

const ARTryOnPage = ({ isOpen, onClose, selectedItemId }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDevOpen, setIsDevOpen] = useState(false);

  const colorMap = {
    'Obsidian Black': '#1a1a1a',
    'Sapphire Blue': '#1e40af',
    'Rose Gold': '#fb8500',
    'Cyber Silver': '#94a3b8',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Black': '#000000',
  };

  // ── UI State ────────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState('#1a1a1a');
  const [isARActive, setIsARActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [logs, setLogs] = useState([]);
  const [liveDistance, setLiveDistance] = useState(null);
  const [modelWidth, setModelWidth] = useState(null);

  // ── Calibration State ─────────────────────────────────
  const [modelScale, setModelScale] = useState(6.0);
  const [autoFit, setAutoFit] = useState(true);
  const [modelOffsetX, setModelOffsetX] = useState(0);
  const [modelOffsetY, setModelOffsetY] = useState(0.05);
  const [modelOffsetZ, setModelOffsetZ] = useState(0);
  const [autoStretch, setAutoStretch] = useState(false);
  const [modelStretchFactor, setModelStretchFactor] = useState(1.0);
  const [earAnchor1, setEarAnchor1] = useState(127);
  const [earAnchor2, setEarAnchor2] = useState(356);

  const streamRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await fetchGlassById(selectedItemId || 1);
        const data = response.data || response;
        setItem({
          ...data,
          modelPath: 'https://res.cloudinary.com/dfg9uh4cc/image/upload/v1776324744/glass1_sqdfcb.glb'
        });
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(colorMap[data.colors[0].name] || '#1a1a1a');
        }
      } catch (err) {
        console.error("Failed to fetch glass:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [selectedItemId, isOpen]);

  const addLog = (msg) => {
    if (!isDevOpen) return;
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-20));
  };

  const handleARToggle = () => {
    if (isARActive) {
      setIsARActive(false);
    } else {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setIsARActive(true);
    }
  };

  const handleARStart = () => {
    if (isDevOpen) addLog('AR engine started');
  };
  const handleARStop = () => {
    setIsARActive(false);
    setLiveDistance(null);
    setModelWidth(null);
    if (isDevOpen) addLog('AR engine stopped');
  };

  if (!isOpen) return null;

  return (
    <div className="ar-modal-overlay" onClick={onClose}>
      <div className="ar-modal-content" style={{ width: '95vw', height: '90vh' }} onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '100px', width: '100%' }}>Loading quality assets...</div>
        ) : (
          <div className="ar-modal-layout">
            {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
            <aside className="ar-sidebar-left" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <h4>Variants</h4>
              <div className="color-selection-grid">
                {item?.colors && item.colors.map(color => (
                  <div
                    key={color.id}
                    className={`color-variant-item ${selectedColor === (colorMap[color.name] || '#ccc') ? 'active' : ''}`}
                    onClick={() => setSelectedColor(colorMap[color.name] || '#ccc')}
                  >
                    <div className="color-circle" style={{ backgroundColor: colorMap[color.name] || '#ccc' }}>
                      {selectedColor === (colorMap[color.name] || '#ccc') && <span className="checkmark">✓</span>}
                    </div>
                    <span className="color-name">{color.name}</span>
                  </div>
                ))}
              </div>

              <div className="sidebar-item-info">
                <h3>{item?.name}</h3>
                <p>{item?.shape?.name || 'Glasses'}</p>
                <div className="price-tag">{item?.price}VND</div>
              </div>
            </aside>

            {/* ── CENTER: Viewport ───────────────────────────────────────────── */}
            <main className="ar-viewport-center" style={{ overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ARFeature
                item={item}
                selectedColor={selectedColor}
                isActive={isARActive}
                onStart={handleARStart}
                onStop={handleARStop}
                onLog={addLog}
                onFpsUpdate={setFps}
                onDistanceUpdate={(val) => isDevOpen && setLiveDistance(val)}
                onModelWidthUpdate={(val) => isDevOpen && setModelWidth(val)}
                modelScale={modelScale}
                autoFit={autoFit}
                modelOffsetX={modelOffsetX}
                modelOffsetY={modelOffsetY}
                modelOffsetZ={modelOffsetZ}
                autoStretch={autoStretch}
                modelStretchFactor={modelStretchFactor}
                earAnchor1={earAnchor1}
                earAnchor2={earAnchor2}
                showAnchors={false}
              />

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
                <button className="button-primary" onClick={handleARToggle}
                  style={{ width: '100%', marginTop: '10px', backgroundColor: isARActive ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                  {isARActive ? '⏹ Stop AR Tracking' : '▶ Start AR Face Tracking'}
                </button>

                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => setIsDevOpen(!isDevOpen)}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', padding: '8px', borderRadius: '6px', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    <span>🛠 Dev mode</span>
                    <span>{isDevOpen ? '▲' : '▼'}</span>
                  </button>

                    {isDevOpen && (
                    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ padding: '10px', background: autoFit ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: '8px', border: `1px solid ${autoFit ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: autoFit ? '#10b981' : '#cbd5e1' }}>
                          <input type="checkbox" checked={autoFit} onChange={e => setAutoFit(e.target.checked)} />
                          ✨ Auto Fit Face
                        </label>
                      </div>

                      <div style={{ opacity: autoFit ? 0.4 : 1, pointerEvents: autoFit ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
                        <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Manual Scale:</span><span>{modelScale.toFixed(1)}×</span>
                        </label>
                        <input type="range" min="1" max="10" step="0.1" value={modelScale}
                          onChange={e => setModelScale(parseFloat(e.target.value))}
                          style={{ width: '100%', marginTop: '5px' }} />
                      </div>

                      {[
                        { label: 'Offset X', value: modelOffsetX, set: setModelOffsetX },
                        { label: 'Offset Y', value: modelOffsetY, set: setModelOffsetY },
                        { label: 'Offset Z', value: modelOffsetZ, set: setModelOffsetZ },
                      ].map(({ label, value, set }) => (
                        <div key={label}>
                          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{label}:</span><span>{value.toFixed(2)}</span>
                          </label>
                          <input type="range" min="-1.5" max="1.5" step="0.01" value={value}
                            onChange={e => set(parseFloat(e.target.value))}
                            style={{ width: '100%', marginTop: '5px' }} />
                        </div>
                      ))}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="diagnostic-stat" style={{ padding: '8px', background: 'rgba(16,185,129,0.08)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Dist 127↔356:</span>
                          <span style={{ fontFamily: 'monospace', color: liveDistance ? '#10b981' : '#475569', fontWeight: 'bold' }}>{liveDistance || '--'}</span>
                        </div>
                        <div className="diagnostic-stat" style={{ padding: '8px', background: 'rgba(99,102,241,0.08)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Model Width:</span>
                          <span style={{ fontFamily: 'monospace', color: modelWidth ? '#818cf8' : '#475569', fontWeight: 'bold' }}>{modelWidth?.toFixed(4) || '--'}</span>
                        </div>
                      </div>

                      <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ fontSize: '0.8rem', marginBottom: '8px', color: '#94a3b8' }}>Debugger Logs</h4>
                        <div style={{ height: '150px', overflowY: 'auto', fontSize: '0.7rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                          {logs.map((log, i) => <div key={i}>{log}</div>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARTryOnPage;
