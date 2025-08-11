import React, { useEffect, useState } from 'react';
import { useTask } from '../../../context/TaskContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Comments.css';

const Comments = () => {
  const { getCommentsForUser, markCommentAsRead, formatCommentDate } = useTask();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formattedComments, setFormattedComments] = useState([]);

  // Update comment dates when component mounts or comments change
  useEffect(() => {
    const userComments = getCommentsForUser(user);
    const updatedComments = userComments.map(comment => ({
      ...comment,
      time: comment.createdAt ? formatCommentDate(comment.createdAt) : comment.time
    }));
    setFormattedComments(updatedComments);
  }, [getCommentsForUser, user, formatCommentDate]);

  const handleCommentClick = (comment) => {
    // Mark comment as read
    if (comment.isNew) {
      markCommentAsRead(comment.id);
    }
    
    // Navigate to task if taskId exists
    if (comment.taskId) {
      navigate(`/tasks/${comment.taskId}`);
    }
  };

  return (
    <div className="comments-widget">
      <div className="comments-header">
        <h3>New comments</h3>
        <button className="add-btn">+ Add</button>
      </div>

      <div className="comments-list">
        {formattedComments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet</p>
          </div>
        ) : (
          formattedComments.map(comment => (
            <div 
              key={comment.id} 
              className={`comment-item ${comment.taskId ? 'clickable' : ''}`}
              onClick={() => handleCommentClick(comment)}
            >
              <div className="comment-main">
                <div className="comment-meta">
                  <strong className="comment-title">{comment.type}</strong>
                  {comment.isNew && <span className="new-dot" />}
                  {comment.author && (
                    <span className="comment-author">by {comment.author}</span>
                  )}
                </div>
                <p className="comment-message">{comment.message}</p>
                <span className="comment-time">{comment.time}</span>
              </div>
              {comment.taskId && <span className="comment-arrow">›</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
