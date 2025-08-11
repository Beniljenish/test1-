# Frontend Integration Guide

This guide will help you integrate your React frontend with the new PostgreSQL backend.

## 🔧 Required Changes

### 1. Install Additional Dependencies

```bash
# In your React project root
npm install axios socket.io-client
```

### 2. Create API Service Layer

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('organizo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('organizo_token');
      localStorage.removeItem('organizo_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Update AuthContext

Update your `src/context/AuthContext.js`:

```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('organizo_token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            token
          }
        });
      } catch (error) {
        localStorage.removeItem('organizo_token');
        localStorage.removeItem('organizo_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('organizo_token', token);
      localStorage.setItem('organizo_user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      localStorage.setItem('organizo_token', token);
      localStorage.setItem('organizo_user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('organizo_token');
    localStorage.removeItem('organizo_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return { 
        success: true, 
        message: response.data.message,
        pendingData: response.data.pendingData 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 4. Update TaskContext

Update your `src/context/TaskContext.js`:

```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.payload] };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    notifications: [],
    comments: [],
    unreadCount: 0
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      dispatch({ type: 'SET_TASKS', payload: response.data });
    } catch (error) {
      console.error('Fetch tasks error:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data });
      return { success: true, task: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create task' 
      };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      return { success: true, task: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update task' 
      };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete task' 
      };
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.notifications });
      return response.data;
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const response = await api.get(`/comments/task/${taskId}`);
      dispatch({ type: 'SET_COMMENTS', payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Fetch comments error:', error);
      return [];
    }
  };

  const addComment = async (taskId, content) => {
    try {
      const response = await api.post('/comments', { taskId, content });
      dispatch({ type: 'ADD_COMMENT', payload: response.data });
      return { success: true, comment: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add comment' 
      };
    }
  };

  return (
    <TaskContext.Provider value={{
      ...state,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      fetchNotifications,
      markNotificationAsRead,
      deleteNotification,
      fetchComments,
      addComment
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
```

### 5. Add Socket.io Integration

Create `src/services/socket.js`:

```javascript
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.socket.emit('join-user-room', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('new-notification');
    }
  }
}

export default new SocketService();
```

### 6. Environment Variables

Create `.env` in your React project root:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 🔄 Migration Steps

### Step 1: Backup Current Data
Export your current localStorage data before migrating:

```javascript
// Run this in browser console to backup data
const backup = {
  users: JSON.parse(localStorage.getItem('organizo_users') || '[]'),
  tasks: JSON.parse(localStorage.getItem('organizo_tasks') || '[]'),
  notifications: JSON.parse(localStorage.getItem('organizo_notifications') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('organizo_user') || 'null')
};
console.log('Backup data:', JSON.stringify(backup, null, 2));
```

### Step 2: Update Migration Script
Update the `migrate.js` script with your actual localStorage data.

### Step 3: Test Integration
1. Start the backend server
2. Update your frontend components to use the new context methods
3. Test all functionality

### Step 4: Update Components
Replace localStorage calls with API calls in your components:

```javascript
// Old way
const tasks = JSON.parse(localStorage.getItem('organizo_tasks') || '[]');

// New way
const { tasks, fetchTasks } = useTask();
useEffect(() => {
  fetchTasks();
}, []);
```

## 🚀 Deployment

### Backend Deployment (Heroku example)
```bash
# Install Heroku CLI and login
heroku create organizo-backend
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-postgres-host
heroku config:set DB_NAME=your-db-name
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set JWT_SECRET=your-jwt-secret

git add .
git commit -m "Deploy backend"
git push heroku main
```

### Frontend Deployment
Update your environment variables with the production API URL:
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
```

## 🔧 Troubleshooting

1. **CORS Issues**: Ensure your backend CORS settings include your frontend URL
2. **Token Persistence**: Make sure JWT tokens are stored and sent correctly
3. **Socket Connection**: Check that Socket.io connects to the correct backend URL
4. **API Endpoints**: Verify all API endpoints match between frontend and backend

## 📚 Additional Resources

- [Axios Documentation](https://axios-http.com/)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

Happy coding! 🎉
