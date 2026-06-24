import React, { useState, useEffect } from 'react';
import { BarChart2, DollarSign, TrendingUp, AlertCircle, Download, FileText, CheckCircle, Clock } from 'lucide-react';
import config from '../../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const BusinessReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // High-level aggregates
  const [summary, setSummary] = useState({
    totalInvoices: 0, totalRevenue: 0,
    totalPaymentsReceived: 0, outstandingAmount: 0,
    paidInvoices: 0, overdueInvoices: 0
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // We can fetch data from dashboard-aggregated and also fetch recent invoices/payments
      const [dashRes, invRes, payRes] = await Promise.all([
        fetch(`${config.apiUrl}/dashboard-aggregated`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/invoices`, { headers: getAuthHeaders() }),
        fetch(`${config.apiUrl}/payments`, { headers: getAuthHeaders() })
      ]);

      const [dashData, invData, payData] = await Promise.all([
        dashRes.json(), invRes.json(), payRes.json()
      ]);

      if (dashData.success && dashData.data.summary) {
        const s = dashData.data.summary;
        setSummary({
          totalInvoices: s.totalInvoices || 0,
          totalRevenue: s.totalRevenue || 0,
          totalPaymentsReceived: s.totalPaymentsReceived || 0,
          outstandingAmount: s.outstandingAmount || 0,
          paidInvoices: s.paidInvoices || 0,
          overdueInvoices: s.overdueInvoices || 0
        });
      }

      if (invData.success) {
        setRecentInvoices(invData.data.slice(0, 5)); // Just take top 5
      }
      if (payData.success) {
        setRecentPayments(payData.data.slice(0, 5)); // Just take top 5
      }

    } catch {
      setError('Network error loading reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of collections, revenue and outstanding dues</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all text-sm font-semibold">
          <Download size={16} /> Export Master Report
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                <FileText size={18} className="text-blue-500" /> <span className="font-semibold text-sm uppercase">Total Billed</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">₹{summary.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-2 font-medium">{summary.totalInvoices} Invoices Generated</div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                <CheckCircle size={18} className="text-green-500" /> <span className="font-semibold text-sm uppercase">Total Collected</span>
              </div>
              <div className="text-3xl font-black text-green-600">₹{summary.totalPaymentsReceived.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-2 font-medium">{summary.paidInvoices} Fully Paid Invoices</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                <AlertCircle size={18} className="text-red-500" /> <span className="font-semibold text-sm uppercase">Outstanding</span>
              </div>
              <div className="text-3xl font-black text-red-600">₹{summary.outstandingAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-2 font-medium">{summary.overdueInvoices} Overdue Invoices</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                <TrendingUp size={18} className="text-indigo-500" /> <span className="font-semibold text-sm uppercase">Collection Rate</span>
              </div>
              <div className="text-3xl font-black text-indigo-600">
                {summary.totalRevenue > 0 ? ((summary.totalPaymentsReceived / summary.totalRevenue) * 100).toFixed(1) : '0.0'}%
              </div>
              <div className="text-sm text-gray-500 mt-2 font-medium">Of Total Revenue Collected</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* Recent Invoices */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Clock size={16}/> Recent Billing</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Invoice</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {recentInvoices.map(inv => (
                      <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-blue-600">{inv.invoice_number}</div>
                          <div className="text-xs text-gray-500">{new Date(inv.invoice_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{inv.customerDetails?.company_name}</td>
                        <td className="px-4 py-3 text-right font-bold">₹{inv.grand_total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Collections */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"><DollarSign size={16}/> Recent Collections</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Receipt</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3 text-right">Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {recentPayments.map(pay => (
                      <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-green-600">{pay.receiptDetails?.receipt_number || 'ADV'}</div>
                          <div className="text-xs text-gray-500">{new Date(pay.payment_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{pay.customerDetails?.company_name}</td>
                        <td className="px-4 py-3 text-right font-black text-green-600">+₹{pay.amount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default BusinessReports;
