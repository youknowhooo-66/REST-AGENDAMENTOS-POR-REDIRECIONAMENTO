import React from 'react';

const Input = ({
  id,
  label,
  name,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5"
        >
          {label}
          {required && <span className="text-destructive ml-1.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center group">
        {icon && (
          <div className="absolute left-4 text-slate-500 dark:text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors-smooth">
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
          disabled={disabled}
          className={`
            w-full px-4 py-3.5 
            bg-white dark:bg-slate-800 
            border-2 
            ${error
              ? 'border-destructive dark:border-destructive-light focus:border-destructive focus:ring-4 focus:ring-destructive/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-primary dark:focus:border-primary-light'
            }
            text-slate-900 dark:text-white font-medium
            rounded-xl 
            focus:ring-4 focus:ring-primary/20 focus:outline-none
            placeholder:text-slate-400 dark:placeholder:text-slate-500 
            transition-smooth
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900
            shadow-sm hover:shadow focus:shadow-md
            ${icon ? 'pl-12' : 'pl-4'}
          `}
          {...props}
        />
      </div>

      {/* Helper Text or Error Message */}
      {(helperText || error) && (
        <p className={`mt-2.5 text-sm font-medium animate-fade-in-up ${error ? 'text-destructive dark:text-destructive-light' : 'text-slate-600 dark:text-slate-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;