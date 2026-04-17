import React, { useEffect } from 'react';
import Header from '../components/layout/Header';
import { useOrder } from '../hooks/useOrder';
import { formatPrice } from '../utils/formatPrice';; 

const OrderHistoryPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
    const { orders, loading, error, pagination, loadMyOrders } = useOrder();
    const [limit, setLimit] = React.useState(10);

    useEffect(() => {
        if (user) {
            loadMyOrders(1, limit);
        }
    }, [loadMyOrders, user, limit]);

    const handlePageChange = (newPage) => {
        loadMyOrders(newPage, limit);
    };

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', padding: '40px', background: '#0b0f1a', color: '#fff' }}>
                <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />
                <div style={{ maxWidth: '560px', margin: '80px auto', padding: '30px', borderRadius: '24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h1 style={{ marginBottom: '16px' }}>Login required</h1>
                    <p style={{ marginBottom: '24px', color: '#cfcfcf' }}>You need to log in to view your order history.</p>
                    <button onClick={onLoginClick} style={{ padding: '12px 22px', borderRadius: '14px', border: 'none', background: '#7c5cff', color: '#fff', cursor: 'pointer' }}>Log in now</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '100px 24px 24px', background: '#080c18', color: '#f7f7ff' }}>
            <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />

            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '40px' }}>
                <section style={{ borderRadius: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2.4rem' }}>Order History</h1>
                            <p style={{ margin: '8px 0 0', color: '#a3a3c2' }}>Track and manage your previous purchases.</p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#8b8ba8' }}>Orders per page:</span>
                            <select 
                                value={limit} 
                                onChange={(e) => setLimit(Number(e.target.value))}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                        </div>
                    </div>

                    {loading && <p>Loading order history...</p>}
                    {error && <p style={{ color: '#ff7b7b' }}>Error: {error}</p>}
                    
                    {(orders || []).length === 0 && !loading ? (

                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                            <p style={{ color: '#b5b5d1', fontSize: '1.2rem' }}>You haven't placed any orders yet.</p>
                            <button 
                                onClick={() => window.location.href = '/store'}
                                style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '12px', border: '1px solid #7c5cff', background: 'transparent', color: '#7c5cff', cursor: 'pointer' }}
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gap: '24px' }}>
                                {orders?.map(order => (

                                    <div key={order.id} style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        {/* Content omitted for brevity in replace tool, but will be preserved */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(124, 92, 255, 0.2)', color: '#7c5cff', fontWeight: 600, fontSize: '0.85rem' }}>
                                                        Order #{order.id}
                                                    </span>
                                                    <span style={{ color: '#a0a3cf', fontSize: '0.9rem' }}>
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 style={{ margin: '14px 0 4px', fontSize: '1.2rem' }}>{order.recipientName}</h3>
                                                <p style={{ margin: 0, color: '#8b8ba8', fontSize: '0.9rem' }}>{order.shippingAddress}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ 
                                                    padding: '6px 14px', 
                                                    borderRadius: '10px', 
                                                    background: order.status === 'COMPLETED' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)',
                                                    color: order.status === 'COMPLETED' ? '#2ecc71' : '#f1c40f',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {order.status}
                                                </div>
                                                <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                                                    {formatPrice(order.totalPrice)}
                                                </p>
                                                <p style={{ margin: '4px 0 0', color: '#7c5cff', fontSize: '0.9rem', fontWeight: 600 }}>{order.paymentMethod}</p>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                                            <h4 style={{ margin: '0 0 16px', color: '#b5b6de', fontSize: '1rem' }}>Items ({order.orderItems?.length || 0})</h4>
                                            <div style={{ display: 'grid', gap: '12px' }}>
                                                {order.orderItems?.map(item => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                                👓
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: '#fff' }}>{item.glasses?.name}</div>
                                                                <div style={{ fontSize: '0.85rem', color: '#8b8ba8' }}>Quantity: {item.quantity}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontWeight: 700, color: '#d4d6f0' }}>{formatPrice(item.priceAtPurchase)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination UI */}
                            {pagination.totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
                                    <button 
                                        disabled={pagination.currentPage === 1 || loading}
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: pagination.currentPage === 1 ? '#555' : '#fff',
                                            cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                                            transition: '0.2s'
                                        }}
                                    >
                                        Previous
                                    </button>
                                    
                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: pagination.currentPage === i + 1 ? '#7c5cff' : 'rgba(255,255,255,0.05)',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: '0.2s'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button 
                                        disabled={pagination.currentPage === pagination.totalPages || loading}
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: pagination.currentPage === pagination.totalPages ? '#555' : '#fff',
                                            cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                                            transition: '0.2s'
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default OrderHistoryPage;
