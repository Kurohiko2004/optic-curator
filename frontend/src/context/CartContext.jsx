import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyCart } from '../services/api';
import { cartApi } from '../services/cartApi';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: null,
      cartCount: 0,
      loading: false,
      error: null,
      addToCart: async () => {
        throw new Error('CartProvider is missing. Wrap the component tree with CartProvider.');
      },
      loadCart: async () => {},
      updateQuantity: async () => {
        throw new Error('CartProvider is missing. Wrap the component tree with CartProvider.');
      },
      removeItem: async () => {
        throw new Error('CartProvider is missing. Wrap the component tree with CartProvider.');
      },
      clearCart: async () => {
        throw new Error('CartProvider is missing. Wrap the component tree with CartProvider.');
      },
    };
  }
  return context;
};

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
        throw new Error('Please log in to add items to the cart');
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
      throw new Error('Please log in to update quantity');
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
      throw new Error('Please log in to remove items');
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
      throw new Error('Please log in to clear the cart');
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
