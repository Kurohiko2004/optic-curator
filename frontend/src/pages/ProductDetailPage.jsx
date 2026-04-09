import React, { useState, useRef, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import Header from '../components/layout/Header';
import ARTryOnModal, { GlassesModel } from './ARTryOnPage';
import { glassesItems } from '../data/shopData';
import './ProductDetailPage.css';

// Component for the 3D preview in the detail page
const RotatingModel = ({ color }) => {
  const meshRef = useRef();
  
  // Slow 360 rotation logic
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      <GlassesModel color={color} />
    </group>
  );
};

const ProductDetailPage = ({ onLoginClick, onSignupClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = glassesItems.find((p) => p.id === parseInt(id));

  const [arModal, setArModal] = useState({ isOpen: false });
  const [is3DView, setIs3DView] = useState(false);
  
  // Define variants
  const colorVariants = [
    { name: 'Obsidian Black', hex: '#1a1a1a' },
    { name: 'Sapphire Blue', hex: '#1e40af' },
    { name: 'Rose Gold', hex: '#fb8500' },
    { name: 'Cyber Silver', hex: '#94a3b8' }
  ];

  const [selectedVariant, setSelectedVariant] = useState(
    colorVariants.find(v => v.name === item?.color) || colorVariants[0]
  );

  if (!item) {
    return (
      <div className="product-detail-page">
        <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
        <div className="error-container">
          <h2>Product Not Found</h2>
          <Link to="/store" className="button-primary">Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page animate-fade-in">
      <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} activePage="store" />

      <main className="detail-container">
        {/* Back Button */}
        <button className="back-to-store-btn" onClick={() => navigate('/store')}>
          ← Back to Store
        </button>

        <div className="detail-grid">
          {/* Left: Product Visuals */}
          <div className="product-visuals">
            <div className="variant-sidebar">
              {colorVariants.map((variant) => (
                <div 
                  key={variant.name} 
                  className={`variant-dot ${selectedVariant.name === variant.name ? 'active' : ''}`}
                  onClick={() => setSelectedVariant(variant)}
                  title={variant.name}
                >
                  <div className="dot-fill" style={{ backgroundColor: variant.hex }}></div>
                </div>
              ))}
            </div>

            <div className="image-main-wrapper glass-morphism">
              {is3DView && !arModal.isOpen ? (
                <div className="canvas-wrapper">
                  <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
                    <ambientLight intensity={0.7} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Suspense fallback={null}>
                      <RotatingModel color={selectedVariant.hex} />
                      <Environment preset="city" />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} />
                  </Canvas>
                </div>
              ) : (
                <img src={item.image} alt={item.name} className="main-product-img" />
              )}
              
              <button 
                className="view-toggle-btn"
                onClick={() => setIs3DView(!is3DView)}
              >
                {is3DView ? 'Show Image' : 'View 3D Preview'}
              </button>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="product-essentials">
            <div className="breadcrumb-nav">
              <Link to="/store">Store</Link> <span className="separator">/</span> <span>{item.type}</span>
            </div>

            <h1 className="premium-gradient-text">{item.name}</h1>
            <div className="price-label">${item.price}</div>

            <div className="product-specs">
              <div className="spec-item">
                <span className="label">Frame Material:</span>
                <span className="value">{item.type}</span>
              </div>
              <div className="spec-item">
                <span className="label">Selected Color:</span>
                <span className="value" style={{ color: selectedVariant.hex }}>{selectedVariant.name}</span>
              </div>
              <div className="spec-item">
                <span className="label">Lens Type:</span>
                <span className="value">Polarized UV400</span>
              </div>
            </div>

            <p className="product-description">
              The {item.name} in <strong>{selectedVariant.name}</strong> represents the pinnacle of optical engineering. 
              Crafted from premium {item.type.toLowerCase()}, these frames offer unparalleled 
              durability with a weightless feel. Perfect for both professional and casual environments.
            </p>

            <div className="action-buttons">
              <button 
                className="button-primary ar-trigger" 
                onClick={() => setArModal({ isOpen: true })}
              >
                <span className="icon">🕶️</span> Virtual AR Try-On
              </button>
              <button className="secondary-button add-cart">
                Add to Cart
              </button>
            </div>

            <div className="trust-badges">
              <span>✓ Free Shipping</span>
              <span>✓ 2 Year Warranty</span>
              <span>✓ AR Certified</span>
            </div>
          </div>
        </div>
      </main>

      <ARTryOnModal 
        isOpen={arModal.isOpen} 
        onClose={() => setArModal({ isOpen: false })} 
        selectedItemId={item.id} 
      />
    </div>
  );
};

export default ProductDetailPage;
