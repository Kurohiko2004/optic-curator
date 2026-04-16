import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { CheckCircle, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import './PaymentResultPage.css';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const { showToast } = useToast(); // Fix: Đổi addToast thành showToast cho đúng ToastContext

    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        console.log("PaymentResultPage mounted with status:", status, "orderId:", orderId);
        
        if (showToast) { // Kiểm tra hàm tồn tại trước khi gọi
            if (status === 'success') {
                showToast('Thanh toán đơn hàng thành công!', 'success');
            } else if (status === 'failed') {
                showToast('Thanh toán thất bại hoặc đã bị hủy.', 'error');
            } else if (status === 'invalid') {
                showToast('Dữ liệu thanh toán không hợp lệ.', 'error');
            }
        }
    }, [status, orderId, showToast]);

    const renderContent = () => {
        if (status === 'success') {
            return (
                <div className="result-card success">
                    <CheckCircle className="result-icon" size={64} />
                    <h1>Thanh toán thành công!</h1>
                    <p>Cảm ơn bạn đã mua sắm tại Optic Curator.</p>
                    <p className="order-info">Mã đơn hàng: <strong>#{orderId}</strong></p>
                    <div className="action-buttons">
                        <Link to="/orders/me" className="btn btn-primary">
                            <ShoppingBag size={20} /> Xem đơn hàng của tôi
                        </Link>
                        <Link to="/store" className="btn btn-secondary">Tiếp tục mua sắm</Link>
                    </div>
                </div>
            );
        }

        if (status === 'failed') {
            return (
                <div className="result-card error">
                    <XCircle className="result-icon" size={64} />
                    <h1>Thanh toán thất bại</h1>
                    <p>Giao dịch của bạn không thể hoàn tất hoặc đã bị hủy bỏ.</p>
                    <div className="action-buttons">
                        <Link to="/cart" className="btn btn-primary">Quay lại giỏ hàng</Link>
                        <Link to="/store" className="btn btn-secondary">Tiếp tục mua sắm</Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="result-card warning">
                <AlertCircle className="result-icon" size={64} />
                <h1>Lỗi xác thực</h1>
                <p>Có lỗi xảy ra trong quá trình xác thực giao dịch hoặc tham số không hợp lệ.</p>
                <div className="action-buttons">
                    <Link to="/store" className="btn btn-primary">Quay lại cửa hàng</Link>
                </div>
            </div>
        );
    };

    return (
        <div className="payment-result-container">
            <div className="glass-effect">
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentResultPage;
