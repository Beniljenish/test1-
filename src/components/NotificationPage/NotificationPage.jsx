import React, { useState } from 'react';
import './NotificationPage.css';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';

const NotificationPage = () => {
  const { notifications = [], deleteNotification, clearAllNotifications, markNotificationAsRead } = useTasks();
  const { user } = useAuth();
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Filter notifications to show only those specifically targeted to the current user
  const userNotifications = notifications.filter(notification => {
    // Show notification ONLY if it's specifically targeted to the current user
    return notification.targetUserId === user?.id;
  });

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  return (
    <div className="notification-page">
      <div className="notification-left">
        <div className="notif-header">
          <h2 className="notif-heading">Latest notifications</h2>
          <button className="notif-menu" onClick={clearAllNotifications}>🗑️</button>
        </div>

        <div className="notif-list">
          {userNotifications.length > 0 ? (
            userNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notif-card ${!notification.isRead ? 'unread' : ''} ${selectedNotification?.id === notification.id ? 'selected' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notif-status">
                  <div className={`status-icon ${notification.completed ? 'completed' : 'pending'}`}>
                    {notification.completed ? '✓' : '○'}
                  </div>
                </div>
                <div className="notif-details">
                  <h4 className={`notif-task-title ${notification.completed ? 'completed-text' : ''}`}>
                    {notification.title}
                  </h4>
                  <p className="notif-description">{notification.message}</p>
                </div>
                <div className="notif-user">
                  <img src="/default-avatar.png" alt="User" className="user-avatar" />
                </div>
                <button 
                  className="delete-notification-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                    if (selectedNotification?.id === notification.id) {
                      setSelectedNotification(null);
                    }
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <p>No notifications</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="notification-right">
        {selectedNotification ? (
          <>
            <div className="task-title-bar">
              <h3 className="task-heading">{selectedNotification.title}</h3>
              <button className="task-close" onClick={() => setSelectedNotification(null)}>✕</button>
            </div>
            
            <div className="task-detail">
              <span>Task:</span>
              <span className="pill project-pill">{selectedNotification.title}</span>
            </div>
            
            <div className="task-detail">
              <span>Type:</span>
              <span className={`pill priority-medium`}>
                {selectedNotification.type === 'assigned' ? 'Task Assigned' : 
                 selectedNotification.type === 'completed' ? 'Task Completed' :
                 selectedNotification.type === 'task_modified' ? 'Task Modified' : 'Notification'}
              </span>
            </div>
            
            <div className="task-detail">
              <span>From:</span>
              <span className="pill user-pill">
                <img src="/default-avatar.png" alt="User" className="user-avatar" />
                {selectedNotification.userName || 'Admin'}
              </span>
            </div>
            
            <div className="task-detail">
              <span>Date:</span>
              <span className="pill deadline-pill">
                {new Date(selectedNotification.createdAt || selectedNotification.timestamp).toLocaleDateString()}
              </span>
            </div>
            
            <div className="section-box">
              <h4>Notification Details</h4>
              <p>{selectedNotification.message}</p>
            </div>
            
            <div className="task-actions">
              <button className="btn outline" onClick={() => markNotificationAsRead(selectedNotification.id)}>
                Mark as Read
              </button>
              <button className="btn danger" onClick={() => {
                deleteNotification(selectedNotification.id);
                setSelectedNotification(null);
              }}>
                Delete Notification
              </button>
            </div>
          </>
        ) : (
          <div className="no-task-selected">
            <p>Select a notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
