const BASE_URL = 'http://localhost:8082/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }
  return data;
};

export const fetchGlasses = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/glasses?${query}`);
  return handleResponse(response);
};

export const fetchGlassById = async (id) => {
  const response = await fetch(`${BASE_URL}/glasses/${id}`);
  return handleResponse(response);
};

export const fetchShapes = async () => {
  const response = await fetch(`${BASE_URL}/glasses/shapes`);
  return handleResponse(response);
};

export const signup = async (userData) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return handleResponse(response);
};

export const login = async (credentials) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    return handleResponse(response);
};

// CART SERVICES
export const addToCart = async (glassesId, quantity = 1, token) => {
    const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ glassesId, quantity })
    });
    return handleResponse(response);
};

export const getMyCart = async (token) => {
    const response = await fetch(`${BASE_URL}/cart`, {
        headers: { 
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};
