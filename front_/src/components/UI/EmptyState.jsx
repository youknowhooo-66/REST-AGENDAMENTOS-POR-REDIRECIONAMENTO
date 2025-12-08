import React from 'react';
import Button from './Button';

const EmptyState = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 ${className}`}>
            {icon && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4 text-slate-400">
                    {React.cloneElement(icon, { size: 32 })}
                </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="primary">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
