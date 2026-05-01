import React from 'react';

const BatchTesterSection = ({ 
  isTesting, 
  testProgress, 
  testResults, 
  testStats, 
  onRunTest 
}) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      onRunTest(files);
    }
  };

  return (
    <div className="logs-container" style={{ marginTop: '40px', border: '1px solid #3b82f6' }}>
      <h3 style={{ color: '#3b82f6' }}>Dataset Batch Tester (MediaPipe Centroid Logic)</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
        Select the <strong>training_set</strong> folder to automatically run the centroid-based classification on every image.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          webkitdirectory="true" 
          directory="true" 
          multiple 
          onChange={handleFileChange}
          disabled={isTesting}
          style={{ 
            padding: '10px', 
            background: '#1e293b', 
            color: '#fff', 
            border: '1px solid #475569',
            borderRadius: '6px',
            cursor: isTesting ? 'not-allowed' : 'pointer'
          }}
        />
      </div>

      {isTesting && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ width: '100%', background: '#1e293b', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${testProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }}></div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '5px' }}>Processing images: {testProgress}%</p>
        </div>
      )}

      {testResults.length > 0 && (
        <>
          {testStats && (
            <div style={{ marginBottom: '30px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h4 style={{ color: '#3b82f6', marginTop: 0, marginBottom: '15px' }}>Category Breakdown & Actual Dataset Averages</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '10px' }}>Actual Type</th>
                      <th style={{ padding: '10px' }}>Accuracy</th>
                      <th style={{ padding: '10px' }}>Avg L/Wc</th>
                      <th style={{ padding: '10px' }}>Avg Rf</th>
                      <th style={{ padding: '10px' }}>Avg Rj</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(testStats).sort().map(([type, s]) => (
                      <tr key={type} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '10px', textTransform: 'capitalize', fontWeight: 'bold', color: '#fff' }}>{type}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ color: s.correct/s.count > 0.7 ? '#10b981' : (s.correct/s.count > 0.3 ? '#f59e0b' : '#ef4444') }}>
                            {s.correct}/{s.count} ({((s.correct/s.count)*100).toFixed(1)}%)
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: '#cbd5e1' }}>{(s.sumL/s.count).toFixed(3)}</td>
                        <td style={{ padding: '10px', color: '#cbd5e1' }}>{(s.sumRf/s.count).toFixed(3)}</td>
                        <td style={{ padding: '10px', color: '#cbd5e1' }}>{(s.sumRj/s.count).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead style={{ background: '#1e293b', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid #334155' }}>Filename</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #334155' }}>Expected</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #334155' }}>Predicted</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #334155' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #334155', color: '#cbd5e1' }}>{result.filename}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #334155', textTransform: 'capitalize' }}>{result.expected}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #334155', textTransform: 'capitalize' }}>{result.predicted}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #334155' }}>
                      {result.match 
                        ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Match</span> 
                        : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ Fail</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BatchTesterSection;
