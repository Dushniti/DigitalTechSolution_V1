import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw, Clock, CalendarDays, ClipboardList, IndianRupee, Users, Building, Settings, FileText, BarChart2, MessageSquare, ChevronRight, Briefcase, ShoppingBag, Truck, Package, FileCheck, FileSignature, Layers, CreditCard, Palette, Key, Megaphone, Building2, ChevronDown, Search } from 'lucide-react';
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

  // ── Company Filter State (Admin only) ──────────────────────────────────────
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompanyName, setSelectedCompanyName] = useState('All Companies');
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const dropdownRef = useRef(null);
  const isAdmin = () => {
    const token = getToken();
    if (!token) return false;
    try {
      const actual = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const payload = JSON.parse(atob(actual.split('.')[1]));
      return payload.role === 'Admin';
    } catch { return false; }
  };

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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch companies list (Admin only)
  const fetchCompanies = async () => {
    if (!isAdmin()) return;
    try {
      const res = await fetch(`${config.apiUrl}/companies`, { headers: authHeaders() });
      const result = await res.json();
      if (result.success) setCompanies(result.data || []);
    } catch (e) {
      console.error('Failed to fetch companies:', e);
    }
  };

  const fetchDashboardData = async (companyId = selectedCompanyId) => {
    setLoading(true);
    setError('');
    try {
      const url = companyId
        ? `${config.apiUrl}/dashboard-aggregated?companyId=${companyId}`
        : `${config.apiUrl}/dashboard-aggregated`;
      const res = await fetch(url, { headers: authHeaders() });
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
    fetchCompanies();
  }, []);

  const renderDashboard = () => {
    if (!data) return null;
    
    // Normalize role check (Admin acts as HR/Super_Admin here, we treat Admin/super_admin as AdminDashboard)
    const role = data.role?.toLowerCase() || '';
    
    if (role === 'super_admin' || role === 'admin') {
      return <AdminDashboard data={data} loading={loading} onNavigate={onNavigate} selectedCompanyId={selectedCompanyId} selectedCompanyName={selectedCompanyName} />;
    } else if (role === 'hr') {
      return <HRDashboard data={data} loading={loading} onNavigate={onNavigate} />;
    } else if (role === 'manager') {
      return <ManagerDashboard data={data} loading={loading} onNavigate={onNavigate} />;
    } else {
      return <EmployeeDashboard data={data} loading={loading} onNavigate={onNavigate} />;
    }
  };

  // Company filter dropdown (Admin only)
  const renderCompanyFilter = () => {
    if (!isAdmin() || companies.length === 0) return null;

    const filtered = companies.filter(c =>
      c.company_name?.toLowerCase().includes(companySearch.toLowerCase())
    );

    const handleSelect = (id, name) => {
      setSelectedCompanyId(id);
      setSelectedCompanyName(name);
      setCompanyDropdownOpen(false);
      setCompanySearch('');
      fetchDashboardData(id);
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setCompanyDropdownOpen(prev => !prev)}
          className="flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-[180px]"
        >
          <Building2 size={15} className="text-blue-500 flex-shrink-0" />
          <span className="truncate max-w-[130px]">{selectedCompanyName}</span>
          <ChevronDown size={15} className={`ml-auto text-gray-400 transition-transform duration-200 flex-shrink-0 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {companyDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search box */}
            <div className="p-2 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search company..."
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto py-1">
              {/* All Companies option */}
              <button
                onClick={() => handleSelect('', 'All Companies')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  selectedCompanyId === ''
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center flex-shrink-0">
                  <Building2 size={14} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">All Companies</div>
                  <div className="text-xs text-gray-400">Platform-wide view</div>
                </div>
                {selectedCompanyId === '' && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-gray-100 dark:border-slate-800" />

              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">No companies found</div>
              ) : (
                filtered.map(c => (
                  <button
                    key={c._id}
                    onClick={() => handleSelect(c._id, c.company_name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      selectedCompanyId === c._id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {c.company_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium truncate max-w-[170px]">{c.company_name}</div>
                      <div className={`text-xs font-medium ${
                        c.status === 'Active' ? 'text-green-500' :
                        c.status === 'Suspended' ? 'text-red-500' : 'text-gray-400'
                      }`}>{c.status || 'Unknown'}</div>
                    </div>
                    {selectedCompanyId === c._id && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
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
      modules.push({ id: 'branches', label: 'Branches', icon: Building, gradient: 'from-rose-500 to-red-500' });
      modules.push({ id: 'reports', label: 'Reports', icon: BarChart2, gradient: 'from-rose-500 to-pink-500' });
    }
    if (role === 'admin' || role === 'super_admin') {
      modules.push({ id: 'users', label: 'Auth Users', icon: Users, gradient: 'from-cyan-600 to-cyan-400' });
    }
    if (role === 'admin' || role === 'super_admin') {
      modules.push({ id: 'plans', label: 'Plans', icon: Layers, gradient: 'from-blue-600 to-blue-500' });
      modules.push({ id: 'company-subscriptions', label: 'Subscriptions', icon: Users, gradient: 'from-emerald-600 to-green-500' });
    }
    if (role !== 'employee') {
      modules.push({ id: 'contacts', label: 'Messages', icon: MessageSquare, gradient: 'from-violet-500 to-purple-400' });
      modules.push({ id: 'invoices', label: 'Invoices', icon: FileCheck, gradient: 'from-blue-600 to-blue-400' });
      modules.push({ id: 'payments', label: 'Payments', icon: IndianRupee, gradient: 'from-green-600 to-green-400' });
    }
    if (role === 'company admin') {
      modules.push({ id: 'billing', label: 'Billing', icon: CreditCard, gradient: 'from-orange-500 to-red-500' });
      modules.push({ id: 'white-label', label: 'Branding', icon: Palette, gradient: 'from-pink-500 to-rose-500' });
      modules.push({ id: 'api-keys', label: 'API Keys', icon: Key, gradient: 'from-purple-500 to-indigo-500' });
      modules.push({ id: 'announcements', label: 'Announcements', icon: Megaphone, gradient: 'from-blue-500 to-cyan-500' });
    }
    if (role === 'admin' || role === 'super_admin') {
      modules.push({ id: 'announcements', label: 'Announcements', icon: Megaphone, gradient: 'from-blue-500 to-cyan-500' });
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

  const renderCRMStats = () => {
    if (!data || !data.summary) return null;
    const { 
      totalCustomers, totalVendors, totalProducts,
      totalQuotations, pendingQuotations, approvedQuotations,
      totalWorkOrders, pendingWorkOrders, inProgressWorkOrders, completedWorkOrders,
      assignedWorkOrders
    } = data.summary;
    
    if (totalCustomers === undefined && totalQuotations === undefined) return null;
    
    const role = data.role?.toLowerCase() || '';

    return (
      <div className="mb-8 space-y-8">
        {/* Phase 2: Business Overview */}
        {(role !== 'employee') && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Customers</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers || 0}</h3>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Vendors</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalVendors || 0}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Products</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Sales & Operations */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales & Operations</h2>
          
          {role === 'employee' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">My Assigned Tasks</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{assignedWorkOrders || 0}</h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><FileSignature size={20}/></div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Quotations</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-slate-800 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{totalQuotations || 0}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-500">{pendingQuotations || 0}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-500">{approvedQuotations || 0}</div>
                    <div className="text-xs text-gray-500">Approved</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow lg:col-span-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Layers size={20}/></div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Work Orders</h4>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-slate-800 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{totalWorkOrders || 0}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-500">{pendingWorkOrders || 0}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-500">{inProgressWorkOrders || 0}</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-500">{completedWorkOrders || 0}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFinancialStats = () => {
    if (!data || !data.summary) return null;
    const { 
      totalInvoices, paidInvoices, overdueInvoices, totalRevenue, outstandingAmount, totalPaymentsReceived, totalExpenses, netProfit 
    } = data.summary;
    
    if (totalInvoices === undefined) return null;
    
    const role = data.role?.toLowerCase() || '';
    if (role === 'employee') return null;

    return (
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FileCheck size={20}/></div>
              <div className="text-right">
                <div className="text-2xl font-black text-gray-900 dark:text-white">₹{totalRevenue?.toFixed(2) || '0.00'}</div>
                <div className="text-xs font-semibold text-gray-500">Total Billed</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between">
              <span>{totalInvoices || 0} Invoices</span>
              <span className="text-green-600 font-semibold">{paidInvoices || 0} Paid</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><IndianRupee size={20}/></div>
              <div className="text-right">
                <div className="text-2xl font-black text-green-600">₹{totalPaymentsReceived?.toFixed(2) || '0.00'}</div>
                <div className="text-xs font-semibold text-gray-500">Total Collected</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              Payments Received
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><AlertCircle size={20}/></div>
              <div className="text-right">
                <div className="text-2xl font-black text-red-600">₹{outstandingAmount?.toFixed(2) || '0.00'}</div>
                <div className="text-xs font-semibold text-gray-500">Outstanding Balance</div>
              </div>
            </div>
            <div className="text-xs text-red-500 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 font-semibold flex justify-between">
              <span>{overdueInvoices || 0} Overdue Invoices</span>
              <span>Expenses: ₹{totalExpenses?.toFixed(2) || '0'}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                <IndianRupee size={20}/>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {netProfit >= 0 ? '' : '-'}₹{Math.abs(netProfit || 0).toFixed(2)}
                </div>
                <div className="text-xs font-semibold text-gray-500">Net Profit</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              Total Revenue - Total Expenses
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {(!data || data.role?.toLowerCase() !== 'employee') && (
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Welcome to Digital Tech Solution, <span className="font-semibold text-gray-700 dark:text-gray-300">{data?.userName ? data.userName.split(' ')[0] : 'User'}</span>!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Company Filter Dropdown — Admin only */}
            {renderCompanyFilter()}
            <button
              onClick={() => fetchDashboardData()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      )}

      {data && data.role?.toLowerCase() === 'employee' && (
        <div className="flex justify-end mb-4">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {data?.role?.toLowerCase() === 'employee' && renderDashboard()}
      {renderLaunchpad()}
      {renderFinancialStats()}
      {renderCRMStats()}
      {data?.role?.toLowerCase() !== 'employee' && renderDashboard()}
    </div>
  );
};

export default DashboardOverview;
