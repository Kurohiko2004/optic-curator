import React, { useEffect, useRef } from 'react';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Calibration constant derived from user data:
 *   rawDist (127-356) = 15.5966 units, modelWidth at fit = 0.9733 units
 *   FIT_RATIO = 15.5966 / 0.9733 ≈ 16.02
 */
const FIT_RATIO = 16.02;

/**
 * Lerp speed for smooth scaling.
 */
const LERP_SPEED = 0.2;

const ARFeature = ({
  item,
  selectedColor,
  isActive,
  onStart,
  onStop,
  onLog,
  onFpsUpdate,
  onDistanceUpdate,
  onModelWidthUpdate,
  modelScale,
  autoFit,
  modelOffsetX,
  modelOffsetY,
  modelOffsetZ,
  autoStretch,
  modelStretchFactor,
  earAnchor1,
  earAnchor2,
  showAnchors,
}) => {
  const containerRef = useRef(null);
  const mindARRef = useRef(null);
  const arModelRef = useRef(null);
  const cachedModelRef = useRef(null); // Cache the loaded GLTF scene
  const anchorDotsRef = useRef([]);
  const mouseMoveRef = useRef(null);
  const modelBaseWidthRef = useRef(1);
  const anchorGroupsRef = useRef(new Array(468));
  const fullAnchorsCreatedRef = useRef(false);

  // Track the current model path to detect if we need to reload
  const currentModelPathRef = useRef(null);

  // Mirror of all props for the animation loop
  const configRef = useRef({});
  useEffect(() => {
    configRef.current = {
      modelScale, autoFit,
      modelOffsetX, modelOffsetY, modelOffsetZ,
      autoStretch, modelStretchFactor,
      earAnchor1, earAnchor2, showAnchors,
    };
  }, [modelScale, autoFit, modelOffsetX, modelOffsetY, modelOffsetZ,
    autoStretch, modelStretchFactor, earAnchor1, earAnchor2, showAnchors]);

  // ── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isActive) startAR();
    else stopAR();
    return () => stopAR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);



  const startAR = async () => {
    try {
      // CRITICAL: Clear the container first to prevent ghost canvases/videos
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      onLog('Initializing MindAR...');
      const mindarThree = new MindARThree({ container: containerRef.current });
      const { renderer, scene, camera } = mindarThree;

      onLog('Starting face tracking...');
      await mindarThree.start();
      mindARRef.current = mindarThree;
      onStart();

      // ── STEP 2: Occluder ──────────────────────────────────────────
      const faceMesh = mindarThree.addFaceMesh();
      faceMesh.material = new THREE.MeshBasicMaterial({ colorWrite: false });
      scene.add(faceMesh);

      const mainAnchor = mindarThree.addAnchor(168);
      anchorGroupsRef.current[168] = mainAnchor.group;
      const anchor127 = mindarThree.addAnchor(127);
      anchorGroupsRef.current[127] = anchor127.group;
      const anchor356 = mindarThree.addAnchor(356);
      anchorGroupsRef.current[356] = anchor356.group;

      const mainAnchorGroup = mainAnchor.group;


      // ── STEP 4: Model Caching & Handling ─────────────────────────────
      const modelPath = item?.modelPath || '/model/glasses/glass1.glb';

      const setupModel = (model) => {
        arModelRef.current = model;

        // CRITICAL: Reset scale to 1 before measuring, otherwise Box3 
        // will include previous scaling when reusing from cache!
        model.scale.set(1, 1, 1);
        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        modelBaseWidthRef.current = size.x || 1;
        onLog(`Base width measured: ${modelBaseWidthRef.current.toFixed(4)} Three.js units`);

        const { modelScale: ms, modelOffsetX: ox, modelOffsetY: oy, modelOffsetZ: oz } = configRef.current;
        model.scale.setScalar(ms);
        model.position.set(ox, oy, oz);
        onModelWidthUpdate?.(modelBaseWidthRef.current * ms);

        model.traverse((child) => {
          if (child.isMesh) {
            child.material = child.material.clone();
            if (child.name === 'Plane001') child.material.color.set(selectedColor);
            if (child.name === 'Plane') {
              child.material.transparent = true;
              child.material.opacity = 0.6;
              child.material.color.set('#000000');
            }
          }
        });
        mainAnchorGroup.add(model);
      };

      // Reuse cache if path matches, else load new
      if (cachedModelRef.current && currentModelPathRef.current === modelPath) {
        onLog('Reusing cached 3D model...');
        setupModel(cachedModelRef.current);
      } else {
        onLog('Loading 3D model...');
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
          cachedModelRef.current = gltf.scene;
          currentModelPathRef.current = modelPath;
          setupModel(gltf.scene);
        }, undefined, (err) => onLog('Load Error: ' + err.message));
      }

      // ── STEP 5: Lighting ─────────────────────────────────────────────
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(0, 10, 10);
      scene.add(dirLight);
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      // ── STEP 6: Main Loop ────────────────────────────────────────────
      let frameCount = 0;
      let fpsTick = 0;
      let prevFpsTime = performance.now();
      let rawDist = null;
      let targetScale = configRef.current.modelScale;
      let smoothScale = targetScale;
      const p1 = new THREE.Vector3();
      const p2 = new THREE.Vector3();

      renderer.setAnimationLoop(() => {
        frameCount++;
        const cfg = configRef.current;

        fpsTick++;
        const now = performance.now();
        if (now >= prevFpsTime + 1000) {
          onFpsUpdate(Math.round((fpsTick * 1000) / (now - prevFpsTime)));
          fpsTick = 0;
          prevFpsTime = now;
        }

        // ── MATH TICK: Update distance & scale target at 30fps ──
        if (frameCount % 2 === 0) {
          const ag127 = anchorGroupsRef.current[127];
          const ag356 = anchorGroupsRef.current[356];
          if (ag127 && ag356) {
            ag127.getWorldPosition(p1);
            ag356.getWorldPosition(p2);
            rawDist = p1.distanceTo(p2);
            onDistanceUpdate?.((rawDist * 100).toFixed(2));
          }
          if (cfg.autoFit && rawDist) {
            targetScale = rawDist / (FIT_RATIO * modelBaseWidthRef.current);
          } else {
            targetScale = cfg.modelScale;
          }
        }

        if (arModelRef.current && targetScale > 0) {
          smoothScale += (targetScale - smoothScale) * LERP_SPEED;
          arModelRef.current.scale.setScalar(smoothScale);
          if (frameCount % 6 === 0) onModelWidthUpdate?.(modelBaseWidthRef.current * smoothScale);
        }

        renderer.render(scene, camera);
      });

    } catch (err) {
      onLog('Error: ' + err.message);
    }
  };

  const stopAR = () => {
    if (!mindARRef.current) return;
    onLog('Stopping AR...');

    // 1. Terminate render loop
    mindARRef.current.renderer?.setAnimationLoop(null);

    // 2. Explicitly detach the model from the MindAR anchor group
    // This is key to fix the "frozen model" bug
    if (arModelRef.current && arModelRef.current.parent) {
      arModelRef.current.parent.remove(arModelRef.current);
    }

    // 3. Stop MindAR (which releases camera)
    mindARRef.current.stop();
    mindARRef.current = null;

    // 4. GUI Cleanups
    if (mouseMoveRef.current) {
      window.removeEventListener('mousemove', mouseMoveRef.current);
      mouseMoveRef.current = null;
    }

    arModelRef.current = null;
    anchorDotsRef.current = [];
    anchorGroupsRef.current = new Array(468);
    fullAnchorsCreatedRef.current = false;

    // 5. Hard clear the container DOM to be 100% safe
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    onStop();
  };

  // Reactive color/pos updates
  useEffect(() => {
    if (!arModelRef.current) return;
    if (!autoFit) arModelRef.current.scale.setScalar(modelScale);
    arModelRef.current.position.set(modelOffsetX, modelOffsetY, modelOffsetZ);
  }, [modelScale, modelOffsetX, modelOffsetY, modelOffsetZ, autoFit]);

  useEffect(() => {
    if (!arModelRef.current) return;
    arModelRef.current.traverse((child) => {
      if (child.isMesh && child.name === 'Plane001') child.material.color.set(selectedColor);
    });
  }, [selectedColor]);


  return (
    <div ref={containerRef} style={{
      width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px',
      position: 'relative', display: isActive ? 'block' : 'none', zIndex: isActive ? 10 : -1,
      overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }} />
  );
};

export default ARFeature;
