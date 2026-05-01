import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';
import { TRACKED_IDS, categorizeFaceShape } from '../utils/faceGeometry';

const useFaceTracking = (containerRef, showAnchors, showAllAnchors) => {
  const [isActive, setIsActive] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState({
    L: 0, Wf: 0, Wc: 0, Wj: 0, angleLeft: 0, angleRight: 0,
    ratioL: 0, rf: 0, rj: 0
  });
  const [predictedShape, setPredictedShape] = useState({ shape: 'Waiting...', process: [] });

  const mindARRef = useRef(null);
  const anchorDotsRef = useRef({});
  const mouseMoveRef = useRef(null);

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
    try {
      if (containerRef.current) containerRef.current.innerHTML = '';
      const mindarThree = new MindARThree({ container: containerRef.current });
      const { renderer, scene, camera } = mindarThree;

      if (renderer) {
        try { renderer.outputColorSpace = 'srgb'; } catch (e) { }
      }

      await mindarThree.start();
      mindARRef.current = mindarThree;

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
          const getPos = (id) => {
            const pos = new THREE.Vector3();
            if (anchorDotsRef.current[id] && anchorDotsRef.current[id].group) {
               anchorDotsRef.current[id].group.getWorldPosition(pos);
            }
            return pos;
          };

          const p10 = getPos(10), p152 = getPos(152);
          const p54 = getPos(54), p284 = getPos(284);
          const p234 = getPos(234), p454 = getPos(454);
          const p132 = getPos(132), p361 = getPos(361);
          const p58 = getPos(58), p288 = getPos(288);

          const faceVector = p10.clone().sub(p152);
          const pHairline = p10.clone().add(faceVector.multiplyScalar(0.16));
          
          if (anchorDotsRef.current[10] && anchorDotsRef.current[10].group) {
            const localHairline = pHairline.clone();
            anchorDotsRef.current[10].group.worldToLocal(localHairline);
            hairlineSphere.position.copy(localHairline);
          }

          const L = pHairline.distanceTo(p152);
          const Wf = p54.distanceTo(p284);
          const Wc = p234.distanceTo(p454);
          const Wj = p132.distanceTo(p361);

          const vecLeftMidJaw = p58.clone().sub(p132);
          const vecLeftCheek = p234.clone().sub(p132);
          const angleLeft = vecLeftMidJaw.angleTo(vecLeftCheek) * (180 / Math.PI);

          const vecRightMidJaw = p288.clone().sub(p361);
          const vecRightCheek = p454.clone().sub(p361);
          const angleRight = vecRightMidJaw.angleTo(vecRightCheek) * (180 / Math.PI);

          if (Wc > 0) {
            const result = categorizeFaceShape(L, Wf, Wc, Wj, angleLeft, angleRight);
            
            setMeasurements({
              L, Wf, Wc, Wj, angleLeft, angleRight,
              ratioL: result.ratioL,
              rf: result.rf,
              rj: result.rj
            });
            
            setPredictedShape({
              shape: result.shape,
              process: result.process
            });
          }
        }
      });

    } catch (err) {
      console.error("AR Start Error:", err);
      setIsActive(false);
    }
  };

  const stopAR = () => {
    if (!mindARRef.current) return;
    mindARRef.current.renderer?.setAnimationLoop(null);
    mindARRef.current.stop();
    mindARRef.current = null;
    if (mouseMoveRef.current) window.removeEventListener('mousemove', mouseMoveRef.current);
    mouseMoveRef.current = null;
    anchorDotsRef.current = {};
    setHoveredId(null);
    if (containerRef.current) containerRef.current.innerHTML = '';
  };

  return {
    isActive,
    setIsActive,
    measurements,
    predictedShape,
    hoveredId,
    tooltipPos,
    anchorDotsRef
  };
};

export default useFaceTracking;
