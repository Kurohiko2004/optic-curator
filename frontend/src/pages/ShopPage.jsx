import React from 'react';
import Header from '../components/layout/Header';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/shop/ProductCard';
import ShopHero from '../components/shop/ShopHero';
import ShopBanner from '../components/shop/ShopBanner';
import Pagination from '../components/shop/Pagination';
import ARTryOnModal from './ARTryOnPage';

// Extracted Data & Hooks
import { glassesItems, shapes, faceShapes } from '../data/shopData';
import { useShopFilters } from '../hooks/useShopFilters';

// Extracted CSS
import './ShopPage.css';

const ShopPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const { 
    price, setPrice, 
    expandedFilters, toggleFilter, 
    itemsPerPage, setItemsPerPage 
  } = useShopFilters();

  const [arModal, setArModal] = React.useState({ isOpen: false, itemId: null });

  const startTryOn = (itemId) => {
    setArModal({ isOpen: true, itemId });
  };

  const closeTryOn = () => {
    setArModal({ ...arModal, isOpen: false });
  };

  return (
    <div className="shop-page">
      <Header 
        onLoginClick={onLoginClick} 
        onSignupClick={onSignupClick} 
        user={user}
        onLogout={onLogout}
      />
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
              <ProductCard 
                key={item.id} 
                item={item} 
                onTryOnClick={() => startTryOn(item.id)} 
              />
            ))}
          </div>

          <Pagination 
            itemsPerPage={itemsPerPage} 
            setItemsPerPage={setItemsPerPage} 
          />
        </div>
      </main>

      <ARTryOnModal 
        isOpen={arModal.isOpen} 
        onClose={closeTryOn} 
        selectedItemId={arModal.itemId} 
      />
    </div>
  );
};

export default ShopPage;
