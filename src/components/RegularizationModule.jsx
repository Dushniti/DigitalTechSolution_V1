import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, RefreshCw, ClipboardList } from 'lucide-react';
import config from '../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': getToken() || '',
});
const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const payload = actualToken.split('.')[1];
    return JSON.parse(atob(payload)).role;
  } catch (e) {
    return null;
  }
};

const RegularizationModule = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const currentUserRole = getRoleFromToken();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/regularization`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch regularization requests.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`${config.apiUrl}/regularization/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Request ${status.toLowerCase()}`);
        fetchRequests();
      } else {
        setError(data.message || 'Failed to update request.');
      }
    } catch {
      setError('Network error.');
    }
  };

  return (
    <div>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Regularization</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage incomplete punch records</p>
        </div>
        <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
             <ClipboardList className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
             <p className="text-gray-500 font-medium">No regularization requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  {currentUserRole === 'Admin' && <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">User</th>}
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Requested Times</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  {currentUserRole === 'Admin' && <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{r.date}</td>
                    {currentUserRole === 'Admin' && <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{r.email}</td>}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      In: {new Date(r.punchInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} <br/>
                      Out: {new Date(r.punchOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        r.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    {currentUserRole === 'Admin' && (
                      <td className="px-6 py-4">
                        {r.status === 'Pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleStatusUpdate(r._id, 'Approved')} className="p-1.5 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 transition-colors" title="Approve">
                              <Check size={16} />
                            </button>
                            <button onClick={() => handleStatusUpdate(r._id, 'Rejected')} className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors" title="Reject">
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegularizationModule;
