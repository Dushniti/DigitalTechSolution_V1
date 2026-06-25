import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Search, FileText, Download, Printer, CheckCircle, AlertCircle, RefreshCw, FileSignature } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
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

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);

  // PDF Printing states
  const [viewInvoice, setViewInvoice] = useState(null);
  const printRef = useRef();

  const [form, setForm] = useState({
    invoice_number: `INV-${Date.now()}`,
    customer_id: '',
    work_order_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'Generated', // Draft, Generated, Partially Paid, Paid, Overdue, Cancelled
    notes: '',
    terms: '1. Payment is due within 30 days.\n2. Please mention the invoice number in your payment reference.',
    items: []
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const currentRole = getRoleFromToken();
    setRole(currentRole);

    // Also fetch company profile if not Admin
    const token = localStorage.getItem('adminToken');
    if (token && currentRole !== 'Admin') {
      const payload = JSON.parse(atob(token.startsWith('Bearer ') ? token.split(' ')[1].split('.')[1] : token.split('.')[1]));
      if (payload.companyId) {
        fetch(`${config.apiUrl}/companies/${payload.companyId}`, { headers: getAuthHeaders() })
          .then(res => res.json())
          .then(data => {
            if (data.success) setCompanyProfile(data.data);
          });
      }
    }

    fetchData(currentRole);
  }, []);

  const fetchData = async (currentRole = role) => {
    setLoading(true);
    try {
      const endpoints = [
        fetch(`${config.apiUrl}/invoices`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/customers`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/products`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/work-orders`, { headers: getAuthHeaders() })
      ];

      if (currentRole === 'Admin') {
        endpoints.push(fetch(`${config.apiUrl}/companies`, { headers: getAuthHeaders() }));
      }

      const responses = await Promise.all(endpoints);
      const data = await Promise.all(responses.map(r => r.json()));

      if (data[0].success) setInvoices(data[0].data);
      if (data[1].success) setCustomers(data[1].data);
      if (data[2].success) setProducts(data[2].data);
      if (data[3].success) setWorkOrders(data[3].data);
      if (currentRole === 'Admin' && data[4]?.success) setCompanies(data[4].data);

    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Convert WO to Invoice Logic
  const handleWorkOrderSelect = (woId) => {
    setForm(prev => ({ ...prev, work_order_id: woId }));
    if (!woId) return;

    const wo = workOrders.find(w => w._id === woId);
    if (wo) {
      setForm(prev => ({
        ...prev,
        customer_id: wo.customer_id,
        items: wo.items.map(item => ({
          service_id: item.service_id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0,
          tax: item.tax || 0,
          amount: item.amount
        }))
      }));
    }
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { service_id: '', description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0, amount: 0 }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;

    // Auto populate price and desc if product is selected
    if (field === 'service_id') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].description = product.product_name;
        newItems[index].unit_price = product.selling_price;
        newItems[index].tax = product.gst_percentage || 0;
      }
    }

    const qty = Number(newItems[index].quantity) || 0;
    const price = Number(newItems[index].unit_price) || 0;
    const disc = Number(newItems[index].discount) || 0;
    const taxPct = Number(newItems[index].tax) || 0;

    const baseAmount = qty * price;
    const afterDisc = baseAmount - disc;
    const taxAmount = (afterDisc * taxPct) / 100;
    newItems[index].amount = afterDisc + taxAmount;

    setForm({ ...form, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    const discount_amount = form.items.reduce((sum, item) => sum + Number(item.discount), 0);
    const tax_amount = form.items.reduce((sum, item) => sum + (((Number(item.quantity) * Number(item.unit_price) - Number(item.discount)) * Number(item.tax)) / 100), 0);
    const grand_total = subtotal - discount_amount + tax_amount;
    return { subtotal, discount_amount, tax_amount, grand_total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      setError('Add at least one item');
      return;
    }

    setFormLoading(true);
    const totals = calculateTotals();
    const payload = { ...form, ...totals };

    try {
      const url = editingId ? `${config.apiUrl}/invoices/${editingId}` : `${config.apiUrl}/invoices`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        fetchData();
        resetForm();
      } else {
        setError(data.message || 'Failed to save invoice');
      }
    } catch {
      setError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      invoice_number: `INV-${Date.now()}`,
      customer_id: '', work_order_id: '',
      invoice_date: new Date().toISOString().split('T')[0], due_date: '',
      status: 'Generated', notes: '', terms: '1. Payment is due within 30 days.', items: []
    });
    setEditingId(null);
  };

  const openEdit = (inv) => {
    setForm({
      invoice_number: inv.invoice_number,
      customer_id: inv.customer_id,
      work_order_id: inv.work_order_id || '',
      invoice_date: inv.invoice_date?.split('T')[0] || '',
      due_date: inv.due_date?.split('T')[0] || '',
      status: inv.status,
      notes: inv.notes || '',
      terms: inv.terms || '',
      items: inv.items || []
    });
    setEditingId(inv._id);
    setShowModal(true);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${viewInvoice?.invoice_number}`,
  });

  const canManage = role === 'Admin' || role === 'Company Admin' || role === 'User';

  // Filter search
  const filteredInvoices = invoices.filter(i =>
    i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    i.customerDetails?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and track invoices</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all text-sm font-semibold">
            <Plus size={16} /> Create Invoice
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left text-gray-500 font-semibold border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date & Due</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{inv.invoice_number}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {inv.customerDetails?.company_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div>{new Date(inv.invoice_date).toLocaleDateString()}</div>
                    <div className="text-xs text-red-500 mt-1">Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{Number(inv.grand_total || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-red-600">₹{Number(inv.balance_amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg 
                      ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'Partially Paid' ? 'bg-blue-100 text-blue-700' :
                          inv.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                            inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                    <button onClick={() => setViewInvoice(inv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FileText size={16} /></button>
                    {canManage && <button onClick={() => openEdit(inv)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={16} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No invoices found. Create one to get started!</div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileSignature className="text-blue-600" />
                {editingId ? 'Edit Invoice' : 'Create New Invoice'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto grow">
              <form id="invoiceForm" onSubmit={handleSubmit} className="space-y-8">

                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Invoice #</label>
                    <input required value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Convert from WO (Optional)</label>
                    <select value={form.work_order_id} onChange={(e) => handleWorkOrderSelect(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="">Select Work Order...</option>
                      {workOrders.filter(w => w.status !== 'Draft').map(w => (
                        <option key={w._id} value={w._id}>{w.work_order_number} ({w.customerDetails?.company_name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Customer*</label>
                    <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="">Select Customer</option>
                      {customers.map(c => <option key={c._id} value={c._id}>{c.company_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="Draft">Draft</option>
                      <option value="Generated">Generated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Invoice Date</label>
                    <input type="date" required value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Due Date</label>
                    <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white" />
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3 w-1/4">Product/Service</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 w-20">Qty</th>
                        <th className="px-4 py-3 w-32">Price (₹)</th>
                        <th className="px-4 py-3 w-24">Disc (₹)</th>
                        <th className="px-4 py-3 w-20">Tax %</th>
                        <th className="px-4 py-3 w-32">Total (₹)</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {form.items.map((item, index) => (
                        <tr key={index} className="bg-white dark:bg-slate-900">
                          <td className="px-4 py-2">
                            <select value={item.service_id} onChange={(e) => updateItem(index, 'service_id', e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                              <option value="">Custom Item</option>
                              {products.map(p => <option key={p._id} value={p._id}>{p.product_name}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2"><input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Desc..." className="w-full p-2 border rounded-lg" /></td>
                          <td className="px-4 py-2"><input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-full p-2 border rounded-lg" /></td>
                          <td className="px-4 py-2"><input type="number" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} className="w-full p-2 border rounded-lg" /></td>
                          <td className="px-4 py-2"><input type="number" value={item.discount} onChange={(e) => updateItem(index, 'discount', e.target.value)} className="w-full p-2 border rounded-lg" /></td>
                          <td className="px-4 py-2"><input type="number" value={item.tax} onChange={(e) => updateItem(index, 'tax', e.target.value)} className="w-full p-2 border rounded-lg" /></td>
                          <td className="px-4 py-2 font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800">₹{item.amount?.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
                    <button type="button" onClick={addItem} className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline"><Plus size={16} /> Add Line Item</button>
                  </div>
                </div>

                {/* Footer Totals */}
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Terms & Conditions</label>
                      <textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={3} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Private Notes</label>
                      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={2} />
                    </div>
                  </div>

                  <div className="w-full md:w-80 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 h-fit">
                    {(() => {
                      const t = calculateTotals();
                      return (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal:</span> <span>₹{t.subtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between text-red-500"><span>Discount:</span> <span>-₹{t.discount_amount.toFixed(2)}</span></div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax:</span> <span>+₹{t.tax_amount.toFixed(2)}</span></div>
                          <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                            <span>Grand Total:</span> <span>₹{t.grand_total.toFixed(2)}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-white dark:bg-slate-900">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-xl border font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" form="invoiceForm" disabled={formLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2">
                {formLoading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />} Save Invoice
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* VIEW & PRINT MODAL */}
      <AnimatePresence>
        {viewInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18} /> Document Preview</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"><Printer size={16} /> Print PDF</button>
                  <button onClick={() => setViewInvoice(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"><X size={20} /></button>
                </div>
              </div>

              {/* PRINTABLE AREA */}
              <div className="overflow-y-auto p-8 bg-gray-100 flex justify-center">
                <style>
                  {`
                    @media print {
                      @page { margin: 10mm; size: A4; }
                      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                  `}
                </style>
                <div ref={printRef} className="bg-white p-10 w-full max-w-[210mm] min-h-[297mm] shadow-lg text-black print:w-full print:max-w-full print:min-h-fit print:shadow-none print:p-0">

                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                    <div>
                      <h1 className="text-4xl font-black text-gray-900 tracking-tighter">INVOICE</h1>
                      <p className="text-gray-500 font-semibold mt-1">Ref: {viewInvoice.invoice_number}</p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const comp = viewInvoice?.companyDetails || (role === 'Admin' ? companies.find(c => c._id === viewInvoice?.company_id) : companyProfile) || {};
                        return (
                          <>
                            <div className="text-2xl font-black text-blue-600">{comp.company_name || 'Company Name'}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {comp.address || '123 Tech Park, Sector 4'}<br />
                              {comp.city || 'City'}, {comp.state || 'State'} {comp.zip_code || '000000'}<br />
                              {comp.tax_number ? `GST: ${comp.tax_number}` : ''}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="flex justify-between mb-8 gap-8">
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</h3>
                      <div className="font-bold text-lg text-gray-800">{viewInvoice.customerDetails?.company_name}</div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {viewInvoice.customerDetails?.email}<br />
                        {viewInvoice.customerDetails?.phone}<br />
                        GST: {viewInvoice.customerDetails?.tax_number || 'N/A'}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="grid grid-cols-2 gap-2 text-sm justify-end w-full max-w-xs ml-auto">
                        <div className="font-bold text-gray-500">Invoice Date:</div>
                        <div className="font-semibold">{new Date(viewInvoice.invoice_date).toLocaleDateString()}</div>
                        <div className="font-bold text-gray-500">Due Date:</div>
                        <div className="font-semibold text-red-600">{viewInvoice.due_date ? new Date(viewInvoice.due_date).toLocaleDateString() : 'N/A'}</div>
                        <div className="font-bold text-gray-500">Status:</div>
                        <div className="font-bold uppercase tracking-wide">{viewInvoice.status}</div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <table className="w-full mb-8">
                    <thead>
                      <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                        <th className="p-3 text-left w-1/2">Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Tax%</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewInvoice.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 text-sm font-medium">{item.description}</td>
                          <td className="p-3 text-sm text-center">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">₹{Number(item.unit_price || 0).toFixed(2)}</td>
                          <td className="p-3 text-sm text-right">{item.tax}%</td>
                          <td className="p-3 text-sm text-right font-bold">₹{Number(item.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Section */}
                  <div className="flex justify-end mb-12">
                    <div className="w-72 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-500">Subtotal:</span>
                        <span className="font-semibold">₹{Number(viewInvoice.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-500">Discount:</span>
                        <span className="font-semibold text-red-600">-₹{Number(viewInvoice.discount_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-500">Tax Amount:</span>
                        <span className="font-semibold">₹{Number(viewInvoice.tax_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg bg-gray-100 p-3 rounded-lg mt-2">
                        <span className="font-black text-gray-800">Grand Total:</span>
                        <span className="font-black text-blue-600">₹{Number(viewInvoice.grand_total || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-md p-2 mt-2 border-t-2 border-dashed border-gray-300">
                        <span className="font-bold text-gray-600">Balance Due:</span>
                        <span className="font-black text-red-600">₹{Number(viewInvoice.balance_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Notes */}
                  <div className="mt-auto grid grid-cols-2 gap-8 text-sm text-gray-600">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Terms & Conditions</h4>
                      <p className="whitespace-pre-line text-xs">{viewInvoice.terms}</p>

                      <h4 className="font-bold text-gray-800 mt-4 mb-1">Bank Details</h4>
                      <p className="text-xs">Bank Name: HDFC Bank<br />A/C: 50100123456789<br />IFSC: HDFC0001234</p>
                    </div>
                    <div className="text-right flex flex-col justify-end items-end">
                      <div className="w-48 h-16 border-b-2 border-gray-300 mb-2"></div>
                      <div className="font-bold text-gray-800">Authorized Signature</div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InvoiceManagement;
