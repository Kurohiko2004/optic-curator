import React from 'react';
import FilterSection from './FilterSection';
import { formatPrice } from '../../utils/formatPrice';

const FilterSidebar = ({ 
  price, setPrice, 
  expandedFilters, toggleFilter, 
  shapes, faceShapes,
  selectedShape, setSelectedShape 
}) => {
  
  const handleShapeChange = (shape) => {
    // If clicking the already selected shape, deselect it (toggle off)
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
        
        {/* Price Filter */}
        <div className="filter-section">
          <label>Price Range: <span className="premium-gradient-text">{formatPrice(price)}</span></label>
          <input 
            type="range" 
            min="300000"
            max="1000000"
            step="100000"
            value={price} 
            onChange={(e) => setPrice(Number(e.target.value))}
            className="price-slider"
          />
          <div className="price-labels">
            <span>{formatPrice(300000)}</span>
            <span>{formatPrice(1000000)}</span>
          </div>
        </div>

        {/* Glasses Shape Filter - Custom Round Radio Buttons */}
        <FilterSection 
          title="Glasses Shape" 
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
                    // Allow deselecting radio button by clicking again
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
