import { useState, useCallback } from 'react';
import { orderApi } from '../services/orderApi';
import { useCart } from '../context/CartContext'; // Dùng CartContext chung để đồng bộ giỏ hàng

export const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dùng để reset giỏ hàng trên máy khách ngay sau khi tạo đơn thành công mà không cần loadCart
  const { loadCart } = useCart();

  const loadMyOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.getMyOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkout = async (orderDetails) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.createOrder(orderDetails);
      if (response.success) {
         await loadCart();
         
         // Nếu backend trả về link VNPAY, lập tức redirect
         if (response.paymentUrl) {
             window.location.href = response.paymentUrl;
             // Trả về false tạm thời để UI không cần hide sang trang thành công vội
             return { success: false, pendingRedirect: true }; 
         }

         return { success: true, order: response.data };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    loadMyOrders,
    checkout
  };
};
