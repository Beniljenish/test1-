import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Avatar from '../../common/Avatar/Avatar';
import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <header className="header">
      <div className="header-left">
        {/* Desktop Search - always visible */}
        <input
          type="text"
          placeholder="Search..."
          className="search-input desktop-search"
        />
        
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
        <Button 
          variant="primary" 
          size="small"
          className="new-task-btn"
        >
          <span className="btn-text-full">+ New task</span>
          <span className="btn-text-short">+</span>
        </Button>

        <button className="notification-btn">
          <span className="notification-icon">📧</span>
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
    </header>
  );
};

export default Header;
