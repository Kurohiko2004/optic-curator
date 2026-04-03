import React from 'react';
import Header from '../components/layout/Header';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/shop/ProductCard';
import ShopHero from '../components/shop/ShopHero';
import ShopBanner from '../components/shop/ShopBanner';
import Pagination from '../components/shop/Pagination';

// Extracted Data & Hooks
import { glassesItems, shapes, faceShapes } from '../data/shopData';
import { useShopFilters } from '../hooks/useShopFilters';

// Extracted CSS
import './ShopPage.css';

const ShopPage = ({ onLoginClick, onSignupClick }) => {
  const { 
    price, setPrice, 
    expandedFilters, toggleFilter, 
    itemsPerPage, setItemsPerPage 
  } = useShopFilters();

  return (
    <div className="shop-page">
      <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
      <ShopHero />
      <ShopBanner />

      <main className="shop-main-area">
        <FilterSidebar 
          price={price} 
          setPrice={setPrice} 
          expandedFilters={expandedFilters} 
          toggleFilter={toggleFilter}
          shapes={shapes}
          faceShapes={faceShapes}
        />

        <div className="product-matrix-container">
          <div className="matrix-grid">
            {glassesItems.map(item => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>

          <Pagination 
            itemsPerPage={itemsPerPage} 
            setItemsPerPage={setItemsPerPage} 
          />
        </div>
      </main>
    </div>
  );
};

export default ShopPage;
