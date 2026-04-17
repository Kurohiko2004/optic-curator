import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/shop/ProductCard';
import ShopHero from '../components/shop/shopHero';
import ShopBanner from '../components/shop/ShopBanner';
import Pagination from '../components/shop/Pagination';
import ARTryOnModal from './ARTryOnPage';

// Services
import { fetchGlasses, fetchShapes, fetchColors } from '../services/api';

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
    selectedShape, setSelectedShape,
    selectedColors, setSelectedColors,
    toggleColor, resetFilters
  } = useShopFilters();

  const [glasses, setGlasses] = useState([]);
  const [availableShapes, setAvailableShapes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
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
        const [shapesData, colorsData] = await Promise.all([fetchShapes(), fetchColors()]);
        setAvailableShapes(shapesData.data || shapesData);
        setAvailableColors(colorsData.data || colorsData);
      } catch (error) {
        console.error("Error fetching filter data:", error);
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

        if (selectedColors.length > 0) {
          params.colorIds = selectedColors.join(',');
        }

        // 2. Chỉ thêm glassesShapeId vào params NẾU selectedShape có tồn tại
        if (selectedShape && selectedShape.id) {
          params.glassesShapeId = Number(selectedShape.id);
        }

        // 3. Thêm lọc giá nếu đang active
        if (isPriceFilterActive) {
          params.maxPrice = debouncedPrice;
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
  }, [currentPage, itemsPerPage, debouncedPrice, isPriceFilterActive, selectedShape, selectedColors]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedPrice, isPriceFilterActive, itemsPerPage, selectedShape, selectedColors]);

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
          colors={availableColors}
          faceShapes={faceShapes}
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
          selectedColors={selectedColors}
          toggleColor={toggleColor}
          onReset={resetFilters}
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
