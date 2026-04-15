import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ShopPage from './pages/ShopPage';
import IntroductionPage from './pages/IntroductionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AuthModal from './components/auth/AuthModal';
import { CartProvider } from './context/CartContext';
import './index.css';
import OrderDebugPage from "./pages/OrderDebugPage.jsx";
import CartDebugPage from "./pages/CartDebugPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Import AdminDashboard

function App() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setUser({ loggedIn: true });
    }
  }, [token]);

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeAuthModal = () => setAuthModal(prev => ({ ...prev, isOpen: false }));

  const handleAuthSuccess = (userData) => {
    const newToken = localStorage.getItem('token');
    setToken(newToken);
    setUser(userData);
    closeAuthModal();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
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
            <CartDebugPage
                onLoginClick={openLogin}
                onSignupClick={onSignupClick}
                user={user}
                onLogout={handleLogout}
            />
          } />

          <Route path="/orders/me" element={
            <OrderDebugPage
                onLoginClick={openLogin}
                onSignupClick={onSignupClick}
                user={user}
                onLogout={handleLogout}
            />
          } />

          {/* Admin Dashboard Route */}
          <Route path="/admin" element={
            <AdminDashboard
                onLoginClick={openLogin}
                onSignupClick={onSignupClick}
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
  );
}

export default App;
