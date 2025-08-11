import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  // Initialize tasks from localStorage or default values
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('organizo_tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return []; // Start with empty tasks array
  });

  // Initialize notifications from localStorage
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('organizo_notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

  // Initialize comments from localStorage
  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem('organizo_comments');
    if (savedComments) {
      return JSON.parse(savedComments);
    }
    return []; // Start with empty comments array
  });

  const [categories] = useState([
    { 
      id: 1, 
      name: 'Work', 
      count: 12, 
      color: '#8B5A3C', 
      members: [
        { id: 1, name: 'John', avatar: '👨‍💼' },
        { id: 2, name: 'Sarah', avatar: '👩‍💻' }
      ]
    },
    { 
      id: 2, 
      name: 'Family', 
      count: 8, 
      color: '#4F46E5', 
      members: [
        { id: 3, name: 'Mom', avatar: '👩‍🦳' },
        { id: 4, name: 'Dad', avatar: '👨‍🦲' },
        { id: 5, name: 'Sister', avatar: '👱‍♀️' }
      ]
    },
    { 
      id: 3, 
      name: 'Freelance work', 
      count: 3, 
      color: '#059669', 
      members: [
        { id: 6, name: 'Client A', avatar: '👔' },
        { id: 7, name: 'Client B', avatar: '🏢' },
        { id: 8, name: 'Client C', avatar: '💼' }
      ]
    },
    { 
      id: 4, 
      name: 'Conference planning', 
      count: 1, 
      color: '#DC2626', 
      members: [
        { id: 9, name: 'Organizer', avatar: '👨‍🏫' }
      ]
    }
  ]);

  const [trackingItems] = useState([
    { id: 1, title: 'Create wireframe', time: '1h 25m 30s', isActive: true },
    { id: 2, title: 'Slack logo design', time: '30m 18s', isActive: false },
    { id: 3, title: 'Dashboard design', time: '1h 48m 22s', isActive: false },
    { id: 4, title: 'Create wireframe', time: '17m 1s', isActive: false },
    { id: 5, title: 'Mood tracker', time: '15h 5m 58s', isActive: false }
  ]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('organizo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('organizo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('organizo_comments', JSON.stringify(comments));
  }, [comments]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'organizo_tasks' && e.newValue) {
        setTasks(JSON.parse(e.newValue));
      } else if (e.key === 'organizo_notifications' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      } else if (e.key === 'organizo_comments' && e.newValue) {
        setComments(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Add polling for same-tab updates (every 2 seconds)
    const pollInterval = setInterval(() => {
      const savedTasks = localStorage.getItem('organizo_tasks');
      const savedNotifications = localStorage.getItem('organizo_notifications');
      const savedComments = localStorage.getItem('organizo_comments');
      
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (JSON.stringify(parsedTasks) !== JSON.stringify(tasks)) {
          setTasks(parsedTasks);
        }
      }
      
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        if (JSON.stringify(parsedNotifications) !== JSON.stringify(notifications)) {
          setNotifications(parsedNotifications);
        }
      }
      
      if (savedComments) {
        const parsedComments = JSON.parse(savedComments);
        if (JSON.stringify(parsedComments) !== JSON.stringify(comments)) {
          setComments(parsedComments);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [tasks, notifications, comments]);

  // Function to add a new notification
  const addNotification = (notificationData) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      taskId: notificationData.taskId,
      title: notificationData.title,
      message: notificationData.message,
      isRead: false,
      completed: notificationData.type === 'completed',
      type: notificationData.type,
      createdAt: new Date().toISOString(),
      userName: notificationData.userName,
      targetUserId: notificationData.targetUserId
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    
    // Force immediate localStorage update
    localStorage.setItem('organizo_notifications', JSON.stringify(updatedNotifications));
    
    return newNotification;
  };

  // Function to mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Function to clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('organizo_notifications', JSON.stringify([]));
  };

  // Function to delete a specific notification
  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('organizo_notifications', JSON.stringify(updatedNotifications));
  };

  const toggleTask = (taskId, currentUser) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          const wasCompleted = task.stage === 'completed';
          
          // Check permissions: only admins can un-complete tasks
          if (wasCompleted && currentUser?.role !== 'admin') {
            console.log('Only admin users can un-complete tasks');
            return task; // Return unchanged task for regular users trying to un-complete
          }
          
          const newStage = wasCompleted ? 'in-progress' : 'completed';
          
          // Create notification ONLY for task creator when user completes the task
          if (!wasCompleted && task.creatorId && task.creatorId !== currentUser?.id) {
            addNotification({
              taskId: task.id,
              title: task.title,
              message: `${currentUser?.name} completed the task "${task.title}".`,
              type: 'completed',
              userName: currentUser?.name,
              targetUserId: task.creatorId
            });
          }
          
          return {
            ...task, 
            stage: newStage,
            completed: !wasCompleted, // Ensure both properties are in sync
            completedDate: wasCompleted ? null : new Date().toISOString()
          };
        }
        return task;
      });
      
      // Force immediate localStorage update with the updated tasks
      setTimeout(() => {
        localStorage.setItem('organizo_tasks', JSON.stringify(updatedTasks));
      }, 100);
      
      return updatedTasks;
    });
  };

  const addTask = (task, currentUser) => {
    const newTask = {
      id: Date.now(), // Use timestamp for unique ID
      title: task.title,
      dueDate: task.dueDate || 'Today',
      stage: task.stage || 'not-started',
      priority: task.priority || 'medium',
      description: task.description || '',
      team: task.team || 'Development',
      avatar: task.avatar || 'https://randomuser.me/api/portraits/men/30.jpg',
      completed: false,
      createdAt: new Date().toISOString(),
      trackedTime: 0, // Initialize tracked time to 0 seconds
      creatorId: currentUser?.id,
      creatorName: currentUser?.name,
      assigneeId: task.assigneeId || currentUser?.id,
      assigneeName: task.assigneeName || currentUser?.name,
      comments: [],
      attachments: [],
      ...task
    };
    
    // Create notification ONLY for assignee when admin assigns task to user
    if (newTask.assigneeId !== newTask.creatorId) {
      addNotification({
        taskId: newTask.id,
        title: newTask.title,
        message: `${newTask.creatorName} assigned you a new task.`,
        type: 'assigned',
        userName: newTask.creatorName,
        targetUserId: newTask.assigneeId
      });
    }
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    // Force immediate localStorage update and sync across tabs
    localStorage.setItem('organizo_tasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTask = (taskId, updatedTask, currentUser = null) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const originalTask = { ...task };
        const newTask = { ...task, ...updatedTask };
        
        // Check if this is a meaningful modification (not just attachment updates)
        const isAttachmentOnlyUpdate = updatedTask.attachments && Object.keys(updatedTask).length === 1;
        
        // If currentUser is provided and this is not just an attachment update, send modification notification
        if (currentUser && !isAttachmentOnlyUpdate) {
          // Determine who to notify
          const usersToNotify = [];
          
          // Notify assignee if different from current user
          if (newTask.assigneeId && newTask.assigneeId !== currentUser.id) {
            usersToNotify.push({
              id: newTask.assigneeId,
              message: `${currentUser.name} modified your assigned task "${newTask.title}"`
            });
          }
          
          // Notify creator if different from current user and assignee
          if (newTask.creatorId && newTask.creatorId !== currentUser.id && newTask.creatorId !== newTask.assigneeId) {
            usersToNotify.push({
              id: newTask.creatorId,
              message: `${currentUser.name} modified task "${newTask.title}"`
            });
          }
          
          // Send notifications
          usersToNotify.forEach(userToNotify => {
            const newNotification = {
              id: Date.now() + Math.random(),
              taskId: newTask.id,
              title: newTask.title,
              message: userToNotify.message,
              isRead: false,
              completed: false,
              type: 'task_modified',
              createdAt: new Date().toISOString(),
              userName: currentUser.name,
              targetUserId: userToNotify.id
            };
            
            setNotifications(prev => {
              const updated = [newNotification, ...prev];
              localStorage.setItem('organizo_notifications', JSON.stringify(updated));
              return updated;
            });
          });
        }
        
        return newTask;
      }
      return task;
    }));
  };

  // New function to update tracked time for a specific task
  const updateTrackedTime = (taskId, timeInSeconds) => {
    setTasks(tasks.map(task =>
      task.id === taskId 
        ? { ...task, trackedTime: timeInSeconds }
        : task
    ));
  };

  // Helper function to format time in seconds to readable format
  const formatTrackedTime = (totalSeconds) => {
    if (totalSeconds === 0) return '0m';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  // Function to format date based on when it was created
  const formatCommentDate = (dateString) => {
    const commentDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Reset time to start of day for comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const commentStart = new Date(commentDate.getFullYear(), commentDate.getMonth(), commentDate.getDate());
    
    if (commentStart.getTime() === todayStart.getTime()) {
      return 'Today';
    } else if (commentStart.getTime() === yesterdayStart.getTime()) {
      return 'Yesterday';
    } else {
      // Format as date for older comments
      return commentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: commentDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Function to add a new comment to the global comments widget
  const addGlobalComment = (commentData) => {
    const now = new Date();
    const newComment = {
      id: Date.now(),
      type: commentData.taskTitle || 'Task Comment',
      message: commentData.text,
      time: formatCommentDate(now.toISOString()),
      isNew: true,
      taskId: commentData.taskId,
      author: commentData.author,
      authorId: commentData.authorId,
      createdAt: now.toISOString()
    };
    
    setComments(prevComments => [newComment, ...prevComments]);
    return newComment;
  };

  // Function to get comments visible to current user based on role and comment rules
  const getCommentsForUser = (currentUser) => {
    if (!currentUser) return [];
    
    return comments.filter(comment => {
      // Filter out system comments (comments without taskId)
      if (!comment.taskId) return false;
      
      // Find the task this comment belongs to
      const task = tasks.find(t => t.id === comment.taskId);
      if (!task) return false;
      
      // Admin and super-admin users can see ALL comments
      if (currentUser.role === 'admin' || currentUser.role === 'super-admin') {
        return true;
      }
      
      // For regular users: show comments on tasks assigned to them
      if (task.assigneeId === currentUser.id) {
        // Show admin/super-admin comments OR their own comments
        const isAdminComment = comment.authorId && isUserAdmin(comment.authorId);
        const isOwnComment = comment.authorId === currentUser.id;
        
        return isAdminComment || isOwnComment;
      }
      
      return false;
    });
  };

  // Function to check if user can see a specific comment in task details
  const canUserSeeComment = (currentUser, comment, task) => {
    if (!currentUser || !comment || !task) return false;
    
    // Admins and super-admins can see all comments
    if (currentUser.role === 'admin' || currentUser.role === 'super-admin') return true;
    
    // Regular users can see comments on their assigned tasks if:
    // 1. The comment is from an admin/super-admin user, OR
    // 2. The comment is their own comment
    if (task.assigneeId === currentUser.id) {
      return (comment.authorId && isUserAdmin(comment.authorId)) || // Admin/super-admin comments
             (comment.authorId === currentUser.id); // Their own comments
    }
    
    return false;
  };

  // Function to mark comment as read
  const markCommentAsRead = (commentId) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, isNew: false }
          : comment
      )
    );
  };

  // Function to get notifications for specific user - only show targeted notifications
  const getNotificationsForUser = (userId) => {
    return notifications.filter(notification => 
      notification.targetUserId === userId
    );
  };

  // Function to get all notifications for admin users (admin sees all notifications)
  const getAllNotificationsForAdmin = (currentUser) => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin')) {
      return notifications; // Admins and super-admins see all notifications
    }
    return getNotificationsForUser(currentUser?.id);
  };

  // Function to add comment to task
  const addCommentToTask = (taskId, comment, user) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? {
              ...task,
              comments: [
                ...task.comments,
                {
                  id: Date.now(),
                  text: comment,
                  author: user.name,
                  authorId: user.id,
                  createdAt: new Date().toISOString()
                }
              ]
            }
          : task
      )
    );

    // Add to global comments with authorId
    addGlobalComment({
      taskId,
      text: comment,
      author: user.name,
      authorId: user.id,
      taskTitle: task.title
    });

    // Create notifications for comments
    if (user.role === 'admin' || user.role === 'super-admin') {
      // Admin/Super-admin commented → Notify the assigned user (if different)
      if (task.assigneeId && task.assigneeId !== user.id) {
        addNotification({
          taskId: task.id,
          title: task.title,
          message: `${user.name} added a comment to your task "${task.title}"`,
          type: 'comment_added',
          userName: user.name,
          targetUserId: task.assigneeId
        });
      }
    } else {
      // Regular user commented → Notify the task creator/admin (if different)
      if (task.creatorId && task.creatorId !== user.id) {
        addNotification({
          taskId: task.id,
          title: task.title,
          message: `${user.name} added a comment to task "${task.title}"`,
          type: 'comment_added',
          userName: user.name,
          targetUserId: task.creatorId
        });
      }
    }
  };

  // Function to force sync data across tabs
  const forceSyncData = () => {
    // Reload data from localStorage
    const savedTasks = localStorage.getItem('organizo_tasks');
    const savedNotifications = localStorage.getItem('organizo_notifications');
    const savedComments = localStorage.getItem('organizo_comments');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  };

  // Function to get tasks visible to current user
  const getTasksForUser = (currentUser) => {
    if (!currentUser) return [];
    
    return tasks.filter(task => {
      // Admin and super-admin users can see ALL tasks (full admin access)
      if (currentUser.role === 'admin' || currentUser.role === 'super-admin') {
        return true; // Admins and super-admins see all tasks
      }
      // Regular users can only see tasks assigned to them
      else {
        return task.assigneeId === currentUser.id;
      }
    });
  };

  // Function to get tasks assigned TO the current user (for admin's "Assigned Tasks" section)
  const getAssignedTasks = (currentUser) => {
    if (!currentUser) return [];
    
    return tasks.filter(task => {
      return task.assigneeId === currentUser.id && task.creatorId !== currentUser.id;
    });
  };

  // Function to get tasks created BY the current user (for admin's "My Tasks" section)
  const getMyOwnTasks = (currentUser) => {
    if (!currentUser) return [];
    
    return tasks.filter(task => {
      return task.creatorId === currentUser.id;
    });
  };

  // Function to check if user can create tasks (admins and super-admins)
  const canCreateTask = (currentUser) => {
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin');
  };

  // Function to check if user can edit any task (admins and super-admins can edit all tasks)
  const canEditAnyTask = (currentUser) => {
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin');
  };

  // Function to check if user can delete any task (admins and super-admins can delete all tasks)  
  const canDeleteAnyTask = (currentUser) => {
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin');
  };

  // Function to search tasks by user (admin only)
  const searchTasksByUser = (currentUser, searchUserId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return []; // Only admins can search by user
    }
    
    return tasks.filter(task => 
      task.creatorId === searchUserId || task.assigneeId === searchUserId
    );
  };

  // Function to get all users from tasks (for admin search)
  const getAllTaskUsers = (currentUser) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return []; // Only admins can see all users
    }
    
    const users = new Map();
    tasks.forEach(task => {
      if (task.creatorId && task.creatorName) {
        users.set(task.creatorId, { id: task.creatorId, name: task.creatorName });
      }
      if (task.assigneeId && task.assigneeName) {
        users.set(task.assigneeId, { id: task.assigneeId, name: task.assigneeName });
      }
    });
    
    return Array.from(users.values());
  };

  // Function to manually refresh data (for testing)
  const refreshData = () => {
    forceSyncData();
  };

  // Helper function to check if a user is admin by checking their role
  const isUserAdmin = (userId) => {
    // Get users from localStorage to check role
    const savedUsers = localStorage.getItem('organizo_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const user = users.find(u => u.id === userId);
      return user && (user.role === 'admin' || user.role === 'super-admin');
    }
    
    // Fallback: check if it's a known admin ID (based on default users)
    // ID 1: Ben (admin), ID 5: Admin123 (super-admin)
    const knownAdminIds = [1, 5]; 
    return knownAdminIds.includes(userId);
  };

  // Function to check if user can toggle task completion status
  const canToggleTaskCompletion = (currentUser, task) => {
    if (!currentUser || !task) return false;
    
    // Admin and super-admin users can always toggle (complete/un-complete)
    if (currentUser.role === 'admin' || currentUser.role === 'super-admin') return true;
    
    // Regular users can only complete tasks, not un-complete them
    if (task.stage === 'completed') {
      return false; // Cannot un-complete
    } else {
      return task.assigneeId === currentUser.id; // Can complete if assigned to them
    }
  };

  const value = {
    tasks,
    categories,
    trackingItems,
    comments,
    notifications,
    toggleTask,
    addTask,
    deleteTask,
    updateTask,
    updateTrackedTime,
    formatTrackedTime,
    addGlobalComment,
    markCommentAsRead,
    formatCommentDate,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    deleteNotification,
    getNotificationsForUser,
    getAllNotificationsForAdmin,
    addCommentToTask,
    forceSyncData,
    refreshData,
    getTasksForUser,
    getAssignedTasks,
    getMyOwnTasks,
    canCreateTask,
    canEditAnyTask,
    canDeleteAnyTask,
    searchTasksByUser,
    getAllTaskUsers,
    getCommentsForUser,
    canUserSeeComment,
    isUserAdmin,
    canToggleTaskCompletion
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};