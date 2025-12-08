import React from 'react';

const Button = ({
    type = 'button',
    onClick,
    children,
    className = '',
    fullWidth = false,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    icon = null,
    iconPosition = 'left'
}) => {
    const baseClasses = `
    inline-flex items-center justify-center gap-2.5
    font-semibold rounded-xl 
    focus:ring-4 focus:outline-none 
    transition-smooth
    transform active:scale-[0.98]
    disabled:opacity-60 disabled:cursor-not-allowed
    select-none
  `;

    const sizeClasses = {
        sm: 'px-4 py-2.5 text-sm',
        md: 'px-6 py-3.5 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const variantClasses = {
        primary: `
      bg-primary-gradient
      text-white 
      shadow-md hover:shadow-xl hover:shadow-primary/30
      focus:ring-primary/40
      hover:-translate-y-0.5
      border-2 border-transparent
    `,
        secondary: `
      bg-white dark:bg-card 
      text-slate-900 dark:text-white 
      border-2 border-slate-300 dark:border-slate-600 
      shadow-sm hover:shadow-md
      hover:bg-slate-50 dark:hover:bg-slate-700 
      hover:border-slate-400 dark:hover:border-slate-500
      focus:ring-primary/20
      hover:-translate-y-0.5
    `,
        destructive: `
      bg-error-gradient
      text-white 
      shadow-md hover:shadow-xl hover:shadow-destructive/30
      focus:ring-destructive/40
      hover:-translate-y-0.5
      border-2 border-transparent
    `,
        success: `
      bg-success-gradient
      text-white 
      shadow-md hover:shadow-xl hover:shadow-success/30
      focus:ring-success/40
      hover:-translate-y-0.5
      border-2 border-transparent
    `,
        ghost: `
      bg-transparent 
      text-slate-700 dark:text-slate-200 
      hover:bg-slate-100 dark:hover:bg-slate-800
      focus:ring-primary/20
      border-2 border-transparent
    `,
        outline: `
      bg-transparent 
      border-2 border-primary 
      text-primary dark:text-primary-light
      hover:bg-primary hover:text-white dark:hover:bg-primary-light
      focus:ring-primary/20
      shadow-sm hover:shadow-md
    `,
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${widthClass} 
        ${variantClasses[variant]} 
        ${className}
      `}
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Carregando...</span>
                </>
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <span className="shrink-0">{icon}</span>
                    )}
                    <span>{children}</span>
                    {icon && iconPosition === 'right' && (
                        <span className="shrink-0">{icon}</span>
                    )}
                </>
            )}
        </button>
    );
};

export default Button;
