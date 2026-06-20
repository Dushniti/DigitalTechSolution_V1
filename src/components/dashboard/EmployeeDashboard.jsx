import React from 'react';
import StatCard from './widgets/StatCard';
import { AttendanceTrendChart } from './widgets/ChartWidget';
import { Clock, CalendarDays, IndianRupee, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeDashboard = ({ data, loading, onNavigate }) => {
  if (loading) return <div className="animate-pulse space-y-6">...loading...</div>;

  return (
    <div className="space-y-6">
      {/* Quick Actions & Welcome */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Here's your summary for today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('attendance')} className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all shadow-sm">
            Mark Attendance
          </button>
          <button onClick={() => onNavigate('leaves')} className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
            Apply Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Today's Attendance" value={data?.summary?.attendanceToday || 'N/A'} icon={Clock} gradient="from-blue-500 to-cyan-400" />
        <StatCard title="Available Leave Balance" value={data?.summary?.leaveBalance || '0'} icon={CalendarDays} gradient="from-orange-500 to-amber-400" />
        <StatCard title="Last Payroll Net" value={`₹${data?.summary?.lastPayrollNet?.toLocaleString() || '0'}`} icon={IndianRupee} gradient="from-emerald-500 to-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AttendanceTrendChart data={data?.attendanceTrend} title="My Attendance Trend (Last 7 Days)" />
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={16} className="text-blue-500" /> Upcoming Holidays
          </h3>
          <div className="space-y-3">
            {data?.upcomingHolidays?.length > 0 ? data.upcomingHolidays.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{new Date(h.date).getDate()}</span>
                  <span className="text-[10px] font-medium text-blue-500 dark:text-blue-500">{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{h.name}</p>
                  <p className="text-xs text-gray-500">{h.type}</p>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">No upcoming holidays</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
