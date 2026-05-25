import React, { useRef, useEffect } from 'react';
import './BatchTesterSection.css';

// The 10 key anchors used for face shape measurement
const KEY_ANCHORS = {
  10:  { label: 'Forehead',    color: '#facc15' }, // yellow
  152: { label: 'Chin',        color: '#facc15' },
  234: { label: 'L. Cheek',    color: '#f97316' }, // orange
  454: { label: 'R. Cheek',    color: '#f97316' },
  54:  { label: 'L. Temple',   color: '#22d3ee' }, // cyan
  284: { label: 'R. Temple',   color: '#22d3ee' },
  132: { label: 'L. Jaw',      color: '#a78bfa' }, // violet
  361: { label: 'R. Jaw',      color: '#a78bfa' },
  58:  { label: 'L. Chin Pt',  color: '#fb7185' }, // pink
  288: { label: 'R. Chin Pt',  color: '#fb7185' },
};

/**
 * Draws all 468 landmark dots + the 10 key measurement anchors
 * onto the canvas, scaled to fit the displayed image size.
 */
function drawLandmarks(canvas, landmarks, imgWidth, imgHeight) {
  if (!canvas || !landmarks || !imgWidth || !imgHeight) return;

  // Match canvas pixel dims to its displayed CSS size
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width;
  canvas.height = rect.height;

  const scaleX = rect.width  / imgWidth;
  const scaleY = rect.height / imgHeight;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const keyIds = new Set(Object.keys(KEY_ANCHORS).map(Number));

  // ── 1. All 468 dots (tiny, semi-transparent white) ──────────────────
  landmarks.forEach((lm, idx) => {
    if (keyIds.has(idx)) return; // draw key anchors on top
    ctx.beginPath();
    ctx.arc(lm.x * imgWidth * scaleX, lm.y * imgHeight * scaleY, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
  });

  // ── 2. Key anchors (larger, colored, with label) ─────────────────────
  Object.entries(KEY_ANCHORS).forEach(([idStr, { label, color }]) => {
    const id = Number(idStr);
    const lm = landmarks[id];
    const cx = lm.x * imgWidth  * scaleX;
    const cy = lm.y * imgHeight * scaleY;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Solid dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Label
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy - 11);
  });
}

// ─────────────────────────────────────────────────────────────────────────────

const LandmarkOverlay = ({ previewUrl, result }) => {
  const imgRef    = useRef(null);
  const canvasRef = useRef(null);

  const redraw = () => {
    if (!result?.landmarks) return;
    drawLandmarks(
      canvasRef.current,
      result.landmarks,
      result.imgWidth,
      result.imgHeight,
    );
  };

  // Redraw whenever the result changes
  useEffect(() => {
    // Wait one frame so the image has been painted and getBoundingClientRect is accurate
    const id = requestAnimationFrame(redraw);
    return () => cancelAnimationFrame(id);
  }, [result]);

  // Also redraw if the element resizes (e.g. window resize)
  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver(() => requestAnimationFrame(redraw));
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [result]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <img
        ref={imgRef}
        src={previewUrl}
        alt="Uploaded face"
        className="batch-preview-img"
        style={{ display: 'block', width: '100%', borderRadius: '12px' }}
        onLoad={redraw}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          borderRadius: '12px',
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const BatchTesterSection = ({
  isTesting,
  testProgress,
  testResults,
  testStats,
  onRunTest,
}) => {
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      // Revoke previous URL to avoid memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      onRunTest(files);
    }
  };

  const firstResult = testResults[0] || null;

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
            <div className="batch-progress-fill" style={{ width: `${testProgress}%` }} />
          </div>
          <p className="batch-progress-text">Analyzing image...</p>
        </div>
      )}

      {firstResult && (
        <div className="batch-result-container">
          {/* Image with landmark canvas overlay */}
          {previewUrl && (
            <LandmarkOverlay
              previewUrl={previewUrl}
              result={firstResult}
            />
          )}

          {/* Result text */}
          <div style={{ width: '100%' }}>
            <div className="batch-result-label">Detected Face Shape</div>
            <div className="batch-result-value">{firstResult.predicted}</div>
            <div className="batch-result-filename">
              Analyzed from: {firstResult.filename}
            </div>

            {/* Key ratio metrics */}
            {firstResult.landmarks && (
              <div style={{
                marginTop: '14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.78rem',
                color: '#94a3b8',
              }}>
                {[
                  ['Ratio L',    firstResult.ratioL?.toFixed(3)],
                  ['Ratio f',    firstResult.rf?.toFixed(3)],
                  ['Ratio j',    firstResult.rj?.toFixed(3)],
                  ['Jaw Angle',  firstResult.jawAngle ? `${firstResult.jawAngle.toFixed(1)}°` : '—'],
                ].map(([key, val]) => (
                  <div key={key} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{key}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{val ?? '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTesterSection;
