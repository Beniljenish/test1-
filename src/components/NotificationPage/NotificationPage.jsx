import React, { useState } from 'react';
import './NotificationPage.css';

export default function NotificationPage() {
  const [selectedId, setSelectedId] = useState(1);

  const notifications = [
    { id: 1, title: 'Company research', message: 'John Deere added a new task.', isRead: false, completed: false },
    { id: 2, title: 'Company research', message: 'John Deere marked the task complete.', isRead: true, completed: true },
    { id: 3, title: 'Market ideation', message: 'John Deere marked the task complete.', isRead: true, completed: true },
    { id: 4, title: 'Illustrations invoicing', message: 'John Deere marked the task on hold.', isRead: false, completed: false },
    { id: 5, title: 'Yearly wrap-up', message: 'John Deere marked the task complete.', isRead: true, completed: true },
  ];

  const selectedTask = notifications.find(n => n.id === selectedId);

  return (
    <div className="notification-page">
      <div className="notification-left">
        <h3 className="notif-heading">Latest notifications</h3>
        <div className="notif-list">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notif-card ${n.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(n.id)}
            >
              <div className="notif-icon">
                {n.completed ? <span className="checkmark">✔</span> : <span className="circle" />}
              </div>
              <div className="notif-content">
                <div className={`notif-title ${n.completed ? 'strike' : ''}`}>{n.title}</div>
                <div className="notif-msg">{n.message}</div>
              </div>
              <img className="notif-avatar" src="https://i.pravatar.cc/32" alt="avatar" />
            </div>
          ))}
        </div>
      </div>

      <div className="notification-right">
        <div className="task-title-bar">
          <div className="task-heading">{selectedTask.title}</div>
          <div className="task-close">✕</div>
        </div>

        <div className="task-detail"><span>👤 Assignee</span><span className="pill">Me</span></div>
        <div className="task-detail"><span>🗓️ Deadline</span><span className="pill dark">Today</span></div>
        <div className="task-detail"><span>📁 Projects</span><span className="pill light">Secret project</span></div>
        <div className="task-detail"><span>⚙️ Priority</span><span className="pill yellow">Medium</span></div>

        <div className="section-box">
          <h4>Attachments</h4>
          <div className="section-row"><span>📎 No attachments</span><button>Attach</button></div>
        </div>

        <div className="section-box">
          <h4>Links</h4>
          <div className="section-row"><span>🔗 No links</span><button>Add</button></div>
        </div>

        <div className="task-actions">
          <button className="btn outline">📁 Archive task</button>
          <button className="btn danger">🗑️ Delete task</button>
        </div>
      </div>
    </div>
  );
}
