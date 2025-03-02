import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        // Check if user is logged in by fetching profile
        const response = await axios.get(`${API_URL}/users/me`, {
          withCredentials: true
        });
        
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Not authenticated', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/sessions`, {
        email,
        password
      }, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        // Fetch user profile after successful login
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          withCredentials: true
        });
        
        setUser(userResponse.data);
        toast.success('Login successful!');
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/sessions`, {
        withCredentials: true
      });
      
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error during logout');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/users`, userData);
      
      if (response.status === 201) {
        toast.success('Registration successful! Please login.');
        return true;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};