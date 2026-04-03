import React from 'react';

const ProductCard = ({ item }) => {
  return (
    <div className="product-card glass-morphism animate-fade-in">
      <div className="product-image-container">
        <img src={item.image} alt={item.name} />
        <div className="try-on-badge">AR Ready</div>
      </div>
      <div className="product-info">
        <div className="info-top">
          <h4>{item.name}</h4>
          <span className="price">${item.price}</span>
        </div>
        <p className="type">{item.type}</p>
        <p className="color">{item.color}</p>
        <div className="product-actions">
          <button className="secondary-button" style={{ flex: 1 }}>Details</button>
          <button className="button-primary" style={{ flex: 1, padding: '10px' }}>
            AR Try-On
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
