import { API_ENDPOINTS } from '../data/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const fetchOrderApi = async (url, method = 'GET', body = null) => {
    const options = {
        method,
        headers: getAuthHeaders()
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Order API request failed');
    }
    return data;
};

export const orderApi = {
    createOrder: (orderDetails) => fetchOrderApi(API_ENDPOINTS.ORDER.POST, 'POST', orderDetails),
    getMyOrders: () => fetchOrderApi(API_ENDPOINTS.ORDER.GET_ME, 'GET'),
};
