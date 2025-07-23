import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Login from './components/Auth/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ProfilePage from './components/ProfilePage/ProfilePage.jsx'; // <-- Already imported
import NotificationPage from './components/NotificationPage/NotificationPage';

import './styles/globals.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              {/* Add this Route for Profile Page */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
