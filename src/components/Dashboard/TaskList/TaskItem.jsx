import React from 'react';
import { useTask } from '../../../context/TaskContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TaskItem = ({ task }) => {
  const { toggleTask, deleteTask, canEditAnyTask, canDeleteAnyTask } = useTask();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    toggleTask(task.id, user);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/tasks/${task.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  // Function to determine which section a date belongs to
  const getDateSection = (dateString) => {
    if (!dateString) return 'Next Month';
    
    // Handle string formats like "Today", "Tomorrow" directly
    if (dateString === 'Today') return 'Today';
    if (dateString === 'Tomorrow') return 'Tomorrow';
    
    // Parse the date string
    let taskDate;
    
    // Handle formats like "Aug 10", "Aug 15", etc.
    if (typeof dateString === 'string' && dateString.includes(' ')) {
      const currentYear = new Date().getFullYear();
      const dateStr = `${dateString}, ${currentYear}`;
      taskDate = new Date(dateStr);
    } else {
      taskDate = new Date(dateString);
    }
    
    // If date parsing failed, default to Next Month
    if (isNaN(taskDate.getTime())) {
      return 'Next Month';
    }
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    // Calculate start of this week (Sunday)
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    // Calculate end of this week (Saturday)
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    endOfThisWeek.setHours(23, 59, 59, 999);
    
    // Calculate start of next week (Sunday)
    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);
    startOfNextWeek.setHours(0, 0, 0, 0);
    
    // Calculate end of next week (Saturday)
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    endOfNextWeek.setHours(23, 59, 59, 999);
    
    // Calculate start of next month
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    startOfNextMonth.setHours(0, 0, 0, 0);
    
    if (taskDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (taskDate >= startOfThisWeek && taskDate <= endOfThisWeek && taskDate > tomorrow) {
      // Current week (after tomorrow but within this week)
      return 'This Week';
    } else if (taskDate >= startOfNextWeek && taskDate <= endOfNextWeek) {
      // Next week
      return 'Next Week';
    } else if (taskDate >= startOfNextMonth) {
      // Next month and beyond
      return 'Next Month';
    } else {
      // Anything else (dates between next week and next month)
      return 'This Month';
    }
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
        <span className="task-date">{getDateSection(task.dueDate)}</span>
        {/* Admin Controls */}
        {(canEditAnyTask(user) || canDeleteAnyTask(user)) && (
          <div className="task-admin-controls">
            {canEditAnyTask(user) && (
              <button 
                className="task-edit-btn"
                onClick={handleEdit}
                title="Edit Task"
              >
                ✏️
              </button>
            )}
            {canDeleteAnyTask(user) && (
              <button 
                className="task-delete-btn"
                onClick={handleDelete}
                title="Delete Task"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;