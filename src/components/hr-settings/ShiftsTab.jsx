import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const ShiftsTab = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formData, setFormData] = useState({ name: '', startTime: '', endTime: '' });

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/shifts`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setShifts(data.data);
      else setError(data.message || 'Failed to fetch shifts');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingShift ? 'PUT' : 'POST';
      const url = editingShift 
        ? `${config.apiUrl}/shifts/${editingShift._id}` 
        : `${config.apiUrl}/shifts`;
        
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchShifts();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error saving shift');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/shifts/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) fetchShifts();
      else alert(data.message);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openModal = (shift = null) => {
    setEditingShift(shift);
    setFormData(shift ? { name: shift.name, startTime: shift.startTime, endTime: shift.endTime } : { name: '', startTime: '', endTime: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Shift Management</h3>
        <div className="flex gap-2">
          <button onClick={fetchShifts} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={16} /> Add Shift
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Shift Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Start Time</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">End Time</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : shifts.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-500">No shifts found</td></tr>
            ) : (
              shifts.map(d => (
                <tr key={d._id} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{d.name}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-600">{d.startTime}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-600">{d.endTime}</td>
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
            <h3 className="text-xl font-bold mb-4">{editingShift ? 'Edit' : 'Add'} Shift</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Shift Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" placeholder="e.g. Morning Shift" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Start Time</label>
                  <input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">End Time</label>
                  <input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
                </div>
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

export default ShiftsTab;
