import { API_ENDPOINTS } from '../data/constants';
import { fetchApi } from './apiClient';

export const authApi = {
  login: (credentials) => fetchApi(API_ENDPOINTS.AUTH.LOGIN, 'POST', credentials),
  signup: (userData) => fetchApi(API_ENDPOINTS.AUTH.SIGNUP, 'POST', userData),
};

// Aliases for compatibility
export const login = authApi.login;
export const signup = authApi.signup;
