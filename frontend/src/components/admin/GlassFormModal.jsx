import React, { useState, useEffect } from 'react';
import './GlassFormModal.css';

const GlassFormModal = ({ isOpen, onClose, glass, shapes, colors, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        glassesShapeId: '',
        description: '',
        materialFrame: '',
        lensType: '',
        image: '',
        modelPath: '',
        colorIds: []
    });

    useEffect(() => {
        if (glass) {
            setFormData({
                name: glass.name || '',
                price: glass.price || '',
                stock: glass.stock || '',
                glassesShapeId: glass.glassesShapeId || (shapes[0]?.id || ''),
                description: glass.description || '',
                materialFrame: glass.materialFrame || '',
                lensType: glass.lensType || '',
                image: glass.image || '',
                modelPath: glass.modelPath || '',
                colorIds: glass.colors ? glass.colors.map(c => c.id) : []
            });
        } else {
            setFormData({
                name: '',
                price: '',
                stock: '',
                glassesShapeId: shapes[0]?.id || '',
                description: '',
                materialFrame: '',
                lensType: '',
                image: '/item1.png',
                modelPath: '/model/glasses/glass1.glb',
                colorIds: []
            });
        }
    }, [glass, shapes, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleColorToggle = (colorId) => {
        setFormData(prev => {
            const currentIds = [...prev.colorIds];
            const index = currentIds.indexOf(colorId);
            if (index > -1) {
                currentIds.splice(index, 1);
            } else {
                currentIds.push(colorId);
            }
            return { ...prev, colorIds: currentIds };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                <button className="admin-modal-close" onClick={onClose}>&times;</button>
                
                <h2 className="premium-gradient-text" style={{ marginBottom: '10px' }}>
                    {glass ? 'Edit Glass' : 'Create New Glass'}
                </h2>
                <p style={{ color: '#888', marginBottom: '30px' }}>
                    {glass ? `Modify details for ${glass.name}` : 'Fill in the details to add a new product to the catalog'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="admin-form-grid">
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                placeholder="e.g. Aviator Classic"
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (VND) *</label>

                            <input 
                                name="price" 
                                type="number" 
                                step="0.01" 
                                value={formData.price} 
                                onChange={handleChange} 
                                required 
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label>Stock Quantity *</label>
                            <input 
                                name="stock" 
                                type="number" 
                                value={formData.stock} 
                                onChange={handleChange} 
                                required 
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Glasses Shape *</label>
                            <select 
                                name="glassesShapeId" 
                                value={formData.glassesShapeId} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="" disabled>Select a shape</option>
                                {shapes.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Material Frame</label>
                            <input 
                                name="materialFrame" 
                                value={formData.materialFrame} 
                                onChange={handleChange} 
                                placeholder="e.g. Titanium, Acetate"
                            />
                        </div>

                        <div className="form-group">
                            <label>Lens Type</label>
                            <input 
                                name="lensType" 
                                value={formData.lensType} 
                                onChange={handleChange} 
                                placeholder="e.g. Polarized, Gradient"
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Describe the product history, style, and fit..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Image URL</label>
                            {formData.image && <img src={formData.image} className="image-preview" alt="Preview" />}
                            <input 
                                name="image" 
                                value={formData.image} 
                                onChange={handleChange} 
                                placeholder="/item1.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>3D Model Path (.glb)</label>
                            <input 
                                name="modelPath" 
                                value={formData.modelPath} 
                                onChange={handleChange} 
                                placeholder="/model/glasses/glass1.glb"
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Available Colors</label>
                            <div className="color-selection">
                                {colors.map(c => (
                                    <div 
                                        key={c.id} 
                                        className={`color-tag ${formData.colorIds.includes(c.id) ? 'selected' : ''}`}
                                        onClick={() => handleColorToggle(c.id)}
                                    >
                                        {c.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        {glass && (
                            <button 
                                type="button" 
                                className="delete-btn" 
                                onClick={() => {
                                    if(window.confirm('Are you sure you want to delete this product?')) {
                                        onDelete(glass.id);
                                    }
                                }}
                            >
                                Delete Product
                            </button>
                        )}
                        <button type="submit" className="save-btn">
                            {glass ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GlassFormModal;
