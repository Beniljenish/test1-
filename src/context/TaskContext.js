import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Finish monthly reporting', completed: false, dueDate: 'Today' },
    { id: 2, title: 'Contract signing', completed: false, dueDate: 'Today' },
    { id: 3, title: 'Market overview keynote', completed: false, dueDate: 'Tomorrow' },
    { id: 4, title: 'Project research', completed: false, dueDate: 'Tomorrow' },
    { id: 5, title: 'Prepare invoices', completed: false, dueDate: 'This week' }
  ]);

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

  const [comments] = useState([
    {
      id: 1,
      type: 'Market research',
      message: "I've logged your data attached...",
      time: 'Today',
      isNew: true
    },
    {
      id: 2,
      type: 'Market research',
      message: "I've added this task, let's check it out together.",
      time: 'Today',
      isNew: false
    }
  ]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (task) => {
    const newTask = {
      id: tasks.length + 1,
      ...task,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const value = {
    tasks,
    categories,
    trackingItems,
    comments,
    toggleTask,
    addTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};