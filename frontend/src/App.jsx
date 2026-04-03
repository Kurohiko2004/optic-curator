import React, { useState } from 'react';
import ShopPage from './pages/ShopPage';
import IntroductionPage from './pages/IntroductionPage';
import LoginModal from './components/auth/LoginModal';
import SignupModal from './components/auth/SignupModal';
import './index.css';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('introduction'); // 'introduction' or 'store'

  const openLogin = () => { setIsSignupOpen(false); setIsLoginOpen(true); };
  const openSignup = () => { setIsLoginOpen(false); setIsSignupOpen(true); };

  return (
    <div className="app-container">
      <div className="hero-background">
        <div className="glow-circle" style={{ top: '10%', left: '15%', width: '300px', height: '300px', background: 'var(--accent-primary)' }}></div>
        <div className="glow-circle" style={{ bottom: '15%', right: '10%', width: '400px', height: '400px', background: 'var(--accent-secondary)' }}></div>
      </div>
      
      {currentPage === 'introduction' ? (
        <IntroductionPage 
          onLoginClick={openLogin} 
          onSignupClick={openSignup} 
          setCurrentPage={setCurrentPage} 
        />
      ) : (
        <ShopPage 
          onLoginClick={openLogin} 
          onSignupClick={openSignup} 
          setCurrentPage={setCurrentPage} 
        />
      )}
      
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onSignupClick={openSignup} />}
      {isSignupOpen && <SignupModal onClose={() => setIsSignupOpen(false)} onLoginClick={openLogin} />}
    </div>
  );
}

export default App;
