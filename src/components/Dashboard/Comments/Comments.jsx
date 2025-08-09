import React from 'react';
import { useTask } from '../../../context/TaskContext';
import './Comments.css';

const Comments = () => {
  const { comments } = useTask();

  return (
    <div className="comments-widget">
      <div className="comments-header">
        <h3>New comments</h3>
        <button className="add-btn">+ Add</button>
      </div>

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-main">
              <div className="comment-meta">
                <strong className="comment-title">{comment.type}</strong>
                {comment.isNew && <span className="new-dot" />}
              </div>
              <p className="comment-message">{comment.message}</p>
            </div>
            <span className="comment-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
