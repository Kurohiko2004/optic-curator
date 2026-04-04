import React, { useState, useEffect } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, initialMode, onClose }) => {
  const [mode, setMode] = useState(initialMode || 'login');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-morphism animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="premium-gradient-text" style={{ marginBottom: '30px', display: 'block', textAlign: 'center' }}>
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </h2>

        <div className="input-group">
          <input type="text" placeholder="Username" />
        </div>

        {mode === 'signup' && (
          <div className="input-group">
            <input type="email" placeholder="Email Address" />
          </div>
        )}

        <div className="input-group password-group">
        <input 
          type={showPassword ? 'text' : 'password'} 
          placeholder="Password" 
        />
        <button 
          type="button" 
          className="password-toggle-btn" 
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          )}
        </button>
      </div>

        <button className="button-primary login-submit-btn">
          {mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>

        {mode === 'login' ? (
          <p className="signup-link">
            New to OPTIC? <span className="premium-gradient-text" onClick={() => setMode('signup')} style={{ cursor: 'pointer' }}>Create account</span>
          </p>
        ) : (
          <p className="signup-link">
            Already have an account? <span className="premium-gradient-text" onClick={() => setMode('login')} style={{ cursor: 'pointer' }}>Log In</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
