import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, LayoutDashboard, Users, MessageSquare, Settings } from 'lucide-react';
import config from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    contacts: 0,
    projects: 0,
    schedules: 0,
    getStarted: 0
  });

  const token = localStorage.getItem('adminToken');
  if (!token) return null;

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.hash = ''; // Redirect to home if not logged in
    }

    // You can fetch real dashboard stats here using the token
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">DTS Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          <a href="#dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
            <LayoutDashboard size={18} />
            Overview
          </a>
          <a href="#messages" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors">
            <MessageSquare size={18} />
            Messages
          </a>
          <a href="#users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors">
            <Users size={18} />
            Users
          </a>
          <a href="#settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors">
            <Settings size={18} />
            Settings
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, Admin!</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Contacts', value: '24', color: 'bg-blue-500' },
            { title: 'Project Requests', value: '12', color: 'bg-indigo-500' },
            { title: 'Scheduled Calls', value: '8', color: 'bg-teal-500' },
            { title: 'New Leads', value: '35', color: 'bg-amber-500' }
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">API integration pending for fetching live data.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
