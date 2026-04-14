import { useState, useCallback } from 'react';
import { cartApi } from '../services/cartApi';

/**
 * Custom Hook xử lý toàn bộ data, logic và calling API Giỏ hàng
 * Teammate (làm giao diện) chỉ việc nhúng Hook này vào component và gọi state/hàm
 */
export const useCart = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch giỏ hàng (Chỉ update state khi Component gọi)
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartApi.getCart();
      if (response.success) {
        setCartData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Thêm vào giỏ hàng
  const addToCart = async (glassesId, quantity = 1) => {
    try {
        await cartApi.addToCart(glassesId, quantity);
        await loadCart(); // Gọi lại loadCart để đồng bộ hoá UI mới nhất
        return { success: true };
    } catch (err) { // Lỗi ở đây (ví dụ Hết Hàng) sẽ được trả về dạng object để Frontend Alert/Toast
        return { success: false, message: err.message };
    }
  };

  // 3. Cập nhật Số Lượng Kính
  const updateQuantity = async (cartItemId, quantity) => {
    try {
        await cartApi.updateQuantity(cartItemId, quantity);
        await loadCart();
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
  };

  // 4. Xoá Mặt Hàng
  const removeItem = async (cartItemId) => {
    try {
        await cartApi.removeItem(cartItemId);
        await loadCart();
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
  };

  // 5. Làm rỗng Giỏ (thường dùng sau Checkout)
  const clearCart = async () => {
    try {
        await cartApi.clearCart();
        await loadCart(); // Lúc này cartData sẽ trở về trạng thái trống
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
  };

  return {
    cartData,         // Chứa thông tin giỏ hàng, tổng tiền (totalPrice),...
    loading,          // Dùng để show Spinners / Skeletons
    error,            // Dùng để show lỗi nếu getCart chết
    loadCart,         // Phải gọi hàm này trong useEffect() ở Component Giỏ Hàng
    addToCart,        // Dùng ở Nút "Thêm vào giỏ"
    updateQuantity,   // Dùng ở Nút "+ / -"
    removeItem,       // Dùng ở icon Thùng Rác
    clearCart         // Dùng ở Nút "Xóa Tất Cả"
  };
};
