import React from 'react';

const Pagination = ({ itemsPerPage, setItemsPerPage }) => {
  return (
    <footer className="matrix-footer">
      <div className="pagination">
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <span>...</span>
        <button className="page-btn">12</button>
      </div>
      <div className="page-limit">
        <span>Items per page:</span>
        <select className="limit-select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </footer>
  );
};

export default Pagination;
