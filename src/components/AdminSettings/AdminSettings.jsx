import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './AdminSettings.css';

const AdminSettings = () => {
  const { 
    user, 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    canEditUser, 
    canDeleteUser, 
    isSuperAdmin,
    approveProfileChange,
    denyProfileChange,
    pendingProfileChanges
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const loadUsers = useCallback(async () => {
    try {
      const userList = await getAllUsers();
      setUsers(userList || []);
      
      // Also refresh pending changes from localStorage to ensure latest data
      try {
        const saved = localStorage.getItem('organizo_pending_changes');
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Refreshed pending changes from localStorage:', parsed);
          // Force re-render by clearing and setting again
          window.dispatchEvent(new Event('storage'));
        }
      } catch (error) {
        console.error('Error refreshing pending changes:', error);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, [getAllUsers]);

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super-admin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [user, navigate, loadUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user: ' + error.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, formData);
      setIsEditModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      alert('You cannot delete your own account');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleApproveChange = async (requestId) => {
    try {
      const success = await approveProfileChange(requestId);
      if (success) {
        loadUsers(); // Refresh data
        alert('Profile change approved successfully! The user has been notified.');
      } else {
        alert('Failed to approve change');
      }
    } catch (error) {
      console.error('Failed to approve change:', error);
      alert('Failed to approve change: ' + error.message);
    }
  };

  const handleDenyChange = async (requestId) => {
    const reason = prompt('Please provide a reason for denial (optional):');
    try {
      const success = await denyProfileChange(requestId, reason);
      if (success) {
        loadUsers();
        alert('Profile change denied successfully! The user has been notified.');
      } else {
        alert('Failed to deny change');
      }
    } catch (error) {
      console.error('Failed to deny change:', error);
      alert('Failed to deny change: ' + error.message);
    }
  };

  const openEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '', // Don't show existing password
      role: userToEdit.role
    });
    setIsEditModalOpen(true);
  };

  const exportToExcel = () => {
    const exportData = users.map(user => ({
      'User ID': user.id,
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Created Date': user.createdAt || 'N/A',
      'Last Modified': user.updatedAt || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    
    const fileName = `user_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'user' });
  };

  if (user?.role !== 'admin' && user?.role !== 'super-admin') {
    return null;
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1>🔧 Admin Settings</h1>
        <p>Manage users and system settings</p>
      </div>

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          ✅ Profile Approvals {pendingProfileChanges.filter(c => c.status === 'pending').length > 0 && <span className="badge-count">{pendingProfileChanges.filter(c => c.status === 'pending').length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          ⚙️ System Settings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          📊 Data Export
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'users' && (
          <div className="user-management">
            <div className="section-header">
              <h2>User Management</h2>
              <button 
                className="btn primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                ➕ Create New User
              </button>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userItem => (
                    <tr key={userItem.id}>
                      <td>{userItem.id}</td>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`role-badge ${userItem.role}`}>
                          {userItem.role === 'super-admin' ? 'Super Admin' : userItem.role}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {canEditUser(userItem.id) && (
                            <button 
                              className="btn small edit"
                              onClick={() => openEditModal(userItem)}
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {canDeleteUser(userItem.id) && (
                            <button 
                              className="btn small danger"
                              onClick={() => handleDeleteUser(userItem.id)}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="profile-approvals">
            <div className="section-header">
              <h2>Profile Change Approvals</h2>
              <p>Review and approve pending profile changes from users</p>
            </div>

            {pendingProfileChanges.filter(c => c.status === 'pending').length === 0 ? (
              <div className="empty-state">
                <div className="empty-content">
                  <h3>No Pending Approvals</h3>
                  <p>All profile change requests have been processed.</p>
                </div>
              </div>
            ) : (
              <div className="approvals-container">
                {pendingProfileChanges.filter(c => c.status === 'pending').map((change) => (
                  <div key={change.id} className="approval-card">
                    <div className="approval-header">
                      <div className="user-info">
                        <h4>{change.userName}</h4>
                        <span className="user-email">{change.userEmail}</span>
                      </div>
                      <div className="request-date">
                        Requested: {new Date(change.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="changes-details">
                      <h5>Requested Changes:</h5>
                      <div className="changes-list">
                        {change.changes.name && (
                          <div className="change-item">
                            <span className="change-label">Name:</span>
                            <span className="change-value">
                              {change.userName} → {change.changes.name}
                            </span>
                          </div>
                        )}
                        {change.changes.email && (
                          <div className="change-item">
                            <span className="change-label">Email:</span>
                            <span className="change-value">
                              {change.userEmail} → {change.changes.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="approval-actions">
                      <button 
                        className="btn primary"
                        onClick={() => handleApproveChange(change.id)}
                      >
                        ✅ Approve
                      </button>
                      <button 
                        className="btn danger"
                        onClick={() => handleDenyChange(change.id)}
                      >
                        ❌ Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-settings">
            <h2>System Configuration</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <h3>🔐 Security Settings</h3>
                <p>Configure password policies and security options</p>
                <button className="btn outline">Configure</button>
              </div>
              <div className="setting-item">
                <h3>📧 Email Notifications</h3>
                <p>Manage email notification preferences</p>
                <button className="btn outline">Configure</button>
              </div>
              <div className="setting-item">
                <h3>🎨 Theme Settings</h3>
                <p>Customize the application theme and appearance</p>
                <button className="btn outline">Configure</button>
              </div>
              <div className="setting-item">
                <h3>🔄 Backup & Restore</h3>
                <p>Backup and restore application data</p>
                <button className="btn outline">Configure</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="data-export">
            <h2>Data Export</h2>
            <div className="export-options">
              <div className="export-item">
                <h3>📊 User Data Export</h3>
                <p>Export all user information including IDs, passwords, and modification dates</p>
                <button 
                  className="btn primary"
                  onClick={exportToExcel}
                >
                  📥 Export to Excel
                </button>
              </div>
              <div className="export-item">
                <h3>📋 Task Data Export</h3>
                <p>Export all tasks and project data</p>
                <button className="btn outline">
                  📥 Export Tasks
                </button>
              </div>
              <div className="export-item">
                <h3>🔔 Notification Export</h3>
                <p>Export notification history and analytics</p>
                <button className="btn outline">
                  📥 Export Notifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {isSuperAdmin() && <option value="super-admin">Super Admin</option>}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn outline" onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {isSuperAdmin() && <option value="super-admin">Super Admin</option>}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn outline" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
