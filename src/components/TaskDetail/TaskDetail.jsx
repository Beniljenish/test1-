import React, { useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import './TaskDetail.css';

const TaskDetail = () => {
  const { tasks } = useTask();
  const { getProfile } = useAuth();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Felixovio',
      time: 'Nov 5 2022 at 12:14 PM',
      text: 'Here are the numbers from the store. Add it to reporting',
      avatar: 'https://randomuser.me/api/portraits/men/30.jpg'
    }
  ]);

  const task = tasks.find(t => t.id === parseInt(taskId));
  const profile = getProfile();

  if (!task) {
    return <div>Task not found</div>;
  }

  // Enhanced task data with relevant details
  const taskDetails = {
    ...task,
    description: `Fill out the ${task.title.toLowerCase()}, so everyone in the company is happy and see your productivity!`,
    type: 'Report',
    priority: task.stage === 'completed' ? 'high' : 'medium',
    deadline: getDeadlineDate(task.dueDate),
    assignee: {
      name: profile.name,
      avatar: profile.avatar
    },
    attachments: [
      { name: 'E-commerce numbers.xls', type: 'excel', icon: '📊' },
      { name: 'SAP numbers.pptx', type: 'powerpoint', icon: '📋' },
      { name: 'New products.doc', type: 'word', icon: '📄' }
    ]
  };

  function getDeadlineDate(dueDate) {
    const today = new Date();
    if (dueDate === 'Today') return today.toLocaleDateString();
    if (dueDate === 'Tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toLocaleDateString();
    }
    if (dueDate === 'This week') {
      const friday = new Date(today);
      friday.setDate(today.getDate() + (5 - today.getDay()));
      return friday.toLocaleDateString();
    }
    return dueDate;
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(), // Use timestamp for unique ID
        author: profile.name,
        time: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        text: comment.trim(),
        avatar: profile.avatar,
        canDelete: true // Mark as deletable since user posted it
      };
      
      setComments([...comments, newComment]);
      setComment('');
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleSaveEdit = (commentId) => {
    if (editingCommentText.trim()) {
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              text: editingCommentText.trim(),
              edited: true,
              editTime: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            }
          : comment
      ));
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      navigate('/tasks');
    }
  };

  return (
    <div className="task-detail-overlay" onClick={handleBackdropClick}>
      <div className="task-detail-modal">
        <div className="task-detail-header">
          <div className="task-detail-nav">
            <button onClick={() => navigate('/tasks')}>📋</button>
            <button>👁</button>
            <button>📁</button>
          </div>
          <button className="close-btn" onClick={() => navigate('/tasks')}>✕</button>
        </div>

        <div className="task-detail-content">
          <div className="task-main-content">
            <div className="task-main-info">
              <div className="task-title-section">
                <h1>{taskDetails.title}</h1>
                <div className="task-assignee">
                  <img src={taskDetails.assignee.avatar} alt={taskDetails.assignee.name} />
                  <span>{taskDetails.assignee.name}</span>
                  <span className="task-time">Nov 5 2022 at 12:14 PM</span>
                </div>
                <p className="task-description">{taskDetails.description}</p>
                <button className="attach-btn">📎 Attach</button>
              </div>
            </div>

            <div className="comments-section">
              <h3 className="comments-title">Comments</h3>
              <div className="comments-list">
                {comments.map(commentItem => (
                  <div key={commentItem.id} className="comment-item">
                    <img src={commentItem.avatar} alt={commentItem.author} className="comment-avatar" />
                    <div className="comment-content">
                      <div className="comment-header">
                        <strong>{commentItem.author}</strong>
                        <span className="comment-time">
                          {commentItem.time}
                          {commentItem.edited && (
                            <span className="edited-indicator"> (edited {commentItem.editTime})</span>
                          )}
                        </span>
                        {(commentItem.canDelete || commentItem.author === profile.name) && (
                          <div className="comment-actions">
                            <button 
                              className="comment-edit-btn"
                              onClick={() => handleEditComment(commentItem.id, commentItem.text)}
                              title="Edit comment"
                            >
                              ✏️
                            </button>
                            <button 
                              className="comment-delete-btn"
                              onClick={() => handleDeleteComment(commentItem.id)}
                              title="Delete comment"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === commentItem.id ? (
                        <div className="comment-edit-form">
                          <textarea
                            className="comment-edit-input"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(commentItem.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <div className="comment-edit-actions">
                            <button 
                              className="comment-save-btn"
                              onClick={() => handleSaveEdit(commentItem.id)}
                            >
                              Save
                            </button>
                            <button 
                              className="comment-cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{commentItem.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="comment-input-section">
                <div className="comment-input-wrapper">
                  <span>💬</span>
                  <input 
                    type="text" 
                    placeholder="Comment, or type / for command"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button onClick={handleAddComment}>➤</button>
                </div>
              </div>
            </div>
          </div>

          <div className="task-sidebar">
            <div className="task-info-section">
              <h3>Info</h3>
              <div className="info-item">
                <span className="info-label">📑 Type</span>
                <span className={`info-value badge ${taskDetails.type.toLowerCase()}`}>
                  {taskDetails.type}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">⚡ Priority</span>
                <span className={`info-value badge priority ${taskDetails.priority}`}>
                  {taskDetails.priority}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">⏰ Deadline</span>
                <span className="info-value">{taskDetails.deadline || 'Empty'}</span>
              </div>
            </div>

            <div className="attachments-section">
              <h3>Attachments</h3>
              {taskDetails.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <span className="attachment-icon">{attachment.icon}</span>
                  <span className="attachment-name">{attachment.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
