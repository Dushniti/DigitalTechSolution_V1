import React from 'react';
import HRDashboard from './HRDashboard';
import StatCard from './widgets/StatCard';
import { IndianRupee, CheckCircle2, Clock, Activity, Building2, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = ({ data, loading, onNavigate }) => {
  if (loading) return <div className="animate-pulse space-y-6">...loading...</div>;

  return (
    <div className="space-y-8">
      {/* SaaS Metrics (Super Admin Only) */}
      {data?.saasMetrics && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">SaaS Platform Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Companies" value={data.saasMetrics.totalCompanies} icon={Building2} gradient="from-blue-600 to-blue-500" />
            <StatCard title="Active Subscriptions" value={data.saasMetrics.activeSubscriptions} icon={CheckCircle2} gradient="from-emerald-500 to-green-500" />
            <StatCard title="Total Platform Users" value={data.saasMetrics.totalUsers} icon={Users} gradient="from-purple-500 to-pink-500" />
            <StatCard title="Monthly Revenue" value={`₹${data.saasMetrics.monthlyRevenue.toLocaleString()}`} icon={IndianRupee} gradient="from-amber-500 to-orange-500" />
          </div>
        </div>
      )}

      {/* Admin specific Payroll Analytics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payroll Analytics (This Month)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Salary Paid" value={`₹${data?.payrollAnalytics?.totalPaid?.toLocaleString() || '0'}`} icon={IndianRupee} gradient="from-emerald-500 to-green-400" />
          <StatCard title="Pending Payroll" value={`₹${data?.payrollAnalytics?.totalPending?.toLocaleString() || '0'}`} icon={Clock} gradient="from-amber-500 to-orange-400" />
          <StatCard title="Employees Paid" value={data?.payrollAnalytics?.countPaid || '0'} icon={CheckCircle2} gradient="from-blue-500 to-cyan-400" />
          <StatCard title="Employees Pending" value={data?.payrollAnalytics?.countPending || '0'} icon={Clock} gradient="from-purple-500 to-pink-400" />
        </div>
        
        {/* Department wise attendance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
           <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Department-wise Attendance (Today)</h3>
           <div className="h-64">
             {data?.deptAttendance?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.deptAttendance}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="_id" tick={{fontSize: 12}} stroke="#94a3b8" />
                   <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                   <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: 'transparent'}} />
                   <Bar dataKey="presentCount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No data available</div>
             )}
           </div>
        </div>
      </div>

      {/* Recent Activities */}
      {data?.recentActivities && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activities</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {data.recentActivities.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No recent activities found</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {data.recentActivities.map(activity => (
                  <div key={activity._id} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Activity size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.module_name} <span className="text-gray-500 font-normal">({activity.action})</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reusing HR Dashboard for Organization overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Organization Overview</h2>
        <HRDashboard data={data} loading={loading} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default AdminDashboard;
