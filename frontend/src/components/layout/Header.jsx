import React from 'react';

const Header = () => {
  return (
    <header className="shop-header glass-morphism">
      <div className="header-content">
        <div className="logo premium-gradient-text">OPTIC VR</div>
        <nav>
          <a href="#">Introduction</a>
          <a href="#" className="active">Store</a>
          <a href="#">AR Laboratory</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button">🛒</button>
          <button className="button-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Login</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
