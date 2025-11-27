import React from 'react';

const StatCard = ({ icon, title, value, change, changeType }) => {
    const isPositive = changeType === 'positive';
    const changeColor = isPositive ? 'text-positive' : 'text-negative';

    return (
        <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-text-muted">{title}</p>
                <p className="text-2xl font-bold text-text">{value}</p>
                {change && (
                    <p className={`text-xs mt-1 ${changeColor}`}>
                        {change} vs. semana passada
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
