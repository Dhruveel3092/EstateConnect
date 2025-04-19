import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post(APIRoutes.register, { username, email, password });
      if (data.success) {
        login(data.user);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        throw new Error("Email already registered.");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
