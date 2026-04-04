import React from 'react';

const Header = ({ onLoginClick, onSignupClick, setCurrentPage, activePage }) => {
  return (
    <header className="shop-header glass-morphism">
      <div className="header-content">
        <div className="logo premium-gradient-text" style={{cursor: 'pointer'}} onClick={() => setCurrentPage && setCurrentPage('introduction')}>OPTIC VR</div>
        <nav>
          <a href="#" className={activePage === 'introduction' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage && setCurrentPage('introduction'); }}>Introduction</a>
          <a href="#" className={activePage === 'store' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage && setCurrentPage('store'); }}>Store</a>
          <a href="#">AR Laboratory</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button">🛒</button>
          <button className="secondary-button" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'transparent' }} onClick={onSignupClick}>Sign Up</button>
          <button className="button-primary" style={{ padding: '8px 16px', borderRadius: '8px' }} onClick={onLoginClick}>Log In</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
