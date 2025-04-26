import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // start with loading = true

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // begin loading

      try {
        const { data } = await axios.get(APIRoutes.authCheck, { withCredentials: true });
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false); // finish loading
      }
    };

    fetchUser();
  }, []); // only run once on mount

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        setIsAuthenticated,
        setUser,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
