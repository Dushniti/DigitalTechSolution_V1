import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Clock, CalendarDays, ClipboardList, IndianRupee, Users, Building, Settings, FileText, BarChart2, MessageSquare, ChevronRight, Briefcase } from 'lucide-react';
import config from '../../config';

import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HRDashboard from './HRDashboard';
import AdminDashboard from './AdminDashboard';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const DashboardOverview = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllModules, setShowAllModules] = useState(false);
  const [columns, setColumns] = useState(6);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1280) setColumns(6);
      else if (window.innerWidth >= 1024) setColumns(5);
      else if (window.innerWidth >= 768) setColumns(4);
      else if (window.innerWidth >= 640) setColumns(3);
      else setColumns(2);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/dashboard-aggregated`, {
        headers: authHeaders(),
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch dashboard data.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const renderDashboard = () => {
    if (!data) return null;
    
    // Normalize role check (Admin acts as HR/Super_Admin here, we treat Admin/super_admin as AdminDashboard)
    const role = data.role?.toLowerCase() || '';
    
    if (role === 'super_admin' || role === 'admin') {
      return <AdminDashboard data={data} loading={loading} onNavigate={onNavigate} />;
    } else if (role === 'hr') {
      return <HRDashboard data={data} loading={loading} onNavigate={onNavigate} />;
    } else if (role === 'manager') {
      return <ManagerDashboard data={data} loading={loading} onNavigate={onNavigate} />;
    } else {
      return <EmployeeDashboard data={data} loading={loading} onNavigate={onNavigate} />;
    }
  };

  const renderLaunchpad = () => {
    if (!data) return null;
    const role = data.role?.toLowerCase() || '';
    
    const modules = [
      { id: 'attendance', label: 'Attendance', icon: Clock, gradient: 'from-blue-500 to-cyan-400' },
      { id: 'leaves', label: 'Leave Management', icon: CalendarDays, gradient: 'from-emerald-500 to-green-400' },
      { id: 'regularization', label: 'Regularization', icon: ClipboardList, gradient: 'from-purple-500 to-pink-400' },
      { id: 'documents', label: 'Documents', icon: FileText, gradient: 'from-amber-500 to-orange-400' },
    ];

    if (role === 'admin' || role === 'super_admin' || role === 'hr') {
      modules.push({ id: 'salary', label: 'Payroll', icon: IndianRupee, gradient: 'from-emerald-600 to-green-500' });
      modules.push({ id: 'organization', label: 'Org & Staff', icon: Building, gradient: 'from-indigo-500 to-blue-500' });
      modules.push({ id: 'hr-settings', label: 'HR Settings', icon: Settings, gradient: 'from-slate-600 to-slate-500' });
      modules.push({ id: 'master', label: 'Job Master', icon: Briefcase, gradient: 'from-amber-600 to-yellow-500' });
      modules.push({ id: 'reports', label: 'Reports', icon: BarChart2, gradient: 'from-rose-500 to-pink-500' });
    }
    if (role === 'admin' || role === 'super_admin') {
      modules.push({ id: 'users', label: 'Auth Users', icon: Users, gradient: 'from-cyan-600 to-cyan-400' });
    }
    if (role !== 'employee') {
      modules.push({ id: 'contacts', label: 'Messages', icon: MessageSquare, gradient: 'from-violet-500 to-purple-400' });
    }

    const hasMore = modules.length > columns;
    const visibleModules = showAllModules ? modules : modules.slice(0, hasMore ? columns - 1 : columns);

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Access Modules</h2>
          {showAllModules && (
            <button
              onClick={() => setShowAllModules(false)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Show Less
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {visibleModules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => onNavigate(m.id)}
                className="group flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden text-center"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {m.label}
                </span>
                <ChevronRight className="absolute bottom-2 right-2 text-gray-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={16} />
              </button>
            );
          })}
          {!showAllModules && hasMore && (
            <button
              onClick={() => setShowAllModules(true)}
              className="group flex flex-col items-center justify-center p-5 bg-blue-50/50 dark:bg-slate-800/50 rounded-2xl border border-blue-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <span className="font-bold text-lg">+{modules.length - (columns - 1)}</span>
              </div>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400 leading-tight">
                Show More
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Welcome to Digital Tech Solution, <span className="font-semibold text-gray-700 dark:text-gray-300">{data?.userName ? data.userName.split(' ')[0] : 'User'}</span>!
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {renderLaunchpad()}
      {renderDashboard()}
    </div>
  );
};

export default DashboardOverview;
