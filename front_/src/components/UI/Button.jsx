import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = "",
    icon,
    fullWidth = false, // Destructure fullWidth
    ...restProps // Use restProps instead of props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-primary",
        secondary: "bg-background-elevated text-foreground border border-border hover:bg-muted shadow-sm hover:shadow focus:ring-border-strong",
        outline: "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-border",
        danger: "bg-gradient-to-r from-destructive to-destructive-light hover:from-destructive-dark hover:to-destructive text-white shadow-md hover:shadow-lg focus:ring-destructive",
        success: "bg-gradient-to-r from-success to-success-light hover:from-success-dark hover:to-success text-white shadow-md hover:shadow-lg focus:ring-success",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    const fullWidthClass = fullWidth ? 'w-full' : ''; // Apply w-full conditionally

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidthClass} ${className}`}
            disabled={disabled || isLoading
            }
            {...restProps} // Spread restProps
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && icon && <span className="mr-2">{icon}</span>}
            {children}
        </button >
    );
};

export default Button;
