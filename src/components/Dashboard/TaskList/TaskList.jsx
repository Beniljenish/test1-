import React from 'react';
import { useTask } from '../../../context/TaskContext';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = () => {
  const { tasks } = useTask();

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>My tasks ({tasks.length})</h2>
        <button className="more-btn">⋯</button>
      </div>

      <div className="task-items">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskList;