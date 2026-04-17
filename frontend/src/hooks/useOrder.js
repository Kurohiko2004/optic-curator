import { useState, useCallback } from 'react';
import { orderApi } from '../services/orderApi';
import { useCart } from '../context/CartContext'; // Dùng CartContext chung để đồng bộ giỏ hàng

export const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1
  });
  
  const { loadCart } = useCart();

  const loadMyOrders = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.getMyOrders(page, limit);
      if (response.success) {
        setOrders(response.data); // Backend now returns 'data' via getPagingData utility

        setPagination({
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          currentPage: response.currentPage
        });
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
         
         if (response.paymentUrl) {
             window.location.href = response.paymentUrl;
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
    pagination,
    loadMyOrders,
    checkout
  };
};
