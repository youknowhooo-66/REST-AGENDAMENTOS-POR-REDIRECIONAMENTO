import React from 'react';

const Select = ({ id, label, name, options = [], value, onChange, required = false, className = '', ...props }) => {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
          {label} {required && <span className="text-destructive ml-1.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary-light text-slate-900 dark:text-white transition-smooth shadow-sm hover:shadow focus:shadow-md cursor-pointer"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
