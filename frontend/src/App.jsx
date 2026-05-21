import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ShopPage from './pages/ShopPage';
import IntroductionPage from './pages/IntroductionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ARTryOnPage from './pages/ARTryOnPage';
import AuthModal from './components/auth/AuthModal';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';
import OrderPage from "./pages/OrderPage.jsx";
import OrderHistoryPage from "./pages/OrderHistoryPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PaymentResultPage from "./pages/PaymentResultPage.jsx";
import FaceDetectPage from "./pages/FaceDetectPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Component bảo vệ route Admin
const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      // Nếu không phải Admin hoặc chưa đăng nhập, chuyển hướng về /store
      navigate('/store', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'Admin') {
    // Có thể hiển thị loading spinner hoặc null trong khi chờ xác thực
    return null;
  }

  return children;
};

// Component bảo vệ route thông thường (yêu cầu đăng nhập)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Nếu chưa đăng nhập, chuyển hướng về /store
      navigate('/store', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

  return children;
};

function AppContent() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (justLoggedIn && user?.role === 'Admin') {
      navigate('/admin');
      setJustLoggedIn(false);
    }
  }, [user, justLoggedIn, navigate]);

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeAuthModal = () => setAuthModal(prev => ({ ...prev, isOpen: false }));

  const handleAuthSuccess = (userData) => {
    setJustLoggedIn(true);
    closeAuthModal();
  };

  const handleLogout = () => {
    logout(); // Xóa thông tin user và token
    navigate('/store'); // Chuyển hướng về trang cửa hàng
  };

  return (
    <ToastProvider>
      <CartProvider userToken={localStorage.getItem('token')}>
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
              <CartPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />

            <Route path="/orders/me" element={
              <OrderPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />

            <Route path="/orders/history" element={
              <OrderHistoryPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />

            <Route path="/payment/result" element={
              <PaymentResultPage />
            } />

            <Route path="/ar-test" element={
              <ARTryOnPage />
            } />

            <Route path="/face_detect" element={
              <FaceDetectPage
                onLoginClick={openLogin}
                onSignupClick={openSignup}
                user={user}
                onLogout={handleLogout}
              />
            } />

            {/* Protected User Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage
                  onLoginClick={openLogin}
                  onSignupClick={openSignup}
                  user={user}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            } />

            {/* Protected Admin Route */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminDashboard
                  onLoginClick={openLogin}
                  onSignupClick={openSignup}
                  user={user}
                  onLogout={handleLogout}
                />
              </AdminProtectedRoute>
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
    </ToastProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
