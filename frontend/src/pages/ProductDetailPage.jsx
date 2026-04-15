import React, { useState, useRef, Suspense, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import Header from '../components/layout/Header';
import ARTryOnModal, { GlassesModel } from './ARTryOnPage';
import { fetchGlassById } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { useToast } from '../context/ToastContext';
import QuantityPopup from '../components/common/QuantityPopup';
import './ProductDetailPage.css';

// Mapping color names to hex for visual representation (Optional fallback)
const colorMap = {
  'Obsidian Black': '#1a1a1a',
  'Sapphire Blue': '#1e40af',
  'Rose Gold': '#fb8500',
  'Cyber Silver': '#94a3b8',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Black': '#000000',
};

const RotatingModel = ({ modelPath, color }) => {
  const meshRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
    console.log(modelPath);
  });



  return (
    <group ref={meshRef}>
      <GlassesModel modelPath={modelPath} color={color} />
    </group>
  );
};

const ProductDetailPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arModal, setArModal] = useState({ isOpen: false });
  const [is3DView, setIs3DView] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const getProductDetail = async () => {
      setLoading(true);
      try {
        const response = await fetchGlassById(id);
        const productData = response.data || response; 
        setItem(productData);
        
        if (productData.colors && productData.colors.length > 0) {
          setSelectedVariant(productData.colors[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Không tìm thấy sản phẩm hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };

    getProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />
        <div className="loading-container" style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>Đang tải thông tin sản phẩm...</h2>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="product-detail-page">
        <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />
        <div className="error-container" style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>{error || "Product Not Found"}</h2>
          <Link to="/store" className="button-primary">Back to Store</Link>
        </div>
      </div>
    );
  }

  const selectedColorHex = selectedVariant ? (colorMap[selectedVariant.name] || '#666') : '#666';

  const handleAddToCart = async () => {
    if (!user || !user.loggedIn) {
      onLoginClick();
      return;
    }

    setIsPopupOpen(true);
  };

  const handleConfirmAddToCart = async (quantity) => {
    setAdding(true);
    try {
      await addToCart(item.id, quantity);
      showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
      setIsPopupOpen(false);
    } catch (err) {
      showToast(err.message || 'Không thể thêm sản phẩm vào giỏ hàng', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-detail-page animate-fade-in">
      <Header 
        onLoginClick={onLoginClick} 
        onSignupClick={onSignupClick} 
        user={user} 
        onLogout={onLogout} 
        activePage="store" 
      />

      <main className="detail-container">
        <button className="back-to-store-btn" onClick={() => navigate('/store')}>
          ← Back to Store
        </button>

        <div className="detail-grid">
          <div className="product-visuals">
            <div className="variant-sidebar">
              {item.colors && item.colors.map((color) => (
                <div 
                  key={color.id} 
                  className={`variant-dot ${selectedVariant?.id === color.id ? 'active' : ''}`}
                  onClick={() => setSelectedVariant(color)}
                  title={color.name}
                >
                  <div className="dot-fill" style={{ backgroundColor: colorMap[color.name] || '#ccc' }}></div>
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
                      <RotatingModel modelPath={item.modelPath} color={selectedColorHex} />
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

          <div className="product-essentials">
            <div className="breadcrumb-nav">
              <Link to="/store">Store</Link> <span className="separator">/</span> <span>{item.shape?.name || 'Glasses'}</span>
            </div>

            <h1 className="premium-gradient-text">{item.name}</h1>
            <div className="price-label">{formatPrice(Number(item.price))}</div>

            <div className="product-specs">
              <div className="spec-item">
                <span className="label">Frame Material</span>
                <span className="value">{item.materialFrame}</span>
              </div>
              <div className="spec-item">
                <span className="label">Selected Color</span>
                <span className="value">{selectedVariant?.name}</span>
              </div>
              <div className="spec-item">
                <span className="label">Lens Type</span>
                <span className="value">{item.lensType}</span>
              </div>
              <div className="spec-item">
                <span className="label">Stock</span>
                <span className="value">{item.stock} items left</span>
              </div>
            </div>

            <p className="product-description">
              {item.description}
            </p>

            <div className="action-buttons">
              <button 
                type="button"
                className="button-primary ar-trigger" 
                onClick={() => setArModal({ isOpen: true })}
              >
                <span>Virtual AR Try-on</span>
              </button>
              <button
                type="button"
                className="secondary-button add-cart"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
            <QuantityPopup
              isOpen={isPopupOpen}
              initialQuantity={1}
              max={item.stock || 99}
              onConfirm={handleConfirmAddToCart}
              onCancel={() => setIsPopupOpen(false)}
              title="Chọn số lượng"
            />

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
