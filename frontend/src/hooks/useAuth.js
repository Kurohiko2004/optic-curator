import { useState } from 'react';
import { API_ENDPOINTS } from '../data/constants';

export const useAuth = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authenticate = async (mode, formData) => {
    setLoading(true);
    setError(null);

    const url = mode === 'login' 
      ? API_ENDPOINTS.AUTH.LOGIN 
      : API_ENDPOINTS.AUTH.SIGNUP;

    const body = mode === 'login' 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      console.log('Success:', data);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      if (onSuccess) onSuccess(data);
      return data;
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { authenticate, loading, error, setError };
};
