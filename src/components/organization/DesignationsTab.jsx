import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const decodeToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const DesignationsTab = () => {
  const userRole = decodeToken(getToken())?.role;
  const isAdmin = userRole === 'Admin';

  const [designations, setDesignations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchText, setCompanySearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', level: 1 });

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const q = selectedCompanyId ? `?companyId=${selectedCompanyId}` : '';
      
      const reqs = [
        fetch(`${config.apiUrl}/designations${q}`, { headers: authHeaders() })
      ];

      if (isAdmin && companies.length === 0) {
        reqs.push(fetch(`${config.apiUrl}/companies`, { headers: authHeaders() }));
      }

      const results = await Promise.all(reqs);
      const data = await results[0].json();
      
      if (data.success) setDesignations(data.data);
      else setError(data.message || 'Failed to fetch designations');

      if (isAdmin && companies.length === 0 && results[1]) {
        const compData = await results[1].json();
        if (compData.success) setCompanies(compData.data || []);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, [selectedCompanyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingDesig ? 'PUT' : 'POST';
      const url = editingDesig 
        ? `${config.apiUrl}/designations/${editingDesig._id}` 
        : `${config.apiUrl}/designations`;
        
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchDesignations();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error saving designation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this designation?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/designations/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) fetchDesignations();
      else alert(data.message);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openModal = (desig = null) => {
    setEditingDesig(desig);
    setFormData(desig ? { title: desig.title, description: desig.description, level: desig.level } : { title: '', description: '', level: 1 });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Designations</h3>
          {isAdmin && (
            <div className="relative">
              <div 
                className="flex items-center justify-between px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 cursor-pointer min-w-[200px]"
                onClick={() => setCompanySearchOpen(!companySearchOpen)}
              >
                <span className="truncate pr-4 font-medium text-blue-600 dark:text-blue-400">
                  {selectedCompanyId ? companies.find(c => c._id === selectedCompanyId)?.company_name : 'All Companies'}
                </span>
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              
              {companySearchOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => { setCompanySearchOpen(false); setCompanySearchText(''); }} />
                  <div className="absolute top-full left-0 mt-1 w-full min-w-[250px] max-h-[300px] overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-20 py-1 custom-scrollbar">
                    <div className="sticky top-0 bg-white dark:bg-slate-800 p-2 border-b border-gray-100 dark:border-slate-700 z-10">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search companies..."
                        value={companySearchText}
                        onChange={(e) => setCompanySearchText(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                      />
                    </div>
                    <div 
                      className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors ${!selectedCompanyId ? 'bg-blue-50/50 dark:bg-slate-700/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => {
                        setSelectedCompanyId('');
                        setCompanySearchOpen(false);
                        setCompanySearchText('');
                      }}
                    >
                      All Companies
                    </div>
                    {companies
                      .filter(c => c.company_name.toLowerCase().includes(companySearchText.toLowerCase()))
                      .map(c => (
                        <div 
                          key={c._id}
                          className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors ${selectedCompanyId === c._id ? 'bg-blue-50/50 dark:bg-slate-700/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={() => {
                            setSelectedCompanyId(c._id);
                            setCompanySearchOpen(false);
                            setCompanySearchText('');
                          }}
                        >
                          {c.company_name}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDesignations} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={16} /> Add Designation
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Level</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : designations.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-500">No designations found</td></tr>
            ) : (
              designations.map(d => (
                <tr key={d._id} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{d.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{d.level}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{d.description || '-'}</td>
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
            <h3 className="text-xl font-bold mb-4">{editingDesig ? 'Edit' : 'Add'} Designation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Level (Hierarchy)</label>
                <input type="number" required value={formData.level} onChange={e => setFormData({...formData, level: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent" rows={3}></textarea>
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

export default DesignationsTab;
