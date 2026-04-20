import React, { useState, useEffect, useCallback } from 'react';
import { glassesApi } from '../services/glassesApi';
import Header from '../components/layout/Header';
import GlassFormModal from '../components/admin/GlassFormModal';
import Pagination from '../components/shop/Pagination';
import { formatPrice } from '../utils/formatPrice';
import SearchBar from '../components/common/SearchBar';



import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout, onLoginClick, onSignupClick }) => {
    const [glasses, setGlasses] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGlass, setSelectedGlass] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        glassesShapeId: '',
        colorIds: '',
        minPrice: '',
        maxPrice: ''
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            
            const [glassesRes, shapesRes, colorsRes] = await Promise.all([
                glassesApi.getList({ 
                    ...cleanFilters, 
                    page: currentPage,
                    items: itemsPerPage 
                }),
                glassesApi.getShapes(),
                glassesApi.getColors()
            ]);
            
            setGlasses(glassesRes.data || []);
            setTotalPages(glassesRes.totalPages || 1);
            setTotalItems(glassesRes.totalItems || 0);
            setShapes(shapesRes.data || []);
            setColors(colorsRes.data || []);
        } catch (err) {
            console.error('Error loading admin data:', err);
            setMessage('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage, itemsPerPage]);


    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 300); // Simple debounce
        return () => clearTimeout(timer);
    }, [loadData]);

    // Reset to page 1 when filters or limit change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, itemsPerPage]);

    const handleFilterChange = (e) => {

        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenCreate = () => {
        setSelectedGlass(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (glass) => {
        setSelectedGlass(glass);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (selectedGlass) {
                await glassesApi.update(selectedGlass.id, formData);
                setMessage('Product updated successfully');
            } else {
                await glassesApi.create(formData);
                setMessage('Product created successfully');
            }
            setIsModalOpen(false);
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await glassesApi.delete(id);
            setMessage('Product deleted');
            setIsModalOpen(false);
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    return (
        <div className="admin-dashboard-container">
            <Header user={user} onLogout={onLogout} onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
            
            <main className="admin-content">
                <div className="admin-header-actions">
                    <h1 className="premium-gradient-text" style={{ fontSize: '2.5rem' }}>Glass Inventory</h1>
                    <button className="add-new-btn" onClick={handleOpenCreate}>
                        + Add New Glass
                    </button>
                </div>

                <div className="admin-main-layout">
                    <aside className="admin-sidebar">
                        <div className="search-filters-bar">
                            <SearchBar 
                                label="Search Name"
                                placeholder="Find by model name..."
                                value={filters.search}
                                onChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
                            />
                            <div className="filter-group">

                                <label>Shape</label>
                                <select name="glassesShapeId" value={filters.glassesShapeId} onChange={handleFilterChange}>
                                    <option value="">All Shapes</option>
                                    {shapes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Color</label>
                                <select name="colorIds" value={filters.colorIds} onChange={handleFilterChange}>
                                    <option value="">All Colors</option>
                                    {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Price Range</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input 
                                        name="minPrice" 
                                        type="number" 
                                        placeholder="Min Price" 
                                        style={{ width: '100%' }}
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                    />
                                    {filters.minPrice && (
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            = {formatPrice(Number(filters.minPrice))}
                                        </span>
                                    )}
                                    <input 
                                        name="maxPrice" 
                                        type="number" 
                                        placeholder="Max Price" 
                                        style={{ width: '100%' }}
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                    />
                                    {filters.maxPrice && (
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            = {formatPrice(Number(filters.maxPrice))}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <button className="reset-filters-btn" onClick={() => setFilters({
                                search: '',
                                glassesShapeId: '',
                                colorIds: '',
                                minPrice: '',
                                maxPrice: ''
                            })}>
                                Reset Filters
                            </button>
                        </div>
                    </aside>

                    <section className="admin-main-section">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px' }}>
                                <div className="loading-spinner"></div>
                                <p>Refining inventory data...</p>
                            </div>
                        ) : (
                            <>
                                <div className="admin-results-info">
                                    <span>Showing {glasses.length} of {totalItems} products</span>
                                </div>
                                
                                <div className="glasses-grid">
                                    {glasses.map(item => (
                                        <div key={item.id} className="admin-glass-card" onClick={() => handleOpenEdit(item)}>
                                            <div className="card-img-wrapper">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="card-info">
                                                <span className="shape-tag">{item.shape?.name}</span>
                                                <h3>{item.name}</h3>
                                                <div className="card-footer">
                                                    <div className="card-price">{formatPrice(item.price)}</div>

                                                    <div className={`card-stock ${item.stock < 10 ? 'low' : ''}`}>
                                                        Stock: {item.stock}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {glasses.length > 0 && (
                                    <Pagination
                                        itemsPerPage={itemsPerPage}
                                        setItemsPerPage={setItemsPerPage}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={(page) => setCurrentPage(page)}
                                    />
                                )}

                                {glasses.length === 0 && !loading && (
                                    <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                                        <p style={{ color: '#64748b' }}>No products found matching your search.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>

            </main>

            {message && <div className="message-toast">{message}</div>}

            <GlassFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                glass={selectedGlass}
                shapes={shapes}
                colors={colors}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default AdminDashboard;
