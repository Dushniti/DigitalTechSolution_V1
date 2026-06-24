import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import config from '../../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const LedgerManagement = () => {
  const [activeTab, setActiveTab] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  
  const [ledgerData, setLedgerData] = useState([]);
  
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    // Reset selection when tab changes
    setSelectedEntityId('');
    setLedgerData([]);
  }, [activeTab]);

  useEffect(() => {
    if (selectedEntityId) {
      fetchLedger();
    }
  }, [selectedEntityId, dateRange]);

  const fetchEntities = async () => {
    try {
      const [custRes, vendRes] = await Promise.all([
        fetch(`${config.apiUrl}/customers`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/vendors`, { headers: getAuthHeaders() })
      ]);
      const custData = await custRes.json();
      const vendData = await vendRes.json();
      
      if (custData.success) setCustomers(custData.data);
      if (vendData.success) setVendors(vendData.data);
    } catch {
      console.error('Failed to fetch entities');
    }
  };

  const fetchLedger = async () => {
    setLoading(true);
    try {
      let query = `?`;
      if (dateRange.start) query += `startDate=${dateRange.start}&`;
      if (dateRange.end) query += `endDate=${dateRange.end}`;

      const url = activeTab === 'customer' 
        ? `${config.apiUrl}/ledger/customer/${selectedEntityId}${query}`
        : `${config.apiUrl}/ledger/vendor/${selectedEntityId}${query}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      
      if (data.success) {
        setLedgerData(data.data);
      } else {
        setError('Failed to fetch ledger');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ledger Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track financial transactions and running balances</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm transition-all text-sm font-semibold">
          <Download size={16} /> Export Statement
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-slate-800">
        <div className="flex gap-6 w-max">
          <button onClick={() => setActiveTab('customer')} className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${activeTab === 'customer' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Customer Ledger
          </button>
          <button onClick={() => setActiveTab('vendor')} className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${activeTab === 'vendor' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Vendor Ledger
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Select {activeTab === 'customer' ? 'Customer' : 'Vendor'}</label>
          <select value={selectedEntityId} onChange={(e) => setSelectedEntityId(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
            <option value="">-- Choose {activeTab === 'customer' ? 'Customer' : 'Vendor'} --</option>
            {activeTab === 'customer' && customers.map(c => <option key={c._id} value={c._id}>{c.company_name}</option>)}
            {activeTab === 'vendor' && vendors.map(v => <option key={v._id} value={v._id}>{v.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Date</label>
          <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Date</label>
          <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {selectedEntityId ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Statement of Account</h3>
            <button onClick={fetchLedger} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-800/80 text-left text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-slate-700">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Transaction Type</th>
                  <th className="px-6 py-4 text-right">Debit (₹)</th>
                  <th className="px-6 py-4 text-right">Credit (₹)</th>
                  <th className="px-6 py-4 text-right">Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {ledgerData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">{new Date(row.transaction_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${row.reference_type === 'Payment' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {row.reference_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">{row.debit ? `₹${row.debit.toFixed(2)}` : '-'}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{row.credit ? `₹${row.credit.toFixed(2)}` : '-'}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">₹{row.balance?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ledgerData.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <FileText size={48} className="text-gray-300 mb-4" />
                <p>No transactions found for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
          Please select a {activeTab} to view their ledger statement.
        </div>
      )}

    </div>
  );
};

export default LedgerManagement;
