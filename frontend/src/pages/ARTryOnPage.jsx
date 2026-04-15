import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, useGLTF } from '@react-three/drei';
import { glassesItems } from '../data/shopData';
import './ARTryOnPage.css';

// Real 3D GLTF Model Component
export const GlassesModel = ({ modelPath, color }) => {
  // fail-safe
  const { scene } = useGLTF(modelPath || '/model/glasses/glass1.glb');

  // const { scene } = useGLTF(modelPath);

  // Apply color to the frame material
  // Assuming the frame parts are named consistently or we can target by index/type
useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Target ONLY Plane001 for the frame color
        if (child.name === 'Plane001') {
          if (child.material) {
            child.material.color.set(color);
          }
        }

        // Target ONLY Plane for the lens transparency
        if (child.name === 'Plane') {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.6;
            child.material.color.set('#000000');
          }
        }

        // Note: Plane002 (Handle) is ignored by this logic, so it keeps its original material.
      }
    });
  }, [scene, color]);

  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive object={scene} scale={1.5} position={[0, -0.2, 0]} />
    </Float>
  );
};

const ARTryOnModal = ({ isOpen, onClose, selectedItemId }) => {
  const item = glassesItems.find(i => i.id === selectedItemId) || glassesItems[0];
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Handle camera stream
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setIsCameraActive(false);
        alert("Camera access denied.");
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isCameraActive]);
  
  // Available color variants
  const colorVariants = [
    { name: 'Obsidian Black', hex: '#1a1a1a' },
    { name: 'Sapphire Blue', hex: '#1e40af' },
    { name: 'Rose Gold', hex: '#fb8500' },
    { name: 'Cyber Silver', hex: '#94a3b8' }
  ];

  const [selectedColor, setSelectedColor] = useState(colorVariants[0].hex);

  // Update color when item changes
  useEffect(() => {
    if (item) {
      const initialColor = colorVariants.find(v => v.name === item.color)?.hex || colorVariants[0].hex;
      setSelectedColor(initialColor);
    }
  }, [selectedItemId]);

  if (!isOpen) return null;

  return (
    <div className="ar-modal-overlay" onClick={onClose}>
      <div className="ar-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        
        <div className="ar-modal-layout">
          {/* LEFT SIDEBAR: Color Variants */}
          <aside className="ar-sidebar-left">
            <h4>Colors</h4>
            <div className="color-selection-grid">
              {colorVariants.map((variant) => (
                <div 
                  key={variant.hex}
                  className={`color-variant-item ${selectedColor === variant.hex ? 'active' : ''}`}
                  onClick={() => setSelectedColor(variant.hex)}
                >
                  <div 
                    className="color-circle"
                    style={{ backgroundColor: variant.hex }}
                  >
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
          <main className="ar-viewport-center">
            <div className={`ar-canvas-container ${isCameraActive ? 'with-camera' : ''}`}>
              <Canvas 
                shadows 
                gl={{ alpha: true, antialias: true }}
                onCreated={({ gl }) => {
                  gl.setClearColor(0x000000, 0); // Transparent background
                }}
              >
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={isCameraActive ? 0.7 : 0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                
                <Suspense fallback={null}>
                  <GlassesModel color={selectedColor} />
                  <Environment preset="city" />
                </Suspense>

                <OrbitControls enablePan={false} minDistance={2} maxDistance={10} />
              </Canvas>
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`ar-video-feed ${isCameraActive ? 'visible' : ''}`}
            />

            {!isCameraActive && (
              <div className="camera-placeholder">
                <div className="icon">📷</div>
                <h3>Camera is Off</h3>
                <p>Turn on to experience live AR</p>
              </div>
            )}

            <div className="ar-ui-overlay">
              <div className={`status-badge ${isCameraActive ? 'ready' : ''}`}>
                {isCameraActive ? '● CAMERA ACTIVE' : '○ CAMERA READY'}
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR: Actions & Diagnostics */}
          <aside className="ar-sidebar-right">
             <div className="control-card glass-morphism">
               <h4>Controls</h4>
               <button 
                className="button-primary" 
                onClick={() => setIsCameraActive(!isCameraActive)}
                style={{ width: '100%', marginTop: '10px' }}
              >
                {isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
              </button>
             </div>

              <div className="control-card glass-morphism">
                <h4>Diagnostics</h4>
                <div className="diagnostic-stat">
                  <span>Face detection:</span>
                  <span className={`dot ${isCameraActive ? 'green' : 'red'}`}></span>
                </div>
                <div className="diagnostic-stat">
                  <span>Lighting:</span>
                  <span className="dot green"></span>
                </div>
                <div className="diagnostic-stat">
                  <span>FPS:</span>
                  <span className="value">60</span>
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

export default ARTryOnModal;
