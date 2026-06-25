import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Save, X, Eye, Download, Paperclip, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({ Authorization: getToken() || '' });
const jsonAuthHeaders = () => ({ 'Content-Type': 'application/json', Authorization: getToken() || '' });

const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(' ')[1].split('.')[1]));
    return payload.role;
  } catch (e) {
    return null;
  }
};

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: '', 
    company_id: '',
    category_id: '', 
    vendor_id: '', 
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    tax_amount: '0',
    total_amount: '',
    payment_method: 'Cash',
    reference_number: '',
    description: '',
    status: 'Pending Approval'
  });
  const [file, setFile] = useState(null);

  const role = getRoleFromToken();

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [
        fetch(`${config.apiUrl}/expenses`, { headers: jsonAuthHeaders() }),
        fetch(`${config.apiUrl}/expense-categories`, { headers: jsonAuthHeaders() }),
        fetch(`${config.apiUrl}/vendors`, { headers: jsonAuthHeaders() })
      ];
      if (role === 'Admin') promises.push(fetch(`${config.apiUrl}/companies`, { headers: jsonAuthHeaders() }));

      const resAll = await Promise.all(promises);
      const expData = await resAll[0].json();
      const catData = await resAll[1].json();
      const venData = await resAll[2].json();
      
      if (expData.success) setExpenses(expData.data);
      if (catData.success) setCategories(catData.data.filter(c => c.status === 'Active'));
      if (venData.success) setVendors(venData.data.filter(v => v.status === 'Active'));

      if (role === 'Admin' && resAll[3]) {
        const compData = await resAll[3].json();
        if (compData.success) setCompanies(compData.data.filter(c => c.status === 'Active'));
      }
    } catch (err) {
      setError('Network error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Recalculate total
  useEffect(() => {
    const amt = parseFloat(formData.amount) || 0;
    const tax = parseFloat(formData.tax_amount) || 0;
    setFormData(prev => ({ ...prev, total_amount: (amt + tax).toFixed(2) }));
  }, [formData.amount, formData.tax_amount]);

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setFormData({ 
        id: expense._id, 
        company_id: expense.company_id || '',
        category_id: expense.category_id, 
        vendor_id: expense.vendor_id || '', 
        expense_date: expense.expense_date.split('T')[0],
        amount: expense.amount,
        tax_amount: expense.tax_amount,
        total_amount: expense.total_amount,
        payment_method: expense.payment_method,
        reference_number: expense.reference_number || '',
        description: expense.description || '',
        status: expense.status
      });
      setIsEditing(true);
    } else {
      setFormData({ 
        id: '', 
        company_id: '',
        category_id: categories.length > 0 ? categories[0]._id : '', 
        vendor_id: '', 
        expense_date: new Date().toISOString().split('T')[0],
        amount: '',
        tax_amount: '0',
        total_amount: '',
        payment_method: 'Cash',
        reference_number: '',
        description: '',
        status: 'Pending Approval'
      });
      setIsEditing(false);
    }
    setFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const url = isEditing 
      ? `${config.apiUrl}/expenses/${formData.id}`
      : `${config.apiUrl}/expenses`;
      
    const method = isEditing ? 'PUT' : 'POST';

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'id') submitData.append(key, formData[key]);
    });
    if (file) submitData.append('attachment', file);

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(), // Don't set Content-Type for FormData, browser does it
        body: submitData
      });
      const result = await res.json();
      
      if (result.success) {
        fetchData();
        handleCloseModal();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Network error during save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/expenses/${id}`, {
        method: 'DELETE',
        headers: jsonAuthHeaders()
      });
      const result = await res.json();
      if (result.success) fetchData();
      else alert(result.message);
    } catch (err) {
      alert('Network error during delete');
    }
  };

  const handleChangeStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this expense?`)) return;
    try {
      const res = await fetch(`${config.apiUrl}/expenses/${id}/status`, {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (result.success) fetchData();
      else alert(result.message);
    } catch (err) {
      alert('Network error during status change');
    }
  };

  const downloadAttachment = async (id, filename) => {
    try {
      const res = await fetch(`${config.apiUrl}/expenses/${id}/attachment`, { headers: authHeaders() });
      if (!res.ok) throw new Error('File not found');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.expense_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.categoryDetails?.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.vendorDetails?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Record and manage company expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading expenses...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Expense No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Attachment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No expenses found.</td></tr>
                ) : (
                  filteredExpenses.map(exp => (
                    <tr key={exp._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {exp.expense_number}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(exp.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {exp.categoryDetails?.category_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {exp.vendorDetails?.company_name || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        ₹{exp.total_amount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          exp.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          exp.status === 'Rejected' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {exp.status === 'Approved' ? <CheckCircle size={14} /> : 
                           exp.status === 'Rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {exp.attachment ? (
                          <button 
                            onClick={() => downloadAttachment(exp._id, exp.attachment)}
                            className="inline-flex items-center justify-center p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Download Attachment"
                          >
                            <Paperclip size={18} />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(role === 'Admin' || role === 'Company Admin') && exp.status === 'Pending Approval' && (
                            <>
                              <button onClick={() => handleChangeStatus(exp._id, 'Approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Approve"><CheckCircle size={16} /></button>
                              <button onClick={() => handleChangeStatus(exp._id, 'Rejected')} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Reject"><XCircle size={16} /></button>
                            </>
                          )}
                          {exp.status !== 'Approved' && (
                            <button onClick={() => handleOpenModal(exp)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                          )}
                          {exp.status !== 'Approved' && (
                            <button onClick={() => handleDelete(exp._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Expense' : 'New Expense'}
                </h3>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
                {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {role === 'Admin' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company (Optional)</label>
                      <select value={formData.company_id} onChange={(e) => setFormData({...formData, company_id: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm">
                        <option value="">Global / Select Company</option>
                        {companies.map(c => <option key={c._id} value={c._id}>{c.company_name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                    <select required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.category_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
                    <input type="date" required value={formData.expense_date} onChange={(e) => setFormData({...formData, expense_date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Vendor (Optional)</label>
                    <select value={formData.vendor_id} onChange={(e) => setFormData({...formData, vendor_id: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm">
                      <option value="">No Vendor</option>
                      {vendors.map(v => <option key={v._id} value={v._id}>{v.company_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Method *</label>
                    <select required value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm">
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount *</label>
                    <input type="number" step="0.01" min="0" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tax Amount</label>
                    <input type="number" step="0.01" min="0" value={formData.tax_amount} onChange={(e) => setFormData({...formData, tax_amount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Amount</label>
                    <input type="number" readOnly value={formData.total_amount} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 dark:border-slate-700 rounded-xl dark:bg-slate-800/50 dark:text-gray-400 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reference No / Txn ID</label>
                    <input type="text" value={formData.reference_number} onChange={(e) => setFormData({...formData, reference_number: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="2" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-sm"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Attachment (Bill / Receipt)</label>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-gray-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <p className="mt-1 text-xs text-gray-500">Max 5MB. PDF, JPG, PNG.</p>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                    <Save size={16} /> Save Expense
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

export default ExpenseManagement;
