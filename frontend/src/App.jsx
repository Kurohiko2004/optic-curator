import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ShopPage from './pages/ShopPage';
import IntroductionPage from './pages/IntroductionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ARTryOnTestPage from './pages/ARTryOnTestPage';
import AuthModal from './components/auth/AuthModal';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';
import OrderPage from "./pages/OrderPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  // Khởi tạo token từ localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Khởi tạo user đồng bộ với token ngay từ lần render đầu tiên
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return savedToken ? { loggedIn: true } : null;
  });

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeAuthModal = () => setAuthModal(prev => ({ ...prev, isOpen: false }));

  const handleAuthSuccess = (userData) => {
    const newToken = localStorage.getItem('token');
    setToken(newToken);
    setUser(userData); // Lưu thông tin user từ API trả về
    closeAuthModal();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <ToastProvider>
      <CartProvider userToken={token}>
        <div className="app-container">
          <div className="hero-background">
            <div className="glow-circle" style={{ top: '10%', left: '15%', width: '300px', height: '300px', background: 'var(--accent-primary)' }}></div>
            <div className="glow-circle" style={{ bottom: '15%', right: '10%', width: '400px', height: '400px', background: 'var(--accent-secondary)' }}></div>
          </div>

          <Routes>
            <Route path="/" element={
              <IntroductionPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />
            <Route path="/store" element={
              <ShopPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />
            <Route path="/item/:id" element={
              <ProductDetailPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />

            <Route path="/cart" element={
              <CartPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />

            <Route path="/orders/me" element={
              <OrderPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />

            <Route path="/ar-test" element={
              <ARTryOnTestPage />
            } />
            <Route path="/admin" element={
              <AdminDashboard
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />
          </Routes>

          <AuthModal
            isOpen={authModal.isOpen}
            initialMode={authModal.mode}
            onClose={closeAuthModal}
            onSuccess={handleAuthSuccess}
          />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
