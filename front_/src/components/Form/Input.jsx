import React from 'react';

const Input = ({ id, label, name, icon, type = 'text', placeholder, value, onChange, required = false }) => {
  return (
    <div className="w-full">
      <label htmlFor={id || name} className="sr-only">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id || name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full p-3 bg-transparent border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition ${icon ? 'pl-10' : 'pl-4'}`}
        />
      </div>
    </div>
  );
};

export default Input;