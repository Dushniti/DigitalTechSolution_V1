import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const AttendanceTrendChart = ({ data, title }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="h-64">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" />
            <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Area type="monotone" dataKey="present" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPresent)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
         <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No data available</div>
      )}
    </div>
  </div>
);

export const LeaveDistributionChart = ({ data, title }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-64">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="_id">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
           <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No data available</div>
        )}
      </div>
      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data?.map((entry, idx) => (
          <div key={entry._id} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
            <span className="text-gray-600 dark:text-gray-300">{entry._id} ({entry.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
