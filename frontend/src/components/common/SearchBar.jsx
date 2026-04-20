import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = "Search...", label = "Search" }) => {
    return (
        <div className="search-bar-container">
            {label && <label className="search-bar-label">{label}</label>}
            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {value && (
                    <button className="clear-search" onClick={() => onChange('')}>
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
