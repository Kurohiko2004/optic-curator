import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { categorizeFaceShape } from '../utils/faceGeometry';

const useBatchTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testStats, setTestStats] = useState(null);
  const [measurementsCache, setMeasurementsCache] = useState([]);

  useEffect(() => {
    if (testResults.length === 0) {
      setTestStats(null);
      return;
    }
    const stats = {};
    testResults.forEach(res => {
      const type = res.expected;
      if (!stats[type]) {
        stats[type] = { count: 0, correct: 0, sumL: 0, sumRf: 0, sumRj: 0, sumAngle: 0 };
      }
      stats[type].count++;
      if (res.match) stats[type].correct++;
      stats[type].sumL += res.ratioL || 0;
      stats[type].sumRf += res.rf || 0;
      stats[type].sumRj += res.rj || 0;
      stats[type].sumAngle += res.jawAngle || 0;
    });
    setTestStats(stats);
  }, [testResults]);

  const loadMediaPipeScript = async () => {
    if (window.FaceMesh) return window.FaceMesh;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
      script.onload = () => resolve(window.FaceMesh);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const runTest = async (files) => {
    if (files.length === 0) return;

    setIsTesting(true);
    setTestResults([]);
    setTestProgress(0);

    try {
      const FaceMeshCtor = await loadMediaPipeScript();
      const faceMesh = new FaceMeshCtor({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
      faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

      const newResults = [];
      
      let resolveCurrentResult = null;
      faceMesh.onResults((results) => {
        if (resolveCurrentResult) resolveCurrentResult(results);
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const expectedShapeMatch = file.name.match(/([a-zA-Z]+)/);
        const expectedShape = expectedShapeMatch ? expectedShapeMatch[1].toLowerCase() : "unknown";

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(res => img.onload = res);
        URL.revokeObjectURL(img.src); 

        let detectedShape = "no face";
        let match = false;
        let resData = { ratioL: 0, rf: 0, rj: 0 };

        const results = await new Promise(async (resolve) => {
          resolveCurrentResult = resolve;
          const timer = setTimeout(() => resolve(null), 1000);
          try {
            await faceMesh.send({ image: img });
          } catch (e) {
            resolve(null);
          }
          resolveCurrentResult = (res) => {
            clearTimeout(timer);
            resolve(res);
          };
        });

        if (results && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          // Use absolute pixel coordinates to calculate true physical distances.
          // Normalized Euclidean distances are severely distorted by the image aspect ratio.
          const getPos = (id) => ({ x: landmarks[id].x * img.width, y: landmarks[id].y * img.height });

          const p10 = getPos(10), p152 = getPos(152);
          const p54 = getPos(54), p284 = getPos(284);
          const p234 = getPos(234), p454 = getPos(454);
          const p132 = getPos(132), p361 = getPos(361);
          const p58  = getPos(58),  p288  = getPos(288);

          // L = direct distance p10→p152 (no hairline extension, matches Colab formula)
          const pHairline = p10;

          const getDist = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

          const L  = getDist(pHairline, p152);
          const Wf = getDist(p54, p284);
          const Wc = getDist(p234, p454);
          const Wj = getDist(p132, p361);

          // Angle at chin apex (152) between jaw side points (58, 288) — using normalized coords
          const v1x = p58.x - p152.x,  v1y = p58.y - p152.y;
          const v2x = p288.x - p152.x, v2y = p288.y - p152.y;
          const dot = v1x*v2x + v1y*v2y;
          const mag1 = Math.sqrt(v1x*v1x + v1y*v1y);
          const mag2 = Math.sqrt(v2x*v2x + v2y*v2y);
          const cosA = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
          const chinAngle = Math.acos(cosA) * (180 / Math.PI);
          const angleLeft  = chinAngle;
          const angleRight = chinAngle;

          // ── DEBUG: log raw values for "oval (2).jpg" to match Colab exactly ──
          if (file.name === 'oval (2).jpg') {
            console.group('[DEBUG] oval (2).jpg — Raw Landmark Comparison');
            console.log('152 (chin):       x=' + p152.x.toFixed(6) + '  y=' + p152.y.toFixed(6));
            console.log('58  (left jaw):   x=' + p58.x.toFixed(6)  + '  y=' + p58.y.toFixed(6));
            console.log('288 (right jaw):  x=' + p288.x.toFixed(6) + '  y=' + p288.y.toFixed(6));
            console.log('234 (left cheek): x=' + p234.x.toFixed(6) + '  y=' + p234.y.toFixed(6));
            console.log('454 (right cheek):x=' + p454.x.toFixed(6) + '  y=' + p454.y.toFixed(6));
            console.log('10  (top head):   x=' + p10.x.toFixed(6)  + '  y=' + p10.y.toFixed(6));
            console.log('--- Computed ---');
            console.log('L (p10→p152):    ' + L.toFixed(6));
            console.log('Wc (234→454):    ' + Wc.toFixed(6));
            console.log('L/Wc (ratioL):   ' + (L/Wc).toFixed(6));
            console.log('Wf (54→284):     ' + Wf.toFixed(6));
            console.log('Wj (132→361):    ' + Wj.toFixed(6));
            console.log('chinAngle:       ' + chinAngle.toFixed(4) + '°');
            console.log('img dimensions:  ' + img.width + ' x ' + img.height);
            console.groupEnd();
          }

          const res = categorizeFaceShape(L, Wf, Wc, Wj, angleLeft, angleRight);
          resData = res;
          detectedShape = res.shape.toLowerCase();
        }

        match = detectedShape.includes(expectedShape);
        
        const entry = {
          filename: file.name,
          expected: expectedShape,
          predicted: detectedShape,
          match,
          ratioL: resData.ratioL,
          rf: resData.rf,
          rj: resData.rj,
          rjf: resData.rjf,
          jawAngle: resData.jawAngle,
          process: resData.process
        };
        newResults.push(entry);

        // Update progress every 10 images to avoid flooding React
        if ((i + 1) % 10 === 0 || i === files.length - 1) {
          setTestProgress(Math.round(((i + 1) / files.length) * 100));
          setTestResults([...newResults]);
        }
      }

      // Final state update after all images processed
      setTestResults([...newResults]);
      setMeasurementsCache([...newResults]);
      
      faceMesh.close();
    } catch (err) {
      console.error("Batch Test Error:", err);
    } finally {
      setIsTesting(false);
    }
  };

  const exportMeasurements = () => {
    if (measurementsCache.length === 0) return;
    const payload = measurementsCache.map(r => ({
      expected: r.expected,
      ratioL: r.ratioL,
      rf: r.rf,
      rj: r.rj,
      rjf: r.rjf,
      jawAngle: r.jawAngle
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    testResults,
    isTesting,
    testProgress,
    testStats,
    measurementsCache,
    runTest,
    exportMeasurements
  };
};

export default useBatchTester;
