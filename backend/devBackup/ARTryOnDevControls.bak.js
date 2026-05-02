// Backed up Dev Controls from ARTryOnPage.jsx
/*
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
*/
