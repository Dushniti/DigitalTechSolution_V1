import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Download, Printer, Copy, Edit, Trash2, X, AlertCircle, RefreshCw, Send, CheckCircle, MoreVertical } from 'lucide-react';
import config from '../../config';
import { useReactToPrint } from 'react-to-print';

const QuotationManagement = () => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: '' }

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingQuote, setViewingQuote] = useState(null);

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

  const getCompanyDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const res = await fetch(`${config.apiUrl}/companies/${payload.companyId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setCompanyDetails(data.data);
    } catch { }
  };

  useEffect(() => {
    setRole(getRoleFromToken());
    fetchQuotations();
    fetchCustomers();
    fetchProducts();
    getCompanyDetails();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/quotations`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setQuotations(data.data);
    } catch (err) {
      setError('Failed to load quotations');
    } finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/customers`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch { }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/products`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch { }
  };

  // Form Initial State
  const initialForm = {
    customer_id: '',
    quotation_number: '', // Auto-generated if left blank
    quotation_date: new Date().toISOString().split('T')[0],
    valid_till: '',
    items: [],
    subtotal: 0,
    tax_amount: 0,
    grand_total: 0,
    notes: 'Thank you for your business!',
    status: 'Draft'
  };

  const [form, setForm] = useState(initialForm);

  const calculateTotals = (items) => {
    let subtotal = 0;
    let tax_amount = 0;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      const discountVal = (lineTotal * (item.discount || 0)) / 100;
      const postDiscount = lineTotal - discountVal;
      const taxVal = (postDiscount * (item.tax || 0)) / 100;

      subtotal += postDiscount;
      tax_amount += taxVal;
      item.amount = postDiscount + taxVal;
    });

    const grand_total = subtotal + tax_amount;
    setForm(prev => ({ ...prev, items, subtotal, tax_amount, grand_total }));
  };

  const handleAddItem = () => {
    const newItem = { service_id: '', description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0, amount: 0 };
    calculateTotals([...form.items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    calculateTotals(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;

    // Auto-fill price from product
    if (field === 'service_id' && value) {
      const product = products.find(p => p._id === value);
      if (product) {
        updated[index].description = product.product_name;
        updated[index].unit_price = product.price || 0;
        updated[index].tax = product.tax_rate || 0;
      }
    }

    calculateTotals(updated);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e, sendEmail = false) => {
    e.preventDefault();
    if (form.items.length === 0) return setError('Please add at least one item');

    try {
      const payload = sendEmail
        ? { ...form, status: 'Sent', sendEmail: true }
        : { ...form };

      const url = editingId ? `${config.apiUrl}/quotations/${editingId}` : `${config.apiUrl}/quotations`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchQuotations();
        if (sendEmail) {
          showToast('success', '✅ Quotation saved and email sent to customer successfully!');
        }
      } else {
        setError(data.message || 'Action failed');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleDuplicate = (quote) => {
    setEditingId(null);
    setForm({
      ...quote,
      _id: undefined,
      quotation_number: '',
      status: 'Draft',
      quotation_date: new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quotation?')) return;
    try {
      await fetch(`${config.apiUrl}/quotations/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      fetchQuotations();
    } catch { }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`${config.apiUrl}/quotations/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      fetchQuotations();
    } catch { }
  };

  // Printing logic
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Quotation_${viewingQuote?.quotation_number || 'Doc'}`
  });

  const filteredQuotes = quotations.filter(q => {
    const matchesSearch = q.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerDetails?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? q.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" onClick={() => setActiveDropdown(null)}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold
              ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer quotes and proposals</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchQuotations} className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-colors">
            <Plus size={20} /> Create Quotation
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search quotation # or customer..."
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
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Quotation List */}
      <div className="md:bg-white md:dark:bg-slate-900 md:rounded-2xl md:border md:border-gray-200 md:dark:border-slate-800 md:overflow-hidden md:shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase">Quote #</th>
                <th className="px-6 py-4 font-semibold uppercase">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase">Date</th>
                <th className="px-6 py-4 font-semibold uppercase">Amount</th>
                <th className="px-6 py-4 font-semibold uppercase">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredQuotes.map((quote) => (
                <tr key={quote._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{quote.quotation_number}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {quote.customerDetails?.company_name || quote.customerDetails?.contact_person || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(quote.quotation_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">₹{quote.grand_total?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${quote.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        quote.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                          quote.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {(role === 'Admin' || role === 'Company Admin' || role === 'User') && quote.status === 'Sent' && (
                        <>
                          <button onClick={() => handleStatusChange(quote._id, 'Approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle size={16} /></button>
                          <button onClick={() => handleStatusChange(quote._id, 'Rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Reject"><X size={16} /></button>
                        </>
                      )}

                      <button onClick={() => { setViewingQuote(quote); setShowPrintModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg" title="Print/PDF"><Printer size={16} /></button>

                      {quote.status !== 'Approved' && (
                        <button onClick={() => { setForm(quote); setEditingId(quote._id); setShowForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg" title="Edit"><Edit size={16} /></button>
                      )}

                      <button onClick={() => handleDuplicate(quote)} className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg" title="Duplicate"><Copy size={16} /></button>

                      {(role === 'Admin' || role === 'Company Admin') && (
                        <button onClick={() => handleDelete(quote._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No quotations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden flex flex-col gap-4">
          {filteredQuotes.map((quote) => (
            <div key={quote._id} className="p-4 space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{quote.quotation_number}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(quote.quotation_date).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${quote.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      quote.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                        quote.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'}`}>
                    {quote.status}
                  </span>
                  
                  {/* 3-Dot Dropdown Menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === quote._id ? null : quote._id); }}
                      className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === quote._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-10 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(role === 'Admin' || role === 'Company Admin' || role === 'User') && quote.status === 'Sent' && (
                            <>
                              <button onClick={() => { handleStatusChange(quote._id, 'Approved'); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <CheckCircle size={16} /> Approve
                              </button>
                              <button onClick={() => { handleStatusChange(quote._id, 'Rejected'); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <X size={16} /> Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => { setViewingQuote(quote); setShowPrintModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <Printer size={16} /> Print
                          </button>
                          {quote.status !== 'Approved' && (
                            <button onClick={() => { setForm(quote); setEditingId(quote._id); setShowForm(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                              <Edit size={16} /> Edit
                            </button>
                          )}
                          <button onClick={() => { handleDuplicate(quote); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <Copy size={16} /> Copy
                          </button>
                          {(role === 'Admin' || role === 'Company Admin') && (
                            <button onClick={() => { handleDelete(quote._id); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                              <Trash2 size={16} /> Delete
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-100">{quote.customerDetails?.company_name || quote.customerDetails?.contact_person || 'Unknown'}</div>
              </div>

              <div className="flex justify-between items-center text-sm bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50">
                <div className="font-medium text-gray-500 dark:text-gray-400">Total Amount</div>
                <div className="font-bold text-gray-900 dark:text-white">₹{quote.grand_total?.toLocaleString()}</div>
              </div>

            </div>
          ))}
          {filteredQuotes.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">No quotations found.</div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Quotation' : 'Create Quotation'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Customer*</label>
                  <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white">
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.company_name || c.contact_person}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Quotation Number</label>
                  <input type="text" value={form.quotation_number} onChange={(e) => setForm({ ...form, quotation_number: e.target.value })} placeholder="Auto-generated if empty" className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Date*</label>
                  <input required type="date" value={form.quotation_date} onChange={(e) => setForm({ ...form, quotation_date: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Valid Till</label>
                  <input type="date" value={form.valid_till} onChange={(e) => setForm({ ...form, valid_till: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white" />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Service / Product</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Disc (%)</th>
                        <th className="px-4 py-3">Tax (%)</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {form.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" required />
                          </td>
                          <td className="px-4 py-3 w-20">
                            <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" required />
                          </td>
                          <td className="px-4 py-3 w-28">
                            <input type="number" min="0" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" required />
                          </td>
                          <td className="px-4 py-3 w-20">
                            <input type="number" min="0" max="100" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                          </td>
                          <td className="px-4 py-3 w-20">
                            <input type="number" min="0" max="100" value={item.tax} onChange={(e) => handleItemChange(index, 'tax', Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white w-28">₹{item.amount?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50">
                  <button type="button" onClick={handleAddItem} className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700"><Plus size={16} /> Add Item</button>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end text-sm">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal:</span> <span>₹{form.subtotal?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax Amount:</span> <span>₹{form.tax_amount?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span>Grand Total:</span> <span>₹{form.grand_total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Notes / Terms</label>
                <textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white"></textarea>
              </div>

            </form>

            <div className="p-4 md:p-6 border-t border-gray-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-gray-600 border border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} /> Save &amp; Send
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Save Quotation
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Print/PDF Modal */}
      {showPrintModal && viewingQuote && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-100 dark:bg-slate-900 w-full max-w-4xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">Print / Download PDF</h3>
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"><Printer size={16} /> <span className="hidden sm:inline">Print</span></button>
                <button onClick={() => setShowPrintModal(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl"><X size={20} /></button>
              </div>
            </div>

            {/* Printable Area Wrapper */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex md:justify-center">
              <style>
                {`
                  @media print {
                    @page { margin: 20mm 10mm 10mm 10mm; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                `}
              </style>
              <div ref={printRef} className="bg-white p-6 md:p-10 w-[210mm] shrink-0 min-h-[297mm] shadow-lg text-black print:w-full print:shrink print:min-h-fit print:shadow-none print:p-0 print:pt-4 flex flex-col relative mx-auto" style={{ color: '#000' }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                  <div>
                    {companyDetails?.logo ? (
                      <img src={companyDetails.logo} alt="Logo" className="h-16 object-contain mb-2" />
                    ) : (
                      <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">{companyDetails?.company_name || 'DTS'}</h1>
                    )}
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>{companyDetails?.address}</p>
                      <p>{companyDetails?.city}, {companyDetails?.state}</p>
                      <p>Phone: {companyDetails?.phone}</p>
                      <p>Email: {companyDetails?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest">Quotation</h2>
                    <div className="mt-4 text-sm">
                      <p><span className="font-bold text-gray-800">Quote #:</span> {viewingQuote.quotation_number}</p>
                      <p><span className="font-bold text-gray-800">Date:</span> {new Date(viewingQuote.quotation_date).toLocaleDateString()}</p>
                      {viewingQuote.valid_till && <p><span className="font-bold text-gray-800">Valid Till:</span> {new Date(viewingQuote.valid_till).toLocaleDateString()}</p>}
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="mb-10">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quotation For:</h3>
                  <div className="text-sm text-gray-800">
                    <p className="font-bold text-lg">{viewingQuote.customerDetails?.company_name}</p>
                    <p>{viewingQuote.customerDetails?.contact_person}</p>
                    <p>{viewingQuote.customerDetails?.email}</p>
                    <p>{viewingQuote.customerDetails?.phone}</p>
                    <p className="mt-1 max-w-sm whitespace-pre-wrap">{viewingQuote.customerDetails?.billing_address}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-800 text-left">
                      <th className="py-3 font-bold uppercase text-xs tracking-wider">Description</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-center">Qty</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-right">Price</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-right">Tax</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingQuote.items?.map((item, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-4">{item.description}</td>
                        <td className="py-4 text-center">{item.quantity}</td>
                        <td className="py-4 text-right">₹{item.unit_price?.toFixed(2)}</td>
                        <td className="py-4 text-right">{item.tax}%</td>
                        <td className="py-4 text-right font-medium">₹{item.amount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span> <span>₹{viewingQuote.subtotal?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tax Amount:</span> <span>₹{viewingQuote.tax_amount?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2 mt-2">
                      <span>Total:</span> <span>₹{viewingQuote.grand_total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingQuote.notes && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terms & Notes</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewingQuote.notes}</p>
                  </div>
                )}

                <div className="mt-auto pt-8 pb-4 text-center text-xs text-gray-400">
                  <div className="border-t border-gray-200 pt-4">
                    This is a computer generated quotation.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default QuotationManagement;
