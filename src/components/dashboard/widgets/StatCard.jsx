import React from 'react';

const StatCard = ({ title, value, sub, icon: Icon, gradient, loading }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-3 h-full">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
      {Icon && <Icon className="w-5 h-5 text-white" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 whitespace-normal break-words leading-tight">{title}</p>
      {loading
        ? <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        : <p className="text-xl font-extrabold text-gray-900 dark:text-white truncate" title={value}>{value}</p>
      }
      {sub && <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 whitespace-normal break-words leading-tight">{sub}</p>}
    </div>
  </div>
);

export default StatCard;
