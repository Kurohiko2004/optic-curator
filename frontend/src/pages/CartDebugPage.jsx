import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import Header from '../components/layout/Header';

const CartDebugPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
    const navigate = useNavigate();
    const { cartData, loading, error, loadCart, updateQuantity, removeItem, clearCart } = useCart();
    const [isConfirming, setIsConfirming] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');

    useEffect(() => {
        if (user) {
            loadCart();
        }
    }, [loadCart, user]);

    const handleCreateOrder = () => {
        setIsConfirming(true);
    };

    const confirmOrder = () => {
        setIsConfirming(false);
        // Chuyển hướng sang OrderDebugPage và truyền kèm phương thức thanh toán đã chọn qua state
        navigate('/orders/me', { state: { preferredPaymentMethod: paymentMethod } });
    };

    const renderRawJson = (data) => (
        <pre style={{ fontSize: '12px', background: '#222', color: '#0f0', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
        </pre>
    );

    return (
        <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#eee' }}>
            <Header
                onLoginClick={onLoginClick}
                onSignupClick={onSignupClick}
                user={user}
                onLogout={onLogout}
            />

            {/* POPUP XÁC NHẬN TẠO ĐƠN HÀNG KÈM PHƯƠNG THỨC THANH TOÁN */}
            {isConfirming && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#333', padding: '30px', borderRadius: '15px',
                        textAlign: 'left', border: '1px solid #4facfe', maxWidth: '400px', width: '90%'
                    }}>
                        <h2 style={{ color: '#4facfe', textAlign: 'center' }}>Xác nhận đặt hàng</h2>
                        <p style={{ textAlign: 'center' }}>Vui lòng chọn phương thức thanh toán:</p>
                        
                        <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                                border: '1px solid #555', borderRadius: '8px', cursor: 'pointer',
                                background: paymentMethod === 'COD' ? 'rgba(79, 172, 254, 0.1)' : 'transparent',
                                borderColor: paymentMethod === 'COD' ? '#4facfe' : '#555',
                                transition: '0.3s'
                            }}>
                                <input 
                                    type="radio" name="payment" value="COD" 
                                    checked={paymentMethod === 'COD'} 
                                    onChange={(e) => setPaymentMethod(e.target.value)} 
                                />
                                <div>
                                    <strong style={{ color: '#fff' }}>Thanh toán khi nhận hàng (COD)</strong>
                                    <div style={{ fontSize: '12px', color: '#888' }}>Trả tiền mặt khi shipper giao hàng</div>
                                </div>
                            </label>

                            <label style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                                border: '1px solid #555', borderRadius: '8px', cursor: 'pointer',
                                background: paymentMethod === 'VNPAY' ? 'rgba(79, 172, 254, 0.1)' : 'transparent',
                                borderColor: paymentMethod === 'VNPAY' ? '#4facfe' : '#555',
                                transition: '0.3s'
                            }}>
                                <input 
                                    type="radio" name="payment" value="VNPAY" 
                                    checked={paymentMethod === 'VNPAY'} 
                                    onChange={(e) => setPaymentMethod(e.target.value)} 
                                />
                                <div>
                                    <strong style={{ color: '#fff' }}>Cổng thanh toán VNPay</strong>
                                    <div style={{ fontSize: '12px', color: '#888' }}>Thanh toán qua QR, ATM hoặc Thẻ quốc tế</div>
                                </div>
                            </label>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button 
                                onClick={confirmOrder}
                                style={{ background: '#4facfe', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                TIẾP TỤC
                            </button>
                            <button 
                                onClick={() => setIsConfirming(false)}
                                style={{ background: 'transparent', color: '#aaa', border: '1px solid #555', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                HỦY
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main style={{ marginTop: '100px', maxWidth: '1000px', margin: '100px auto' }}>
                <h1 style={{ color: '#4facfe' }}>Cart Debug Mode (Full Server Data)</h1>

                {!user ? (
                    <div style={{ border: '2px solid red', padding: '20px', borderRadius: '8px' }}>
                        <h2>Chưa có Token!</h2>
                        <p>Vui lòng đăng nhập để Header gửi Authorization Bearer Token vào API.</p>
                    </div>
                ) : (
                    <div>
                        {loading && <h2 style={{ color: 'orange' }}>⏳ Đang gọi API Giỏ hàng...</h2>}
                        {error && (
                            <div style={{ background: '#411', padding: '15px', borderLeft: '5px solid red', marginBottom: '10px' }}>
                                <strong>Lỗi API:</strong> {error}
                            </div>
                        )}

                        {cartData && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2>Giỏ hàng (ID: {cartData.id})</h2>
                                        <button onClick={clearCart} style={{ background: 'red', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>
                                            Xóa toàn bộ (Clear Cart)
                                        </button>
                                    </div>

                                    {cartData.cartItems.length === 0 ? (
                                        <p>Giỏ hàng hiện đang rỗng.</p>
                                    ) : (
                                        cartData.cartItems.map((item) => (
                                            <div key={item.id} style={{ border: '1px solid #444', padding: '15px', marginBottom: '15px', borderRadius: '10px', backgroundColor: '#2a2a2a' }}>
                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                    <img src={item.glasses.image} alt={item.glasses.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{item.glasses.name} (Glasses ID: {item.glassesId})</h4>
                                                        <p style={{ margin: '0', fontSize: '14px', color: '#aaa' }}>CartItem ID: <strong>{item.id}</strong></p>
                                                        <p style={{ margin: '0', color: '#00d1b2' }}>Đơn giá: ${item.glasses.price}</p>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                                            <div style={{ border: '1px solid #555', borderRadius: '5px', overflow: 'hidden' }}>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '5px 10px' }}>-</button>
                                                                <span style={{ padding: '0 15px', fontWeight: 'bold' }}>{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '5px 10px' }}>+</button>
                                                            </div>
                                                            <button onClick={() => removeItem(item.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                                                Gỡ bỏ sản phẩm
                                                            </button>
                                                        </div>

                                                        <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                                                            Updated: {new Date(item.updatedAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <aside>
                                    <div style={{ position: 'sticky', top: '120px', background: '#333', padding: '20px', borderRadius: '10px' }}>
                                        <h3 style={{ marginTop: 0 }}>Tổng kết</h3>
                                        <p>Số loại SP: <strong>{cartData.totalItems}</strong></p>
                                        <h2 style={{ color: '#00d1b2' }}>Tổng tiền: ${cartData.totalPrice}</h2>
                                        
                                        <button 
                                            onClick={handleCreateOrder}
                                            disabled={cartData.cartItems.length === 0}
                                            style={{ 
                                                width: '100%', background: '#4facfe', color: 'white', border: 'none', 
                                                padding: '12px', borderRadius: '8px', fontWeight: 'bold', 
                                                cursor: cartData.cartItems.length === 0 ? 'not-allowed' : 'pointer',
                                                marginTop: '10px', opacity: cartData.cartItems.length === 0 ? 0.5 : 1
                                            }}
                                        >
                                            TIẾN HÀNH ĐẶT HÀNG
                                        </button>

                                        <hr style={{ margin: '20px 0', border: '0.5px solid #555' }} />
                                        <p style={{ fontSize: '12px' }}>Raw JSON Response:</p>
                                        {renderRawJson(cartData)}
                                    </div>
                                </aside>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CartDebugPage;
