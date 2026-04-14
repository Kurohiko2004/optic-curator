export const BASE_API_URL = 'http://localhost:8082/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_API_URL}/auth/login`,
    SIGNUP: `${BASE_API_URL}/auth/signup`,
  },
  CART: {
    GET: `${BASE_API_URL}/cart`,
    ADD: `${BASE_API_URL}/cart/add`,
    CLEAR: `${BASE_API_URL}/cart/clear`,
    UPDATE: (id) => `${BASE_API_URL}/cart/${id}`,
    DELETE: (id) => `${BASE_API_URL}/cart/${id}`,
  },
  ORDER: {
    GET_ME: `${BASE_API_URL}/orders/me`,
    POST: `${BASE_API_URL}/orders`,
  },
  GLASSES: {
    LIST: `${BASE_API_URL}/glasses`,
    DETAIL: (id) => `${BASE_API_URL}/glasses/${id}`,
    SHAPES: `${BASE_API_URL}/glasses/shapes`,
  },
};
