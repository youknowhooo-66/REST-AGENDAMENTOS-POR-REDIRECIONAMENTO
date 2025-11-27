import React from 'react';

const Checkbox = ({ label, checked, onChange, className = '' }) => {
    return (
        <label className={`flex items-center cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="form-checkbox h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-cyan-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{label}</span>
        </label>
    );
};

export default Checkbox;
