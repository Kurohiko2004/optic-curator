import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/shop/ProductCard';
import ShopHero from '../components/shop/ShopHero';
import ShopBanner from '../components/shop/ShopBanner';
import Pagination from '../components/shop/Pagination';
import ARTryOnModal from './ARTryOnPage';

// Services
import { fetchGlasses, fetchShapes } from '../services/api';

// Extracted Data & Hooks
import { faceShapes } from '../data/shopData';
import { useShopFilters } from '../hooks/useShopFilters';

// Extracted CSS
import './ShopPage.css';

const ShopPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const { 
    price, setPrice, 
    expandedFilters, toggleFilter, 
    itemsPerPage, setItemsPerPage 
  } = useShopFilters();

  const [glasses, setGlasses] = useState([]);
  const [availableShapes, setAvailableShapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arModal, setArModal] = useState({ isOpen: false, itemId: null });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load static data like shapes once
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const shapesData = await fetchShapes();
        // Adjust based on shapes API response structure
        setAvailableShapes(shapesData.data || shapesData);
      } catch (error) {
        console.error("Error fetching shapes:", error);
      }
    };
    loadStaticData();
  }, []);

  // Fetch glasses based on page, limit, and filters
  useEffect(() => {
    const loadGlasses = async () => {
      setLoading(true);
      try {
        const response = await fetchGlasses({
          page: currentPage,
          items: itemsPerPage,
          // You can add sortBy, sortOrder, search here later from state
        });
        
        // Based on API response: { data: [], totalPages: 1, totalItems: 3, currentPage: 1 }
        setGlasses(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || 0);
      } catch (error) {
        console.error("Error fetching glasses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGlasses();
  }, [currentPage, itemsPerPage]);

  const startTryOn = (itemId) => {
    setArModal({ isOpen: true, itemId });
  };

  const closeTryOn = () => {
    setArModal({ ...arModal, isOpen: false });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          shapes={availableShapes}
          faceShapes={faceShapes}
        />

        <div className="product-matrix-container">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : (
            <>
              <div className="results-info" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                <span>Showing {glasses.length} of {totalItems} products</span>
              </div>
              
              <div className="matrix-grid">
                {glasses.length > 0 ? (
                  glasses.map(item => (
                    <ProductCard 
                      key={item.id} 
                      item={item} 
                      onTryOnClick={() => startTryOn(item.id)} 
                    />
                  ))
                ) : (
                  <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                    <h3>No products found.</h3>
                  </div>
                )}
              </div>

              <Pagination 
                itemsPerPage={itemsPerPage} 
                setItemsPerPage={setItemsPerPage} 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
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
