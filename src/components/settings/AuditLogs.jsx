import { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Authorization': getToken() || '',
  'Content-Type': 'application/json'
});

const AuditLogs = () => {
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' or 'audit'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    limit: 100
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (filters.module) queryParams.append('module', filters.module);
      if (activeTab === 'activity' && filters.action) queryParams.append('action', filters.action);
      queryParams.append('limit', filters.limit);

      const endpoint = activeTab === 'activity' ? 'activity' : 'audit';
      const res = await fetch(`${config.apiUrl}/logs/${endpoint}?${queryParams}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab, filters]);

  const renderActivityLogs = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Details</th>
            <th className="px-4 py-3">IP Address</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
              <td className="px-4 py-3">{log.userDetails?.name || log.userDetails?.email || 'System'}</td>
              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{log.module_name}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  log.action === 'Created' ? 'bg-green-100 text-green-700' :
                  log.action === 'Updated' ? 'bg-blue-100 text-blue-700' :
                  log.action === 'Deleted' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs truncate" title={log.details}>{log.details}</td>
              <td className="px-4 py-3 text-xs">{log.ip_address}</td>
            </tr>
          ))}
          {logs.length === 0 && !loading && (
            <tr><td colSpan="6" className="text-center py-8">No activity logs found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Record ID</th>
            <th className="px-4 py-3">Updated By</th>
            <th className="px-4 py-3">Changes (New Data)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{log.module_name}</td>
              <td className="px-4 py-3 text-xs font-mono">{log.record_id || 'N/A'}</td>
              <td className="px-4 py-3">{log.updaterDetails?.name || 'System'}</td>
              <td className="px-4 py-3">
                <div className="max-h-24 overflow-y-auto bg-gray-50 dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-700 text-xs font-mono">
                  {JSON.stringify(log.new_data, null, 2)}
                </div>
              </td>
            </tr>
          ))}
          {logs.length === 0 && !loading && (
            <tr><td colSpan="5" className="text-center py-8">No audit logs found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('activity')}
            className={`pb-4 px-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Activity Logs
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`pb-4 px-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Audit Logs (Data Changes)
          </button>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={filters.module} 
            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800"
          >
            <option value="">All Modules</option>
            <option value="Customer">Customers</option>
            <option value="Invoice">Invoices</option>
            <option value="Payment">Payments</option>
            <option value="Quotation">Quotations</option>
            <option value="Expense">Expenses</option>
          </select>
          <button onClick={fetchLogs} className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === 'activity' ? renderActivityLogs() : renderAuditLogs()}
      </div>
    </div>
  );
};

export default AuditLogs;
