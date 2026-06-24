import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Calendar, Filter, ArrowUpRight, CheckCircle } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const ExpenseLedger = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${config.apiUrl}/ledger/expense`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      
      if (data.success) {
        setLedger(data.data);
      } else {
        setError(data.message || 'Failed to fetch expense ledger');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [startDate, endDate]);

  // Calculate totals and categories
  const totalExpense = ledger.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const categoryTotals = ledger.reduce((acc, item) => {
    const catName = item.categoryDetails?.category_name || 'Uncategorized';
    acc[catName] = (acc[catName] || 0) + (item.amount || 0);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Ledger</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chronological history of all approved company expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
            />
          </div>
          <button 
            onClick={fetchLedger}
            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg lg:col-span-1">
          <h3 className="text-white/80 font-medium mb-1">Total Expenses</h3>
          <div className="text-4xl font-black mb-4">₹{totalExpense.toFixed(2)}</div>
          <p className="text-sm text-white/90">Based on active filters</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm lg:col-span-3">
          <h3 className="text-gray-800 dark:text-gray-200 font-bold mb-4 flex items-center gap-2">
            <Filter size={18} className="text-blue-500"/> Category Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryTotals).map(([cat, amount]) => (
              <div key={cat} className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate" title={cat}>{cat}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">₹{amount.toFixed(2)}</p>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && (
              <p className="text-sm text-gray-500 col-span-full">No category data available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading ledger data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Expense No</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount (Dr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                {ledger.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No expense records found.</td></tr>
                ) : (
                  ledger.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400"/>
                          {new Date(entry.transaction_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {entry.expenseDetails?.expense_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {entry.categoryDetails?.category_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={entry.expenseDetails?.description}>
                        {entry.expenseDetails?.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                        ₹{entry.amount?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ExpenseLedger;
