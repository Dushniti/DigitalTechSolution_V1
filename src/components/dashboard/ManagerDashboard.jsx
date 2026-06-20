import React from 'react';
import StatCard from './widgets/StatCard';
import { LeaveDistributionChart } from './widgets/ChartWidget';
import { Users, UserX, UserCheck, AlertCircle } from 'lucide-react';

const ManagerDashboard = ({ data, loading, onNavigate }) => {
  if (loading) return <div className="animate-pulse space-y-6">...loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Team Size" value={data?.summary?.teamSize || '0'} icon={Users} gradient="from-indigo-500 to-blue-400" />
        <StatCard title="Team Present" value={data?.summary?.presentToday || '0'} icon={UserCheck} gradient="from-emerald-500 to-green-400" />
        <StatCard title="Team Absent" value={data?.summary?.absentToday || '0'} icon={UserX} gradient="from-red-500 to-rose-400" />
        <StatCard title="Pending Approvals" value={data?.summary?.pendingLeaves || '0'} icon={AlertCircle} gradient="from-amber-500 to-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <LeaveDistributionChart data={data?.leaveAnalytics?.distribution} title="Team Leave Distribution (Pending)" />
        </div>
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Approval Center</h3>
          <p className="text-sm text-gray-500">Go to Leaves or Regularization tab to manage pending requests from your team.</p>
          {/* We can embed a mini-list here later if we want */}
          <div className="mt-4 flex gap-3">
             <button onClick={() => onNavigate('leaves')} className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 transition-colors">
               Review Leaves ({data?.summary?.pendingLeaves || 0})
             </button>
             <button onClick={() => onNavigate('regularization')} className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
               Regularizations
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
