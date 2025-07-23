import React from 'react';
import { Link } from 'react-router-dom'; // 1. Add this import
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Avatar from '../../common/Avatar/Avatar';
import './Header.css';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />
      </div>

      <div className="header-right">
        <Button variant="primary" size="small">
          + New task
        </Button>

        <button className="notification-btn">
          📧
        </button>

        <div className="user-profile">
          {/* 2. Wrap Avatar with Link */}
          <Link to="/profile">
            <Avatar 
              size="medium"
              emoji="👤"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
