import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyCart } from '../services/api';
import { cartApi } from '../services/cartApi';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, userToken }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCart = async () => {
    if (!userToken) {
        setCart(null);
        return;
    }
    setLoading(true);
    try {
      const result = await getMyCart(userToken);
      setCart(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userToken]);

  const addToCart = async (glassesId, quantity = 1) => {
    if (!userToken) {
        throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');
    }
    try {
      await cartApi.addToCart(glassesId, quantity);
      await loadCart(); // Tải lại giỏ hàng để cập nhật UI
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!userToken) {
      throw new Error('Vui lòng đăng nhập để cập nhật số lượng');
    }
    try {
      await cartApi.updateQuantity(cartItemId, quantity);
      await loadCart();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (cartItemId) => {
    if (!userToken) {
      throw new Error('Vui lòng đăng nhập để xóa sản phẩm');
    }
    try {
      await cartApi.removeItem(cartItemId);
      await loadCart();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!userToken) {
      throw new Error('Vui lòng đăng nhập để xóa giỏ hàng');
    }
    try {
      await cartApi.clearCart();
      await loadCart();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const cartCount = cart ? cart.cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, error, addToCart, loadCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
