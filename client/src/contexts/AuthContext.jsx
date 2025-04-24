import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(APIRoutes.authCheck, { withCredentials: true });
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user);
    } catch (error) {
      console.log(error)
    }
    };
    
    fetchData();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setIsAuthenticated, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);