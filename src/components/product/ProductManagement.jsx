import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
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

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [role, setRole] = useState(null);
  
  const [form, setForm] = useState({
    sku: '', product_name: '', category_id: '', brand: '', hsn_code: '', unit: '',
    description: '', purchase_price: 0, selling_price: 0, gst_percentage: 0,
    image: '', minimum_stock: 0, status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const currentRole = getRoleFromToken();
    setRole(currentRole);
    fetchProducts();
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/products`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/product-categories`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    try {
      const res = await fetch(`${config.apiUrl}/products?search=${value}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch {
      console.error('Search error');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let imageUrl = form.image;
      
      // Handle Image Upload First
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const token = localStorage.getItem('adminToken');
        const uploadRes = await fetch(`${config.apiUrl}/products/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.imageUrl;
        } else {
          throw new Error(uploadData.message || 'Image upload failed');
        }
      }

      const url = editingId ? `${config.apiUrl}/products/${editingId}` : `${config.apiUrl}/products`;
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = { ...form, image: imageUrl };
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchProducts();
        resetForm();
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) fetchProducts();
      else setError(data.message || 'Failed to delete');
    } catch {
      setError('Network error');
    }
  };

  const resetForm = () => {
    setForm({
      sku: '', product_name: '', category_id: '', brand: '', hsn_code: '', unit: '',
      description: '', purchase_price: 0, selling_price: 0, gst_percentage: 0,
      image: '', minimum_stock: 0, status: 'Active'
    });
    setEditingId(null);
    setImageFile(null);
    setPreview(null);
  };

  const openEdit = (product) => {
    setForm(product);
    setEditingId(product._id);
    setPreview(product.image);
    setImageFile(null);
    setShowModal(true);
  };

  const canManage = role === 'Admin' || role === 'Company Admin';

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your inventory and product catalog</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all text-sm font-semibold">
            <Plus size={16} /> Add Product
          </button>
        )}
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
              placeholder="Search by SKU, Name, or Code..." 
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button onClick={fetchProducts} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left text-gray-500 font-semibold border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category/Brand</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Stock Limit</th>
                <th className="px-6 py-4">Status</th>
                {canManage && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    {p.image ? (
                      <img src={p.image} alt="product" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{p.product_name}</div>
                    <div className="text-xs text-blue-600 font-mono">Code: {p.product_code} | SKU: {p.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div>{p.category?.category_name || '-'}</div>
                    <div className="text-xs text-gray-500">{p.brand}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    ₹{p.selling_price} <span className="text-xs text-gray-500 font-normal line-through">₹{p.purchase_price}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {p.minimum_stock} {p.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No products found</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Product Image (JPG, PNG, WEBP)</label>
                  <div className="flex items-center gap-4">
                    {preview ? (
                      <div className="relative w-24 h-24">
                        <img src={preview} alt="preview" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                        <button type="button" onClick={() => { setPreview(null); setImageFile(null); setForm({...form, image: ''}); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <div>
                      <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                  </div>
                </div>

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
                  <label className="block text-sm font-semibold mb-1.5">Product Name*</label>
                  <input required value={form.product_name} onChange={(e) => setForm({...form, product_name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">HSN Code</label>
                  <input value={form.hsn_code} onChange={(e) => setForm({...form, hsn_code: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Unit (e.g., kg, pcs)</label>
                  <input value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Purchase Price (₹)</label>
                  <input type="number" value={form.purchase_price} onChange={(e) => setForm({...form, purchase_price: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Selling Price (₹)</label>
                  <input type="number" value={form.selling_price} onChange={(e) => setForm({...form, selling_price: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">GST Percentage (%)</label>
                  <input type="number" value={form.gst_percentage} onChange={(e) => setForm({...form, gst_percentage: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Minimum Stock Quantity</label>
                  <input type="number" value={form.minimum_stock} onChange={(e) => setForm({...form, minimum_stock: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl" rows={3} />
                </div>
                
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
                  {formLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
