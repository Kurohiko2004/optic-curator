import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { categorizeFaceShape } from '../utils/faceGeometry';

const useBatchTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testStats, setTestStats] = useState(null);

  useEffect(() => {
    if (testResults.length === 0) {
      setTestStats(null);
      return;
    }
    const stats = {};
    testResults.forEach(res => {
      const type = res.expected;
      if (!stats[type]) {
        stats[type] = { count: 0, correct: 0, sumL: 0, sumRf: 0, sumRj: 0 };
      }
      stats[type].count++;
      if (res.match) stats[type].correct++;
      stats[type].sumL += res.ratioL || 0;
      stats[type].sumRf += res.rf || 0;
      stats[type].sumRj += res.rj || 0;
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
          const getPos = (id) => new THREE.Vector3(
            landmarks[id].x * img.width, 
            landmarks[id].y * img.height, 
            landmarks[id].z * img.width
          );

          const p10 = getPos(10), p152 = getPos(152);
          const p54 = getPos(54), p284 = getPos(284);
          const p234 = getPos(234), p454 = getPos(454);
          const p132 = getPos(132), p361 = getPos(361);
          const p58 = getPos(58), p288 = getPos(288);

          const faceVector = p10.clone().sub(p152);
          const pHairline = p10.clone().add(faceVector.multiplyScalar(0.16));

          const getDist2D = (va, vb) => Math.sqrt(Math.pow(va.x - vb.x, 2) + Math.pow(va.y - vb.y, 2));

          const L = getDist2D(pHairline, p152);
          const Wf = getDist2D(p54, p284);
          const Wc = getDist2D(p234, p454);
          const Wj = getDist2D(p132, p361);

          const vecLeftMidJaw = p58.clone().sub(p132);
          const vecLeftCheek = p234.clone().sub(p132);
          const angleLeft = vecLeftMidJaw.angleTo(vecLeftCheek) * (180 / Math.PI);

          const vecRightMidJaw = p288.clone().sub(p361);
          const vecRightCheek = p454.clone().sub(p361);
          const angleRight = vecRightMidJaw.angleTo(vecRightCheek) * (180 / Math.PI);

          const res = categorizeFaceShape(L, Wf, Wc, Wj, angleLeft, angleRight);
          resData = res;
          detectedShape = res.shape.toLowerCase();
        }

        match = detectedShape.includes(expectedShape);
        
        newResults.push({
          filename: file.name,
          expected: expectedShape,
          predicted: detectedShape,
          match,
          ratioL: resData.ratioL,
          rf: resData.rf,
          rj: resData.rj
        });

        setTestProgress(Math.round(((i + 1) / files.length) * 100));
        setTestResults([...newResults]); 
      }
      
      faceMesh.close();
    } catch (err) {
      console.error("Batch Test Error:", err);
    } finally {
      setIsTesting(false);
    }
  };

  return {
    testResults,
    isTesting,
    testProgress,
    testStats,
    runTest
  };
};

export default useBatchTester;
