import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/shop/ProductCard';
import ShopHero from '../components/shop/shopHero';
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
    isPriceFilterActive, togglePriceFilter,
    expandedFilters, toggleFilter,
    itemsPerPage, setItemsPerPage,
    selectedShape, setSelectedShape
  } = useShopFilters();

  const [glasses, setGlasses] = useState([]);
  const [availableShapes, setAvailableShapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arModal, setArModal] = useState({ isOpen: false, itemId: null });

  // Debounced Price for API efficiency and smoother UI
  const [debouncedPrice, setDebouncedPrice] = useState(price);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(price);
    }, 500); // Đợi 500ms sau khi người dùng ngừng kéo slider
    return () => clearTimeout(timer);
  }, [price]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load static data
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const shapesData = await fetchShapes();
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
        const params = {
          page: currentPage,
          items: itemsPerPage,
        };

        if (isPriceFilterActive) {
          params.maxPrice = debouncedPrice; // Sử dụng giá đã debounced
        }

        if (selectedShape && selectedShape.id) {
          params.glassesShapeId = Number(selectedShape.id);
        }

        const response = await fetchGlasses(params);
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
  }, [currentPage, itemsPerPage, debouncedPrice, isPriceFilterActive, selectedShape]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedPrice, isPriceFilterActive, itemsPerPage, selectedShape]);

  const startTryOn = (itemId) => {
    setArModal({ isOpen: true, itemId });
  };

  const closeTryOn = () => {
    setArModal({ ...arModal, isOpen: false });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
          isPriceFilterActive={isPriceFilterActive}
          togglePriceFilter={togglePriceFilter}
          expandedFilters={expandedFilters}
          toggleFilter={toggleFilter}
          shapes={availableShapes}
          faceShapes={faceShapes}
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
        />

        <div className="product-matrix-container">
          {/* Overlay loading mờ để không làm nhảy giao diện */}
          {loading && (
            <div className="matrix-loading-overlay">
              <div className="spinner"></div>
            </div>
          )}

          <div className="results-info" style={{ marginBottom: '20px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
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
              !loading && (
                <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                  <h3>No products found.</h3>
                </div>
              )
            )}
          </div>

          <Pagination
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
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
