import React from 'react';

const FilterSection = ({ title, isExpanded, onToggle, children }) => {
  return (
    <div className={`filter-section ${isExpanded ? 'expanded' : ''}`}>
      <div className="filter-header" onClick={onToggle}>
        <span>{title}</span>
        <span className="arrow">{isExpanded ? '−' : '+'}</span>
      </div>
      {isExpanded && (
        <div className="filter-options">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterSection;
