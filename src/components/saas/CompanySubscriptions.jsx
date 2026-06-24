import React, { useState, useEffect } from 'react';
import { Search, Edit2, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const CompanySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/saas/subscriptions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Trial': return 'bg-blue-100 text-blue-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Suspended': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-6">Loading subscriptions...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Company Subscriptions</h2>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage all company subscriptions across the platform.</p>
        </div>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Start Date</th>
                <th className="px-6 py-4 font-semibold">Expiry Date</th>
                <th className="px-6 py-4 font-semibold">Last Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {subscriptions.map(sub => (
                <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {sub.companyDetails?.company_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{sub.companyDetails?.company_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{sub.companyDetails?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-white">{sub.planDetails?.name || 'N/A'}</span>
                    <p className="text-xs text-gray-500">{sub.billing_cycle}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {new Date(sub.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {new Date(sub.expiry_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {sub.last_billing_date ? new Date(sub.last_billing_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanySubscriptions;
