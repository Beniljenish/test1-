import React from 'react';
import './Button.css'; // make sure this path is correct

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  loading = false,
  onClick,
  disabled = false,
  className = ''
}) => {
  const btnClass = `btn btn-${variant}${fullWidth ? ' btn-full-width' : ''} ${className}`;
  return (
    <button
      type={type}
      className={btnClass}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading…' : (
        <>
          
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
