import React from 'react';
import './BatchTesterSection.css';

const BatchTesterSection = ({ 
  isTesting, 
  testProgress, 
  testResults, 
  testStats, 
  onRunTest
}) => {
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      onRunTest(files);
    }
  };

  return (
    <div className="batch-tester-section">
      <h3 className="batch-tester-title">Upload image to detect</h3>
      <p className="batch-tester-desc">
        Select and upload your image here to analyze face shape from a static photo.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={isTesting}
          className="batch-file-input"
        />
      </div>

      {isTesting && (
        <div className="batch-progress-container">
          <div className="batch-progress-bar">
            <div className="batch-progress-fill" style={{ width: `${testProgress}%` }}></div>
          </div>
          <p className="batch-progress-text">Analyzing image...</p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="batch-result-container">
          {previewUrl && (
            <div style={{ width: '100%', maxWidth: '280px' }}>
              <img 
                src={previewUrl} 
                alt="Uploaded face" 
                className="batch-preview-img"
              />
            </div>
          )}
          
          <div style={{ width: '100%' }}>
            <div className="batch-result-label">
              Detected Face Shape
            </div>
            <div className="batch-result-value">
              {testResults[0].predicted}
            </div>
            <div className="batch-result-filename">
              Analyzed from: {testResults[0].filename}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTesterSection;
