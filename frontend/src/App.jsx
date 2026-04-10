import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ShopPage from './pages/ShopPage';
import IntroductionPage from './pages/IntroductionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AuthModal from './components/auth/AuthModal';
import './index.css';

function App() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeAuthModal = () => setAuthModal(prev => ({ ...prev, isOpen: false }));

  return (
    <div className="app-container">
      <div className="hero-background">
        <div className="glow-circle" style={{ top: '10%', left: '15%', width: '300px', height: '300px', background: 'var(--accent-primary)' }}></div>
        <div className="glow-circle" style={{ bottom: '15%', right: '10%', width: '400px', height: '400px', background: 'var(--accent-secondary)' }}></div>
      </div>
      
      <Routes>
        <Route path="/" element={
          <IntroductionPage onLoginClick={openLogin} onSignupClick={openSignup} />
        } />
        <Route path="/store" element={
          <ShopPage onLoginClick={openLogin} onSignupClick={openSignup} />
        } />
        <Route path="/item/:id" element={
          <ProductDetailPage onLoginClick={openLogin} onSignupClick={openSignup} />
        } />
      </Routes>
      
      <AuthModal 
        isOpen={authModal.isOpen} 
        initialMode={authModal.mode} 
        onClose={closeAuthModal} 
      />
    </div>
  );
}

export default App;
