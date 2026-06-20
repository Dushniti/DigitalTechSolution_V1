/**
 * PayrollModule.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete HRMS Payroll Management Module — Admin Only
 *
 * Tabs:
 *  1. Dashboard   — stat cards, 6-month bar chart, recent activity
 *  2. Salary Setup — per-employee salary structure configuration
 *  3. Generate    — month/year picker, preview table, generate & delete payroll
 *  4. Slips       — search, view salary slip, print
 *  5. Reports     — filters, tabular report, CSV export, dept-wise view
 *  6. Audit Logs  — read-only audit trail
 *
 * All API calls are protected by JWT + Admin middleware on the backend.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Settings, Zap, FileText, BarChart2, ClipboardList,
  RefreshCw, AlertCircle, IndianRupee, Users, CheckCircle2, Clock,
  XCircle, TrendingUp, Download, Printer, Eye, Trash2, Edit2,
  Save, X, ChevronDown, ChevronUp, Building2, CreditCard, Search,
  Calendar, Filter, FileDown, AlertTriangle
} from 'lucide-react';
import config from '../config';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const STATUS_STYLES = {
  Paid:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Failed:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_ICONS = {
  Paid:       <CheckCircle2 size={12} />,
  Processing: <Clock size={12} />,
  Pending:    <AlertTriangle size={12} />,
  Failed:     <XCircle size={12} />,
};

// ─── Toast helper (shared across tabs) ────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  }, []);
  const ToastEl = (
    <AnimatePresence>
      {toast.msg && (
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          className={`fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
  return { showToast, ToastEl };
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, gradient, loading }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      {loading
        ? <div className="h-7 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        : <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
      }
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.totalNet), 1);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-blue-500" /> 6-Month Payroll Trend
      </h3>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500 min-h-[4px]"
              style={{ height: `${(d.totalNet / max) * 100}%` }}
              title={`${d.label}: ${fmt(d.totalNet)}`}
            />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const DashboardTab = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${config.apiUrl}/payroll/dashboard-stats?month=${month}&year=${year}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (data.success) setStats(data.data);
      else setError(data.message || 'Failed to load stats.');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [month, year]);

  return (
    <div className="space-y-6">
      {/* Month/Year picker */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input
          type="number" value={year} min={2020} max={2099}
          onChange={e => setYear(Number(e.target.value))}
          className="w-24 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
        <button
          onClick={() => onNavigate('generate')}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm hover:from-blue-500 hover:to-cyan-400 transition-all"
        >
          <Zap size={15} /> Generate Payroll
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats?.totalEmployees ?? '—'} icon={Users} gradient="from-blue-500 to-cyan-400" loading={loading} sub="registered accounts" />
        <StatCard title="Monthly Payroll" value={loading ? '—' : fmt(stats?.totalMonthlyPayroll)} icon={IndianRupee} gradient="from-purple-500 to-pink-400" loading={loading} sub={`${MONTHS[month-1]} ${year}`} />
        <StatCard title="Salaries Paid" value={stats?.paidCount ?? '—'} icon={CheckCircle2} gradient="from-emerald-500 to-green-400" loading={loading} sub="payment confirmed" />
        <StatCard title="Pending Payment" value={stats?.pendingCount ?? '—'} icon={Clock} gradient="from-amber-500 to-orange-400" loading={loading} sub="awaiting payment" />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {stats?.last6Months && <MiniBarChart data={stats.last6Months} />}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ClipboardList size={16} className="text-purple-500" /> Recent Activity
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
            </div>
          ) : !stats?.recentActivity?.length ? (
            <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{a.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: SALARY SETUP
// ─────────────────────────────────────────────────────────────────────────────
const SalarySetupTab = () => {
  const [users, setUsers] = useState([]);
  const [structures, setStructures] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({});
  const { showToast, ToastEl } = useToast();

  const fetchData = async () => {
    setLoadingUsers(true);
    try {
      const [usersRes, structRes] = await Promise.all([
        fetch(`${config.apiUrl}/users`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/payroll/salary-structure`, { headers: authHeaders() }),
      ]);
      const uData = await usersRes.json();
      const sData = await structRes.json();
      if (uData.success) setUsers(uData.data || []);
      if (sData.success) {
        const map = {};
        (sData.data || []).forEach(s => { map[s.userId] = s; });
        setStructures(map);
      }
    } catch { /* silent */ }
    finally { setLoadingUsers(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExpand = (userId) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    const s = structures[userId] || {};
    const user = users.find(u => u._id === userId) || {};
    setFormData({
      userId,
      // Profile
      name: user.name || '',
      department: user.department || '',
      designation: user.designation || '',
      joiningDate: user.joiningDate || '',
      employeeCode: user.employeeCode || '',
      // Earnings
      basicSalary: s.basicSalary || 0,
      hra: s.hra || 0,
      conveyanceAllowance: s.conveyanceAllowance || 0,
      medicalAllowance: s.medicalAllowance || 0,
      specialAllowance: s.specialAllowance || 0,
      bonus: s.bonus || 0,
      incentive: s.incentive || 0,
      // Deductions
      pf: s.pf || 0,
      esi: s.esi || 0,
      professionalTax: s.professionalTax || 0,
      otherDeductions: s.otherDeductions || 0,
      // Bank
      bankName: s.bankName || '',
      accountNumber: s.accountNumber || '',
      ifscCode: s.ifscCode || '',
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save profile
      await fetch(`${config.apiUrl}/users/${formData.userId}/profile`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({
          name: formData.name, department: formData.department,
          designation: formData.designation, joiningDate: formData.joiningDate,
          employeeCode: formData.employeeCode,
        }),
      });
      // 2. Save salary structure
      const res = await fetch(`${config.apiUrl}/payroll/salary-structure`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Salary structure saved successfully!');
        fetchData();
        setExpandedUser(null);
      } else {
        showToast(data.message || 'Save failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const FieldInput = ({ label, field, type = 'number', prefix }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input
          type={type}
          value={formData[field] ?? ''}
          onChange={e => handleChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          className={`w-full ${prefix ? 'pl-7' : 'px-3'} pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
          min={type === 'number' ? 0 : undefined}
        />
      </div>
    </div>
  );

  return (
    <div>
      {ToastEl}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search employee..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loadingUsers ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => {
            const hasStructure = !!structures[user._id];
            const isOpen = expandedUser === user._id;
            return (
              <div key={user._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Row header */}
                <button
                  onClick={() => handleExpand(user._id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(user.name || user.email)?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user.name || user.email}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email} • {user.department || 'No dept'} • {user.designation || 'No designation'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {hasStructure ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                        {fmt(structures[user._id]?.basicSalary)} basic
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">Not configured</span>
                    )}
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded Form */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 border-t border-gray-100 dark:border-slate-800">
                        {/* Profile Section */}
                        <div className="mt-5 mb-4">
                          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Users size={13} /> Employee Profile</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <FieldInput label="Full Name" field="name" type="text" />
                            <FieldInput label="Employee Code" field="employeeCode" type="text" />
                            <FieldInput label="Department" field="department" type="text" />
                            <FieldInput label="Designation" field="designation" type="text" />
                            <FieldInput label="Joining Date" field="joiningDate" type="date" />
                          </div>
                        </div>

                        {/* Earnings */}
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><IndianRupee size={13} /> Earnings</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <FieldInput label="Basic Salary" field="basicSalary" prefix="₹" />
                            <FieldInput label="HRA" field="hra" prefix="₹" />
                            <FieldInput label="Conveyance" field="conveyanceAllowance" prefix="₹" />
                            <FieldInput label="Medical Allowance" field="medicalAllowance" prefix="₹" />
                            <FieldInput label="Special Allowance" field="specialAllowance" prefix="₹" />
                            <FieldInput label="Bonus" field="bonus" prefix="₹" />
                            <FieldInput label="Incentive" field="incentive" prefix="₹" />
                          </div>
                        </div>

                        {/* Deductions */}
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><XCircle size={13} /> Statutory Deductions</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <FieldInput label="PF Contribution" field="pf" prefix="₹" />
                            <FieldInput label="ESI Contribution" field="esi" prefix="₹" />
                            <FieldInput label="Professional Tax" field="professionalTax" prefix="₹" />
                            <FieldInput label="Other Deductions" field="otherDeductions" prefix="₹" />
                          </div>
                        </div>

                        {/* Bank Details */}
                        <div className="mb-5">
                          <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard size={13} /> Bank Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <FieldInput label="Bank Name" field="bankName" type="text" />
                            <FieldInput label="Account Number" field="accountNumber" type="text" />
                            <FieldInput label="IFSC Code" field="ifscCode" type="text" />
                          </div>
                        </div>

                        {/* Gross Preview */}
                        <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-4 border border-blue-100 dark:border-blue-900/30">
                          <div className="text-sm">
                            <span className="font-semibold text-blue-700 dark:text-blue-400">Gross: </span>
                            <span className="font-bold text-blue-700 dark:text-blue-300">
                              {fmt((formData.basicSalary||0)+(formData.hra||0)+(formData.conveyanceAllowance||0)+(formData.medicalAllowance||0)+(formData.specialAllowance||0)+(formData.bonus||0)+(formData.incentive||0))}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-red-600 dark:text-red-400">Deductions: </span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {fmt((formData.pf||0)+(formData.esi||0)+(formData.professionalTax||0)+(formData.otherDeductions||0))}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Net (approx): </span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              {fmt(
                                (formData.basicSalary||0)+(formData.hra||0)+(formData.conveyanceAllowance||0)+(formData.medicalAllowance||0)+(formData.specialAllowance||0)+(formData.bonus||0)+(formData.incentive||0)
                                -((formData.pf||0)+(formData.esi||0)+(formData.professionalTax||0)+(formData.otherDeductions||0))
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button onClick={() => setExpandedUser(null)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 transition-all shadow-sm"
                          >
                            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                            {saving ? 'Saving...' : 'Save Structure'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: GENERATE PAYROLL
// ─────────────────────────────────────────────────────────────────────────────
const GenerateTab = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [payModal, setPayModal] = useState(null); // payroll record
  const [payForm, setPayForm] = useState({ status: 'Paid', transactionId: '', paymentRemarks: '' });
  const [payLoading, setPayLoading] = useState(false);
  const { showToast, ToastEl } = useToast();

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch(
        `${config.apiUrl}/payroll/monthly?month=${month}&year=${year}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (data.success) setRecords(data.data || []);
    } catch { /* silent */ }
    finally { setLoadingRecords(false); }
  };

  useEffect(() => { fetchRecords(); }, [month, year]);

  const handleGenerate = async () => {
    setShowConfirm(false);
    setGenerating(true);
    try {
      const res = await fetch(`${config.apiUrl}/payroll/generate`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ ${data.generated} payroll(s) generated. ${data.skipped?.length || 0} skipped.`);
        fetchRecords();
      } else {
        showToast(data.message || 'Generation failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${config.apiUrl}/payroll/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) { showToast('Record deleted.'); fetchRecords(); }
      else showToast(data.message || 'Delete failed.', 'error');
    } catch { showToast('Network error.', 'error'); }
    finally { setDeletingId(null); }
  };

  const handlePaySubmit = async () => {
    setPayLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/payroll/payment-status/${payModal._id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify(payForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment status → ${payForm.status}`);
        setPayModal(null);
        fetchRecords();
      } else showToast(data.message || 'Update failed.', 'error');
    } catch { showToast('Network error.', 'error'); }
    finally { setPayLoading(false); }
  };

  const totalNet = records.reduce((s, r) => s + (r.netSalary || 0), 0);

  return (
    <div className="space-y-5">
      {ToastEl}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4">
        <Calendar size={16} className="text-blue-500" />
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" value={year} min={2020} max={2099}
          onChange={e => setYear(Number(e.target.value))}
          className="w-24 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button onClick={fetchRecords} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={14} className={loadingRecords ? 'animate-spin' : ''} />
        </button>
        <div className="ml-auto flex gap-2">
          {records.length > 0 && <span className="self-center text-sm font-semibold text-gray-600 dark:text-gray-400">Total: <span className="text-emerald-600 dark:text-emerald-400">{fmt(totalNet)}</span></span>}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 shadow-sm transition-all"
          >
            {generating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={15} />}
            {generating ? 'Generating...' : 'Generate Payroll'}
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-6 text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={26} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Generate Payroll?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                This will generate payroll for all employees for <strong className="text-gray-700 dark:text-gray-200">{MONTHS[month-1]} {year}</strong>. Employees with existing payroll records will be skipped.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleGenerate} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {payModal && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Update Payment Status</h3>
                <button onClick={() => setPayModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{payModal.employeeName} — {fmt(payModal.netSalary)}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={payForm.status} onChange={e => setPayForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {['Pending','Processing','Paid','Failed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {payForm.status === 'Paid' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
                    <input type="text" value={payForm.transactionId} onChange={e => setPayForm(p => ({ ...p, transactionId: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="TXN123..." />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                  <input type="text" value={payForm.paymentRemarks} onChange={e => setPayForm(p => ({ ...p, paymentRemarks: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Optional remarks..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setPayModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handlePaySubmit} disabled={payLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                  {payLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                  Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loadingRecords ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <IndianRupee className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 font-medium">No payroll generated for {MONTHS[month-1]} {year}</p>
            <p className="text-sm text-gray-400 mt-1">Click "Generate Payroll" to create records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Days</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Gross</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Deductions</th>
                  <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Net Pay</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {records.map(r => (
                  <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{r.employeeName}</p>
                      <p className="text-xs text-gray-400">{r.department}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-gray-500">
                      <span title="Present">{r.attendanceSummary?.presentFullDays || 0}P</span> /
                      <span title="Absent" className="text-red-500"> {r.attendanceSummary?.absentDays || 0}A</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-600 dark:text-gray-400">{fmt(r.grossSalary)}</td>
                    <td className="px-4 py-3.5 text-right text-red-500">{fmt(r.totalDeductions)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{fmt(r.netSalary)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.paymentStatus] || STATUS_STYLES.Pending}`}>
                        {STATUS_ICONS[r.paymentStatus]} {r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setPayModal(r); setPayForm({ status: r.paymentStatus || 'Paid', transactionId: r.transactionId || '', paymentRemarks: r.paymentRemarks || '' }); }}
                          className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors" title="Update Payment">
                          <CreditCard size={14} />
                        </button>
                        {r.paymentStatus !== 'Paid' && (
                          <button onClick={() => handleDelete(r._id)} disabled={deletingId === r._id}
                            className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors" title="Delete">
                            {deletingId === r._id ? <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SALARY SLIP PRINT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SalarySlipPrint = ({ slip }) => {
  if (!slip) return null;
  const { employeeName, department, designation, month, year, email,
          salaryComponents: sc, deductions: ded, attendanceSummary: att,
          grossSalary, totalDeductions, netSalary, paymentStatus,
          paymentDate, transactionId, userInfo, salaryStructure: ss } = slip;

  const monthName = MONTHS[(month || 1) - 1];
  const earnings = [
    { label: 'Basic Salary', value: sc?.basicSalary },
    { label: 'HRA', value: sc?.hra },
    { label: 'Conveyance Allowance', value: sc?.conveyanceAllowance },
    { label: 'Medical Allowance', value: sc?.medicalAllowance },
    { label: 'Special Allowance', value: sc?.specialAllowance },
    { label: 'Bonus', value: sc?.bonus },
    { label: 'Incentive', value: sc?.incentive },
    { label: 'Overtime', value: sc?.overtimeAmount },
  ].filter(e => e.value > 0);

  const deductionsList = [
    { label: 'PF Contribution', value: ded?.pf },
    { label: 'ESI Contribution', value: ded?.esi },
    { label: 'Professional Tax', value: ded?.professionalTax },
    { label: 'Attendance Deduction', value: ded?.attendanceDeduction },
    { label: 'Other Deductions', value: ded?.otherDeductions },
  ].filter(d => d.value > 0);

  return (
    <div id="salary-slip-print-area" className="bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto font-sans">
      {/* Company Header */}
      <div className="text-center mb-6 pb-5 border-b-2 border-blue-600">
        <h1 className="text-2xl font-extrabold text-blue-700">Digital Tech Solution</h1>
        <p className="text-sm text-gray-500 mt-1">SALARY SLIP — {monthName.toUpperCase()} {year}</p>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><span className="font-semibold text-gray-600">Employee Name:</span> {employeeName}</p>
          <p><span className="font-semibold text-gray-600">Email:</span> {email}</p>
          <p><span className="font-semibold text-gray-600">Department:</span> {department}</p>
          <p><span className="font-semibold text-gray-600">Designation:</span> {designation}</p>
        </div>
        <div>
          <p><span className="font-semibold text-gray-600">Employee Code:</span> {userInfo?.employeeCode || 'N/A'}</p>
          <p><span className="font-semibold text-gray-600">Joining Date:</span> {userInfo?.joiningDate || 'N/A'}</p>
          <p><span className="font-semibold text-gray-600">Bank:</span> {ss?.bankName || 'N/A'}</p>
          <p><span className="font-semibold text-gray-600">A/C No:</span> {ss?.accountNumber || 'N/A'}</p>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Attendance Summary</h3>
        <div className="grid grid-cols-4 gap-3 text-sm text-center">
          <div><p className="font-bold text-gray-900">{att?.totalWorkingDays}</p><p className="text-xs text-gray-500">Working Days</p></div>
          <div><p className="font-bold text-emerald-700">{att?.presentFullDays}</p><p className="text-xs text-gray-500">Present</p></div>
          <div><p className="font-bold text-red-600">{att?.absentDays}</p><p className="text-xs text-gray-500">Absent</p></div>
          <div><p className="font-bold text-amber-600">{att?.paidLeaveDays}</p><p className="text-xs text-gray-500">Paid Leaves</p></div>
        </div>
      </div>

      {/* Earnings / Deductions */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Earnings</h3>
          <table className="w-full text-sm">
            <tbody>
              {earnings.map(e => (
                <tr key={e.label} className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-600">{e.label}</td>
                  <td className="py-1.5 text-right font-medium">{fmt(e.value)}</td>
                </tr>
              ))}
              <tr className="font-bold border-t-2 border-gray-200">
                <td className="pt-2 text-emerald-700">Gross Total</td>
                <td className="pt-2 text-right text-emerald-700">{fmt(grossSalary)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Deductions</h3>
          <table className="w-full text-sm">
            <tbody>
              {deductionsList.map(d => (
                <tr key={d.label} className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-600">{d.label}</td>
                  <td className="py-1.5 text-right font-medium text-red-500">{fmt(d.value)}</td>
                </tr>
              ))}
              <tr className="font-bold border-t-2 border-gray-200">
                <td className="pt-2 text-red-600">Total Deductions</td>
                <td className="pt-2 text-right text-red-600">{fmt(totalDeductions)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm font-medium">Net Payable Salary</p>
          <p className="text-white text-2xl font-extrabold">{fmt(netSalary)}</p>
        </div>
        <div className="text-right">
          <p className="text-blue-100 text-xs">Payment Status</p>
          <p className="text-white font-bold text-sm">{paymentStatus}</p>
          {paymentDate && <p className="text-blue-200 text-xs">{new Date(paymentDate).toLocaleDateString('en-IN')}</p>}
          {transactionId && <p className="text-blue-200 text-xs">TXN: {transactionId}</p>}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-5">This is a computer-generated salary slip and does not require a signature.</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4: SALARY SLIPS
// ─────────────────────────────────────────────────────────────────────────────
const SlipsTab = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewSlip, setViewSlip] = useState(null);
  const [slipLoading, setSlipLoading] = useState(false);
  const { showToast, ToastEl } = useToast();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/payroll/monthly?month=${month}&year=${year}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setRecords(data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, [month, year]);

  const handleViewSlip = async (payrollId) => {
    setSlipLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/payroll/slip/${payrollId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setViewSlip(data.data);
      else showToast(data.message || 'Failed to load slip.', 'error');
    } catch { showToast('Network error.', 'error'); }
    finally { setSlipLoading(false); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('salary-slip-print-area');
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Salary Slip</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 6px 4px; font-size: 13px; }
        .net-box { background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; }
        .att-box { background: #f9fafb; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
        .att-grid { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 8px; }
        h1 { color: #1d4ed8; }
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .earn-title { color: #059669; }
        .ded-title { color: #dc2626; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .total-row td { font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 8px; }
      </style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const filtered = records.filter(r =>
    (r.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {ToastEl}

      <div className="flex flex-wrap items-center gap-3">
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" value={year} min={2020} max={2099}
          onChange={e => setYear(Number(e.target.value))}
          className="w-24 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-52" />
        </div>
        <button onClick={fetchRecords} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Slip View Modal */}
      <AnimatePresence>
        {viewSlip && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-bold text-gray-900 dark:text-white">Salary Slip</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors">
                    <Printer size={15} /> Print
                  </button>
                  <button onClick={() => setViewSlip(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"><X size={18} /></button>
                </div>
              </div>
              <div className="p-5">
                <SalarySlipPrint slip={viewSlip} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 font-medium">No salary slips found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Period</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Net Salary</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{r.employeeName}</p>
                      <p className="text-xs text-gray-400">{r.email}</p>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-500 text-xs">{MONTHS[r.month-1]} {r.year}</td>
                    <td className="px-5 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{fmt(r.netSalary)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.paymentStatus] || STATUS_STYLES.Pending}`}>
                        {STATUS_ICONS[r.paymentStatus]} {r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleViewSlip(r._id)} disabled={slipLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors ml-auto">
                        <Eye size={13} /> View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 5: REPORTS
// ─────────────────────────────────────────────────────────────────────────────
const ReportsTab = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [reportType, setReportType] = useState('monthly'); // monthly | department
  const [records, setRecords] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast, ToastEl } = useToast();

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month, year });
      if (status) params.append('status', status);
      if (department) params.append('department', department);

      const [monthRes, deptRes] = await Promise.all([
        fetch(`${config.apiUrl}/payroll/reports/monthly?${params}`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/payroll/reports/department?month=${month}&year=${year}`, { headers: authHeaders() }),
      ]);
      const mData = await monthRes.json();
      const dData = await deptRes.json();
      if (mData.success) { setRecords(mData.data || []); setSummary(mData.summary); }
      if (dData.success) setDeptData(dData.data || []);
    } catch { showToast('Failed to load report.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const exportCSV = () => {
    const rows = [
      ['Employee', 'Email', 'Department', 'Designation', 'Month', 'Year', 'Working Days', 'Present', 'Absent', 'Basic', 'Gross', 'Deductions', 'Net Salary', 'Status', 'Payment Date', 'Txn ID'],
      ...records.map(r => [
        r.employeeName, r.email, r.department, r.designation, MONTHS[r.month-1], r.year,
        r.attendanceSummary?.totalWorkingDays,
        r.attendanceSummary?.presentFullDays,
        r.attendanceSummary?.absentDays,
        r.salaryComponents?.basicSalary,
        r.grossSalary, r.totalDeductions, r.netSalary,
        r.paymentStatus,
        r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('en-IN') : '',
        r.transactionId || '',
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `payroll_${MONTHS[month-1]}_${year}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!');
  };

  return (
    <div className="space-y-5">
      {ToastEl}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
        <Filter size={15} className="text-gray-400" />
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" value={year} min={2020} max={2099}
          onChange={e => setYear(Number(e.target.value))}
          className="w-24 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">All Statuses</option>
          {['Pending','Processing','Paid','Failed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department..."
          className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-40" />
        <button onClick={fetchReport} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Apply
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/20 transition-colors ml-auto">
          <FileDown size={14} /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Gross', value: fmt(summary.totalGross), color: 'text-blue-700 dark:text-blue-400' },
            { label: 'Total Deductions', value: fmt(summary.totalDeductions), color: 'text-red-600 dark:text-red-400' },
            { label: 'Total Net', value: fmt(summary.totalNet), color: 'text-emerald-700 dark:text-emerald-400' },
            { label: `Paid / Pending`, value: `${summary.paid} / ${summary.pending}`, color: 'text-purple-700 dark:text-purple-400' },
          ].map(c => (
            <div key={c.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report Type Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
        {[['monthly','Monthly Report'],['department','Department Report']].map(([v,l]) => (
          <button key={v} onClick={() => setReportType(v)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${reportType === v ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Monthly Report Table */}
      {reportType === 'monthly' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : records.length === 0 ? (
            <div className="flex flex-col items-center py-16"><BarChart2 className="w-12 h-12 text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No records found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Attendance</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Gross</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Deductions</th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Net</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {records.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{r.employeeName}</p>
                        <p className="text-xs text-gray-400">{r.department} • {r.designation}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-500">
                        {r.attendanceSummary?.presentFullDays}P / {r.attendanceSummary?.absentDays}A
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-600 dark:text-gray-400">{fmt(r.grossSalary)}</td>
                      <td className="px-4 py-3.5 text-right text-red-500">{fmt(r.totalDeductions)}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{fmt(r.netSalary)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[r.paymentStatus] || STATUS_STYLES.Pending}`}>
                          {STATUS_ICONS[r.paymentStatus]} {r.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Department Report */}
      {reportType === 'department' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : deptData.length === 0 ? (
            <div className="flex flex-col items-center py-16"><Building2 className="w-12 h-12 text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No department data found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Employees</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Total Gross</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Total Net</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Paid / Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {deptData.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Building2 size={14} className="text-blue-500 shrink-0" /> {d._id || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">{d.totalEmployees}</td>
                      <td className="px-5 py-4 text-right text-gray-600 dark:text-gray-400">{fmt(d.totalGross)}</td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{fmt(d.totalNet)}</td>
                      <td className="px-5 py-4 text-center text-sm">
                        <span className="text-emerald-600 font-semibold">{d.paid}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-amber-600 font-semibold">{d.pending}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 6: AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────
const AuditLogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/payroll/audit-logs?limit=200`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setLogs(data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const ACTION_COLORS = {
    PAYROLL_GENERATED:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    PAYROLL_DELETED:        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    PAYROLL_RECALCULATED:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    SALARY_PAID:            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    SALARY_STRUCTURE_UPDATED:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.userId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
        <span className="text-xs text-gray-400">{filtered.length} records</span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16"><ClipboardList className="w-12 h-12 text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No audit logs found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Performed By</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filtered.map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${ACTION_COLORS[l.action] || 'bg-gray-100 text-gray-600'}`}>
                        {l.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-mono">{l.performedBy?.substring(0,16)}...</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {l.netSalary && <span>Net: {fmt(l.netSalary)} </span>}
                      {l.userId && <span>User: {l.userId?.substring(0,10)}... </span>}
                      {l.status && <span>Status: {l.status}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAYROLL MODULE — Tab Router
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'setup',      label: 'Salary Setup',   icon: Settings },
  { id: 'generate',   label: 'Generate',        icon: Zap },
  { id: 'slips',      label: 'Salary Slips',    icon: FileText },
  { id: 'reports',    label: 'Reports',         icon: BarChart2 },
  { id: 'audit',      label: 'Audit Logs',      icon: ClipboardList },
];

const PayrollModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div>
      {/* Module Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IndianRupee size={20} className="text-blue-600" /> Payroll Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Admin-only — salary setup, generation, slips & reports</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-6 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'dashboard' && <DashboardTab onNavigate={setActiveTab} />}
          {activeTab === 'setup'     && <SalarySetupTab />}
          {activeTab === 'generate'  && <GenerateTab />}
          {activeTab === 'slips'     && <SlipsTab />}
          {activeTab === 'reports'   && <ReportsTab />}
          {activeTab === 'audit'     && <AuditLogsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PayrollModule;
