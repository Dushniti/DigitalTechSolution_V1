import React, { useState, useEffect } from 'react';
import { LogOut, FileText, IndianRupee, FileCheck, ExternalLink, Download } from 'lucide-react';
import config from '../config';

const ClientPortalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('invoices');

  const token = localStorage.getItem('clientToken');
  const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');

  useEffect(() => {
    if (!token) {
      window.location.href = '#/client-portal';
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/client-portal/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    window.location.href = '#/client-portal';
  };

  const handleDownloadInvoice = (invoice) => {
    alert('PDF Generation functionality will be implemented soon.');
  };

  const handleDownloadQuotation = (quotation) => {
    alert('PDF Generation functionality will be implemented soon.');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Client Portal</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold">{clientData.company_name}</span>
                <span className="text-xs text-slate-400">{clientData.contact_person}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <IndianRupee size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invoiced</p>
              <h3 className="text-3xl font-bold text-gray-900">₹{data?.summary?.totalInvoiced?.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-6">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <FileCheck size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
              <h3 className="text-3xl font-bold text-gray-900">₹{data?.summary?.outstandingBalance?.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {['invoices', 'quotations', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-0">
            {activeTab === 'invoices' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Invoice No</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.invoices?.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-gray-500">No invoices found.</td></tr>
                    ) : (
                      data?.invoices?.map(inv => (
                        <tr key={inv._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{inv.invoice_number}</td>
                          <td className="py-3 px-4 text-gray-600">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium">₹{inv.grand_total?.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                              inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => handleDownloadInvoice(inv)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 inline-flex items-center gap-1 transition-colors">
                              <Download size={16} /> <span className="text-xs font-medium">PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'quotations' && (
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Quote No</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.quotations?.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-gray-500">No quotations found.</td></tr>
                    ) : (
                      data?.quotations?.map(q => (
                        <tr key={q._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{q.quotation_number}</td>
                          <td className="py-3 px-4 text-gray-600">{new Date(q.quotation_date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium">₹{q.grand_total?.toLocaleString()}</td>
                          <td className="py-3 px-4">
                             <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              q.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              q.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => handleDownloadQuotation(q)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 inline-flex items-center gap-1 transition-colors">
                              <Download size={16} /> <span className="text-xs font-medium">PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payments' && (
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Receipt No</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Mode</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.payments?.length === 0 ? (
                      <tr><td colSpan="4" className="py-8 text-center text-gray-500">No payments found.</td></tr>
                    ) : (
                      data?.payments?.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{p.receipt_number}</td>
                          <td className="py-3 px-4 text-gray-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-gray-600">{p.payment_mode}</td>
                          <td className="py-3 px-4 font-medium text-green-600">₹{p.amount?.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortalDashboard;
