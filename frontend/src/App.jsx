import React from 'react';
import ShopPage from './pages/ShopPage';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <div className="hero-background">
        <div className="glow-circle" style={{ top: '10%', left: '15%', width: '300px', height: '300px', background: 'var(--accent-primary)' }}></div>
        <div className="glow-circle" style={{ bottom: '15%', right: '10%', width: '400px', height: '400px', background: 'var(--accent-secondary)' }}></div>
      </div>
      <ShopPage />
    </div>
  );
}

export default App;
