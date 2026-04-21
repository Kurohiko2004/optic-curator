import React from 'react';
import FilterSection from './FilterSection';
import { formatPrice } from '../../utils/formatPrice';
import SearchBar from '../common/SearchBar';


const FilterSidebar = ({ 
  price, setPrice, 
  isPriceFilterActive, togglePriceFilter,
  expandedFilters, toggleFilter, 
  shapes, colors = [],
  faceShapes = [],
  selectedShape, setSelectedShape,
  selectedColors, toggleColor,
  search, setSearch,
  onReset

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Filters</h3>
          <button 
            className="reset-btn" 
            onClick={onReset}
            style={{ 
              background: 'none', 
              border: '1px solid var(--accent-primary)', 
              color: 'var(--accent-primary)',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <SearchBar 
            label={null}
            placeholder="Search glasses..."
            value={search}
            onChange={setSearch}
          />
        </div>

        
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

        {/* Color Filter */}
        <FilterSection 
          title="Frame Color" 
          isExpanded={expandedFilters.color || true} 
          onToggle={() => toggleFilter('color')}
        >
          <div className="filter-options">
            {colors.map((color) => (
              <label key={color.id} className="custom-checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(String(color.id))}
                  onChange={() => toggleColor(String(color.id))}
                />
                <span className="checkbox-square"></span>
                <span className="label-text">
                  {color.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
};

export default FilterSidebar;
