// Re-export all from small files for centralized access and backward compatibility
export * from './apiClient';
export * from './authApi';
export * from './glassesApi';
export { cartApi, cartApi as default } from './cartApi';

// Aliases for Cart for compatibility
import { cartApi } from './cartApi';
export const addToCart = cartApi.addToCart;
export const getMyCart = cartApi.getCart;
export const updateCartQuantity = cartApi.updateQuantity;
export const removeFromCart = cartApi.removeItem;
export const clearCart = cartApi.clearCart;
