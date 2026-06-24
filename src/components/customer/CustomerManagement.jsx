import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const getRoleFromToken = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [role, setRole] = useState(null);
  
  const [form, setForm] = useState({
    customer_name: '', company_name: '', gst_no: '', pan_no: '', mobile: '',
    alternate_mobile: '', email: '', billing_address: '', shipping_address: '',
    city: '', state: '', country: '', pincode: '', credit_limit: 0, opening_balance: 0,
    contact_person: '', notes: '', status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const currentRole = getRoleFromToken();
    setRole(currentRole);
    fetchCustomers();
    if (currentRole === 'Admin') {
      fetchCompanies();
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/companies`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setCompanies(data.data);
    } catch {
      console.error('Failed to fetch companies');
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/customers`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    try {
      const res = await fetch(`${config.apiUrl}/customers?search=${value}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch {
      console.error('Search error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = editingId ? `${config.apiUrl}/customers/${editingId}` : `${config.apiUrl}/customers`;
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = { ...form };
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchCustomers();
        resetForm();
      } else {
        setError(data.message || 'Failed to save customer');
      }
    } catch {
      setError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) fetchCustomers();
      else setError(data.message || 'Failed to delete');
    } catch {
      setError('Network error');
    }
  };

  const resetForm = () => {
    setForm({
      customer_name: '', company_name: '', gst_no: '', pan_no: '', mobile: '',
      alternate_mobile: '', email: '', billing_address: '', shipping_address: '',
      city: '', state: '', country: '', pincode: '', credit_limit: 0, opening_balance: 0,
      contact_person: '', notes: '', status: 'Active'
    });
    setEditingId(null);
  };

  const openEdit = (customer) => {
    setForm(customer);
    setEditingId(customer._id);
    setShowModal(true);
  };

  const exportCSV = () => {
    const headers = ['Code', 'Name', 'Company', 'Mobile', 'Email', 'City', 'State', 'Status'];
    const csvData = customers.map(c => [
      c.customer_code, c.customer_name, c.company_name, c.mobile, c.email, c.city, c.state, c.status
    ]);
    const csvContent = [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canManage = role === 'Admin' || role === 'Company Admin';

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your customer database and ledgers</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm transition-all text-sm font-semibold">
            <Download size={16} /> Export CSV
          </button>
          {canManage && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all text-sm font-semibold">
              <Plus size={16} /> Add Customer
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Code, Name, or Company..." 
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button onClick={fetchCustomers} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left text-gray-500 font-semibold border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                {canManage && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono font-medium text-blue-600">{c.customer_code}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{c.customer_name}</div>
                    <div className="text-xs text-gray-500">{c.company_name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div>{c.mobile}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {c.city}, {c.state}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    ₹{c.opening_balance}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No customers found</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {role === 'Admin' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5">Assign to Company*</label>
                    <select required value={form.company_id || ''} onChange={(e) => setForm({...form, company_id: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="">Select Company</option>
                      {companies.map(c => <option key={c._id} value={c._id}>{c.company_name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Customer Name*</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Company Name</label>
                  <input value={form.company_name} onChange={(e) => setForm({...form, company_name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">GST Number</label>
                  <input value={form.gst_no} onChange={(e) => setForm({...form, gst_no: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">PAN Number</label>
                  <input value={form.pan_no} onChange={(e) => setForm({...form, pan_no: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Mobile Number*</label>
                  <input required value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Billing Address</label>
                  <textarea value={form.billing_address} onChange={(e) => setForm({...form, billing_address: e.target.value})} className="w-full px-4 py-2 border rounded-xl" rows={2} />
                </div>
                
                <div><label className="block text-sm font-semibold mb-1.5">City</label><input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
                <div><label className="block text-sm font-semibold mb-1.5">State</label><input value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
                <div><label className="block text-sm font-semibold mb-1.5">Credit Limit (₹)</label><input type="number" value={form.credit_limit} onChange={(e) => setForm({...form, credit_limit: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
                <div><label className="block text-sm font-semibold mb-1.5">Opening Balance (₹)</label><input type="number" value={form.opening_balance} onChange={(e) => setForm({...form, opening_balance: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-xl border font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">
                  {formLoading ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
