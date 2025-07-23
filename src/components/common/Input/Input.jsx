import React from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  error = false,
  ...props
}) => {
  const inputClass = [
    'input',
    error ? 'input-error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      className={inputClass}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default Input;