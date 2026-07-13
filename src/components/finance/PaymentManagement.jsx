import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, FileText, Printer, CheckCircle, AlertCircle, RefreshCw, IndianRupee, X } from 'lucide-react';
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

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('');
  const [companyProfile, setCompanyProfile] = useState(null);

  // PDF Printing states
  const [viewReceipt, setViewReceipt] = useState(null);
  const printRef = useRef();

  const [form, setForm] = useState({
    payment_number: `PAY-${Date.now()}`,
    customer_id: '',
    invoice_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer', // Cash, UPI, Bank Transfer, Cheque
    transaction_reference: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    const currentRole = getRoleFromToken();
    setRole(currentRole);

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

    fetchData(currentRole, selectedCompanyFilter);
  }, [selectedCompanyFilter]);

  const fetchData = async (currentRole = role, companyFilter = selectedCompanyFilter) => {
    setLoading(true);
    try {
      const endpoints = [
        fetch(`${config.apiUrl}/payments${companyFilter ? `?company_id=${companyFilter}` : ''}`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/invoices${companyFilter ? `?company_id=${companyFilter}` : ''}`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/customers${companyFilter ? `?company_id=${companyFilter}` : ''}`, { headers: getAuthHeaders() })
      ];

      if (currentRole === 'Admin') {
        endpoints.push(fetch(`${config.apiUrl}/companies`, { headers: getAuthHeaders() }));
      }

      const responses = await Promise.all(endpoints);

      const payData = await responses[0].json();
      const invData = await responses[1].json();
      const custData = await responses[2].json();

      if (payData.success) setPayments(payData.data);
      // Filter out fully paid or cancelled invoices for the dropdown
      if (invData.success) setInvoices(invData.data.filter(i => !['Paid', 'Cancelled'].includes(i.status)));
      if (custData.success) setCustomers(custData.data);

      if (currentRole === 'Admin' && responses[3]) {
        const compData = await responses[3].json();
        if (compData.success) setCompanies(compData.data);
      }

    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSelect = (invId) => {
    setForm(prev => ({ ...prev, invoice_id: invId }));
    if (!invId) return;

    const inv = invoices.find(i => i._id === invId);
    if (inv) {
      setForm(prev => ({
        ...prev,
        customer_id: inv.customer_id,
        amount: inv.balance_amount || 0
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        fetchData();
        resetForm();
      } else {
        setError(data.message || 'Failed to save payment');
      }
    } catch {
      setError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      payment_number: `PAY-${Date.now()}`,
      customer_id: '', invoice_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'Bank Transfer', transaction_reference: '',
      amount: '', notes: ''
    });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt_${viewReceipt?.receiptDetails?.receipt_number || 'Payment'}`,
  });

  const canManage = role === 'Admin' || role === 'Company Admin' || role === 'User';

  const filteredPayments = payments.filter(p =>
    p.payment_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.customerDetails?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.receiptDetails?.receipt_number?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handleSearchChange = (val) => { setSearch(val); setCurrentPage(1); };
  const handlePageSizeChange = (val) => { setPageSize(Number(val)); setCurrentPage(1); };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment & Receipts</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Record incoming payments and generate receipts</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-all text-sm font-semibold">
            <Plus size={16} /> Record Payment
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
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 flex-wrap gap-4">
          <div className="relative w-full max-w-md flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Payment #, Receipt # or Customer..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {role === 'Admin' && (
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto min-w-[200px]"
              >
                <option value="">My Data (Admin)</option>
                <option value="all">All Companies</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>{c.company_name}</option>
                ))}
              </select>
            )}
            <button onClick={() => fetchData()} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors shrink-0">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left text-gray-500 font-semibold border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4">Receipt #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Invoice Ref</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Method & Ref</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {paginatedPayments.map((pay) => (
                <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{pay.receiptDetails?.receipt_number || 'N/A'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {pay.customerDetails?.company_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">
                    {pay.invoiceDetails?.invoice_number || 'Advance/Other'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(pay.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div className="font-semibold">{pay.payment_method}</div>
                    <div className="text-xs">{pay.transaction_reference || 'No Ref'}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-green-600">₹{pay.amount?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setViewReceipt(pay)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-end w-full gap-2 text-xs font-bold">
                      <FileText size={16} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No payments found.</div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>
                Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{Math.min((currentPage - 1) * pageSize + 1, filteredPayments.length)}</span>–<span className="font-semibold text-gray-700 dark:text-gray-200">{Math.min(currentPage * pageSize, filteredPayments.length)}</span> of <span className="font-semibold text-gray-700 dark:text-gray-200">{filteredPayments.length}</span>
              </span>
              <span className="text-gray-300 dark:text-slate-600">|</span>
              <label className="flex items-center gap-2">
                Rows:
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">«</button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">‹ Prev</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === p
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >{p}</button>
                  )
                )}

              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next ›</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">»</button>
            </div>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold flex items-center gap-2 text-green-600">
                <IndianRupee size={20} /> Record Incoming Payment
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="paymentForm" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Payment #</label>
                    <input readOnly value={form.payment_number} className="w-full px-4 py-2 border rounded-xl bg-gray-100 font-mono text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Date</label>
                    <input type="date" required value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5">Apply To Invoice (Optional - leaves as Advance if empty)</label>
                    <select value={form.invoice_id} onChange={(e) => handleInvoiceSelect(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="">Select Pending Invoice...</option>
                      {invoices.map(i => (
                        <option key={i._id} value={i._id}>{i.invoice_number} (Bal: ₹{i.balance_amount}) - {i.customerDetails?.company_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5">Customer*</label>
                    <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white" disabled={!!form.invoice_id}>
                      <option value="">Select Customer</option>
                      {customers.map(c => <option key={c._id} value={c._id}>{c.company_name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Payment Method</label>
                    <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Transaction Ref / Cheque No.</label>
                    <input value={form.transaction_reference} onChange={(e) => setForm({ ...form, transaction_reference: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white" placeholder="e.g. UTR1234567" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5">Amount Received (₹)*</label>
                    <input type="number" step="0.01" required min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-3 border-2 border-green-500 rounded-xl bg-green-50 font-black text-xl text-green-700" placeholder="0.00" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5">Internal Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={2} />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-xl border font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" form="paymentForm" disabled={formLoading} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2">
                {formLoading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />} Confirm Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* VIEW RECEIPT MODAL */}
      <AnimatePresence>
        {viewReceipt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText size={18} /> Receipt Preview</h3>
                <div className="flex gap-2">
                  <button onClick={() => handlePrint()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors"><Printer size={16} /> Print PDF</button>
                  <button onClick={() => setViewReceipt(null)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg"><X size={20} /></button>
                </div>
              </div>

              {/* PRINTABLE AREA */}
              <div className="overflow-y-auto p-4 md:p-8 bg-gray-100 dark:bg-slate-800 flex justify-center">
                <style>
                  {`
                    @media print {
                      @page { margin: 20mm 10mm 10mm 10mm; size: A4; }
                      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                  `}
                </style>
                <div ref={printRef} className="bg-white p-6 md:p-10 w-full max-w-[210mm] min-h-[297mm] shadow-lg text-black print:w-full print:max-w-full print:min-h-fit print:shadow-none print:p-0 print:pt-4">

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-800 pb-6 mb-6 gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter">PAYMENT RECEIPT</h1>
                      <p className="text-gray-500 font-semibold mt-1">Receipt #: {viewReceipt.receiptDetails?.receipt_number || 'N/A'}</p>
                    </div>
                    <div className="sm:text-right">
                      {(() => {
                        const comp = viewReceipt?.companyDetails || (role === 'Admin' ? companies.find(c => c._id === viewReceipt?.company_id) : companyProfile) || {};
                        return (
                          <>
                            <div className="text-xl sm:text-2xl font-black text-green-600">{comp.company_name || 'Company Name'}</div>
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

                  <div className="flex justify-between mb-6 sm:mb-8 gap-8">
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Received From:</h3>
                      <div className="font-bold text-lg text-gray-800">{viewReceipt.customerDetails?.company_name || 'N/A'}</div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {viewReceipt.customerDetails?.email}<br />
                        {viewReceipt.customerDetails?.phone}<br />
                        GST: {viewReceipt.customerDetails?.tax_number || 'N/A'}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="grid grid-cols-2 gap-2 text-sm justify-end w-full max-w-xs ml-auto">
                        <div className="font-bold text-gray-500">Payment Date:</div>
                        <div className="font-semibold">{new Date(viewReceipt.payment_date || new Date()).toLocaleDateString()}</div>
                        <div className="font-bold text-gray-500">Method:</div>
                        <div className="font-semibold">{viewReceipt.payment_method || 'N/A'}</div>
                        <div className="font-bold text-gray-500">Reference:</div>
                        <div className="font-semibold">{viewReceipt.transaction_reference || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center">
                    <h2 className="text-gray-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Amount Received</h2>
                    <div className="text-4xl sm:text-5xl font-black text-green-700">₹{viewReceipt.amount?.toFixed(2)}</div>
                  </div>

                  {/* Info Table */}
                  <div className="overflow-x-auto w-full mb-8 sm:mb-12">
                    <table className="w-full text-left border-collapse text-sm sm:text-base">
                      <thead>
                        <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                          <th className="p-3">Payment Details</th>
                          <th className="p-3 text-right">Applied To</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 border-b border-gray-200">
                        <tr>
                          <td className="p-3 text-sm font-medium">Payment towards services/invoices</td>
                          <td className="p-3 text-sm text-right font-semibold">{viewReceipt?.invoiceDetails?.invoice_number || 'Advance / General Payment'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Notes */}
                  <div className="mt-auto grid grid-cols-2 gap-8 text-sm text-gray-600">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Notes</h4>
                      <p className="whitespace-pre-line text-xs">Thank you for your business!</p>
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

export default PaymentManagement;
