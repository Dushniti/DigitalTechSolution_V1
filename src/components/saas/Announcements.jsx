import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit2, Clock, CheckCircle2 } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Info', // Info, Warning, Success
    is_global: false
  });

  // Determine role
  const token = getToken();
  let role = '';
  if (token) {
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    try {
      role = JSON.parse(atob(actualToken.split('.')[1])).role;
    } catch (e) {}
  }
  const isSuperAdmin = role === 'Admin';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // In a real app, this would hit a specific announcements endpoint
      // Mock data for UI demonstration
      setAnnouncements([
        {
          _id: '1',
          title: 'System Maintenance Scheduled',
          message: 'The system will be down for maintenance on Saturday from 2 AM to 4 AM.',
          type: 'Warning',
          is_global: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '2',
          title: 'New Feature: Client Portal',
          message: 'We have launched the new client portal for your customers to track their work orders and invoices.',
          type: 'Success',
          is_global: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } catch (err) {
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mock submit
    const newAnnouncement = {
      _id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString()
    };
    
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowModal(false);
    setFormData({ title: '', message: '', type: 'Info', is_global: false });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a._id !== id));
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Success': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) return <div className="p-6">Loading announcements...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isSuperAdmin ? 'Broadcast messages to all companies and users.' : 'View system and company announcements.'}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            <span>New Broadcast</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map(announcement => (
          <div key={announcement._id} className={`p-6 rounded-2xl border ${getTypeStyle(announcement.type)} relative`}>
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Megaphone size={18} />
                {announcement.title}
                {announcement.is_global && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold uppercase tracking-wider ml-2">
                    Global
                  </span>
                )}
              </h3>
              {isSuperAdmin && (
                <button onClick={() => handleDelete(announcement._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <p className="text-sm opacity-90">{announcement.message}</p>
            <div className="mt-4 flex items-center gap-1 text-xs opacity-75 font-medium">
              <Clock size={14} />
              {new Date(announcement.created_at).toLocaleString()}
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No announcements at this time.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Announcement</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                  <textarea
                    required rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Info">Info</option>
                      <option value="Success">Success</option>
                      <option value="Warning">Warning</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        checked={formData.is_global}
                        onChange={e => setFormData({...formData, is_global: e.target.checked})}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Global Broadcast</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
