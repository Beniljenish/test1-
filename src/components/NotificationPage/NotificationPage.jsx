import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationPage.css';

export default function NotificationPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'task',
      title: 'Company research',
      message: 'John Deere added a new task.',
      time: '2 minutes ago',
      isRead: false,
      avatar: '👤'
    },
    {
      id: 2,
      type: 'task',
      title: 'Company research',
      message: 'John Deere marked the task complete.',
      time: '5 minutes ago',
      isRead: true,
      avatar: '👤'
    },
    {
      id: 3,
      type: 'task',
      title: 'Market ideation',
      message: 'John Deere marked the task complete.',
      time: '10 minutes ago',
      isRead: true,
      avatar: '👤'
    },
    {
      id: 4,
      type: 'task',
      title: 'Illustrations invoicing',
      message: 'John Deere marked the task on hold.',
      time: '15 minutes ago',
      isRead: false,
      avatar: '👤'
    },
    {
      id: 5,
      type: 'task',
      title: 'Yearly wrap-up',
      message: 'John Deere marked the task complete.',
      time: '20 minutes ago',
      isRead: true,
      avatar: '👤'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'unread') return !notification.isRead;
    return true;
  });

  const markAsRead = (id) => {
    // Handle marking notification as read
    console.log('Mark as read:', id);
  };

  const markAllAsRead = () => {
    // Handle marking all notifications as read
    console.log('Mark all as read');
  };

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h1 className="notification-title">Latest notifications</h1>
        <div className="notification-actions">
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
          <button className="notification-settings-btn">
            ⚙️
          </button>
        </div>
      </div>

      <div className="notification-filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveFilter('unread')}
        >
          Unread
        </button>
      </div>

      <div className="notification-list">
        {filteredNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="notification-status">
              {!notification.isRead && <div className="unread-indicator"></div>}
            </div>
            
            <div className="notification-content">
              <div className="notification-text">
                <span className="notification-task-title">{notification.title}</span>
                <span className="notification-message">{notification.message}</span>
              </div>
              <div className="notification-time">{notification.time}</div>
            </div>

            <div className="notification-avatar">
              <div className="avatar-circle">
                {notification.avatar}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
