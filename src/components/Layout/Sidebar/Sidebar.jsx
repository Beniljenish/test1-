import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', active: true },
    { id: 'tasks', label: 'My tasks', icon: '✓', active: false },
    { id: 'notifications', label: 'Notifications', icon: '🔔', active: false },
  ];

  const settingsItems = [
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'logout', label: 'Log out', icon: '🚪', onClick: logout },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">AZ</div>
          <span className="logo-text">Organizo</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`sidebar-item ${item.active ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        {settingsItems.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="sidebar-item"
            onClick={item.onClick}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
