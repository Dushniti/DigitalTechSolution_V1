import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Database, Check, AlertCircle, DownloadCloud } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Authorization': getToken() || '',
  'Content-Type': 'application/json'
});

const SystemSettings = ({ isBackup = false }) => {
  const [form, setForm] = useState({
    application_name: 'Digital Tech Solution ERP',
    default_currency: 'INR',
    date_format: 'DD/MM/YYYY',
    time_zone: 'Asia/Kolkata',
  });
  
  const [loading, setLoading] = useState(!isBackup);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isBackup) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/settings/system`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success && data.data) {
          setForm(prev => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        setError('Failed to fetch system settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [isBackup]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`${config.apiUrl}/settings/system`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast('System settings updated successfully');
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      window.open(`${config.apiUrl}/backup/download`, '_blank');
    } catch (err) {
      setError('Failed to download backup');
    }
  };

  if (isBackup) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Database Backup</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Download a complete JSON export of all core collections including companies, users, invoices, and settings.
          </p>
          <div className="pt-6">
            <button 
              onClick={handleBackup}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 mx-auto shadow-sm shadow-blue-200"
            >
              <DownloadCloud size={18} /> Generate & Download Backup
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Global Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Name</label>
              <input type="text" name="application_name" value={form.application_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Currency</label>
              <select name="default_currency" value={form.default_currency} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Format</label>
              <select name="date_format" value={form.date_format} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Zone</label>
              <select name="time_zone" value={form.time_zone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
