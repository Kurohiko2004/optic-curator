import React, { useState, useEffect } from 'react';
import { glassesApi } from '../services/glassesApi';
import Header from '../components/layout/Header';

const AdminDashboard = ({ user, onLogout, onLoginClick, onSignupClick }) => {
    const [glasses, setGlasses] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Form state for creating/editing glasses
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        materialFrame: '',
        lensType: '',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        glassesShapeId: '1'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [glassesRes, shapesRes] = await Promise.all([
                glassesApi.getList({ items: 100 }), // Get many items for management
                glassesApi.getShapes()
            ]);
            setGlasses(glassesRes.data || []);
            setShapes(shapesRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await glassesApi.create(formData);
            setMessage('Created successfully!');
            loadData();
            // Reset form
            setFormData({
                name: '', price: '', stock: '', materialFrame: '', lensType: '',
                image: '/item1.png', modelPath: '/model/glasses/glass1.glb', glassesShapeId: '1'
            });
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        try {
            await glassesApi.update(id, { stock: newStock });
            setMessage('Stock updated!');
            loadData();
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    return (
        <div className="admin-dashboard" style={{ padding: '20px', backgroundColor: '#111', color: 'white', minHeight: '100vh' }}>
            <Header user={user} onLogout={onLogout} onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
            
            <main style={{ marginTop: '100px', maxWidth: '1000px', margin: '100px auto' }}>
                <h1 className="premium-gradient-text">Admin Dashboard - Glass Management</h1>
                
                {message && <p style={{ background: '#333', padding: '10px', borderRadius: '5px' }}>{message}</p>}

                {/* FORM CREATE NEW GLASS */}
                <section style={{ border: '1px solid #4facfe', padding: '20px', borderRadius: '15px', marginBottom: '40px' }}>
                    <h3>Add New Glass</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input placeholder="Price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        <input placeholder="Stock Quantity" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                        <input placeholder="Material" value={formData.materialFrame} onChange={e => setFormData({...formData, materialFrame: e.target.value})} />
                        <input placeholder="Lens Type" value={formData.lensType} onChange={e => setFormData({...formData, lensType: e.target.value})} />
                        <select value={formData.glassesShapeId} onChange={e => setFormData({...formData, glassesShapeId: e.target.value})}>
                            {shapes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button type="submit" className="button-primary" style={{ gridColumn: '1 / -1' }}>Create Product</button>
                    </form>
                </section>

                {/* LIST GLASSES FOR UPDATE */}
                <section>
                    <h3>Manage Existing Glasses</h3>
                    {loading ? <p>Loading...</p> : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {glasses.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222', padding: '15px', borderRadius: '10px' }}>
                                    <div>
                                        <strong>{item.name}</strong> - ${item.price}
                                        <div style={{ fontSize: '12px', color: '#888' }}>Stock: {item.stock}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="number" 
                                            style={{ width: '80px' }} 
                                            defaultValue={item.stock} 
                                            onBlur={(e) => handleUpdateStock(item.id, e.target.value)}
                                        />
                                        <span style={{ fontSize: '10px', color: '#666' }}>Edit stock & blur to save</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
