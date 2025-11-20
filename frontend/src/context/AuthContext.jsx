// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      console.log('👤 Loading user...');
      const { data } = await API.get('/auth/me');
      setUser(data.user);
      console.log('✅ User loaded:', data.user.email);
    } catch (error) {
      console.error('❌ Failed to load user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registering user...');
      const { data } = await API.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      console.log('✅ Registration successful');
      return data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Logging in...');
      const { data } = await API.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      console.log('✅ Login successful');
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};