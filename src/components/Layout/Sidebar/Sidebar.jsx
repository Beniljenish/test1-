import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', to: '/dashboard' },
    { id: 'tasks', label: 'My tasks', icon: '✓', to: '/tasks' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', to: '/notifications' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">TT</div>
            <span className="logo-text">Task Test</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item${isActive ? ' active' : ''}`
              }
              end
              onClick={() => setIsOpen(false)} // Auto-close on link click
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <NavLink to="/settings" className="sidebar-item" onClick={() => setIsOpen(false)}>
              <span className="sidebar-icon">⚙️</span>
              <span className="sidebar-label">
                {user?.role === 'super-admin' ? 'Super Admin' : 'Admin Settings'}
              </span>
            </NavLink>
          )}
          <button
            className="sidebar-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              logout();
              setIsOpen(false);
              navigate('/login', { replace: true });
            }}
          >
            <span className="sidebar-icon">🚪</span>
            <span className="sidebar-label">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
