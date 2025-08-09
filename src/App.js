import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Login from './components/Auth/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ProfilePage from './components/ProfilePage/ProfilePage.jsx';
import NotificationPage from './components/NotificationPage/NotificationPage';
import MyTask from './components/MyTask/MyTask';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';

import './styles/globals.css';
import './App.css';

// Main App Routes Component (inside AuthProvider to access auth state)
function AppRoutes() {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('AppRoutes - Loading:', loading, 'User:', user ? 'logged in' : 'not logged in');

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      {/* Public login page */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />

      {/* Root route - redirect based on auth status */}
      <Route 
        path="/" 
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />} 
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout><NotificationPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout><MyTask /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to login */}
      <Route 
        path="*" 
        element={<Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
