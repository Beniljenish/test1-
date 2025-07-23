import React from 'react';
import './Avatar.css';

const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 'medium',
  className = '',
  emoji = '👤'
}) => {
  const avatarClass = [
    'avatar',
    `avatar-${size}`,
    className
  ].filter(Boolean).join(' ');

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={avatarClass}
      />
    );
  }

  return (
    <div className={avatarClass}>
      <span className="avatar-emoji">{emoji}</span>
    </div>
  );
};

export default Avatar;