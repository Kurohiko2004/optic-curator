import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyCart, addToCart as apiAddToCart } from '../services/api';

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
      await apiAddToCart(glassesId, quantity, userToken);
      await loadCart(); // Tải lại giỏ hàng để cập nhật UI
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const cartCount = cart ? cart.cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, error, addToCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};
