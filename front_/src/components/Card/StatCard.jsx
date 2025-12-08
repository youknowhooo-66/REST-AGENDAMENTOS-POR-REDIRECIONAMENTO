import React from 'react';

const StatCard = ({ icon, title, value, change, changeType, trend }) => {
    const isPositive = changeType === 'positive';

    return (
        <div className="
      group
      bg-white dark:bg-slate-800 
      p-6 rounded-2xl 
      shadow-sm hover:shadow-xl 
      smooth-transition
      flex items-start gap-4 
      border border-slate-200 dark:border-slate-700 
      hover:border-primary/20 dark:hover:border-primary/20
      hover-lift
      overflow-hidden
      relative
    ">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon Container */}
            <div className="
        relative
        bg-gradient-to-br from-indigo-50 to-indigo-100/50
        dark:from-indigo-900/30 dark:to-indigo-800/20
        p-3.5 rounded-xl 
        group-hover:scale-110 
        smooth-transition
        shadow-sm
      ">
                <div className="text-indigo-600 dark:text-indigo-400">
                    {icon}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                    {value}
                </p>

                {change && (
                    <div className="flex items-center gap-1.5">
                        {/* Trend Icon */}
                        <svg
                            className={`w-4 h-4 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isPositive ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            )}
                        </svg>

                        <p className={`
              text-sm font-semibold
              ${isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }
            `}>
                            {change}
                        </p>

                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            vs. semana passada
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
