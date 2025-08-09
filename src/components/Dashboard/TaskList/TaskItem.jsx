import React from 'react';
import { useTask } from '../../../context/TaskContext';

const TaskItem = ({ task }) => {
  const { toggleTask } = useTask();

  const handleToggle = () => {
    toggleTask(task.id);
  };

  return (
    <div className={`task-item ${task.stage === 'completed' ? 'completed' : ''}`}>
      <button 
        className={`task-checkbox ${task.stage === 'completed' ? 'checked' : ''}`}
        onClick={handleToggle}
      >
        {task.stage === 'completed' && <span className="checkmark">✓</span>}
      </button>

      <div className="task-content">
        <span className="task-title">{task.title}</span>
      </div>

      <div className="task-meta">
        <span className="task-date">{task.dueDate}</span>
      </div>
    </div>
  );
};

export default TaskItem;