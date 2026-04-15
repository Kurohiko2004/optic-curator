import { API_ENDPOINTS } from '../data/constants';
import { fetchApi } from './apiClient';

export const glassesApi = {
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`${API_ENDPOINTS.GLASSES.LIST}?${query}`);
  },
  getById: (id) => fetchApi(API_ENDPOINTS.GLASSES.DETAIL(id)),
  getShapes: () => fetchApi(API_ENDPOINTS.GLASSES.SHAPES),
  
  // Admin functions
  create: (data) => fetchApi(API_ENDPOINTS.GLASSES.LIST, 'POST', data, true),
  update: (id, data) => fetchApi(API_ENDPOINTS.GLASSES.DETAIL(id), 'PUT', data, true),
};

// Aliases for compatibility
export const fetchGlasses = glassesApi.getList;
export const fetchGlassById = glassesApi.getById;
export const fetchShapes = glassesApi.getShapes;
