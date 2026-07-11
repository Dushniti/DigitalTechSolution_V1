import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw, Mail, Phone, Eye, EyeOff, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

// ─── Password strength helper ─────────────────────────────────────────────────
const getPasswordStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { level: score, label: 'Medium', color: 'bg-amber-400' };
  return { level: score, label: 'Strong', color: 'bg-emerald-500' };
};

const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    departmentId: '', designationId: '', joiningDate: '', status: 'Active',
    loginPassword: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createLogin, setCreateLogin] = useState(true);
  const [formError, setFormError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, desigRes] = await Promise.all([
        fetch(`${config.apiUrl}/employees`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/departments`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/designations`, { headers: authHeaders() }),
      ]);
      const empData = await empRes.json();
      const deptData = await deptRes.json();
      const desigData = await desigRes.json();

      if (empData.success) setEmployees(empData.employees || []);
      if (deptData.success) setDepartments(deptData.data || []);
      if (desigData.success) setDesignations(desigData.data || []);
    } catch (err) {
      setError('Network error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!editingEmp && createLogin) {
      if (!formData.loginPassword || formData.loginPassword.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (formData.loginPassword !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
    }

    try {
      const method = editingEmp ? 'PUT' : 'POST';
      const url = editingEmp
        ? `${config.apiUrl}/employees/${editingEmp._id}`
        : `${config.apiUrl}/employees`;

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        designationId: formData.designationId,
        joiningDate: formData.joiningDate,
        status: formData.status,
      };

      if (!editingEmp && createLogin && formData.loginPassword) {
        payload.loginPassword = formData.loginPassword;
      }

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        fetchData();
        showToast(
          data.data?.loginCreated
            ? `✅ Employee created! Login: ${formData.email} | Password: ${formData.loginPassword}`
            : data.message || 'Employee saved successfully.',
          'success'
        );
      } else {
        setFormError(data.message || 'Failed to save employee.');
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee record?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/employees/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        showToast('Employee deleted successfully.');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  const openModal = (emp = null) => {
    setEditingEmp(emp);
    setFormError('');
    setCreateLogin(true);
    setShowPassword(false);
    setFormData(emp ? {
      name: emp.name, email: emp.email,
      phone: emp.phone || '',
      departmentId: emp.departmentId || '', designationId: emp.designationId || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      status: emp.status || 'Active',
      loginPassword: '', confirmPassword: '',
    } : {
      name: '', email: '', phone: '',
      departmentId: '', designationId: '', joiningDate: '', status: 'Active',
      loginPassword: '', confirmPassword: '',
    });
    setShowModal(true);
  };

  const getDeptName = (id) => departments.find(d => d._id === id)?.name || '-';
  const getDesigName = (id) => designations.find(d => d._id === id)?.title || '-';
  const pwdStrength = getPasswordStrength(formData.loginPassword);

  return (
    <div>
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl text-sm font-semibold shadow-xl text-white transition-all max-w-sm ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Employees Directory</h3>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Login</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-500">No employees found</td></tr>
            ) : (
              employees.map(e => (
                <tr key={e._id} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {e.name}
                      {e.employeeCode && <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-[10px] font-bold text-gray-500">{e.employeeCode}</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Joined: {e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400"><Mail size={12} /> {e.email}</div>
                    {e.phone && <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1"><Phone size={12} /> {e.phone}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{getDesigName(e.designationId)}</div>
                    <div className="text-xs text-gray-500">{getDeptName(e.departmentId)}</div>
                  </td>
                  <td className="py-3 px-4">
                    {e.userId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <ShieldCheck size={11} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-slate-700">
                        No Login
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${e.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex justify-end gap-2">
                    <button onClick={() => openModal(e)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(e._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl my-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
              {editingEmp ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              {editingEmp ? 'Update employee details.' : 'Fill in the details and set login credentials for the employee.'}
            </p>

            {formError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Email Address *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Joining Date</label>
                  <input type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Department</label>
                  <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Designation</label>
                  <select value={formData.designationId} onChange={e => setFormData({ ...formData, designationId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>

              {/* ── Login Access — only on ADD ─────────────────────────────── */}
              {!editingEmp && (
                <div className="border border-blue-100 dark:border-slate-700 rounded-2xl p-4 bg-blue-50/40 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white">
                        <KeyRound size={14} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Login Access</p>
                        <p className="text-xs text-gray-400">Employee can login to dashboard with these credentials</p>
                      </div>
                    </div>
                    {/* Toggle switch */}
                    <button type="button" onClick={() => setCreateLogin(!createLogin)}
                      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${createLogin ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${createLogin ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {createLogin ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {/* Login Email (auto filled, read-only) */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Login Email</label>
                        <div className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Mail size={13} className="shrink-0" />
                          <span className="truncate">{formData.email || <em>Enter email above first</em>}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Same as employee email address</p>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Set Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.loginPassword}
                            onChange={e => setFormData({ ...formData, loginPassword: e.target.value })}
                            placeholder="Min. 6 characters"
                            className="w-full px-3 py-2 pr-10 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {/* Strength bar */}
                        {formData.loginPassword && (
                          <div className="mt-1.5">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwdStrength.level ? pwdStrength.color : 'bg-gray-200 dark:bg-slate-700'}`} />
                              ))}
                            </div>
                            <p className={`text-[10px] mt-0.5 font-semibold ${pwdStrength.level <= 1 ? 'text-red-500' : pwdStrength.level <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {pwdStrength.label}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Confirm Password *</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Re-enter password"
                          className={`w-full px-3 py-2 text-sm rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${formData.confirmPassword && formData.confirmPassword !== formData.loginPassword
                            ? 'border-red-400 dark:border-red-600'
                            : 'border-gray-200 dark:border-slate-700'
                            }`}
                        />
                        {formData.confirmPassword && formData.confirmPassword !== formData.loginPassword && (
                          <p className="text-[10px] text-red-500 mt-0.5">Passwords do not match</p>
                        )}
                        {formData.confirmPassword && formData.confirmPassword === formData.loginPassword && (
                          <p className="text-[10px] text-emerald-500 mt-0.5 flex items-center gap-1">
                            <UserCheck size={10} /> Passwords match
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      Employee will be created <strong>without login access</strong>. You can add login later from Auth Users.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
                  {editingEmp
                    ? <><Edit2 size={14} /> Update Employee</>
                    : <><Plus size={14} /> {createLogin ? 'Create Employee + Login' : 'Create Employee'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesTab;
