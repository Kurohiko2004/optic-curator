import React from 'react';

const ShopBanner = () => {
  return (
    <div className="shop-banner animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <img src="/banner.png" alt="Model wear glasses" className="banner-img" />
      <div className="banner-overlay">
        <div className="exclusive-badge">SEASON 2026</div>
        <h2>THE VISIONARY COLLECTION</h2>
        <button className="button-primary">Experience the Look</button>
      </div>
    </div>
  );
};

export default ShopBanner;
