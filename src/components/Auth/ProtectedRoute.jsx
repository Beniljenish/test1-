import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Simply redirect to login if not authenticated
  // Loading is handled at the app level
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
