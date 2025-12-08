import React from 'react';

const Table = ({ children, className = "" }) => {
    return (
        <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                {children}
            </table>
        </div>
    );
};

const TableHeader = ({ children }) => (
    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
        <tr>{children}</tr>
    </thead>
);

const TableBody = ({ children }) => (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
        {children}
    </tbody>
);

const TableRow = ({ children, className = "", onClick }) => (
    <tr
        onClick={onClick}
        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {children}
    </tr>
);

const TableHead = ({ children, className = "" }) => (
    <th className={`px-4 py-3 font-semibold tracking-wider ${className}`}>
        {children}
    </th>
);

const TableCell = ({ children, className = "" }) => (
    <td className={`px-4 py-3 whitespace-nowrap ${className}`}>
        {children}
    </td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
