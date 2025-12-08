import React from 'react';

const Input = ({
    label,
    error,
    helperText,
    icon,
    className = "",
    containerClassName = "",
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            block w-full rounded-lg border-2 transition-all duration-200
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error
                            ? 'border-destructive-light focus:border-destructive focus:ring-destructive/20'
                            : 'border-input hover:border-border-strong focus:border-primary focus:ring-primary/20'
                        }
            bg-background 
            text-foreground
            placeholder-muted-foreground
            focus:outline-none focus:ring-4
            disabled:bg-muted disabled:text-muted-foreground
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1 animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
        </div>
    );
};

export default Input;
