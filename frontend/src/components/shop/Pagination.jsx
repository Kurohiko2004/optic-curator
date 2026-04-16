import React from 'react';

const Pagination = ({ 
  itemsPerPage, 
  setItemsPerPage, 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Basic logic to handle dots (e.g., if there are many pages)
  const renderPages = () => {
    if (totalPages <= 7) return pages;
    
    // Simplification for now, just show first 5 and last
    if (currentPage <= 4) return [...pages.slice(0, 5), '...', totalPages];
    if (currentPage > totalPages - 4) return [1, '...', ...pages.slice(totalPages - 5)];
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <footer className="matrix-footer">
      <div className="pagination">
        {renderPages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="pagination-dots">...</span>
            ) : (
              <button 
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="page-limit">
        <span>Products per page:</span>
        <select 
          className="limit-select" 
          value={itemsPerPage} 
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            onPageChange(1); // Reset to first page when limit changes
          }}
        >
          <option value={9}>9</option>
          <option value={18}>18</option>
          <option value={27}>27</option>
        </select>
      </div>
    </footer>
  );
};

export default Pagination;
