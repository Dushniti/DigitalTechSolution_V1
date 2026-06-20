import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw, Mail, Phone, Hash } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    userId: '', name: '', email: '', phone: '', employeeCode: '',
    departmentId: '', designationId: '', joiningDate: '', status: 'Active'
  });

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, desigRes, usersRes] = await Promise.all([
        fetch(`${config.apiUrl}/employees`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/departments`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/designations`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/users`, { headers: authHeaders() }),
      ]);
      const empData = await empRes.json();
      const deptData = await deptRes.json();
      const desigData = await desigRes.json();
      const usersData = await usersRes.json();

      if (empData.success) setEmployees(empData.employees || []);
      if (deptData.success) setDepartments(deptData.data || []);
      if (desigData.success) setDesignations(desigData.data || []);
      if (usersData.success) setUsers(usersData.data || []);
    } catch (err) {
      setError('Network error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingEmp ? 'PUT' : 'POST';
      const url = editingEmp
        ? `${config.apiUrl}/employees/${editingEmp._id}`
        : `${config.apiUrl}/employees`;

      const payload = { ...formData };
      if (!payload.userId || payload.userId.trim() === '') {
        delete payload.userId;
      } else {
        payload.userId = payload.userId.trim();
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
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error saving employee record');
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
      if (data.success) fetchData();
      else alert(data.message);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openModal = (emp = null) => {
    setEditingEmp(emp);
    setFormData(emp ? {
      userId: emp.userId || '', name: emp.name, email: emp.email,
      phone: emp.phone || '', employeeCode: emp.employeeCode || '',
      departmentId: emp.departmentId || '', designationId: emp.designationId || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      status: emp.status || 'Active'
    } : {
      userId: '', name: '', email: '', phone: '', employeeCode: '',
      departmentId: '', designationId: '', joiningDate: '', status: 'Active'
    });
    setShowModal(true);
  };

  const getDeptName = (id) => departments.find(d => d._id === id)?.name || '-';
  const getDesigName = (id) => designations.find(d => d._id === id)?.title || '-';

  return (
    <div>
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
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500">No employees found</td></tr>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl my-auto">
            <h3 className="text-xl font-bold mb-4">{editingEmp ? 'Edit' : 'Add'} Employee</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Linked User Account ID (Optional)</label>
                <input
                  list="user-accounts"
                  value={formData.userId}
                  onChange={e => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent"
                  placeholder="Select or paste User ID..."
                />
                <datalist id="user-accounts">
                  {users.filter(u => u.role !== 'Admin').map(u => (
                    <option key={u._id} value={u._id}>{u.email} ({u.role})</option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Employee Code</label>
                <input required value={formData.employeeCode} onChange={e => setFormData({ ...formData, employeeCode: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Joining Date</label>
                <input type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Department</label>
                <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-slate-800">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Designation</label>
                <select value={formData.designationId} onChange={e => setFormData({ ...formData, designationId: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-slate-800">
                  <option value="">Select Designation</option>
                  {designations.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-slate-800">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesTab;
