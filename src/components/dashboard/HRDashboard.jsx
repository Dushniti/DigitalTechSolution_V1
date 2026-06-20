import React from 'react';
import StatCard from './widgets/StatCard';
import { AttendanceTrendChart, LeaveDistributionChart } from './widgets/ChartWidget';
import { Users, UserX, UserCheck, AlertCircle, CalendarDays, ClipboardList } from 'lucide-react';

const HRDashboard = ({ data, loading, onNavigate }) => {
  if (loading) return <div className="animate-pulse space-y-6">...loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Employees" value={data?.summary?.totalEmployees || '0'} icon={Users} gradient="from-blue-500 to-cyan-400" />
        <StatCard title="Present Today" value={data?.summary?.presentToday || '0'} icon={UserCheck} gradient="from-emerald-500 to-green-400" />
        <StatCard title="Absent Today" value={data?.summary?.absentToday || '0'} icon={UserX} gradient="from-red-500 to-rose-400" />
        <StatCard title="On Leave" value={data?.summary?.onLeaveToday || '0'} icon={CalendarDays} gradient="from-purple-500 to-pink-400" />
        <StatCard title="Pending Leaves" value={data?.summary?.pendingLeaves || '0'} icon={AlertCircle} gradient="from-amber-500 to-orange-400" />
        <StatCard title="Pending Regularizations" value={data?.summary?.pendingRegularizations || '0'} icon={ClipboardList} gradient="from-indigo-500 to-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AttendanceTrendChart data={data?.attendanceTrend} title="Organization Attendance Trend (Last 7 Days)" />
        </div>
        
        <div className="lg:col-span-1">
          <LeaveDistributionChart data={data?.leaveAnalytics?.distribution} title="Leave Requests by Type (Pending)" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">New Joiners</h3>
          <div className="space-y-3">
             {data?.insights?.newJoiners?.length > 0 ? data.insights.newJoiners.map(emp => (
                <div key={emp._id} className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{emp.name?.[0]}</div>
                   <div>
                     <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{emp.name}</p>
                     <p className="text-xs text-gray-500">{new Date(emp.joiningDate).toLocaleDateString()}</p>
                   </div>
                </div>
             )) : <p className="text-sm text-gray-500">No recent joiners</p>}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
             <button onClick={() => onNavigate('users')} className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 transition-colors">
               Manage Users
             </button>
             <button onClick={() => onNavigate('leaves')} className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 transition-colors">
               Review Leaves
             </button>
             <button onClick={() => onNavigate('regularization')} className="px-4 py-2 text-sm font-semibold rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100 transition-colors">
               Regularizations
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
