import React from 'react';

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

        <div className={`filter-section ${expandedFilters.shape ? 'expanded' : ''}`}>
          <div className="filter-header" onClick={() => toggleFilter('shape')}>
            <span>Glasses Shape</span>
            <span className="arrow">{expandedFilters.shape ? '−' : '+'}</span>
          </div>
          {expandedFilters.shape && (
            <div className="filter-options">
              {shapes.map(s => (
                <label key={s} className="checkbox-label">
                  <input type="checkbox" /> {s}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className={`filter-section ${expandedFilters.face ? 'expanded' : ''}`}>
          <div className="filter-header" onClick={() => toggleFilter('face')}>
            <span>Face Shape</span>
            <span className="arrow">{expandedFilters.face ? '−' : '+'}</span>
          </div>
          {expandedFilters.face && (
            <div className="filter-options">
               {faceShapes.map(f => (
                <label key={f} className="checkbox-label">
                  <input type="checkbox" /> {f}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
