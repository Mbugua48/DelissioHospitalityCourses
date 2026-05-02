import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user info is stored in localStorage on initial mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Set default axios header so all subsequent requests are authenticated
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      // Note: Your EmailAuthTokenSerializer specifically looks for the 'email' key
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        email: email,
        password: password
      });

      const { token, user_id, role, email: userEmail } = response.data;
      
      const userData = { id: user_id, role, email: userEmail };

      // Update state and persist to localStorage
      setToken(token);
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update axios default header immediately for the next API calls
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      // Return a descriptive error message from the backend if available
      return { 
        success: false, 
        error: error.response?.data?.non_field_errors?.[0] || 'Invalid email or password' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear the authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);