import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import config from '../../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const ProductCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [form, setForm] = useState({ category_name: '', status: 'Active' });
  const [editingId, setEditingId] = useState(null);
  const [role, setRole] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    let currentRole = null;
    if (token) {
      try {
        currentRole = JSON.parse(atob(token.split('.')[1])).role;
        setRole(currentRole);
      } catch (e) {}
    }
    fetchCategories();
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/product-categories`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.message || 'Failed to fetch categories');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = editingId ? `${config.apiUrl}/product-categories/${editingId}` : `${config.apiUrl}/product-categories`;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchCategories();
        setForm({ category_name: '', status: 'Active' });
        setEditingId(null);
      } else {
        setError(data.message || 'Failed to save category');
      }
    } catch {
      setError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/product-categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) fetchCategories();
      else setError(data.message || 'Failed to delete');
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Categories</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage product types and classifications</p>
        </div>
        <button onClick={() => { setForm({category_name: '', status: 'Active'}); setEditingId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all text-sm font-semibold">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left text-gray-500 font-semibold border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{c.category_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setForm(c); setEditingId(c._id); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No categories found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {role === 'Admin' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Assign to Company*</label>
                  <select required value={form.company_id || ''} onChange={(e) => setForm({...form, company_id: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c._id} value={c._id}>{c.company_name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Category Name*</label>
                <input required value={form.category_name} onChange={(e) => setForm({...form, category_name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-xl border font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductCategoryManagement;
