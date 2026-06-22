import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, LayoutDashboard, Users, MessageSquare,
  Pencil, Trash2, X, Check, AlertCircle, RefreshCw, Mail, Phone, Calendar, UserPlus, Home, Eye, Clock, CalendarDays, IndianRupee, ClipboardList, Building, Settings, Bell, FileText, BarChart2, Menu, Briefcase
} from 'lucide-react';
import config from '../config';

// ─── Auth helper ──────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': getToken() || '',
});
const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const payload = actualToken.split('.')[1];
    return JSON.parse(atob(payload)).role;
  } catch (e) {
    return null;
  }
};

import PayrollModule from './PayrollModule';
import RegularizationModule from './RegularizationModule';
import DashboardOverview from './dashboard/DashboardOverview';
import OrganizationModule from './OrganizationModule';
import HRSettingsModule from './HRSettingsModule';
import DocumentModule from './DocumentModule';
import ReportsModule from './ReportsModule';
import MasterModule from './MasterModule';

// ─── Edit User Modal ───────────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose, onSaved }) => {
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user.role || 'employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Build only changed / non-empty fields
    const payload = { email, role };
    if (password) payload.password = password;

    try {
      const res = await fetch(`${config.apiUrl}/users/${user._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        setError(data.message || 'Update failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit User</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Update email, password or role</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* New Password (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              New Password <span className="font-normal text-gray-400 dark:text-gray-500">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={password ? 6 : undefined}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
            <div className="flex gap-2">
              {['user', 'employee', 'HR', 'Admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${role === r
                    ? r === 'Admin'
                      ? 'bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-300'
                      : r === 'HR'
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-200'
                        : r === 'employee'
                          ? 'bg-green-600 border-green-600 text-white shadow-sm shadow-green-300'
                          : 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-300'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {r === 'employee' ? 'Employee' : r === 'user' ? 'User' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Check size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Create User Modal ───────────────────────────────────────────────────────────
const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated();
      } else {
        setError(data.message || 'Failed to create user.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New User</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Set email, password and role</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
            <div className="flex gap-2">
              {['user', 'employee', 'HR', 'Admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${role === r
                    ? r === 'Admin'
                      ? 'bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-300'
                      : r === 'HR'
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-200'
                        : r === 'employee'
                          ? 'bg-green-600 border-green-600 text-white shadow-sm shadow-green-300'
                          : 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-300'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {r === 'employee' ? 'Employee' : r === 'user' ? 'User' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><UserPlus size={15} /> Create User</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Users Module ─────────────────────────────────────────────────────────────
const UsersModule = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserRole = getRoleFromToken();
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState('');

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
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast('User deleted successfully.');
        setDeleteConfirm(null);
        fetchUsers();
      } else {
        setError(data.message || 'Failed to delete user.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            showToast('User created successfully.');
            fetchUsers();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            showToast('User updated successfully.');
            fetchUsers();
          }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-6 text-center"
          >
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600 dark:text-red-400" size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone. User <strong className="text-gray-700 dark:text-gray-200">{deleteConfirm.email}</strong> will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{users.length} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white shadow-sm shadow-blue-300 transition-all"
          >
            <UserPlus size={15} /> Create User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee Profile</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 dark:text-slate-500 font-mono text-xs">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.employeeData ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-200">{user.employeeData.name}</div>
                          <div className="text-xs text-gray-500">{user.employeeData.employeeCode || 'No Code'}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unlinked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === 'Admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : user.role === 'HR'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : user.role === 'employee'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {user.role === 'employee' ? 'Employee' : user.role === 'user' ? 'User' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        {currentUserRole === 'Admin' && (
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Trash2 size={12} /> Delete
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

// ─── View Message Modal ───────────────────────────────────────────────────────
const ViewMessageModal = ({ contact: c, onClose }) => (
  <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold text-base shrink-0">
            {c.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${c.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              c.status === 'read' ? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>{c.status || 'new'}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* Contact info */}
      <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
        {c.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Mail size={14} className="shrink-0 text-blue-500" /> {c.email}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Phone size={14} className="shrink-0 text-blue-500" /> {c.phone}
        </div>
        {c.submittedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar size={14} className="shrink-0 text-blue-500" />
            {new Date(c.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Full message */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Message</p>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 max-h-64 overflow-y-auto">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{c.message}</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
      >
        Close
      </button>
    </motion.div>
  </div>
);

// ─── Contacts Module ──────────────────────────────────────────────────────────
const ContactsModule = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [viewContact, setViewContact] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/contacts`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setContacts(data.data || []);
        setCurrentPage(1); // reset to first page on refresh
      } else {
        setError(data.message || 'Failed to fetch contacts.');
      }
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  // ── Pagination calc ──
  const totalPages = Math.max(1, Math.ceil(contacts.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const paginated = contacts.slice(startIndex, startIndex + perPage);

  const handlePerPageChange = (val) => {
    setPerPage(val);
    setCurrentPage(1);
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // Build page numbers with ellipsis
  const buildPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      {/* View Message Modal */}
      <AnimatePresence>
        {viewContact && (
          <ViewMessageModal contact={viewContact} onClose={() => setViewContact(null)} />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {contacts.length} total &bull; showing {startIndex + 1}–{Math.min(startIndex + perPage, contacts.length)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Per-page selector */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="hidden sm:inline font-medium">Show:</span>
            <div className="flex rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              {[10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePerPageChange(n)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${perPage === n
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No messages yet</p>
        </div>
      ) : (
        <>
          {/* ── Cards grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <AnimatePresence mode="wait">
              {paginated.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {c.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</p>
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${c.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          c.status === 'read' ? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>{c.status || 'new'}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {c.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Mail size={12} /> {c.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Phone size={12} /> {c.phone}
                    </div>
                    {c.submittedAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={12} /> {new Date(c.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{c.message}</p>
                    {(c.message?.length > 60 || c.message?.includes('\n')) && (
                      <button
                        onClick={() => setViewContact(c)}
                        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Eye size={12} /> View full message
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Pagination bar ── */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page <span className="font-semibold text-gray-800 dark:text-gray-200">{currentPage}</span> of <span className="font-semibold text-gray-800 dark:text-gray-200">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {buildPageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === currentPage
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700'
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};



// ─── Attendance Module ────────────────────────────────────────────────────────
const AttendanceModule = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayStatus, setTodayStatus] = useState(null); // { loginTime, logoutTime }
  const [clockLoading, setClockLoading] = useState(false);
  const currentUserRole = getRoleFromToken();
  const [toast, setToast] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmail, setFilterEmail] = useState('');

  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ attendanceId: '', date: '', punchInTime: '', punchOutTime: '', reason: '' });
  const [regLoading, setRegLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterDate) queryParams.append('date', filterDate);
      if (filterEmail && currentUserRole === 'Admin') queryParams.append('email', filterEmail);

      const res = await fetch(`${config.apiUrl}/attendance?${queryParams.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch attendance.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayStatus = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/attendance/today`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setTodayStatus(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkTodayStatus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterDate, filterEmail]);

  const handleClockAction = async (action) => { // 'login' or 'logout'
    setClockLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/attendance/${action}`, {
        method: 'POST',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        checkTodayStatus();
        fetchAttendance();
      } else {
        setError(data.message || `Failed to punch ${action === 'login' ? 'in' : 'out'}.`);
      }
    } catch {
      setError('Network error.');
    } finally {
      setClockLoading(false);
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/regularization`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setShowRegModal(false);
        fetchAttendance();
      } else {
        setError(data.message || 'Failed to submit request.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setRegLoading(false);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage daily punch-ins</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">

          {/* Compact Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-1 shadow-sm">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent border-none text-xs text-gray-600 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer w-[110px] p-1"
            />
            {currentUserRole === 'Admin' && (
              <>
                <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                <input
                  type="text"
                  placeholder="Email..."
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="bg-transparent border-none text-xs text-gray-600 dark:text-gray-300 focus:ring-0 outline-none w-24 p-1 placeholder-gray-400"
                />
              </>
            )}
            <button
              onClick={fetchAttendance}
              className="ml-1 p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center"
              title="Search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
            {(filterDate || filterEmail) && (
              <button
                onClick={() => { setFilterDate(''); setFilterEmail(''); setTimeout(fetchAttendance, 100); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                title="Clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button onClick={fetchAttendance} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>

          {currentUserRole !== 'Admin' && (
            <div className="flex gap-2">
              {!todayStatus ? (
                <button onClick={() => handleClockAction('login')} disabled={clockLoading} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 text-white shadow-sm transition-all">
                  <Clock size={14} /> Punch In
                </button>
              ) : !todayStatus.punchOutTime ? (
                <button onClick={() => handleClockAction('logout')} disabled={clockLoading} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 text-white shadow-sm transition-all">
                  <Clock size={14} /> Punch Out
                </button>
              ) : (
                <span className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400">
                  Punched Out for Today
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Clock className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 font-medium">No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  {currentUserRole === 'Admin' && <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">User</th>}
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Punch In</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Punch Out</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{r.date}</td>
                    {currentUserRole === 'Admin' && <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{r.email}</td>}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {r.punchInTime ? new Date(r.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {r.status === 'Present' && !r.punchOutTime ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Incomplete
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {r.status}
                        </span>
                      )}

                      {currentUserRole !== 'Admin' && (
                        <button
                          onClick={() => {
                            setRegForm({
                              attendanceId: r._id,
                              date: r.date,
                              punchInTime: r.punchInTime ? new Date(r.punchInTime).toISOString().slice(0, 16) : '',
                              punchOutTime: r.punchOutTime ? new Date(r.punchOutTime).toISOString().slice(0, 16) : '',
                              reason: ''
                            });
                            setShowRegModal(true);
                          }}
                          className="ml-3 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          Regularize
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Regularize Attendance</h3>
                <button onClick={() => setShowRegModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleRegularizeSubmit} className="p-6 space-y-5">
                <p className="text-sm text-gray-500">Regularizing for date: <strong>{regForm.date}</strong></p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Actual Punch In Time</label>
                  <input type="datetime-local" value={regForm.punchInTime} onChange={(e) => setRegForm({ ...regForm, punchInTime: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Actual Punch Out Time</label>
                  <input type="datetime-local" value={regForm.punchOutTime} onChange={(e) => setRegForm({ ...regForm, punchOutTime: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reason / Justification</label>
                  <textarea value={regForm.reason} onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })} rows="3" className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none" placeholder="E.g., Forgot to punch out, system error" required></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={regLoading} className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {regLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Leaves Module ────────────────────────────────────────────────────────
const LeavesModule = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const currentUserRole = getRoleFromToken();
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({ type: 'Sick', startDate: '', endDate: '', reason: '' });
  const [applyLoading, setApplyLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/leaves`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setLeaves(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch leaves.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/leaves`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Leave applied successfully.');
        setShowApplyModal(false);
        setForm({ type: 'Sick', startDate: '', endDate: '', reason: '' });
        fetchLeaves();
      } else {
        setError(data.message || 'Failed to apply leave.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`${config.apiUrl}/leaves/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Leave ${status}.`);
        fetchLeaves();
      } else {
        setError(data.message || 'Failed to update status.');
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

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Leave Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Paid">Paid Leave</option>
                </select>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                  Note: You are allotted 2.5 paid leaves per month. Any approved leaves exceeding this quota will be marked as Unpaid (Loss of Pay) and deducted from your salary.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
                  <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reason</label>
                <textarea required rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={applyLoading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  {applyLoading ? 'Submitting...' : 'Submit Leave'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leave Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage leaves</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLeaves} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>

          {currentUserRole !== 'Admin' && (
            <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 text-white shadow-sm transition-all">
              <CalendarDays size={15} /> Apply Leave
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CalendarDays className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 font-medium">No leave records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  {currentUserRole === 'Admin' && <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">User</th>}
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  {currentUserRole === 'Admin' && <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {leaves.map((l, i) => (
                  <tr key={l._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{l.type}</td>
                    {currentUserRole === 'Admin' && <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{l.email}</td>}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{l.startDate} to {l.endDate}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={l.reason}>{l.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold 
                        ${l.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          l.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {l.status}
                      </span>
                    </td>
                    {currentUserRole === 'Admin' && (
                      <td className="px-6 py-4 text-right">
                        {l.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleStatusUpdate(l._id, 'Approved')} className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-semibold">Approve</button>
                            <button onClick={() => handleStatusUpdate(l._id, 'Rejected')} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-semibold">Reject</button>
                          </div>
                        )}
                      </td>
                    )}
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
    if (hash.startsWith('dashboard/')) {
      return hash.split('/')[1] || 'overview';
    }
    return 'overview';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
      if (hash === 'dashboard') {
        setActiveTab('overview');
      } else if (hash.startsWith('dashboard/')) {
        const tab = hash.split('/')[1];
        if (tab) setActiveTab(tab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const token = localStorage.getItem('adminToken');
  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.hash = '';
  };

  const role = getRoleFromToken();
  const navItems = [
    ...(role !== 'employee' ? [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', icon: CalendarDays },
    { id: 'regularization', label: 'Regularization', icon: ClipboardList },
    ...(role === 'Admin' || role === 'HR' ? [{ id: 'salary', label: 'Payroll', icon: IndianRupee }] : []),
    ...(role === 'Admin' ? [{ id: 'users', label: 'Auth Users', icon: Users }] : []),
    ...(role === 'Admin' || role === 'HR' ? [{ id: 'organization', label: 'Org & Staff', icon: Building }] : []),
    ...(role === 'Admin' || role === 'HR' ? [{ id: 'hr-settings', label: 'HR Settings', icon: Settings }] : []),
    ...(role === 'Admin' || role === 'HR' ? [{ id: 'master', label: 'Job Master', icon: Briefcase }] : []),
    { id: 'documents', label: 'Documents', icon: FileText },
    ...(role === 'Admin' || role === 'HR' ? [{ id: 'reports', label: 'Reports', icon: BarChart2 }] : []),
    ...(role !== 'employee' ? [{ id: 'contacts', label: 'Messages', icon: MessageSquare }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden md:overflow-visible">
      {/* ── Mobile Sidebar Overlay ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-200 dark:border-slate-800">
          <a
            href="#home"
            className="flex items-center gap-2.5"
          >
            <img
              src="https://lh3.googleusercontent.com/p/AF1QipNgb3rNsf-wTFuX8iOk_T3vsGKySB2VGSUb3o-D=s1360-w1360-h1020-rw"
              alt="DigitalTechSolution logo"
              className="w-9 h-9 rounded-lg object-cover bg-white ring-1 ring-blue-100 dark:ring-slate-700 shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg'; }}
            />
            <div>
              <p className="text-sm font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent leading-tight">
                DigitalTechSolution
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Management Dashboard</p>
            </div>
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                window.location.hash = `dashboard/${id === 'overview' ? '' : id}`;
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === id
                ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-transparent text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                }`}
            >
              <Icon size={17} />
              {label}
              {activeTab === id && (
                <motion.span layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen md:min-h-screen">
        <header className="mb-6 md:mb-8 flex items-center justify-between gap-4 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-30 pb-2 pt-2 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            >
              <Menu size={22} />
            </button>
            <div className="md:hidden flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">DT</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">DTS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Bell */}
            <div className="relative group">
              <button className="relative p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-all">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-800"></span>
              </button>
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Notifications</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</div>
              </div>
            </div>

            <button
              onClick={() => { sessionStorage.removeItem('_dashRedirected'); window.location.hash = 'home'; }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              <Home size={15} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200 dark:shadow-red-900/30 transition-all"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <DashboardOverview onNavigate={(id) => { window.location.hash = `dashboard/${id === 'overview' ? '' : id}`; }} />}
            {activeTab === 'attendance' && <AttendanceModule />}
            {activeTab === 'leaves' && <LeavesModule />}
            {activeTab === 'regularization' && <RegularizationModule />}
            {activeTab === 'salary' && (role === 'Admin' || role === 'HR') && <PayrollModule />}
            {activeTab === 'users' && role === 'Admin' && <UsersModule />}
            {activeTab === 'organization' && (role === 'Admin' || role === 'HR') && <OrganizationModule />}
            {activeTab === 'hr-settings' && (role === 'Admin' || role === 'HR') && <HRSettingsModule />}
            {activeTab === 'master' && (role === 'Admin' || role === 'HR') && <MasterModule />}
            {activeTab === 'documents' && <DocumentModule />}
            {activeTab === 'reports' && (role === 'Admin' || role === 'HR') && <ReportsModule />}
            {activeTab === 'contacts' && <ContactsModule />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
