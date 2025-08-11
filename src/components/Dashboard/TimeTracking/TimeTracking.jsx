import React, { useState, useEffect, useMemo } from 'react';
import { useTask } from '../../../context/TaskContext';
import { useAuth } from '../../../hooks/useAuth';
import './TimeTracking.css';

const TimeTracking = () => {
  const { tasks, updateTrackedTime, getTasksForUser } = useTask();
  const { user: currentUser } = useAuth();
  const [timers, setTimers] = useState({}); // Track time for each task
  const [activeTimer, setActiveTimer] = useState(null); // Which timer is currently running

  // Use tasks based on user role and permissions - memoized to prevent unnecessary rerenders
  const trackingTasks = useMemo(() => {
    if (!tasks || !currentUser) return [];
    
    // Get tasks visible to current user based on their role
    let visibleTasks;
    if (currentUser.role === 'admin') {
      // Admin can see all tasks for time tracking overview
      visibleTasks = tasks;
    } else {
      // Regular users only see their assigned tasks
      visibleTasks = getTasksForUser(currentUser);
    }
    
    // Function to determine which section a date belongs to (same as TaskList)
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

    // Transform tasks to include section information
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

    // Define section order for consistent display (same as TaskList)
    const sectionOrder = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'This Month', 'Next Month'];
    
    const grouped = groupBySection(transformedTasks);
    
    // Flatten tasks in the same order as TaskList, but only include active tasks
    const orderedTasks = [];
    sectionOrder.forEach(section => {
      if (grouped[section] && grouped[section].length > 0) {
        // Filter out completed tasks from time tracking
        const activeTasks = grouped[section].filter(task => task.stage !== 'completed');
        orderedTasks.push(...activeTasks);
      }
    });
    
    return orderedTasks;
  }, [tasks, currentUser, getTasksForUser]);

  // Initialize timers from tasks (only active tasks)
  useEffect(() => {
    const initialTimers = {};
    
    trackingTasks.forEach(task => {
      // Only initialize timers for active (non-completed) tasks
      if (task.stage !== 'completed') {
        initialTimers[task.id] = {
          seconds: task.trackedTime || 0, // Initialize with saved tracked time
          isActive: false
        };
      }
    });
    setTimers(initialTimers);
  }, [trackingTasks]);

  // Debug: Log tasks to console
  useEffect(() => {
    console.log('Available tasks for tracking (active only):', trackingTasks.length);
    console.log('Active tasks:', trackingTasks);
  }, [trackingTasks]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (activeTimer !== null) {
      // Check if the currently tracked task is still active
      const activeTask = tasks.find(t => t.id === activeTimer);
      if (!activeTask || activeTask.stage === 'completed') {
        // Stop tracking if task was completed
        setActiveTimer(null);
        return;
      }

      interval = setInterval(() => {
        setTimers(prev => {
          const newTimers = {
            ...prev,
            [activeTimer]: {
              ...prev[activeTimer],
              seconds: prev[activeTimer].seconds + 1
            }
          };
          
          // Update the task's tracked time in the context
          const newSeconds = newTimers[activeTimer].seconds;
          updateTrackedTime(activeTimer, newSeconds);
          
          return newTimers;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer, updateTrackedTime, tasks]);

  // Format seconds to readable time
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const toggleTimer = (taskId) => {
    // Check if current user is admin - admins cannot start/stop timers
    if (currentUser && currentUser.role === 'admin') {
      console.log('Admin users cannot start/stop timers');
      return;
    }

    // Find the task to check if it's completed
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.stage === 'completed') {
      console.log('Cannot track time for completed task');
      return;
    }

    // Check if task is assigned to current user
    if (task.assigneeId !== currentUser?.id) {
      console.log('Cannot track time for tasks not assigned to you');
      return;
    }

    if (activeTimer === taskId) {
      // Pause current timer and save the tracked time
      setActiveTimer(null);
      const currentTime = timers[taskId]?.seconds || 0;
      updateTrackedTime(taskId, currentTime);
    } else {
      // Start new timer (this will pause any other active timer)
      // Save current active timer's time if there is one
      if (activeTimer !== null) {
        const currentTime = timers[activeTimer]?.seconds || 0;
        updateTrackedTime(activeTimer, currentTime);
      }
      setActiveTimer(taskId);
    }
  };

  return (
    <div className="time-tracking">
      <div className="time-tracking-header">
        <h3>
          {currentUser?.role === 'admin' ? 'All User Tracking' : 'My tracking'}
        </h3>
        <button className="more-btn">⋯</button>
      </div>

      <div className="tracking-items">
        {trackingTasks.length === 0 ? (
          <div style={{ padding: '10px', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem' }}>
            {currentUser?.role === 'admin' ? 'No tasks to track' : 'No tasks assigned to you'}
          </div>
        ) : (
          trackingTasks.map(task => {
            const timer = timers[task.id] || { seconds: 0, isActive: false };
            const isActive = activeTimer === task.id;
            const isAdmin = currentUser?.role === 'admin';
            const canControl = !isAdmin && task.assigneeId === currentUser?.id;
            
            return (
              <div key={task.id} className={`task-item tracking-item ${isActive ? 'active' : ''}`}>
                <button 
                  className={`task-checkbox play-btn ${isActive ? 'active' : ''} ${!canControl ? 'disabled' : ''}`}
                  onClick={() => canControl ? toggleTimer(task.id) : null}
                  disabled={!canControl}
                  title={
                    isAdmin ? 'Admin cannot control timers' :
                    !canControl ? 'Not your task' :
                    isActive ? 'Pause timer' : 'Start timer'
                  }
                >
                  {isActive ? '⏸️' : '▶️'}
                </button>

                <div className="task-content">
                  <span className="task-title">{task.title}</span>
                  {isAdmin && (
                    <span className="task-assignee" style={{ fontSize: '0.65rem', color: '#888', marginLeft: '0.5rem' }}>
                      ({task.assigneeName || 'Unassigned'})
                    </span>
                  )}
                </div>

                <div className="task-meta tracking-time">
                  <span className={`task-date time-display ${isActive ? 'running' : ''}`}>
                    {formatTime(timer.seconds)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeTimer && currentUser?.role !== 'admin' && (
        <div className="active-timer-indicator">
          <div className="pulse-dot"></div>
          <span>Timer running</span>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;