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
            <div className="comment-header">
              <span className="comment-type">{comment.type}</span>
              <span className="comment-time">{comment.time}</span>
              {comment.isNew && <span className="new-indicator"></span>}
            </div>
            <p className="comment-message">{comment.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;