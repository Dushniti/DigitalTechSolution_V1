import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, Edit, Trash2, X, AlertCircle, RefreshCw, Briefcase, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import config from '../../config';

const WorkOrderManagement = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const getRoleFromToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)).role;
    } catch { return null; }
  };

  const getAuthHeaders = () => ({
    'Authorization': localStorage.getItem('adminToken') || '',
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    setRole(getRoleFromToken());
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [woRes, custRes, empRes, quoteRes] = await Promise.all([
        fetch(`${config.apiUrl}/work-orders`, { headers }),
        fetch(`${config.apiUrl}/customers`, { headers }),
        fetch(`${config.apiUrl}/users`, { headers }), // Fetching users/employees
        fetch(`${config.apiUrl}/quotations?status=Approved`, { headers }) // only fetch approved
      ]);

      const woData = await woRes.json();
      const custData = await custRes.json();
      const empData = await empRes.json();
      const quoteData = await quoteRes.json();

      if (woData.success) setWorkOrders(woData.data);
      if (custData.success) setCustomers(custData.data);
      if (empData.success) {
        // Filter users who are actually employees/managers, not users
        setEmployees(empData.data.filter(u => u.role === 'employee' || u.role === 'manager' || u.role === 'Admin'));
      }
      if (quoteData.success) setQuotations(quoteData.data);

    } catch (err) {
      setError('Failed to load data');
    } finally { setLoading(false); }
  };

  const initialForm = {
    work_order_number: '',
    customer_id: '',
    quotation_id: '',
    assigned_employee: '',
    start_date: new Date().toISOString().split('T')[0],
    expected_completion_date: '',
    priority: 'Medium',
    status: 'Pending',
    notes: ''
  };

  const [form, setForm] = useState(initialForm);

  const handleQuotationSelect = (qId) => {
    const quote = quotations.find(q => q._id === qId);
    if (quote) {
      setForm(prev => ({
        ...prev,
        quotation_id: qId,
        customer_id: quote.customer_id,
        notes: `Converted from Quotation ${quote.quotation_number}\n\n${quote.notes || ''}`
      }));
    } else {
      setForm(prev => ({ ...prev, quotation_id: qId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${config.apiUrl}/work-orders/${editingId}` : `${config.apiUrl}/work-orders`;
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = { ...form };
      if (!payload.quotation_id) delete payload.quotation_id;
      if (!payload.assigned_employee) delete payload.assigned_employee;

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchData();
      } else {
        setError(data.message || 'Action failed');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this work order?')) return;
    try {
      await fetch(`${config.apiUrl}/work-orders/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      fetchData();
    } catch {}
  };

  const filteredWO = workOrders.filter(wo => {
    const matchesSearch = wo.work_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          wo.customerDetails?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? wo.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Work Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage jobs and assign work</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-colors">
            <Plus size={20} /> Create Work Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search work order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Work Order List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWO.map(wo => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={wo._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">WO #: {wo.work_order_number}</span>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{wo.customerDetails?.company_name || 'Unknown Customer'}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0
                ${wo.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  wo.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  wo.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  wo.status === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'}`}>
                {wo.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Briefcase size={16} className="text-gray-400" />
                Assignee: <span className="font-medium text-gray-900 dark:text-white">{wo.employeeDetails ? wo.employeeDetails.email : <span className="text-orange-500">Unassigned</span>}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock size={16} className="text-gray-400" />
                Due: <span className="font-medium text-gray-900 dark:text-white">{wo.expected_completion_date ? new Date(wo.expected_completion_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                 <span className="text-gray-500">Priority: <strong className={`
                   ${wo.priority==='High' || wo.priority==='Urgent' ? 'text-red-500': 'text-gray-800 dark:text-gray-200'}
                 `}>{wo.priority}</strong></span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => { setForm(wo); setEditingId(wo._id); setShowForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Edit size={16}/></button>
              {(role === 'Admin' || role === 'Company Admin') && (
                <button onClick={() => handleDelete(wo._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Trash2 size={16}/></button>
              )}
            </div>
          </motion.div>
        ))}
        {filteredWO.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500">No work orders found.</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Work Order' : 'Create Work Order'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Link Approved Quotation</label>
                  <select value={form.quotation_id} onChange={(e) => handleQuotationSelect(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white">
                    <option value="">None (Standalone Work Order)</option>
                    {quotations.map(q => <option key={q._id} value={q._id}>{q.quotation_number} - {q.customerDetails?.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Customer*</label>
                  <select required value={form.customer_id} onChange={(e) => setForm({...form, customer_id: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white">
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.company_name || c.contact_person}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Assign Employee</label>
                  <select value={form.assigned_employee} onChange={(e) => setForm({...form, assigned_employee: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white">
                    <option value="">Unassigned</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.email} ({emp.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Due Date</label>
                  <input type="date" value={form.expected_completion_date} onChange={(e) => setForm({...form, expected_completion_date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Work Details / Notes</label>
                <textarea rows="4" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white"></textarea>
              </div>

              {editingId && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Status</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl font-semibold text-gray-600 border border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">Save Work Order</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderManagement;
