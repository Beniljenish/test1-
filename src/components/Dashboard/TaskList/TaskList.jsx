import React from 'react';
import { useTask } from '../../../context/TaskContext';
import { useAuth } from '../../../context/AuthContext';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = () => {
  const { getTasksForUser } = useTask();
  const { user } = useAuth();

  // Get tasks visible to current user based on role permissions
  const visibleTasks = getTasksForUser(user);

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

  // Transform tasks to show time info and add calculated properties
  const transformedTasks = visibleTasks.map(task => ({
    ...task,
    section: getDateSection(task.dueDate)
  }));

  // Group tasks by section
  const groupBySection = (tasks) => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.section]) acc[task.section] = [];
      acc[task.section].push(task);
      return acc;
    }, {});
  };

  // Define section order for consistent display
  const sectionOrder = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'This Month', 'Next Month'];

  const grouped = groupBySection(transformedTasks);

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>My tasks ({visibleTasks.length})</h2>
        <button className="more-btn">⋯</button>
      </div>

      <div className="task-sections">
        {sectionOrder.map(section => {
          // Only render sections that have tasks
          if (!grouped[section] || grouped[section].length === 0) return null;
          
          return (
            <div key={section} className="task-section">
              <div className="task-items">
                {grouped[section].map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;