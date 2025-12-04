import React from 'react';

const Button = ({ type = 'button', onClick, children, className = '', fullWidth = false, disabled = false, variant = 'primary' }) => {
    const baseClasses = "font-semibold p-3 rounded-lg focus:ring-4 focus:outline-none transition-all duration-300 transform";
    
    const widthClass = fullWidth ? 'w-full' : '';

    const variantClasses = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary/50",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/50",
    };

    const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${widthClass} ${variantClasses[variant]} ${disabledClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
