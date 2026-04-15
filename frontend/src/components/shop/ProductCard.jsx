import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {formatPrice} from "../../utils/formatPrice.js";
import { useToast } from '../../context/ToastContext';
import QuantityPopup from '../common/QuantityPopup';

const ProductCard = ({ item, onTryOnClick }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsPopupOpen(true);
  };

  const handleConfirmAddToCart = async (quantity) => {
    setAdding(true);
    try {
      await addToCart(item.id, quantity);
      showToast('Product added to cart!', 'success');
      setIsPopupOpen(false);
    } catch (err) {
      showToast(err.message || 'Please log in to use this feature', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card glass-morphism animate-fade-in">
      <div className="product-image-container">
        <img src={item.image} alt={item.name} />
        <div className="try-on-badge">AR Ready</div>
      </div>
      <div className="product-info">
        <div className="info-top">
          <h4>{item.name}</h4>
          <span className="price">{formatPrice(item.price)}</span>
        </div>
        <p className="type">{item.type}</p>
        <p className="color">{item.color}</p>
        <div className="product-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button 
                className="secondary-button" 
                style={{ flex: 1, padding: '10px 12px' }}
                onClick={() => navigate(`/item/${item.id}`)}
            >
                Details
            </button>
            <button className="button-primary" style={{ flex: 1, padding: '10px 12px' }} onClick={onTryOnClick}>
                Try AR
            </button>
          </div>
          <button 
            className="button-primary" 
            style={{ width: '100%', background: 'var(--accent-secondary)' }} 
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <QuantityPopup
        isOpen={isPopupOpen}
        initialQuantity={1}
        max={item.stock || 99}
        onConfirm={handleConfirmAddToCart}
        onCancel={() => setIsPopupOpen(false)}
        title="Choose quantity"
      />
    </div>
  );
};

export default ProductCard;
