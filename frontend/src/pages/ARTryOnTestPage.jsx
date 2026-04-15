import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, useGLTF } from '@react-three/drei';
import { glassesItems } from '../data/shopData';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './ARTryOnPage.css';

// Real 3D GLTF Model Component (For R3F Canvas view)
export const GlassesModel = ({ modelPath, color, autoRotate }) => {
  const { scene } = useGLTF(modelPath || '/model/glasses/glass1.glb');
  const groupRef = useRef();

  // Slow rotation for default view
  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name === 'Plane001' && child.material) {
          child.material.color.set(color);
        }
        if (child.name === 'Plane' && child.material) {
          child.material.transparent = true;
          child.material.opacity = 0.6;
          child.material.color.set('#000000');
        }
      }
    });
  }, [scene, color]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive ref={groupRef} object={scene} scale={1.5} position={[0, -0.2, 0]} />
    </Float>
  );
};

const ARTryOnTestPage = () => {
  const selectedItemId = 1;
  const item = glassesItems.find(i => i.id === selectedItemId) || glassesItems[0];

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelVisible, setIsModelVisible] = useState(true);
  const [logs, setLogs] = useState([]);
  const [mindAR, setMindAR] = useState(null);
  const [modelScale, setModelScale] = useState(0.5);
  const [modelOffsetX, setModelOffsetX] = useState(0);
  const [modelOffsetY, setModelOffsetY] = useState(-0.05);
  const [modelOffsetZ, setModelOffsetZ] = useState(0.1);
  const [fps, setFps] = useState(0);
  const [modelBaseWidth, setModelBaseWidth] = useState(1);
  const [modelScaleX, setModelScaleX] = useState(0.5); 
  const [modelStretchFactor, setModelStretchFactor] = useState(1.0);
  const [earAnchor1, setEarAnchor1] = useState(127); // Default ear anchor
  const [earAnchor2, setEarAnchor2] = useState(356); // Default ear anchor
  const [autoStretch, setAutoStretch] = useState(false);
  const [showAnchors, setShowAnchors] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const arModelRef = useRef(null);
  const anchorDotsRef = useRef([]);
  const mouseMoveRef = useRef(null);
  const mindARRef = useRef(null);

  const colorVariants = [
    { name: 'Obsidian Black', hex: '#1a1a1a' },
    { name: 'Sapphire Blue', hex: '#1e40af' },
    { name: 'Rose Gold', hex: '#fb8500' },
    { name: 'Cyber Silver', hex: '#94a3b8' }
  ];
  const [selectedColor, setSelectedColor] = useState(colorVariants[0].hex);

  useEffect(() => {
    if (item) setSelectedColor(colorVariants.find(v => v.name === item.color)?.hex || colorVariants[0].hex);
  }, [selectedItemId]);

  const addLog = (msg) => {
    setLogs((prevLogs) => {
      const updated = [...prevLogs, `[${new Date().toLocaleTimeString()}] ${msg}`];
      return updated.slice(-10);
    });
  };

  // Global FPS Counter
  useEffect(() => {
    let animationFrameId;
    let frames = 0;
    let prevTime = performance.now();

    const calculateFps = () => {
      frames++;
      const time = performance.now();
      if (time >= prevTime + 1000) {
        setFps(Math.round((frames * 1000) / (time - prevTime)));
        frames = 0;
        prevTime = time;
      }
      animationFrameId = requestAnimationFrame(calculateFps);
    };

    calculateFps();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Turn ON standard camera logic
  const handleStandardCameraToggle = () => {
    if (!isCameraActive) {
      // Switching ON: Turn off model visibility
      setIsModelVisible(false);
      setIsCameraActive(true);
      addLog("Standard camera activated, model hidden.");
    } else {
      // Switching OFF
      setIsCameraActive(false);
      addLog("Standard camera deactivated.");
    }
  };

  const initFaceTracking = async () => {
    try {
      addLog("Initializing MindAR ...");
      const container = document.getElementById('mindar-container');
      const mindarThree = new MindARThree({
        container: container,
      });
      setMindAR(mindarThree);

      // Stop the standard camera stream if it's running so MindAR can grab it
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraActive(false); // Let AR take priority

      addLog("Detecting face mesh...");
      await mindarThree.start();
      addLog("MindAR Face Tracking active!");

      // CREATE INVISIBLE OCCLUSION MESH
      addLog("Generating invisible face mesh for occlusion...");
      const faceMesh = mindarThree.addFaceMesh();
      faceMesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      faceMesh.material.colorWrite = false;
      mindarThree.scene.add(faceMesh);

      // --- ALL ANCHORS VISUALIZATION & INTERACTION ---
      const dots = [];
      const dotGeometry = new THREE.SphereGeometry(0.015, 8, 8);
      const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

      for (let i = 0; i < 468; i++) {
        const anchor = mindarThree.addAnchor(i);
        const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
        dot.userData = { id: i };
        dot.visible = showAnchors;
        anchor.group.add(dot);
        dots.push(dot);
      }
      anchorDotsRef.current = dots;

      // Raycaster for Hover detection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const tooltip = document.getElementById('ar-tooltip');

      const onMouseMove = (event) => {
        const rect = container.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) {
          if (tooltip) tooltip.style.display = 'none';
          return;
        }

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, mindarThree.camera);
        const intersects = raycaster.intersectObjects(dots);

        if (intersects.length > 0) {
          const id = intersects[0].object.userData.id;
          if (tooltip) {
            tooltip.style.display = 'block';
            tooltip.style.left = (event.clientX + 10) + 'px';
            tooltip.style.top = (event.clientY + 10) + 'px';
            tooltip.innerText = `Anchor ID: ${id}`;
          }
          // Highlight
          dots.forEach(d => d.material.color.set(0xff0000));
          intersects[0].object.material.color.set(0x00ff00);
        } else {
          if (tooltip) tooltip.style.display = 'none';
          dots.forEach(d => d.material.color.set(0xff0000));
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      mouseMoveRef.current = onMouseMove;
      // ------------------------------------------------

      // Hook into Anchor 168 (Nose bridge commonly used for glasses)
      const anchor = mindarThree.addAnchor(168);

      // Load the 3D Glasses Model directly into Three.JS
      const loader = new GLTFLoader();
      const modelUrl = item.modelPath || '/model/glasses/glass1.glb';

      loader.load(modelUrl, (gltf) => {
        const scene = gltf.scene;
        arModelRef.current = scene;

        // Calculate actual model width
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const width = size.x;
        setModelBaseWidth(width);
        addLog(`Model original width: ${width.toFixed(4)} units`);

        // Scale and position adjustment for the AR face
        scene.scale.set(modelScale, modelScale, modelScale);
        scene.position.set(modelOffsetX, modelOffsetY, modelOffsetZ); 

        // Fix: Use 0.1 as a default base scale to avoid it being invisible initially
        if (modelScale === 0.5) { // If user hasn't touched the slider yet
           scene.scale.set(0.1, 0.1, 0.1);
        }
        // Apply selected color
        scene.traverse((child) => {
          if (child.isMesh) {
            if (child.name === 'Plane001' && child.material) {
              child.material = child.material.clone();
              child.material.color.set(selectedColor);
            }
            if (child.name === 'Plane' && child.material) {
              child.material = child.material.clone();
              child.material.transparent = true;
              child.material.opacity = 0.6;
              child.material.color.set('#000000');
            }
          }
        });

        anchor.group.add(scene);
        addLog("Glasses model loaded and attached");
      }, undefined, (err) => {
        addLog("FAIL: GLTF Load Error - " + err.message);
        console.error("GLTF Error:", err);
      });

      // Add simple lighting for the AR scene
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 10, 10);
      mindarThree.scene.add(light);
      mindarThree.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      // Basic render loop
      const { renderer, scene, camera } = mindarThree;
      mindARRef.current = mindarThree;
      let frames = 0;

      renderer.setAnimationLoop(() => {
        // Auto-stretching logic
        if (autoStretch && arModelRef.current) {
          const pos1 = new THREE.Vector3();
          const pos2 = new THREE.Vector3();
          
          // Get matrix world positions of selected ear anchors
          const anchor1Group = mindarThree.anchors.find(a => a.landmarkIndex === earAnchor1)?.group;
          const anchor2Group = mindarThree.anchors.find(a => a.landmarkIndex === earAnchor2)?.group;

          if (anchor1Group && anchor2Group) {
            anchor1Group.getWorldPosition(pos1);
            anchor2Group.getWorldPosition(pos2);
            const dist = pos1.distanceTo(pos2);
            
            // Log distance in CM (assuming 1 unit = 100cm/1 meter)
            const distCm = dist * 100;
            // Limit logging frequency to every 30 frames to avoid lag
            if (frames % 30 === 0) {
              addLog(`Distance 127-356: ${distCm.toFixed(2)} cm`);
            }

            // Calculate scale X to match the distance
            const targetScaleX = (dist / modelBaseWidth) * modelStretchFactor;
            arModelRef.current.scale.x = modelScale * targetScaleX;
          }
        }
        
        frames++; // Increment from the global frames counter logic if needed, or track locally
        renderer.render(scene, camera);
      });
    } catch (err) {
      addLog("Error starting mindar: " + err.message);
      console.error(err);
    }
  };

  const stopFaceTracking = () => {
    if (mindAR) {
      mindAR.stop();
      if (mouseMoveRef.current) {
        window.removeEventListener('mousemove', mouseMoveRef.current);
      }
      const container = document.getElementById('mindar-container');
      if (container) container.innerHTML = '';
      setMindAR(null);
      setIsModelVisible(true); // Return model visibility
      addLog("Face tracking stopped, returning to default view.");
    }
  };

  // Handle standard camera stream (non-AR)
  useEffect(() => {
    // Only run standard camera if MindAR is OFF and flag is ON
    if (isCameraActive && !mindAR) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        } catch (err) {
          console.error("Camera error:", err);
          setIsCameraActive(false);
        }
      };
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, mindAR]);

  // Update AR model scale and position dynamically when sliders change
  useEffect(() => {
    if (arModelRef.current) {
      if (!autoStretch) {
        // Final X is Global Scale * X Multiplier
        arModelRef.current.scale.set(modelScale * modelScaleX, modelScale, modelScale);
      } else {
        // In auto-mode, scale Y and Z follow global scale
        arModelRef.current.scale.y = modelScale;
        arModelRef.current.scale.z = modelScale;
      }
      arModelRef.current.position.set(modelOffsetX, modelOffsetY, modelOffsetZ);
    }
  }, [modelScale, modelScaleX, modelOffsetX, modelOffsetY, modelOffsetZ, autoStretch]);

  // Handle anchor visibility toggle
  useEffect(() => {
    anchorDotsRef.current.forEach(dot => {
      dot.visible = showAnchors;
    });
  }, [showAnchors]);

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Tooltip for anchor IDs */}
      <div id="ar-tooltip" style={{
        position: 'fixed',
        display: 'none',
        background: '#000',
        color: '#fff',
        padding: '5px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 10000,
        pointerEvents: 'none'
      }}></div>

      <div className="ar-modal-content" style={{ width: '100%', height: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="ar-modal-layout">
          {/* LEFT SIDEBAR: Color Variants */}
          <aside className="ar-sidebar-left">
            <h4>Variants</h4>
            <div className="color-selection-grid">
              {colorVariants.map((variant) => (
                <div
                  key={variant.hex}
                  className={`color-variant-item ${selectedColor === variant.hex ? 'active' : ''}`}
                  onClick={() => setSelectedColor(variant.hex)}
                >
                  <div className="color-circle" style={{ backgroundColor: variant.hex }}>
                    {selectedColor === variant.hex && <span className="checkmark">L</span>}
                  </div>
                  <span className="color-name">{variant.name}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-item-info">
              <h3>{item?.name}</h3>
              <p>{item?.type}</p>
              <div className="price-tag">${item?.price}</div>
            </div>
          </aside>

          {/* CENTER: AR Viewport */}
          <main className="ar-viewport-center" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* MindAR Container - 16:9 Aspect Ratio Lock */}
            <div
              id="mindar-container"
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                maxHeight: '100%',
                zIndex: mindAR ? 10 : -1,
                display: mindAR ? 'block' : 'none'
              }}
            ></div>

            {/* Hide standard React Three Fiber stuff when MindAR is active to prevent overlapping */}
            {!mindAR && (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '100%' }}>

                {/* Fixed standard camera layout to enforce 16:9 correctly behind the canvas */}
                {isCameraActive && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      objectFit: 'cover', transform: 'scaleX(-1)' // Mirroring standard feed
                    }}
                  />
                )}

                {!isCameraActive && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexCol: 'column' }}>
                    <div className="camera-placeholder" style={{ position: 'static', transform: 'none' }}>
                      <div className="icon">📷</div>
                      <h3>Camera Feed Off</h3>
                      <p>Enable for real AR experience</p>
                    </div>
                  </div>
                )}

                {/* R3F Canvas overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
                  <Canvas shadows gl={{ alpha: true, antialias: true }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                    <ambientLight intensity={isCameraActive ? 0.7 : 0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

                    {isModelVisible && (
                      <Suspense fallback={null}>
                        <GlassesModel color={selectedColor} autoRotate={!isCameraActive} />
                        <Environment preset="city" />
                      </Suspense>
                    )}
                  </Canvas>
                </div>
              </div>
            )}

            <div className="ar-ui-overlay" style={{ zIndex: 100 }}>
              <div className={`status-badge ${isCameraActive || mindAR ? 'ready' : ''}`}>
                {(isCameraActive || mindAR) ? '● CAMERA LIVE' : '○ CAMERA READY'}
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR: Actions & Diagnostics */}
          <aside className="ar-sidebar-right">
            <div className="control-card glass-morphism">
              <h4>Controls</h4>

              {/* Dynamic Scale & Position Sliders */}
              <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Model Scale:</span>
                  <span>{modelScale.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min="0.1" max="3.0" step="0.05"
                  value={modelScale}
                  onChange={(e) => setModelScale(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }}
                />

                {!autoStretch && (
                  <>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <span>Width Multiplier (X):</span>
                      <span>{modelScaleX.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.1" max="3.0" step="0.05"
                      value={modelScaleX}
                      onChange={(e) => setModelScaleX(parseFloat(e.target.value))}
                      style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }}
                    />
                  </>
                )}

                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span>Offset X (Left/Right):</span>
                  <span>{modelOffsetX.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="-1.5" max="1.5" step="0.01"
                  value={modelOffsetX}
                  onChange={(e) => setModelOffsetX(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }}
                />

                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span>Offset Y (Up/Down):</span>
                  <span>{modelOffsetY.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="-1.5" max="1.5" step="0.01"
                  value={modelOffsetY}
                  onChange={(e) => setModelOffsetY(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }}
                />

                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span>Offset Z (Depth):</span>
                  <span>{modelOffsetZ.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="-1.5" max="1.5" step="0.01"
                  value={modelOffsetZ}
                  onChange={(e) => setModelOffsetZ(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }}
                />

                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '10px' }}>Auto-Stretch Calibration</h4>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.7rem' }}>Ear 1 ID</label>
                      <input 
                        type="number" 
                        value={earAnchor1} 
                        onChange={(e) => setEarAnchor1(parseInt(e.target.value))}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem' }}>Ear 2 ID</label>
                      <input 
                        type="number" 
                        value={earAnchor2} 
                        onChange={(e) => setEarAnchor2(parseInt(e.target.value))}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px' }}
                      />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <input 
                      type="checkbox" 
                      checked={autoStretch} 
                      onChange={(e) => setAutoStretch(e.target.checked)} 
                    />
                    Enable Auto-Stretch (X-axis)
                  </label>

                  {autoStretch && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Stretch Factor:</span>
                        <span>{modelStretchFactor.toFixed(2)}</span>
                      </label>
                      <input 
                        type="range" 
                        min="0.5" max="5.0" step="0.1" 
                        value={modelStretchFactor} 
                        onChange={(e) => setModelStretchFactor(parseFloat(e.target.value))}
                        style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }}
                      />
                    </div>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', marginTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={showAnchors} 
                      onChange={(e) => setShowAnchors(e.target.checked)} 
                    />
                    Show All 468 Anchor Dots
                  </label>
                </div>
              </div>

              <button
                className="button-primary"
                onClick={handleStandardCameraToggle}
                style={{ width: '100%', marginTop: '10px', opacity: mindAR ? 0.5 : 1 }}
                disabled={mindAR !== null}
              >
                {isCameraActive ? 'Disable Standard Camera' : 'Turn On Standard Camera'}
              </button>
              <button
                className="button-primary"
                onClick={() => setIsModelVisible(!isModelVisible)}
                style={{ width: '100%', marginTop: '10px', opacity: mindAR ? 0.5 : 1 }}
                disabled={mindAR !== null}
              >
                {isModelVisible ? 'Hide 3D Model' : 'Show 3D Model'}
              </button>
              <button
                className="button-primary"
                onClick={mindAR ? stopFaceTracking : initFaceTracking}
                style={{ width: '100%', marginTop: '10px', backgroundColor: mindAR ? '#ef4444' : '#10b981' }}
              >
                {mindAR ? 'Stop MindAR Tracking' : 'Start AR Face Tracking'}
              </button>
            </div>

            <div className="control-card glass-morphism">
              <h4>Diagnostics</h4>
              <div className="diagnostic-stat">
                <span>Face Detect:</span>
                <span className={`dot ${mindAR ? 'green' : 'red'}`}></span>
              </div>
              <div className="diagnostic-stat">
                <span>FPS:</span>
                <span className="value">{fps}</span>
              </div>
            </div>

            {/* LOGS PANEL */}
            <div className="control-card glass-morphism">
              <h4>Debugger Logs</h4>
              <div style={{
                height: '140px', overflowY: 'auto', fontSize: '0.75rem', fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '8px', color: '#10b981',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                {logs.length === 0 ? "No logs yet..." : logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>

            <button className="add-to-cart-btn button-primary">
              Add to Cart
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ARTryOnTestPage;
