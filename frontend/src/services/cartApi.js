import { API_ENDPOINTS } from '../data/constants';

// Lấy token từ localStorage và tạo Headers dùng chung
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Hàm fetch dùng chung cho các request Giỏ hàng
const fetchCartApi = async (url, method = 'GET', body = null) => {
    const options = {
        method,
        headers: getAuthHeaders()
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    // Nếu status trả về không phải 200/201 (Lỗi token, lỗi logic,...)
    if (!response.ok) {
        throw new Error(data.message || 'Cart API request failed');
    }
    return data;
};

// Khai báo tập hợp các API gọi tới BE
export const cartApi = {
    getCart: () => fetchCartApi(API_ENDPOINTS.CART.GET),
    addToCart: (glassesId, quantity) => fetchCartApi(API_ENDPOINTS.CART.ADD, 'POST', { glassesId, quantity }),
    updateQuantity: (cartItemId, quantity) => fetchCartApi(API_ENDPOINTS.CART.UPDATE(cartItemId), 'PATCH', { quantity }),
    removeItem: (cartItemId) => fetchCartApi(API_ENDPOINTS.CART.DELETE(cartItemId), 'DELETE'),
    clearCart: () => fetchCartApi(API_ENDPOINTS.CART.CLEAR, 'DELETE'),
};
