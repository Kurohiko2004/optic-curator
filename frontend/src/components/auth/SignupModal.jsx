import React from 'react';
import './SignupModal.css';

const SignupModal = ({ onClose, onLoginClick }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-morphism animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="premium-gradient-text" style={{ marginBottom: '30px', display: 'block', textAlign: 'center' }}>Create Account</h2>
        
        <div className="input-group">
          <input type="text" placeholder="Username" />
        </div>
        
        <div className="input-group">
          <input type="email" placeholder="Email Address" />
        </div>
        
        <div className="input-group">
          <input type="password" placeholder="Password" />
        </div>
        
        <button className="button-primary login-submit-btn">Sign Up</button>
        
        <p className="signup-link">Already have an account? <span className="premium-gradient-text" onClick={onLoginClick} style={{cursor: 'pointer'}}>Log In</span></p>
      </div>
    </div>
  );
};

export default SignupModal;
