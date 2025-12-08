import React from 'react';

const Checkbox = ({ label, checked, onChange, className = '', ...props }) => {
    return (
        <label className={`flex items-center cursor-pointer group ${className}`}>
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="peer sr-only"
                    {...props}
                />
                <div className={`
          h-5 w-5 rounded border-2 transition-all duration-200 flex items-center justify-center
          ${checked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-indigo-500'
                    }
          peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-focus:ring-offset-2
        `}>
                    <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            {label && (
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                    {label}
                </span>
            )}
        </label>
    );
};

export default Checkbox;
