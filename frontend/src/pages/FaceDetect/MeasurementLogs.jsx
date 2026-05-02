import React from 'react';

const MeasurementLogs = ({ measurements, predictedShape }) => {
  return (
    <div className="logs-container">
      {/* Detailed logs commented out for UI cleanup - Backed up in backend/devBackup/ */}
      {/* 
      <h3>Live Measurements Logs</h3>
      <div className="logs-grid">
        ... (rest of the grid)
      </div>
      */}

      {/* Predicted Face Shape display hidden as it is now shown in the AR badge */}
      {/* 
      <div style={{ marginTop: '10px', padding: '20px', background: 'rgba(16,185,129,0.05)', border: '1px solid #10b981', borderRadius: '12px' }}>
        <h3 style={{ color: '#10b981', marginTop: 0, display: 'flex', justifyContent: 'space-between' }}>
          <span>Predicted Face Shape</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Classification v6</span>
        </h3>
        <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '15px', textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
          {predictedShape.shape}
        </div>
      </div>
      */}
    </div>
  );
};

export default MeasurementLogs;
