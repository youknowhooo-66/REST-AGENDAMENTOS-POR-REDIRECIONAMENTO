import React from 'react';

const Card = ({ children, className = "", noPadding = false, ...props }) => {
    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 ${noPadding ? '' : 'p-6'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
