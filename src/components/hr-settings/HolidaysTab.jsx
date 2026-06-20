import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const HolidaysTab = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({ name: '', date: '', type: 'Public' });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/holidays`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setHolidays(data.data);
      else setError(data.message || 'Failed to fetch holidays');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingHoliday ? 'PUT' : 'POST';
      const url = editingHoliday 
        ? `${config.apiUrl}/holidays/${editingHoliday._id}` 
        : `${config.apiUrl}/holidays`;
        
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchHolidays();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error saving holiday');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/holidays/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) fetchHolidays();
      else alert(data.message);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openModal = (holiday = null) => {
    setEditingHoliday(holiday);
    setFormData(holiday ? { name: holiday.name, date: holiday.date.split('T')[0], type: holiday.type } : { name: '', date: '', type: 'Public' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Company Holidays</h3>
        <div className="flex gap-2">
          <button onClick={fetchHolidays} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={16} /> Add Holiday
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Holiday Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : holidays.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-500">No holidays found</td></tr>
            ) : (
              holidays.map(d => (
                <tr key={d._id} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{d.name}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-600">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.type === 'Public' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {d.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex justify-end gap-2">
                    <button onClick={() => openModal(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(d._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingHoliday ? 'Edit' : 'Add'} Holiday</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Holiday Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Date</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent">
                  <option value="Public">Public</option>
                  <option value="Company">Company</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidaysTab;
