import { useState } from 'react';

export const useShopFilters = () => {
  const [price, setPrice] = useState(1000000);
  const [expandedFilters, setExpandedFilters] = useState({ shape: true, face: true });
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);

  const togglePriceFilter = () => {
    setIsPriceFilterActive(prev => !prev);
  };

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const toggleColor = (colorId) => {
    setSelectedColors(prev =>
      prev.includes(colorId) ? prev.filter(id => id !== colorId) : [...prev, colorId]
    );
  };

  const resetFilters = () => {
    setPrice(1000000);
    setIsPriceFilterActive(false);
    setSelectedShape(null);
    setSelectedColors([]);
    setCurrentPage(1);
  };

  return {
    price, setPrice,
    isPriceFilterActive, setIsPriceFilterActive,
    togglePriceFilter,
    expandedFilters, toggleFilter,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage,
    selectedShape, setSelectedShape,
    selectedColors, setSelectedColors,
    toggleColor, resetFilters
  };
};
