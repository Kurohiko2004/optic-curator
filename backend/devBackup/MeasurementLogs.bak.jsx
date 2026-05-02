import React from 'react';

const MeasurementLogs = ({ measurements, predictedShape }) => {
  return (
    <div className="logs-container">
      <h3>Live Measurements Logs</h3>
      <div className="logs-grid">
        <div className="log-item">
          <span className="log-label">Face Length (L) [10↔152]:</span>
          <span className="log-value">{measurements.L.toFixed(4)}</span>
        </div>
        <div className="log-item">
          <span className="log-label">Forehead Width (Wf) [54↔284]:</span>
          <span className="log-value">{measurements.Wf.toFixed(4)}</span>
        </div>
        <div className="log-item">
          <span className="log-label">Cheekbone Width (Wc) [234↔454]:</span>
          <span className="log-value">{measurements.Wc.toFixed(4)}</span>
        </div>
        <div className="log-item">
          <span className="log-label">Jawline Width (Wj) [132↔361]:</span>
          <span className="log-value">{measurements.Wj.toFixed(4)}</span>
        </div>
        <div className="log-item">
          <span className="log-label">Left Jaw Angle [150-132-234]:</span>
          <span className="log-value">{measurements.angleLeft.toFixed(1)}°</span>
        </div>
        <div className="log-item">
          <span className="log-label">Right Jaw Angle [379-361-454]:</span>
          <span className="log-value">{measurements.angleRight.toFixed(1)}°</span>
        </div>
      </div>

      <h3 style={{ marginTop: '20px' }}>Key Ratios (Relative to Cheekbone Wc)</h3>
      <div className="logs-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="log-item" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <span className="log-label">Vertical Ratio (L / Wc)</span>
          <span className="log-value">{measurements.ratioL.toFixed(3)}</span>
        </div>
        <div className="log-item" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)' }}>
          <span className="log-label">Forehead Ratio (Wf / Wc)</span>
          <span className="log-value">{measurements.rf.toFixed(3)}</span>
        </div>
        <div className="log-item" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <span className="log-label">Jawline Ratio (Wj / Wc)</span>
          <span className="log-value">{measurements.rj.toFixed(3)}</span>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(16,185,129,0.05)', border: '1px solid #10b981', borderRadius: '12px' }}>
        <h3 style={{ color: '#10b981', marginTop: 0, display: 'flex', justifyContent: 'space-between' }}>
          <span>Predicted Face Shape</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Classification v6</span>
        </h3>
        <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '15px', textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
          {predictedShape.shape}
        </div>
        
        <div className="debug-console" style={{ 
          background: '#0f172a', 
          padding: '12px', 
          borderRadius: '8px', 
          border: '1px solid #1e293b',
          maxHeight: '150px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem'
        }}>
          <div style={{ color: '#64748b', marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
            ENGINE ANALYSIS LOGS:
          </div>
          {predictedShape.process.map((step, i) => (
            <div key={i} style={{ 
              color: step.includes('Debug') ? '#94a3b8' : (step.includes('Priority') ? '#f59e0b' : '#10b981'),
              marginBottom: '4px',
              paddingLeft: '10px',
              borderLeft: `2px solid ${step.includes('FAIL') ? '#ef4444' : '#334155'}`
            }}>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeasurementLogs;
