import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, AlertCircle, RefreshCw, Save, User as UserIcon } from 'lucide-react';
import config from '../../config';

const ALL_MODULES = [
  {
    group: 'Core / HR',
    items: [
      { id: 'overview', label: 'Dashboard Overview' },
      { id: 'attendance', label: 'Attendance' },
      { id: 'leaves', label: 'Leaves' },
      { id: 'regularization', label: 'Regularization' },
      { id: 'salary', label: 'Payroll' },
      { id: 'organization', label: 'Organization & Staff' },
      { id: 'hr-settings', label: 'HR Settings' },
    ]
  },
  {
    group: 'Master / Admin',
    items: [
      { id: 'users', label: 'Auth Users' },
      { id: 'master', label: 'Job Master' },
      { id: 'branches', label: 'Branches' },
      { id: 'company-master', label: 'Company Master' },
      { id: 'office-locations', label: 'Office Locations' },
      { id: 'role-management', label: 'Role Management' },
    ]
  },
  {
    group: 'CRM & Inventory',
    items: [
      { id: 'customers', label: 'Customers' },
      { id: 'vendors', label: 'Vendors' },
      { id: 'product-categories', label: 'Product Categories' },
      { id: 'products', label: 'Products' },
    ]
  },
  {
    group: 'Sales & Ops',
    items: [
      { id: 'quotations', label: 'Quotations' },
      { id: 'work-orders', label: 'Work Orders' },
      { id: 'my-tasks', label: 'My Tasks' },
    ]
  },
  {
    group: 'Finance',
    items: [
      { id: 'invoices', label: 'Invoices' },
      { id: 'payments', label: 'Payments & Receipts' },
      { id: 'ledger', label: 'Ledger' },
      { id: 'expense-categories', label: 'Expense Categories' },
      { id: 'expenses', label: 'Expenses' },
      { id: 'expense-ledger', label: 'Expense Ledger' },
      { id: 'accounting-dashboard', label: 'Finance Analytics' },
    ]
  },
  {
    group: 'Others / SaaS',
    items: [
      { id: 'documents', label: 'Documents' },
      { id: 'settings', label: 'Settings' },
      { id: 'reports', label: 'Reports' },
      { id: 'geo-reports', label: 'Geo Reports' },
      { id: 'contacts', label: 'Messages' },
      { id: 'plans', label: 'SaaS Plans' },
      { id: 'company-subscriptions', label: 'SaaS Subscriptions' },
      { id: 'billing', label: 'Billing' },
      { id: 'white-label', label: 'White Labeling' },
      { id: 'api-keys', label: 'API Keys' },
      { id: 'announcements', label: 'Announcements' },
    ]
  }
];

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': getToken() || '',
});

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/users`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch users.');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleManageAccess = (user) => {
    setSelectedUser(user);
    setSelectedModules(user.accessibleModules || []);
  };

  const toggleModule = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = (groupItems, isSelectAll) => {
    const itemIds = groupItems.map(item => item.id);
    if (isSelectAll) {
      setSelectedModules(prev => [...new Set([...prev, ...itemIds])]);
    } else {
      setSelectedModules(prev => prev.filter(id => !itemIds.includes(id)));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSaveLoading(true);
    try {
      const payload = { accessibleModules: selectedModules };
      
      const res = await fetch(`${config.apiUrl}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Access permissions updated successfully.');
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(data.message || 'Failed to update access permissions.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClearPermissions = async () => {
    if (!selectedUser) return;
    setSaveLoading(true);
    try {
      // Removing custom permissions falls back to default role rules
      const res = await fetch(`${config.apiUrl}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ accessibleModules: null }), // Send null to clear
      });
      const data = await res.json();
      if (data.success) {
        showToast('Permissions reset to default role behavior.');
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(data.message || 'Failed to clear permissions.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSaveLoading(false);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Role & Access Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Control module access at the per-user level</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && !selectedUser && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">User Info</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Access Control</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{user.name || user.employeeData?.name || 'Unnamed User'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'Company Admin' ? 'bg-indigo-100 text-indigo-700' :
                        user.role === 'HR' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.accessibleModules ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <Check size={12} /> Custom ({user.accessibleModules.length})
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100">
                          Default Role Based
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleManageAccess(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Shield size={14} /> Manage Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield size={18} className="text-blue-500" /> 
                    Manage Module Access
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Configuring specific module access for <strong className="text-gray-800 dark:text-gray-200">{selectedUser.name || selectedUser.email}</strong> ({selectedUser.role})
                  </p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/50">
                <div className="mb-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-300">
                  <strong className="font-semibold">Note:</strong> When you assign custom modules, the user will <b>only</b> be able to see and access the modules you select here, overriding their default role permissions.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ALL_MODULES.map((group, idx) => {
                    const allSelected = group.items.every(item => selectedModules.includes(item.id));
                    return (
                      <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{group.group}</h4>
                          <button 
                            onClick={() => handleSelectAll(group.items, !allSelected)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="space-y-3">
                          {group.items.map(item => (
                            <label key={item.id} className="flex items-start gap-3 cursor-pointer group/label" onClick={(e) => { e.preventDefault(); toggleModule(item.id); }}>
                              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                selectedModules.includes(item.id)
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'bg-white border-gray-300 dark:border-slate-600 dark:bg-slate-800 group-hover/label:border-blue-400'
                              }`}>
                                {selectedModules.includes(item.id) && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                                {item.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-white dark:bg-slate-900 rounded-b-2xl">
                <button 
                  onClick={handleClearPermissions}
                  disabled={saveLoading}
                  className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  Reset to Default Role Access
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedUser(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={handleSavePermissions}
                    disabled={saveLoading}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2"
                  >
                    {saveLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                    Save Access Control
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManagement;
