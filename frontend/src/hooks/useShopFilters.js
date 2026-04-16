import { useState } from 'react';

export const useShopFilters = () => {
  const [price, setPrice] = useState(500000);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false); // Thêm trạng thái bật/tắt
  const [expandedFilters, setExpandedFilters] = useState({ shape: true, face: true });
  
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShape, setSelectedShape] = useState(null);

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const togglePriceFilter = () => {
    setIsPriceFilterActive(prev => !prev);
  };

  return {
    price, setPrice,
    isPriceFilterActive, setIsPriceFilterActive,
    togglePriceFilter,
    expandedFilters, toggleFilter,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage,
    selectedShape, setSelectedShape
  };
};
