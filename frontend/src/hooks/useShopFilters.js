import { useState } from 'react';

export const useShopFilters = () => {
  const [price, setPrice] = useState(300000);
  const [expandedFilters, setExpandedFilters] = useState({ shape: true, face: true });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShape, setSelectedShape] = useState(null); // New state for single shape selection, default to null

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  return {
    price, setPrice,
    expandedFilters, toggleFilter,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage,
    selectedShape, setSelectedShape // Export new state
  };
};
