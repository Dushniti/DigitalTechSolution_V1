import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, IndianRupee, Save } from 'lucide-react';
import config from '../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': getToken() || '',
});

const SalaryModule = () => {
  const [activeTab, setActiveTab] = useState('config'); // config, calculate
  const [users, setUsers] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  
  // Defaults to current month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [month, setMonth] = useState(currentMonthStr);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/users`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSalary = async () => {
    if (!month) return;
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/salary/calculate?month=${month}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setSalaryData(data.data || []);
      } else {
        setError(data.message || 'Failed to calculate salary.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'config') {
      fetchUsers();
    } else {
      calculateSalary();
    }
  }, [activeTab]);

  const handleSaveSalary = async (userId, baseSalary) => {
    try {
      const res = await fetch(`${config.apiUrl}/users/${userId}/salary`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ baseSalary })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Salary saved successfully');
      } else {
        setError(data.message || 'Failed to save salary.');
      }
    } catch {
      setError('Network error.');
    }
  };

  return (
    <div>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Salary & Payroll</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage user salaries and monthly payouts</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
          <button 
            onClick={() => setActiveTab('config')} 
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'config' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            Salary Configuration
          </button>
          <button 
            onClick={() => setActiveTab('calculate')} 
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'calculate' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            Monthly Calculation
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">User Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Monthly Base Salary (₹)</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{user.email}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.role}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          defaultValue={user.baseSalary || ''}
                          onBlur={(e) => { user._tempSalary = e.target.value }}
                          className="w-32 px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. 50000"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleSaveSalary(user._id, user._tempSalary || user.baseSalary)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                        >
                          <Save size={14} /> Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calculate' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Select Month</label>
                <input 
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)} 
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={calculateSalary} 
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Calculate
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : salaryData.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                 <IndianRupee className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                 <p className="text-gray-500 font-medium">No salary data found for this month</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Base Salary</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase" title="Excluding Weekends">Working Days</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase" title="Full + 0.5*Half + Leaves">Payable Days</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase text-red-500" title="Missing Punch-Outs">Incomplete</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Calculated Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {salaryData.map((s) => (
                      <tr key={s.userId} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                          {s.email}
                          <div className="text-xs font-normal text-gray-500 mt-0.5">
                            Full: {s.presentFullDays} | Half: {s.presentHalfDays} | Paid L: {s.paidLeaveDays} | Unpaid L: {s.unpaidLeaveDays} | Wknd: {s.weekendDaysWorked}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-400">₹{s.baseSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{s.totalWorkingDays}</td>
                        <td className="px-6 py-4 text-center font-semibold text-blue-600 dark:text-blue-400">{s.payableDays}</td>
                        <td className="px-6 py-4 text-center">
                          {s.incompleteDays > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                              {s.incompleteDays}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            ₹{s.calculatedSalary.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryModule;
