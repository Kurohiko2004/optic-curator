import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useOrder } from '../hooks/useOrder';

const OrderPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
    const location = useLocation();
    const { orders, loading, error, loadMyOrders, checkout } = useOrder();
    const [formData, setFormData] = useState({
        recipientName: 'Vu Anh Nam',
        phoneNumber: '0987654321',
        shippingAddress: 'Xuan Thuy Street, Cau Giay, Hanoi',
        paymentMethod: 'COD'
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (location.state?.preferredPaymentMethod) {
            setFormData(prev => ({
                ...prev,
                paymentMethod: location.state.preferredPaymentMethod
            }));
        }
    }, [location.state]);

    useEffect(() => {
        if (user) {
            loadMyOrders();
        }
    }, [loadMyOrders, user]);

    const handleCheckout = async () => {
        setStatus({ type: '', message: '' });
        const result = await checkout(formData);

        if (result.success) {
            setStatus({ type: 'success', message: 'Order placed successfully! Your order will appear in your history.' });
            loadMyOrders();
        } else if (result.pendingRedirect) {
            setStatus({ type: 'info', message: 'Redirecting to VNPay payment gateway...' });
        } else {
            setStatus({ type: 'error', message: result.message || 'Order failed' });
        }
    };

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', padding: '40px', background: '#0b0f1a', color: '#fff' }}>
                <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />
                <div style={{ maxWidth: '560px', margin: '80px auto', padding: '30px', borderRadius: '24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h1 style={{ marginBottom: '16px' }}>You need to log in to place an order</h1>
                    <p style={{ marginBottom: '24px', color: '#cfcfcf' }}>Log in to proceed with checkout and view your order history.</p>
                    <button onClick={onLoginClick} style={{ padding: '12px 22px', borderRadius: '14px', border: 'none', background: '#7c5cff', color: '#fff', cursor: 'pointer' }}>Log in now</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '24px', background: '#080c18', color: '#f7f7ff' }}>
            <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} user={user} onLogout={onLogout} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
                    <section style={{ padding: '28px', borderRadius: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h1 style={{ marginBottom: '14px', fontSize: '2rem' }}>Checkout</h1>
                        <p style={{ marginBottom: '24px', color: '#a3a3c2' }}>Enter your shipping information and choose a payment method to complete your order.</p>

                        {status.message && (
                            <div style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '18px', background: status.type === 'success' ? 'rgba(46, 204, 113, 0.12)' : status.type === 'error' ? 'rgba(231, 76, 60, 0.12)' : 'rgba(52, 152, 219, 0.12)', color: status.type === 'error' ? '#ff7878' : '#daf7e7' }}>
                                {status.message}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                            <label style={labelStyle}>
                                <span style={labelTextStyle}>Recipient Name</span>
                                <input value={formData.recipientName} onChange={e => setFormData({ ...formData, recipientName: e.target.value })} style={inputStyle} />
                            </label>
                            <label style={labelStyle}>
                                <span style={labelTextStyle}>Phone Number</span>
                                <input value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} style={inputStyle} />
                            </label>
                        </div>

                        <label style={{ ...labelStyle, marginTop: '18px' }}>
                            <span style={labelTextStyle}>Shipping Address</span>
                            <input value={formData.shippingAddress} onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })} style={inputStyle} />
                        </label>

                        <div style={{ marginTop: '18px' }}>
                            <span style={labelTextStyle}>Payment Method</span>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {['COD', 'VNPAY'].map(method => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                                        style={{
                                            padding: '14px 20px',
                                            borderRadius: '18px',
                                            border: formData.paymentMethod === method ? '1px solid #7c5cff' : '1px solid rgba(255,255,255,0.14)',
                                            background: formData.paymentMethod === method ? 'rgba(124, 92, 255, 0.16)' : 'rgba(255,255,255,0.03)',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            minWidth: '140px',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <strong>{method}</strong>
                                        <div style={{ fontSize: '0.9rem', color: '#b5b6de', marginTop: '4px' }}>
                                            {method === 'COD' ? 'Cash on Delivery' : 'VNPay Payment'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            style={{
                                marginTop: '28px',
                                width: '100%',
                                padding: '16px 20px',
                                borderRadius: '20px',
                                border: 'none',
                                background: '#7c5cff',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Processing order...' : 'CONFIRM PAYMENT'}
                        </button>
                    </section>

                    <aside style={{ padding: '24px', borderRadius: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 style={{ marginBottom: '16px' }}>Order Summary</h2>
                        <div style={summaryCardStyle}>
                            <div style={summaryRowStyle}><span>Number of items</span><span>{/* not available */}—</span></div>
                            <div style={summaryRowStyle}><span>Method</span><span>{formData.paymentMethod}</span></div>
                            <div style={summaryRowStyle}><span>Shipping</span><span>Free shipping</span></div>
                            <div style={{ ...summaryRowStyle, marginTop: '16px', fontWeight: 700 }}><span>Status</span><span>Pending Confirmation</span></div>
                        </div>
                        <div style={{ marginTop: '24px', padding: '18px', borderRadius: '20px', background: 'rgba(124,92,255,0.08)' }}>
                            <h3 style={{ marginBottom: '10px' }}>Note</h3>
                            <p style={{ lineHeight: '1.7', color: '#c9c9f0' }}>If you choose VNPay, you will be redirected to the VNPay payment portal after confirming your order. With COD, the order will be saved and you will pay upon delivery.</p>
                        </div>
                    </aside>
                </div>

                <section style={{ marginTop: '32px', borderRadius: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                    <h2 style={{ marginBottom: '18px' }}>Order History</h2>
                    {loading && <p>Loading order history...</p>}
                    {error && <p style={{ color: '#ff7b7b' }}>Error: {error}</p>}
                    {orders.length === 0 ? (
                        <p style={{ color: '#b5b5d1' }}>You have no orders yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, color: '#a0a3cf' }}>Đơn hàng #{order.id}</p>
                                            <h3 style={{ margin: '6px 0 0', fontSize: '1.1rem' }}>{order.recipientName}</h3>
                                        </div>
                                        <span style={{ color: '#7c5cff', fontWeight: 700 }}>{order.paymentMethod}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '16px', color: '#c3c6e8' }}>
                                        <span>Tổng: {order.totalPrice}</span>
                                        <span>Trạng thái: {order.status}</span>
                                        <span>Quantity: {order.orderItems?.length || 0}</span>
                                    </div>
                                    <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
                                        {order.orderItems?.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)' }}>
                                                <span>{item.glasses?.name}</span>
                                                <span>{item.quantity} x {item.priceAtPurchase}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    color: '#d0d2ff',
    fontSize: '0.95rem'
};

const labelTextStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#b5b6de',
    fontWeight: '600'
};

const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    outline: 'none'
};

const summaryCardStyle = {
    borderRadius: '24px',
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)'
};

const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    color: '#d4d6f0'
};

export default OrderPage;
