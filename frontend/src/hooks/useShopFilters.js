import { useState } from 'react';

export const useShopFilters = () => {
  const [price, setPrice] = useState(500);
  const [expandedFilters, setExpandedFilters] = useState({ shape: true, face: true });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  return {
    price, setPrice,
    expandedFilters, toggleFilter,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage
  };
};
