import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTask } from '../../../context/TaskContext';
import Button from '../../common/Button/Button';
import Avatar from '../../common/Avatar/Avatar';
import TaskCreate from '../../TaskCreate/TaskCreate';
import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const { refreshData, canCreateTask, getAllTaskUsers, searchTasksByUser } = useTask();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() && user && user.role === 'admin') {
      // For admins, search through all users and their tasks
      const allUsers = getAllTaskUsers(user);
      const userResults = allUsers.filter(u => 
        u.name.toLowerCase().includes(term.toLowerCase())
      );
      
      const taskResults = [];
      userResults.forEach(u => {
        const userTasks = searchTasksByUser(user, u.id);
        taskResults.push(...userTasks);
      });
      
      setSearchResults([...userResults, ...taskResults]);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        {/* Desktop Search - always visible */}
        <div className="search-container">
          <input
            type="text"
            placeholder={user?.role === 'admin' ? "Search users and tasks..." : "Search..."}
            className="search-input desktop-search"
            value={searchTerm}
            onChange={handleSearch}
          />
          
          {/* Search Results Dropdown for Admins */}
          {showSearchResults && user?.role === 'admin' && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.slice(0, 5).map((result, index) => (
                <div key={index} className="search-result-item">
                  {result.name ? (
                    <div className="user-result">
                      <span className="result-type">User:</span>
                      <span className="result-name">{result.name}</span>
                    </div>
                  ) : (
                    <div className="task-result">
                      <span className="result-type">Task:</span>
                      <span className="result-name">{result.title}</span>
                      <span className="result-assignee">({result.assigneeName})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Mobile Search Toggle Button */}
        <button 
          className="search-toggle mobile-only"
          onClick={toggleSearch}
          aria-label="Toggle search"
        >
          🔍
        </button>
      </div>

      <div className="header-right">
        {/* Only show New Task button for admin users */}
        {canCreateTask(user) && (
          <Button 
            variant="primary" 
            size="small"
            className="new-task-btn"
            onClick={() => setIsTaskCreateOpen(true)}
          >
            <span className="btn-text-full">+ New task</span>
            <span className="btn-text-short">+</span>
          </Button>
        )}

        <button className="notification-btn">
          <span className="notification-icon">📧</span>
        </button>

        {/* Refresh button for testing multi-user sync */}
        <button 
          className="refresh-btn"
          onClick={refreshData}
          title="Refresh data (for multi-user testing)"
          style={{
            background: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            marginRight: '12px'
          }}
        >
          🔄 Sync
        </button>

        <div className="user-profile">
          <Link to="/profile">
            <Avatar 
              size="medium"
              emoji="👤"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchVisible && (
        <div className="mobile-search-overlay">
          <input
            type="text"
            placeholder="Search..."
            className="search-input mobile-search"
            autoFocus
          />
          <button 
            className="search-close"
            onClick={toggleSearch}
            aria-label="Close search"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Only render TaskCreate modal for admin users */}
      {canCreateTask(user) && (
        <TaskCreate 
          isOpen={isTaskCreateOpen} 
          onClose={() => setIsTaskCreateOpen(false)} 
        />
      )}
    </header>
  );
};

export default Header;
