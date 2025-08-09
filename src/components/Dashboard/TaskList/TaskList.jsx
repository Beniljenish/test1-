import React from 'react';
import { useTask } from '../../../context/TaskContext';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = () => {
  const { tasks } = useTask();

  const groupTasksByDate = () => {
    const grouped = {};
    tasks.forEach(task => {
      if (!grouped[task.dueDate]) {
        grouped[task.dueDate] = [];
      }
      grouped[task.dueDate].push(task);
    });
    return grouped;
  };

  const groupedTasks = groupTasksByDate();

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>My tasks ({tasks.length})</h2>
        <button className="more-btn">⋯</button>
      </div>

      <div className="task-groups">
        {Object.entries(groupedTasks).map(([date, dateTasks]) => (
          <div key={date} className="task-group">
            <div className="task-group-header">
              
            </div>
            <div className="task-items">
              {dateTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;