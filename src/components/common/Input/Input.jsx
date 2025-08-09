import React from 'react';

const Input = ({ id, type='text', placeholder, value, onChange, required=false, className='' }) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={className}
  />
);

export default Input;
