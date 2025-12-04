import React from 'react';

const Input = ({ id, label, name, icon, type = 'text', placeholder, value, onChange, required = false, className, ...props }) => {
  const inputId = id || name;
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full p-3 bg-input border border-border text-foreground rounded-lg 
                      focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none 
                      placeholder:text-muted-foreground transition ${icon ? 'pl-10' : 'pl-4'}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;