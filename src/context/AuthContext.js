import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Default users array
  const defaultUsers = [
    {
      id: 1,
      email: 'ben@g',
      password: '123',
      name: 'Ben',
      avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
      role: 'admin'
    },
    {
      id: 2,
      email: 'ash@g',
      password: '123',
      name: 'Ash',
      avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
      role: 'user'
    },
    {
      id: 3,
      email: 'vish@g',
      password: '123',
      name: 'Vish',
      avatar: 'https://randomuser.me/api/portraits/men/40.jpg',
      role: 'user'
    },
    {
      id: 4,
      email: 'user123@g',
      password: '123',
      name: 'User123',
      avatar: 'https://randomuser.me/api/portraits/women/35.jpg',
      role: 'user'
    },
    {
      id: 5,
      email: 'admin123@g',
      password: '123',
      name: 'Admin123',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      role: 'super-admin'
    }
  ];

  // Initialize users from localStorage or default
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('organizo_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded users from localStorage:', parsed);
        return parsed;
      }
      console.log('Using default users');
      localStorage.setItem('organizo_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    } catch (error) {
      console.error('Error loading users:', error);
      return defaultUsers;
    }
  });

  const [pendingProfileChanges, setPendingProfileChanges] = useState(() => {
    try {
      const saved = localStorage.getItem('organizo_pending_changes');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading pending changes:', error);
      return [];
    }
  });

  useEffect(() => {
    // Check for existing session on app start
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('organizo_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Verify the user data is valid
          if (userData && userData.email) {
            setUser(userData);
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('organizo_user');
          }
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
        // Clear invalid data
        localStorage.removeItem('organizo_user');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure proper loading state
    const timeoutId = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timeoutId);
  }, []);

    const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Find user in predefined users array
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userSession = {
          ...foundUser,
          loginTime: new Date().toISOString()
        };
        
        setUser(userSession);
        localStorage.setItem('organizo_user', JSON.stringify(userSession));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (profileData) => {
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('organizo_user', JSON.stringify(updatedUser));
    
    // Also update the user in the users array
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('organizo_users', JSON.stringify(updatedUsers));
    
    // Force immediate sync to ensure data persistence
    setTimeout(() => {
      localStorage.setItem('organizo_user', JSON.stringify(updatedUser));
      localStorage.setItem('organizo_users', JSON.stringify(updatedUsers));
    }, 100);
    
    // Trigger storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    console.log('Profile updated and storage event triggered:', updatedUser);
  };

  const getProfile = () => {
    // Always return the most current user data
    if (user) {
      // First check localStorage for the most recent user session data
      const savedCurrentUser = localStorage.getItem('organizo_user');
      if (savedCurrentUser) {
        try {
          const parsedCurrentUser = JSON.parse(savedCurrentUser);
          if (parsedCurrentUser.id === user.id) {
            // If saved session user is more recent, use it
            if (JSON.stringify(user) !== JSON.stringify(parsedCurrentUser)) {
              setUser(parsedCurrentUser);
              return parsedCurrentUser;
            }
          }
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
      
      // Also check the users array for latest data
      const latestUserData = users.find(u => u.id === user.id);
      if (latestUserData) {
        // Merge current session with latest data from users array
        const mergedUser = { ...user, ...latestUserData };
        // Update current user if there are differences
        if (JSON.stringify(user) !== JSON.stringify(mergedUser)) {
          setUser(mergedUser);
          localStorage.setItem('organizo_user', JSON.stringify(mergedUser));
        }
        return mergedUser;
      }
    }
    return user;
  };

  // Get all users for task assignment
  const getAllUsers = () => {
    // Always return the most current users data from localStorage
    try {
      const saved = localStorage.getItem('organizo_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Update local state if different
        if (JSON.stringify(users) !== JSON.stringify(parsed)) {
          setUsers(parsed);
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    }
    return users;
  };

  // Check if current user can edit task (only task creator)
  const canEditTask = (taskCreatorId) => {
    return user && user.id === taskCreatorId;
  };

  // Check if current user can complete task (assignee or creator)
  const canCompleteTask = (taskCreatorId, assigneeId) => {
    return user && (user.id === taskCreatorId || user.id === assigneeId);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('organizo_user');
    // Also clear any other related storage
    localStorage.clear();
  };

  // Debug function to check auth state
  const debugAuth = () => {
    console.log('Current user:', user);
    console.log('Loading:', loading);
    console.log('LocalStorage:', localStorage.getItem('organizo_user'));
  };

  // User management functions for admin
  const createUser = (userData) => {
    const newUser = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      avatar: userData.avatar || `https://randomuser.me/api/portraits/${userData.name.toLowerCase().includes('a') || userData.name.toLowerCase().includes('e') ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (userId, userData) => {
    // Only super-admin can edit other admins
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'admin' && user?.role !== 'super-admin') {
      throw new Error('Only super admin can edit admin users');
    }
    
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
    
    // If updating current user, update the session
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('organizo_user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (userId) => {
    // Only super-admin can delete other admins
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'admin' && user?.role !== 'super-admin') {
      throw new Error('Only super admin can delete admin users');
    }
    
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    // If deleting current user, log them out
    if (user && user.id === userId) {
      logout();
    }
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  // Profile change approval system
  const requestProfileChange = (changes) => {
    const changeRequest = {
      id: Date.now(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      changes,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      requestedBy: user.id
    };
    
    console.log('Creating profile change request:', changeRequest);
    
    setPendingProfileChanges(prev => {
      const updated = [...prev, changeRequest];
      console.log('Updated pending changes:', updated);
      localStorage.setItem('organizo_pending_changes', JSON.stringify(updated));
      return updated;
    });
    return changeRequest;
  };

  const approveProfileChange = (requestId) => {
    const request = pendingProfileChanges.find(r => r.id === requestId);
    if (!request) {
      console.error('Request not found:', requestId);
      return false;
    }

    console.log('Approving profile change:', request);

    // Apply the changes to the user in the users array
    const updatedUsers = users.map(u => 
      u.id === request.userId 
        ? { ...u, ...request.changes }
        : u
    );
    
    // Update users state and localStorage
    setUsers(updatedUsers);
    localStorage.setItem('organizo_users', JSON.stringify(updatedUsers));
    console.log('Updated users array:', updatedUsers);

    // If it's the current user, update session immediately
    if (user && user.id === request.userId) {
      const updatedUser = { ...user, ...request.changes };
      setUser(updatedUser);
      localStorage.setItem('organizo_user', JSON.stringify(updatedUser));
      console.log('Updated current user session:', updatedUser);
    }

    // Update request status and add notification
    const updatedChanges = pendingProfileChanges.map(r => 
      r.id === requestId 
        ? { 
            ...r, 
            status: 'approved', 
            approvedAt: new Date().toISOString(), 
            approvedBy: user.id,
            notification: `Your profile changes have been approved by ${user.name}`
          }
        : r
    );
    
    setPendingProfileChanges(updatedChanges);
    localStorage.setItem('organizo_pending_changes', JSON.stringify(updatedChanges));
    console.log('Updated pending changes:', updatedChanges);

    // Trigger storage event to notify components
    window.dispatchEvent(new Event('storage'));
    console.log('Approval completed and storage event triggered');

    return true;
  };

  const denyProfileChange = (requestId, reason = '') => {
    setPendingProfileChanges(prev => {
      const updated = prev.map(r => 
        r.id === requestId 
          ? { 
              ...r, 
              status: 'denied', 
              deniedAt: new Date().toISOString(), 
              deniedBy: user.id,
              denialReason: reason,
              notification: `Your profile changes have been denied by ${user.name}${reason ? ': ' + reason : ''}`
            }
          : r
      );
      localStorage.setItem('organizo_pending_changes', JSON.stringify(updated));
      console.log('Profile change denied:', updated);
      return updated;
    });
    return true;
  };

  const getPendingProfileChanges = () => {
    return pendingProfileChanges.filter(r => r.status === 'pending');
  };

  // Get notifications for current user
  const getUserNotifications = () => {
    if (!user) return [];
    return pendingProfileChanges
      .filter(r => r.userId === user.id && r.notification && (r.status === 'approved' || r.status === 'denied'))
      .map(r => ({
        id: r.id,
        message: r.notification,
        type: r.status,
        timestamp: r.status === 'approved' ? r.approvedAt : r.deniedAt
      }));
  };

  // Mark notification as read
  const markNotificationRead = (requestId) => {
    setPendingProfileChanges(prev => {
      const updated = prev.map(r => 
        r.id === requestId 
          ? { ...r, notificationRead: true }
          : r
      );
      localStorage.setItem('organizo_pending_changes', JSON.stringify(updated));
      return updated;
    });
  };

  // Check user permissions
  const canEditUser = (targetUserId) => {
    if (!user) return false;
    const targetUser = users.find(u => u.id === targetUserId);
    
    // Super admin can edit anyone
    if (user.role === 'super-admin') return true;
    
    // Admin can edit users but not other admins
    if (user.role === 'admin' && targetUser?.role !== 'admin' && targetUser?.role !== 'super-admin') return true;
    
    // Users can only edit themselves (through approval process)
    if (user.id === targetUserId) return true;
    
    return false;
  };

  const canDeleteUser = (targetUserId) => {
    if (!user) return false;
    const targetUser = users.find(u => u.id === targetUserId);
    
    // Super admin can delete anyone except themselves
    if (user.role === 'super-admin' && user.id !== targetUserId) return true;
    
    // Admin can delete users but not other admins
    if (user.role === 'admin' && targetUser?.role === 'user') return true;
    
    return false;
  };

  const isSuperAdmin = () => {
    return user?.role === 'super-admin';
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'super-admin';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    debugAuth,
    updateProfile,
    getProfile,
    getAllUsers,
    canEditTask,
    canCompleteTask,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    requestProfileChange,
    approveProfileChange,
    denyProfileChange,
    getPendingProfileChanges,
    getUserNotifications,
    markNotificationRead,
    canEditUser,
    canDeleteUser,
    isSuperAdmin,
    isAdmin,
    pendingProfileChanges
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};