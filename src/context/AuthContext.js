import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('organizo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    if (email && password) {
      const userData = {
        id: 1,
        email,
        name: email.split('@')[0] || 'User',
        avatar: '/api/placeholder/32/32'
      };
      setUser(userData);
      localStorage.setItem('organizo_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Please enter both email and password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('organizo_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};