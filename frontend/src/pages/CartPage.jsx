import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/layout/Header';
import './CartPage.css';

const CartPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const navigate = useNavigate();
  const { cart, loading, error, loadCart, updateQuantity, removeItem, clearCart } = useCart();
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [loadCart, user]);

  const handleCreateOrder = () => {
    setIsConfirming(true);
  };

  const confirmOrder = () => {
    setIsConfirming(false);
    navigate('/orders/me', { state: { preferredPaymentMethod: paymentMethod } });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user) {
    return (
      <div className="cart-page-wrapper">
        <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />
        <div className="empty-cart-container glass-morphism log-in-prompt">
          <div className="empty-cart-icon">🛒</div>
          <h2>Access Required</h2>
          <p>Please log in to view and manage your cart.</p>
          <button className="button-primary" onClick={onLoginClick}>Log in Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />

      {/* Payment Modal Overlay */}
      {isConfirming && (
        <div className="payment-modal-overlay">
          <div className="payment-modal glass-morphism">
            <h2 className="premium-gradient-text">Confirm Order</h2>
            <p>Please select your payment method to continue.</p>

            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-info">
                  <strong>Cash on Delivery (COD)</strong>
                  <span>Pay with cash upon delivery</span>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="VNPAY"
                  checked={paymentMethod === 'VNPAY'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-info">
                  <strong>VNPay Payment Gateway</strong>
                  <span>Secure payment by QR code, ATM, or credit card</span>
                </div>
              </label>
            </div>

            <div className="payment-actions">
              <button className="btn-cancel" onClick={() => setIsConfirming(false)}>
                Cancel
              </button>
              <button className="button-primary" onClick={confirmOrder}>
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        <h1 className="cart-header-title premium-gradient-text">Shopping Cart</h1>
        
        {loading && !cart ? (
          <div className="cart-loading">
            <span style={{ marginRight: '10px' }}>⏳</span> Loading cart...
          </div>
        ) : (
          <>
            {error && <div className="cart-error">Warning: {error}</div>}

            {cart && cart.cartItems.length > 0 ? (
              <div className="cart-layout">
                {/* Left side: Item list */}
                <div className="cart-items-container">
                  <div className="cart-header-actions">
                    <span>{cart.totalItems} items in cart</span>
                    <button className="clear-cart-btn" onClick={clearCart}>
                      Clear Cart
                    </button>
                  </div>

                  {cart.cartItems.map((item) => (
                    <div key={item.id} className="cart-item glass-morphism">
                      <div className="item-image-container">
                        <img src={item.glasses.image} alt={item.glasses.name} className="item-image" />
                      </div>

                      <div className="item-details">
                        <div className="item-name-group">
                          <div>
                            <h3 className="item-name">{item.glasses.name}</h3>
                            <span className="item-total-line">Unit Price: {formatPrice(item.glasses.price)}</span>
                          </div>
                          <div className="item-price">
                            {formatPrice(item.glasses.price * item.quantity)}
                          </div>
                        </div>

                        <div className="item-controls">
                          <div className="quantity-control">
                            <button 
                              className="qty-btn" 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="qty-value">{item.quantity}</span>
                            <button 
                              className="qty-btn" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          
                          <button className="remove-btn" onClick={() => removeItem(item.id)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Remove item
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right side: Summary Sidebar */}
                <aside>
                  <div className="cart-summary glass-morphism">
                    <h3 className="summary-title">Order Summary</h3>
                    
                    <div className="summary-row">
                      <span>Subtotal ({cart.totalItems} items)</span>
                      <span>{formatPrice(cart.totalPrice)}</span>
                    </div>
                    
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span style={{ color: '#00d1b2' }}>Free</span>
                    </div>

                    <div className="summary-row total-row">
                      <span>Total</span>
                      <span className="summary-total-price">{formatPrice(cart.totalPrice)}</span>
                    </div>

                    <button className="button-primary checkout-btn" onClick={handleCreateOrder}>
                      Proceed to Checkout
                    </button>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="empty-cart-container glass-morphism">
                <div className="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>You haven't added any items to your cart yet. Explore our premium eyewear collection.</p>
                <Link to="/store" className="button-primary continue-shopping-btn">
                  Continue Shopping
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CartPage;
