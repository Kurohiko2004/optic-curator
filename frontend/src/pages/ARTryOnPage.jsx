import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import { glassesItems } from '../data/shopData';
import './ARTryOnPage.css';

// A simple dummy model component representing the glasses
export const DummyGlassesModel = ({ color }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh rotation={[0.1, 0, 0]}>
        {/* Frame Front */}
        <boxGeometry args={[2, 0.5, 0.1]} />
        <meshStandardMaterial color={color || '#818cf8'} roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Left Lens */}
      <mesh position={[-0.5, 0, 0.05]}>
        <circleGeometry args={[0.4, 32]} />
        <MeshDistortMaterial 
          color="#000" 
          speed={0} 
          distort={0} 
          opacity={0.6} 
          transparent 
        />
      </mesh>
      
      {/* Right Lens */}
      <mesh position={[0.5, 0, 0.05]}>
        <circleGeometry args={[0.4, 32]} />
        <MeshDistortMaterial 
          color="#000" 
          speed={0} 
          distort={0} 
          opacity={0.6} 
          transparent 
        />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, -0.05, 0.05]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color={color || '#818cf8'} />
      </mesh>
    </Float>
  );
};

const ARTryOnModal = ({ isOpen, onClose, selectedItemId }) => {
  const item = glassesItems.find(i => i.id === selectedItemId) || glassesItems[0];
  const [isCameraActive, setIsCameraActive] = useState(false);
  
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
            <h4>Variants</h4>
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
            <div className="ar-canvas-container">
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                
                <Suspense fallback={null}>
                  <DummyGlassesModel color={selectedColor} />
                  <Environment preset="city" />
                </Suspense>

                <OrbitControls enablePan={false} minDistance={2} maxDistance={10} />
              </Canvas>
            </div>

            {!isCameraActive && (
              <div className="camera-placeholder">
                <div className="icon">📷</div>
                <h3>Camera Feed Off</h3>
                <p>Enable for real AR experience</p>
              </div>
            )}

            <div className="ar-ui-overlay">
              <div className={`status-badge ${isCameraActive ? 'ready' : ''}`}>
                {isCameraActive ? '● CAMERA LIVE' : '○ CAMERA READY'}
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
                {isCameraActive ? 'Disable Camera' : 'Turn On Camera'}
              </button>
             </div>

             <div className="control-card glass-morphism">
               <h4>Diagnostics</h4>
               <div className="diagnostic-stat">
                 <span>Face Detect:</span>
                 <span className="dot red"></span>
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
