import React from 'react';
import FilterSection from './FilterSection';
import { formatPrice } from '../../utils/formatPrice';

const FilterSidebar = ({ 
  price, setPrice, 
  isPriceFilterActive, togglePriceFilter,
  expandedFilters, toggleFilter, 
  shapes,
  selectedShape, setSelectedShape 
}) => {
  
  const handleShapeChange = (shape) => {
    if (selectedShape && selectedShape.id === shape.id) {
      setSelectedShape(null);
    } else {
      setSelectedShape(shape);
    }
  };

  return (
    <aside className="filters-sidebar">
      <div className="filter-group glass-morphism">
        <h3>Filters</h3>
        
        {/* Price Filter with Toggle Switch */}
        <div className="filter-section">
          <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span>Price Range</span>
            <div 
              className={`toggle-switch ${isPriceFilterActive ? 'active' : ''}`}
              onClick={togglePriceFilter}
              style={{
                width: '40px',
                height: '20px',
                background: isPriceFilterActive ? '#6366f1' : '#4a5568',
                borderRadius: '20px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isPriceFilterActive ? '22px' : '2px',
                transition: 'all 0.3s'
              }}></div>
            </div>
          </div>
          
          <div className="price-filter-content" style={{ 
            opacity: isPriceFilterActive ? 1 : 0.4,
            pointerEvents: isPriceFilterActive ? 'auto' : 'none',
            transition: 'all 0.3s'
          }}>
            <label><span className="premium-gradient-text">{formatPrice(price)}</span></label>
            <input 
              type="range" 
              min="100000"
              max="1000000"
              step="100000"
              value={price} 
              onChange={(e) => setPrice(Number(e.target.value))}
              className="price-slider"
              disabled={!isPriceFilterActive}
            />
            <div className="price-labels">
              <span>{formatPrice(100000)}</span>
              <span>{formatPrice(1000000)}</span>
            </div>
          </div>
        </div>

        {/* Glasses Shape Filter */}
        <FilterSection 
          title="Frame Shape" 
          isExpanded={expandedFilters.shape} 
          onToggle={() => toggleFilter('shape')}
        >
          <div className="filter-options">
            {shapes.map((shape) => (
              <label key={shape.id} className="custom-radio-container">
                <input
                  type="radio"
                  name="glass-shape"
                  value={shape.id}
                  checked={selectedShape?.id === shape.id}
                  onChange={() => handleShapeChange(shape)}
                  onClick={(e) => {
                    if (selectedShape?.id === shape.id) {
                      e.preventDefault();
                      setSelectedShape(null);
                    }
                  }}
                />
                <span className="radio-circle"></span>
                <span className="label-text">{shape.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
};

export default FilterSidebar;
