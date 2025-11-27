import React from 'react';

const Button = ({ type = 'button', onClick, children, className = '', fullWidth = false, disabled = false }) => {
    const baseClasses = "font-semibold p-3 rounded-lg focus:ring-4 focus:outline-none transition-all duration-300 transform";
    
    const widthClass = fullWidth ? 'w-full' : '';

    const defaultStyle = "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 hover:scale-105 disabled:bg-primary/50 disabled:cursor-not-allowed";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${widthClass} ${className || defaultStyle}`}
        >
            {children}
        </button>
    );
};

export default Button;
