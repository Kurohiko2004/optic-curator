import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';

/**
 * Trang Debug Order: Hiển thị thông tin API gửi về để Frontend tiện theo dõi.
 */
const OrderDebugPage = () => {
    const location = useLocation();
    const { orders, loading, error, loadMyOrders, checkout } = useOrder();
    const [lastOrderResponse, setLastOrderResponse] = useState(null);

    // Form data mẫu để test checkout
    const [formData, setFormData] = useState({
        recipientName: 'Vũ Anh Nam',
        phoneNumber: '0987654321',
        shippingAddress: 'Đường Xuân Thủy, Cầu Giấy, Hà Nội',
        paymentMethod: 'COD' // Mặc định là COD
    });

    // Cập nhật phương thức thanh toán nếu có truyền từ trang Cart sang
    useEffect(() => {
        if (location.state?.preferredPaymentMethod) {
            setFormData(prev => ({
                ...prev,
                paymentMethod: location.state.preferredPaymentMethod
            }));
        }
    }, [location.state]);

    useEffect(() => {
        loadMyOrders();
    }, [loadMyOrders]);

    const handleTestCheckout = async () => {
        console.log("Submitting order with method:", formData.paymentMethod);
        const result = await checkout(formData);
        
        if (result.success) {
            setLastOrderResponse(result.order);
            loadMyOrders(); // Refresh history
            alert("Đặt hàng thành công!");
        } else if (result.pendingRedirect) {
            // Đã redirect xong trong hook useOrder
            console.log("Redirecting to payment gateway...");
        } else {
            alert("Lỗi: " + result.message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'monospace' }}>
            <h1 style={{ color: '#27ae60' }}>DEBUG ORDER SYSTEM</h1>

            {/* --- SECTION 1: CREATE ORDER TEST --- */}
            <section style={{ border: '2px solid #27ae60', padding: '15px', marginBottom: '20px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>1. Test POST /api/orders (Checkout)</h2>
                    {location.state?.preferredPaymentMethod && (
                        <span style={{ background: '#f1c40f', color: '#000', padding: '2px 10px', borderRadius: '15px', fontSize: '12px' }}>
                            Dữ liệu từ Giỏ hàng: {location.state.preferredPaymentMethod}
                        </span>
                    )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ width: '150px', display: 'inline-block' }}>Người nhận: </label>
                        <input type="text" value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ width: '150px', display: 'inline-block' }}>Số điện thoại: </label>
                        <input type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ width: '150px', display: 'inline-block' }}>Địa chỉ: </label>
                        <input type="text" style={{ width: '350px' }} value={formData.shippingAddress} onChange={e => setFormData({...formData, shippingAddress: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ width: '150px', display: 'inline-block' }}>Phương thức thanh toán: </label>
                        <select 
                            style={{ padding: '5px', fontWeight: 'bold' }}
                            value={formData.paymentMethod} 
                            onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                        >
                            <option value="COD">COD (Tiền mặt)</option>
                            <option value="VNPAY">VNPAY (Thanh toán qua cổng)</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={handleTestCheckout} 
                        disabled={loading}
                        style={{ 
                            padding: '12px', background: '#27ae60', color: 'white', border: 'none', 
                            cursor: 'pointer', fontWeight: 'bold', borderRadius: '5px', marginTop: '10px'
                        }}
                    >
                        {loading ? 'ĐANG GỬI API...' : `XÁC NHẬN ĐẶT HÀNG QUA ${formData.paymentMethod}`}
                    </button>
                </div>

                {lastOrderResponse && (
                    <div style={{ background: '#f0fff0', padding: '10px', border: '1px solid #2ecc71', borderRadius: '5px' }}>
                        <h3>Mới đặt thành công (Response):</h3>
                        <pre style={{ fontSize: '11px' }}>{JSON.stringify(lastOrderResponse, null, 2)}</pre>
                    </div>
                )}
            </section>

            {/* --- SECTION 2: ORDER HISTORY --- */}
            <section style={{ border: '2px solid #2980b9', padding: '15px', borderRadius: '10px' }}>
                <h2>2. Test GET /api/orders/me (Lịch sử)</h2>
                <button onClick={loadMyOrders} style={{ marginBottom: '15px', cursor: 'pointer' }}>Làm mới danh sách</button>
                
                {loading && <p>Đang tải dữ liệu...</p>}
                {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}

                {orders.length === 0 ? (
                    <p>Chưa có đơn hàng nào.</p>
                ) : (
                    <div style={{ marginTop: '20px' }}>
                        {orders.map(order => (
                            <div key={order.id} style={{ border: '1px solid #ccc', marginBottom: '15px', padding: '10px', borderRadius: '5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span><strong>Mã đơn:</strong> {order.id} | <strong>Status:</strong> {order.status}</span>
                                    <span style={{ fontWeight: 'bold', color: '#2980b9' }}>Phương thức: {order.paymentMethod}</span>
                                </div>
                                <p><strong>Tổng tiền:</strong> {order.totalPrice} | <strong>Người nhận:</strong> {order.recipientName}</p>
                                
                                <div style={{ background: '#eee', padding: '8px', borderRadius: '5px' }}>
                                    <strong>Sản phẩm (orderItems):</strong>
                                    <ul style={{ margin: '5px 0' }}>
                                        {order.orderItems?.map(item => (
                                            <li key={item.id}>
                                                {item.glasses?.name} - SL: {item.quantity} - Giá: {item.priceAtPurchase}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <details style={{ marginTop: '10px' }}>
                                    <summary style={{ cursor: 'pointer', color: '#7f8c8d' }}>Xem raw JSON</summary>
                                    <pre style={{ fontSize: '10px', marginTop: '5px' }}>{JSON.stringify(order, null, 2)}</pre>
                                </details>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default OrderDebugPage;
