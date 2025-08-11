import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import './TaskDetail.css';

const TaskDetail = () => {
  const { tasks, updateTask, addCommentToTask, toggleTask, canUserSeeComment, deleteTask, canEditAnyTask, canDeleteAnyTask, addNotification } = useTask();
  const { user, canEditTask, canCompleteTask } = useAuth();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState({});

  const task = tasks.find(t => t.id === parseInt(taskId));

  // Load task-specific data when component mounts or task changes
  useEffect(() => {
    if (task) {
      // Initialize comments for this specific task with filtering
      const taskComments = task.comments || [];
      const filteredComments = taskComments.filter(commentItem => 
        canUserSeeComment(user, commentItem, task)
      );
      setComments(filteredComments);
      
      // Initialize attachments for this specific task
      const taskAttachments = task.attachments || [];
      setAttachments(taskAttachments);
      
      // Initialize edit task data
      setEditTaskData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        stage: task.stage || 'not-started',
        assigneeId: task.assigneeId || '',
        assigneeName: task.assigneeName || ''
      });
    }
  }, [task, canUserSeeComment, user]); // Added task dependency to react to external attachment changes

  if (!task) {
    return (
      <div className="task-detail-overlay" onClick={() => navigate('/tasks')}>
        <div className="task-detail-modal">
          <div className="task-not-found">
            <h2>Task not found</h2>
            <button onClick={() => navigate('/tasks')}>Back to Tasks</button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced task data with actual task information
  const taskDetails = {
    ...task,
    description: task.description || `Complete the ${task.title} task with attention to detail and quality.`,
    type: task.type || 'Task',
    priority: task.priority || 'medium',
    deadline: getDeadlineDate(task.dueDate),
    assignee: {
      name: task.assigneeName || user?.name || 'Unknown',
      avatar: task.avatar || user?.avatar || 'https://via.placeholder.com/150'
    },
    attachments: attachments
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
    if (comment.trim() && user) {
      // Add comment to this specific task using context function
      addCommentToTask(parseInt(taskId), comment.trim(), user);
      setComment('');
    }
  };

  const handleAddAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      
      files.forEach(file => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileIcon = getFileIcon(fileExtension);
        
        const newAttachment = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: fileExtension,
          icon: fileIcon,
          size: file.size,
          file: file, // Store the actual file for download
          uploadDate: new Date().toLocaleDateString()
        };
        
        // Update local state first
        setAttachments(prev => {
          const updatedAttachments = [...prev, newAttachment];
          
          // Update the task with new attachments using the updated array
          if (updateTask) {
            updateTask(task.id, { ...task, attachments: updatedAttachments }); // No user passed for attachment updates
          }
          
          return updatedAttachments;
        });

        // Create notifications for attachment addition
        if (addNotification) {
          // Only notify task creator/admin when a user adds an attachment
          // (Don't notify the assignee, only the admin who assigned the task)
          if (task.creatorId && task.creatorId !== user.id) {
            addNotification({
              taskId: task.id,
              title: task.title,
              message: `${user.name} added attachment "${file.name}" to task "${task.title}"`,
              type: 'attachment_added',
              userName: user.name,
              targetUserId: task.creatorId
            });
          }
        }
      });
    };
    
    input.click();
  };

  const getFileIcon = (extension) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📋',
      pptx: '📋',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      mp3: '🎵',
      zip: '📦',
      rar: '📦'
    };
    return icons[extension] || '📎';
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment.file) {
      const url = URL.createObjectURL(attachment.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      a.click();
      URL.revokeObjectURL(url);
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

  // Admin task edit functionality
  const handleEditTask = () => {
    setIsEditingTask(true);
  };

  const handleSaveTaskEdit = () => {
    if (editTaskData.title.trim()) {
      updateTask(task.id, {
        ...editTaskData,
        title: editTaskData.title.trim(),
        description: editTaskData.description.trim()
      }, user); // Pass current user for modification notifications
      setIsEditingTask(false);
    }
  };

  const handleCancelTaskEdit = () => {
    // Reset to original values
    setEditTaskData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'medium',
      stage: task.stage || 'not-started',
      assigneeId: task.assigneeId || '',
      assigneeName: task.assigneeName || ''
    });
    setIsEditingTask(false);
  };

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTask(task.id);
      navigate('/tasks');
    }
  };

  const handleEditTaskChange = (field, value) => {
    setEditTaskData(prev => ({
      ...prev,
      [field]: value
    }));
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
            {/* Admin Controls */}
            {canEditAnyTask(user) && !isEditingTask && (
              <>
                <button onClick={handleEditTask} title="Edit Task">✏️</button>
                <button onClick={handleDeleteTask} title="Delete Task" className="delete-btn">🗑️</button>
              </>
            )}
            {canEditAnyTask(user) && isEditingTask && (
              <>
                <button onClick={handleSaveTaskEdit} title="Save Changes" className="save-btn">💾</button>
                <button onClick={handleCancelTaskEdit} title="Cancel Edit" className="cancel-btn">❌</button>
              </>
            )}
          </div>
          <button className="close-btn" onClick={() => navigate('/tasks')}>✕</button>
        </div>

        <div className="task-detail-content">
          <div className="task-main-content">
            <div className="task-main-info">
              <div className="task-title-section">
                {isEditingTask && canEditAnyTask(user) ? (
                  <div className="edit-task-form">
                    <input
                      type="text"
                      value={editTaskData.title}
                      onChange={(e) => handleEditTaskChange('title', e.target.value)}
                      className="edit-title-input"
                      placeholder="Task title"
                    />
                  </div>
                ) : (
                  <h1>{task.title}</h1>
                )}
                <div className="task-assignee">
                  <img src={taskDetails.assignee.avatar} alt={taskDetails.assignee.name} />
                  <span>{taskDetails.assignee.name}</span>
                  <span className="task-time">
                    {task.createdAt ? 
                      new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : 
                      'Recently created'
                    }
                  </span>
                </div>
                {isEditingTask && canEditAnyTask(user) ? (
                  <div className="edit-description-section">
                    <textarea
                      value={editTaskData.description}
                      onChange={(e) => handleEditTaskChange('description', e.target.value)}
                      className="edit-description-textarea"
                      placeholder="Task description"
                      rows="4"
                    />
                    <div className="edit-task-fields">
                      <div className="edit-field">
                        <label>Due Date:</label>
                        <input
                          type="text"
                          value={editTaskData.dueDate}
                          onChange={(e) => handleEditTaskChange('dueDate', e.target.value)}
                          className="edit-input"
                          placeholder="Due date"
                        />
                      </div>
                      <div className="edit-field">
                        <label>Priority:</label>
                        <select
                          value={editTaskData.priority}
                          onChange={(e) => handleEditTaskChange('priority', e.target.value)}
                          className="edit-select"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="edit-field">
                        <label>Stage:</label>
                        <select
                          value={editTaskData.stage}
                          onChange={(e) => handleEditTaskChange('stage', e.target.value)}
                          className="edit-select"
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="task-description">{taskDetails.description}</p>
                )}
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
                        {(commentItem.canDelete || commentItem.author === user?.name) && (
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
              <div className="attachments-header">
                <h3>Attachments</h3>
                <button className="add-attachment-btn" onClick={handleAddAttachment} title="Add attachment">
                  +
                </button>
              </div>
              {taskDetails.attachments.length === 0 ? (
                <p className="no-attachments">No attachments yet</p>
              ) : (
                taskDetails.attachments.map((attachment, index) => (
                  <div 
                    key={attachment.id || index} 
                    className="attachment-item"
                    onClick={() => handleDownloadAttachment(attachment)}
                    title={`Download ${attachment.name}`}
                  >
                    <span className="attachment-icon">{attachment.icon}</span>
                    <div className="attachment-details">
                      <span className="attachment-name">{attachment.name}</span>
                      {attachment.size && (
                        <span className="attachment-size">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    <button className="download-btn" title="Download">⬇️</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
