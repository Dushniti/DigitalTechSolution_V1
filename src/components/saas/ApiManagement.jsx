import React, { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const ApiManagement = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const [newKeyName, setNewKeyName] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/saas/api-keys`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    setGenerating(true);
    try {
      const res = await fetch(`${config.apiUrl}/saas/api-keys`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewKeyName('');
        fetchKeys();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error generating key');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone and any integrations using this key will stop working.')) return;
    
    try {
      const res = await fetch(`${config.apiUrl}/saas/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchKeys();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error revoking key');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) return <div className="p-6">Loading API Keys...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
          <p className="text-gray-500 text-sm mt-1">Manage API keys for system integrations and client portal access.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Generate New Key</span>
        </button>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Key Name</th>
                <th className="px-6 py-4 font-semibold">API Key</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created On</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {keys.map(key => (
                <tr key={key._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {key.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-gray-800 dark:text-gray-200 font-mono text-xs">
                        {key.api_key}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(key.api_key, key._id)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedKey === key._id ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${key.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {key.status === 'Active' && (
                      <button
                        onClick={() => handleRevoke(key._id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center justify-end gap-1 w-full"
                      >
                        <Trash2 size={16} /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Key size={48} className="mx-auto text-gray-300 mb-3" />
                    <p>No API keys found.</p>
                    <p className="text-xs mt-1">Generate one to allow integrations to securely access your data.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generate API Key</h3>
            <form onSubmit={handleGenerate}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Key Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Website Integration"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                <button 
                  type="submit" 
                  disabled={generating || !newKeyName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:bg-blue-400"
                >
                  {generating ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiManagement;
