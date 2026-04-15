import React from 'react';
import FilterSection from './FilterSection';

const FilterSidebar = ({ price, setPrice, expandedFilters, toggleFilter, shapes, faceShapes }) => {
  return (
    <aside className="filters-sidebar">
      <div className="filter-group glass-morphism">
        <h3>Filters</h3>
        
        <div className="filter-section">
          <label>Price Range: <span className="premium-gradient-text">${price}</span></label>
          <input 
            type="range" 
            min="50" 
            max="1000" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
            className="price-slider"
          />
          <div className="price-labels">
            <span>$50</span>
            <span>$1000</span>
          </div>
        </div>

        <FilterSection 
          title="Frame Shape" 
          isExpanded={expandedFilters.shape} 
          onToggle={() => toggleFilter('shape')}
        >
          {shapes.map(s => (
            <label key={s.id || s} className="checkbox-label">
              <input type="checkbox" /> {s.name || s}
            </label>
          ))}
        </FilterSection>

        <FilterSection 
          title="Face Shape" 
          isExpanded={expandedFilters.face} 
          onToggle={() => toggleFilter('face')}
        >
          {faceShapes.map(f => (
            <label key={f} className="checkbox-label">
              <input type="checkbox" /> {f}
            </label>
          ))}
        </FilterSection>
      </div>
    </aside>
  );
};

export default FilterSidebar;
