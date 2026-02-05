import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/'; // Adjust if your API base URL is different

// Create an axios instance for API calls
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Token ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * A helper function to parse errors from the backend.
 * Django REST Framework often returns validation errors as an object.
 * e.g., { email: ['user with this email already exists.'] }
 */
const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    // Extracts all error messages and joins them.
    const messages = Object.values(error.response.data).flat();
    return messages.join(' ');
  }
  return error.message || 'An unknown error occurred. Please try again.';
};

// Register user
const register = async (userData) => {
  try {
    const response = await api.post('register/', userData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Login user
const login = async (credentials) => {
  try {
    // Your backend might use a different endpoint like 'token/' or 'api-token-auth/'
    const response = await api.post('login/', credentials);
    if (response.data.token || response.data.access) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Forgot Password
const forgotPassword = async (email) => {
    // Endpoint for DRF might be 'password_reset/'
    const response = await api.post('password_reset/', { email });
    return response.data;
};

// Reset Password
const resetPasswordConfirm = async (data) => {
    // Endpoint for DRF might be 'password_reset/confirm/'
    const response = await api.post('password_reset/confirm/', data);
    return response.data;
};

const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPasswordConfirm,
};

export default authService;