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
    // Check for existing session on app start
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('organizo_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Verify the user data is valid
          if (userData && userData.email) {
            setUser(userData);
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('organizo_user');
          }
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
        // Clear invalid data
        localStorage.removeItem('organizo_user');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure proper loading state
    const timeoutId = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    if (email && password) {
      const userData = {
        id: 1,
        email,
        name: email.split('@')[0] || 'User',
        avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      localStorage.setItem('organizo_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Please enter both email and password' };
  };

  const updateProfile = (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData
    };
    setUser(updatedUser);
    localStorage.setItem('organizo_user', JSON.stringify(updatedUser));
  };

  const getProfile = () => {
    return user || {
      name: 'John Deere',
      email: 'john.deere@email.com',
      avatar: 'https://randomuser.me/api/portraits/men/30.jpg'
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('organizo_user');
    // Also clear any other related storage
    localStorage.clear();
  };

  // Debug function to check auth state
  const debugAuth = () => {
    console.log('Current user:', user);
    console.log('Loading:', loading);
    console.log('LocalStorage:', localStorage.getItem('organizo_user'));
  };

  const value = {
    user,
    login,
    logout,
    loading,
    debugAuth,
    updateProfile,
    getProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};