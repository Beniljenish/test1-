import React, { useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyTask.css';

const MyTask = () => {
  const { getTasksForUser, getAssignedTasks, getMyOwnTasks, toggleTask, formatTrackedTime } = useTask();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [taskFilter, setTaskFilter] = useState('active');
  const [taskSection, setTaskSection] = useState('assigned'); // New state for admin task sections

  // Get different types of tasks based on user role
  const allVisibleTasks = getTasksForUser(user);
  const assignedTasks = getAssignedTasks(user);
  const myOwnTasks = getMyOwnTasks(user);

  // Determine which tasks to show based on user role and selected section
  const getTasksToShow = () => {
    if (user?.role === 'admin' || user?.role === 'super-admin') {
      // For admins and super-admins, show different sections
      switch (taskSection) {
        case 'assigned':
          return assignedTasks; // Tasks assigned TO this admin/super-admin
        case 'own':
          return myOwnTasks; // Tasks created BY this admin/super-admin
        case 'all':
          return allVisibleTasks; // All tasks (for admin/super-admin overview)
        default:
          return assignedTasks;
      }
    } else {
      // For regular users, show only assigned tasks
      return allVisibleTasks;
    }
  };

  const visibleTasks = getTasksToShow();

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

  // Transform tasks to match MyTask format
  const transformedTasks = visibleTasks.map(task => ({
    id: task.id,
    section: getDateSection(task.dueDate),
    title: task.title,
    stage: task.stage,
    priority: task.priority || 'medium',
    due: task.dueDate,
    team: task.team || 'Development',
    avatar: task.avatar || 'https://randomuser.me/api/portraits/men/30.jpg',
    completed: task.stage === 'completed',
    completedDate: task.completedDate,
    trackedTime: task.trackedTime || 0
  }));

  // Filter tasks based on completion status
  const getFilteredTasks = () => {
    switch (taskFilter) {
      case 'completed':
        return transformedTasks.filter(task => task.completed);
      case 'active':
        return transformedTasks.filter(task => !task.completed);
      case 'all':
      default:
        return transformedTasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const completedCount = transformedTasks.filter(task => task.completed).length;
  const activeCount = transformedTasks.filter(task => !task.completed).length;

  const handleTaskToggle = (taskId) => {
    toggleTask(taskId, user);
  };

  const handleFilterChange = (filter) => {
    setTaskFilter(filter);
  };

  const handleSectionChange = (section) => {
    setTaskSection(section);
  };

  const groupBySection = (tasks) => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.section]) acc[task.section] = [];
      acc[task.section].push(task);
      return acc;
    }, {});
  };

  // Define section order for consistent display
  const sectionOrder = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'This Month', 'Next Month'];

  const grouped = groupBySection(filteredTasks);

  const handleTitleClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="task-page-wrapper">
      {/* Admin/Super-Admin Task Section Selector */}
      {(user?.role === 'admin' || user?.role === 'super-admin') && (
        <div className="admin-section-controls">
          <div className="section-buttons">
            <button 
              className={`section-btn ${taskSection === 'assigned' ? 'active' : ''}`}
              onClick={() => handleSectionChange('assigned')}
            >
              📥 Assigned Tasks ({assignedTasks.length})
            </button>
            <button 
              className={`section-btn ${taskSection === 'own' ? 'active' : ''}`}
              onClick={() => handleSectionChange('own')}
            >
              📝 My Tasks ({myOwnTasks.length})
            </button>
            <button 
              className={`section-btn ${taskSection === 'all' ? 'active' : ''}`}
              onClick={() => handleSectionChange('all')}
            >
              🗂️ All Tasks ({allVisibleTasks.length})
            </button>
          </div>
        </div>
      )}

      {/* Task Filter Controls */}
      <div className="task-controls-header">
        {/* Dynamic section title for admins and super-admins */}
        {(user?.role === 'admin' || user?.role === 'super-admin') && (
          <div className="current-section-title">
            <h3>
              {taskSection === 'assigned' && '📥 Tasks Assigned to Me'}
              {taskSection === 'own' && '📝 Tasks I Created'}
              {taskSection === 'all' && '🗂️ All Tasks Overview'}
            </h3>
          </div>
        )}
        
        {/* Regular users see "My Assigned Tasks" */}
        {user?.role !== 'admin' && user?.role !== 'super-admin' && (
          <div className="user-section-title">
            <h2>📥 My Assigned Tasks</h2>
          </div>
        )}
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${taskFilter === 'active' ? 'active' : ''}`}
            onClick={() => handleFilterChange('active')}
          >
            📋 Active Tasks ({activeCount})
          </button>
          <button 
            className={`filter-btn ${taskFilter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            ✅ Completed ({completedCount})
          </button>
          <button 
            className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            📊 All Tasks ({transformedTasks.length})
          </button>
        </div>
        
        {taskFilter === 'completed' && completedCount > 0 && (user?.role === 'admin' || user?.role === 'super-admin') && (
          <div className="completed-info">
            <span className="info-text">
              💡 Showing completed tasks. You can restore them by unchecking.
            </span>
          </div>
        )}
      </div>

      <div className="tasks-wrapper">
        {/* Empty state handling */}
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-content">
              {(user?.role === 'admin' || user?.role === 'super-admin') ? (
                <>
                  {taskSection === 'assigned' && (
                    <>
                      <h3>📥 No tasks assigned to you</h3>
                      <p>You don't have any tasks assigned by other admins yet.</p>
                    </>
                  )}
                  {taskSection === 'own' && (
                    <>
                      <h3>📝 No tasks created</h3>
                      <p>You haven't created any tasks yet. Create your first task to get started!</p>
                    </>
                  )}
                  {taskSection === 'all' && (
                    <>
                      <h3>🗂️ No tasks found</h3>
                      <p>No tasks match your current filter criteria.</p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h3>📥 No assigned tasks</h3>
                  <p>You don't have any tasks assigned to you yet.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          sectionOrder.map(section => {
            // Only render sections that have tasks
            if (!grouped[section] || grouped[section].length === 0) return null;
          
          return (
            <div key={section} className="tasks-section">
              <div className="section-header">
                <h2 className="section-title">{section}</h2>
              </div>
              <div className="tasks-container">
                <div className="row head">
                  <div></div>
                  <div className="title">TASK</div>
                  <div>DUE DATE</div>
                  <div>STAGE</div>
                  <div>PRIORITY</div>
                  <div>TEAM</div>
                  <div>TIME TRACKED</div>
                  <div>ASSIGNEE</div>
                </div>
                {grouped[section].map(task => (
                  <div key={task.id} className={`row ${task.completed ? 'completed-task' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task.id)}
                      title={task.completed ? 'Mark as active' : 'Mark as completed'}
                    />
                    <div 
                      className="title clickable" 
                      onClick={() => handleTitleClick(task.id)}
                    >
                      {task.title}
                      {task.completed && task.completedDate && (
                        <span className="completed-date">
                          ✓ Completed {new Date(task.completedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="due">{task.section}</div>
                    <div className={`badge stage ${task.stage}`}>{task.stage.replace('-', ' ')}</div>
                    <div className={`badge priority ${task.priority}`}>{task.priority}</div>
                    <div className="team">{task.team}</div>
                    <div className="tracked-time">
                      {task.trackedTime > 0 ? formatTrackedTime(task.trackedTime) : '0m'}
                    </div>
                    <img src={task.avatar} alt="avatar" className="avatar" />
                  </div>
                ))}
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};

export default MyTask;