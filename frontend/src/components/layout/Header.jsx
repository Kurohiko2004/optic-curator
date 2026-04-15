import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const { cartCount = 0 } = useCart() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = location.pathname;

  return (
    <header className="shop-header glass-morphism">
      <div className="header-content">
        <Link to="/" className="logo premium-gradient-text" style={{ textDecoration: 'none' }}>OPTIC VR</Link>
        <nav>
          <Link to="/" className={activePage === '/' ? 'active' : ''}>About</Link>
          <Link to="/store" className={activePage === '/store' ? 'active' : ''}>Shop</Link>
        </nav>
        <div className="header-actions">
          {user && (
            <button 
              className="icon-button cart-btn" 
              style={{ position: 'relative' }}
              onClick={() => navigate('/cart')}
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-badge" style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}
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
