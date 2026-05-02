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
        setItem(data);
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
          <div className="ar-modal-layout" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0a1628', borderRadius: '12px', overflow: 'hidden' }}>
            
            {/* ── CENTER: Viewport (Takes up most space) ──────────────────── */}
            <main className="ar-viewport-center" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  color: '#475569', gap: '12px', zIndex: 10
                }}>
                  <div style={{ fontSize: '4rem' }}>🕶️</div>
                  <h3 style={{ color: '#64748b', margin: 0 }}>AR Inactive</h3>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: '#334155' }}>
                    Press <strong style={{ color: '#10b981' }}>Start AR Face Tracking</strong> below to begin
                  </p>
                </div>
              )}

              {/* ── TOP PANEL: Variants (Overlay) ─────────────────────────── */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, 
                padding: '15px 20px', display: 'flex', justifyContent: 'center',
                background: 'linear-gradient(to bottom, rgba(10, 22, 40, 0.9) 0%, rgba(10, 22, 40, 0) 100%)',
                zIndex: 20
              }}>
                <div className="color-selection-flex" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                  {item?.colors && item.colors.map(color => (
                    <div
                      key={color.id}
                      className={`color-variant-badge ${selectedColor === (colorMap[color.name] || '#ccc') ? 'active' : ''}`}
                      onClick={() => setSelectedColor(colorMap[color.name] || '#ccc')}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', 
                        borderRadius: '20px', cursor: 'pointer',
                        background: selectedColor === (colorMap[color.name] || '#ccc') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.4)',
                        border: `1px solid ${selectedColor === (colorMap[color.name] || '#ccc') ? '#fff' : 'transparent'}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div className="color-circle" style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colorMap[color.name] || '#ccc', border: '1px solid rgba(255,255,255,0.3)' }} />
                      <span className="color-name" style={{ color: '#fff', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AR Status Badge */}
              <div style={{ zIndex: 100, position: 'absolute', top: '20px', left: '20px' }}>
                <div className={`status-badge ${isARActive ? 'ready' : ''}`} style={{
                  background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.75rem',
                  color: isARActive ? '#10b981' : '#94a3b8', border: `1px solid ${isARActive ? '#10b981' : '#475569'}`
                }}>
                  {isARActive ? '● AR LIVE' : '○ AR READY'}
                </div>
              </div>
            </main>

            {/* ── BOTTOM PANEL: Details & Controls ───────────────────────── */}
            <div style={{
              background: '#0f172a', padding: '20px', display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between', borderTop: '1px solid #1e293b', gap: '20px',
              flexWrap: 'wrap'
            }}>
              
              {/* Product Info */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '1.4rem' }}>{item?.name}</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>{item?.shape?.name || 'Glasses'}</p>
                  <div style={{ color: '#818cf8', fontWeight: 'bold', fontSize: '1.1rem' }}>{item?.price}VND</div>
                </div>
              </div>

              {/* Diagnostics */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Face Detect:</span>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isARActive ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${isARActive ? '#10b981' : '#ef4444'}` }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>FPS:</span>
                  <span style={{ fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>{fps}</span>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ minWidth: '200px' }}>
                <button 
                  onClick={handleARToggle}
                  style={{ 
                    width: '100%', padding: '12px 24px', borderRadius: '8px', 
                    backgroundColor: isARActive ? '#ef4444' : '#10b981', color: '#fff', 
                    border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
                    transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {isARActive ? '⏹ Stop Tracking' : '▶ Start Try-On'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARTryOnPage;
