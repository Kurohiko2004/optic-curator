import React from 'react';

const ShopBanner = () => {
  return (
    <div className="shop-banner animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <img src="/banner-new.jpg" alt="Người mẫu đeo kính" className="banner-img" />
      <div className="banner-overlay">
        <div className="exclusive-badge">Season 2026</div>
        <h2>THE VISUAL COLLECTION</h2>
      </div>
    </div>
  );
};

export default ShopBanner;
