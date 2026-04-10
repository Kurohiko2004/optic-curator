import { Link, useLocation } from 'react-router-dom';

const Header = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const location = useLocation();
  const activePage = location.pathname;

  return (
    <header className="shop-header glass-morphism">
      <div className="header-content">
        <Link to="/" className="logo premium-gradient-text" style={{ textDecoration: 'none' }}>OPTIC VR</Link>
        <nav>
          <Link to="/" className={activePage === '/' ? 'active' : ''}>Introduction</Link>
          <Link to="/store" className={activePage === '/store' ? 'active' : ''}>Store</Link>
        </nav>
        <div className="header-actions">
          <button className="icon-button">🛒</button>
          {user ? (
            <>
              <span className="user-info" style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>
                Hi, {user.username || 'User'}
              </span>
              <button 
                className="secondary-button" 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'transparent' }} 
                onClick={onLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button 
                className="secondary-button" 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'transparent' }} 
                onClick={onSignupClick}
              >
                Sign Up
              </button>
              <button 
                className="button-primary" 
                style={{ padding: '8px 16px', borderRadius: '8px' }} 
                onClick={onLoginClick}
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
