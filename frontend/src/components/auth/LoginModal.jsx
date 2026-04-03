import React from 'react';
import './LoginModal.css';

const LoginModal = ({ onClose, onSignupClick }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* e.stopPropagation() prevents closing when clicking INSIDE the white box */}
      <div className="modal-content glass-morphism animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="premium-gradient-text" style={{ marginBottom: '30px', display: 'block', textAlign: 'center' }}>Log In</h2>
        
        <div className="input-group">
          <input type="text" placeholder="Username" />
        </div>
        
        <div className="input-group">
          <input type="password" placeholder="Password" />
        </div>
        
        <button className="button-primary login-submit-btn">Log In</button>
        
        <p className="signup-link">New to OPTIC VR? <span className="premium-gradient-text" onClick={onSignupClick} style={{cursor: 'pointer'}}>Create account</span></p>
      </div>
    </div>
  );
};

export default LoginModal;
