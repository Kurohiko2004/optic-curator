import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';
import { TRACKED_IDS, categorizeFaceShape } from '../utils/faceGeometry';

const useFaceTracking = (containerRef, showAnchors, showAllAnchors) => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('idle'); // idle, detecting, completed
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState({
    L: 0, Wf: 0, Wc: 0, Wj: 0, angleLeft: 0, angleRight: 0,
    ratioL: 0, rf: 0, rj: 0
  });
  const [predictedShape, setPredictedShape] = useState({ shape: 'Waiting...', process: [] });
  const [cameraWarning, setCameraWarning] = useState('');

  const mindARRef = useRef(null);
  const anchorDotsRef = useRef({});
  const resultsBuffer = useRef([]);
  const statusRef = useRef('idle'); // Use ref to avoid stale closure in animation loop
  const mouseMoveRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startAR();
    } else {
      stopAR();
    }
    return () => stopAR();
  }, [isActive]);

  // Handle visibility toggles for anchors
  useEffect(() => {
    Object.entries(anchorDotsRef.current).forEach(([id, data]) => {
      if (data.sphere) {
        if (id === 'hairline') {
          data.sphere.visible = showAnchors;
        } else {
          const numericId = parseInt(id);
          const isTracked = TRACKED_IDS.includes(numericId);
          data.sphere.visible = showAnchors && (showAllAnchors || isTracked);
        }
      }
    });
  }, [showAnchors, showAllAnchors]);

  const startAR = async () => {
    if (mindARRef.current) return;
    
    try {
      if (containerRef.current) containerRef.current.innerHTML = '';
      const mindarThree = new MindARThree({ container: containerRef.current });
      mindARRef.current = mindarThree;

      const { renderer, scene, camera } = mindarThree;

      if (renderer) {
        try { renderer.outputColorSpace = 'srgb'; } catch (e) { }
      }

      await mindarThree.start();
      setCameraWarning('');

      // Start 5 second detection timeout
      if (statusRef.current === 'detecting') {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (statusRef.current === 'detecting') {
             setIsActive(false);
             setCameraWarning('No face detected. Please ensure your face is clearly visible and well lit.');
          }
        }, 5000);
      }

      const faceMesh = mindarThree.addFaceMesh();
      faceMesh.material = new THREE.MeshBasicMaterial({ colorWrite: false });
      scene.add(faceMesh);

      const geometry = new THREE.SphereGeometry(0.015, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      // Pre-initialize ALL 468 anchors
      for (let i = 0; i < 468; i++) {
        const anchor = mindarThree.addAnchor(i);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.userData.id = i;
        
        const isTracked = TRACKED_IDS.includes(i);
        sphere.visible = showAnchors && (showAllAnchors || isTracked);
        
        anchor.group.add(sphere);
        anchorDotsRef.current[i] = { group: anchor.group, sphere };
      }

      // Special hairline dot
      const yellowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const hairlineSphere = new THREE.Mesh(geometry, yellowMaterial);
      hairlineSphere.visible = showAnchors;
      if (anchorDotsRef.current[10]) {
        anchorDotsRef.current[10].group.add(hairlineSphere);
        anchorDotsRef.current['hairline'] = { sphere: hairlineSphere };
      }

      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(0, 10, 10);
      scene.add(dirLight);
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      mouseMoveRef.current = (event) => {
        if (!containerRef.current) return;
        const canvas = containerRef.current.querySelector('canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const visibleSpheres = Object.values(anchorDotsRef.current)
          .map(d => d.sphere)
          .filter(sphere => sphere && sphere.visible);
          
        const intersects = raycaster.intersectObjects(visibleSpheres);

        if (intersects.length > 0) {
          const id = intersects[0].object.userData.id;
          setHoveredId(id !== undefined ? id : 'Hairline (Offset)');
          setTooltipPos({ x: event.clientX, y: event.clientY });
        } else {
          setHoveredId(null);
        }
      };

      window.addEventListener('mousemove', mouseMoveRef.current);

      let frameCount = 0;
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        frameCount++;

        if (frameCount % 3 === 0) {
          const getPos3D = (id) => {
            const p = new THREE.Vector3();
            if (anchorDotsRef.current[id] && anchorDotsRef.current[id].group) {
              anchorDotsRef.current[id].group.getWorldPosition(p);
            }
            return p;
          };

          const project = (v) => {
            const p = v.clone().project(camera);
            p.x *= camera.aspect;
            p.z = 0;
            return p;
          };

          const p10_3d = getPos3D(10), p152_3d = getPos3D(152);
          const p54_3d = getPos3D(54), p284_3d = getPos3D(284);
          const p234_3d = getPos3D(234), p454_3d = getPos3D(454);
          const p132_3d = getPos3D(132), p361_3d = getPos3D(361);
          const p58_3d  = getPos3D(58),  p288_3d  = getPos3D(288);

          const pHairline_3d = p10_3d;
          
          if (anchorDotsRef.current[10] && anchorDotsRef.current[10].group) {
            const localHairline = pHairline_3d.clone();
            anchorDotsRef.current[10].group.worldToLocal(localHairline);
            hairlineSphere.position.copy(localHairline);
          }

          // --- Calculation Math (matching 2D logic via projection) ---
          const p10 = project(p10_3d), p152 = project(p152_3d);
          const p54 = project(p54_3d), p284 = project(p284_3d);
          const p234 = project(p234_3d), p454 = project(p454_3d);
          const p132 = project(p132_3d), p361 = project(p361_3d);
          const p58 = project(p58_3d), p288 = project(p288_3d);
          const pHairline = p10;

          const getDist = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
          const L  = getDist(pHairline, p152);
          const Wf = getDist(p54, p284);
          const Wc = getDist(p234, p454);
          const Wj = getDist(p132, p361);

          // Angle at chin apex (152) between jaw side points (58, 288) — projected coords
          const v1x = p58.x - p152.x,  v1y = p58.y - p152.y;
          const v2x = p288.x - p152.x, v2y = p288.y - p152.y;
          const dot = v1x*v2x + v1y*v2y;
          const mag1 = Math.sqrt(v1x*v1x + v1y*v1y);
          const mag2 = Math.sqrt(v2x*v2x + v2y*v2y);
          const cosA = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
          const angleLeft  = Math.acos(cosA) * (180 / Math.PI);
          const angleRight = angleLeft;

          if (Wc > 0 && statusRef.current !== 'completed') {
            const result = categorizeFaceShape(L, Wf, Wc, Wj, angleLeft, angleRight);
            
            setMeasurements({
              L, Wf, Wc, Wj, angleLeft, angleRight,
              ratioL: result.ratioL,
              rf: result.rf,
              rj: result.rj
            });
            
            if (!isDetecting) {
              setPredictedShape({
                shape: result.shape,
                process: result.process
              });
            } else {
              // --- Buffer Results for Voting ---
              resultsBuffer.current.push(result.shape);
              
              if (resultsBuffer.current.length >= 20) {
                // Calculate mode (most frequent)
                const counts = {};
                resultsBuffer.current.forEach(s => {
                  // Normalize hybrid: "Round / Square" === "Square / Round"
                  const normalized = s.includes(' / ') ? s.split(' / ').sort().join(' / ') : s;
                  counts[normalized] = (counts[normalized] || 0) + 1;
                });
                
                const sortedResults = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                const finalVotedShape = sortedResults[0][0];
                
                setPredictedShape({
                  shape: finalVotedShape,
                  process: [...result.process, `VOTING COMPLETED: Collected 20 samples. Most frequent: ${finalVotedShape}`]
                });
                
                // Finalize but KEEP camera active
                setIsDetecting(false);
                setDetectionStatus('completed');
                statusRef.current = 'completed';
                
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
              }
            }
          }
        }
      });

    } catch (err) {
      console.error("AR Start Error:", err);
      setIsActive(false);
      setCameraWarning('Camera access denied or hardware error. Please check permissions.');
    }
  };

  const stopAR = () => {
    if (!mindARRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    mindARRef.current.renderer?.setAnimationLoop(null);
    mindARRef.current.renderer?.dispose();
    mindARRef.current.stop();
    mindARRef.current = null;
    if (mouseMoveRef.current) window.removeEventListener('mousemove', mouseMoveRef.current);
    mouseMoveRef.current = null;
    anchorDotsRef.current = {};
    setHoveredId(null);
    statusRef.current = 'idle';
    setIsDetecting(false);
    setDetectionStatus('idle');
    if (containerRef.current) containerRef.current.innerHTML = '';
  };

  const startDetection = () => {
    resultsBuffer.current = [];
    setDetectionStatus('detecting');
    statusRef.current = 'detecting';
    setIsDetecting(true);
    setIsActive(true);
    setCameraWarning('');
  };

  return {
    isActive,
    setIsActive,
    isDetecting,
    detectionStatus,
    startDetection,
    measurements,
    predictedShape,
    hoveredId,
    tooltipPos,
    anchorDotsRef,
    cameraWarning,
    setCameraWarning
  };
};

export default useFaceTracking;
