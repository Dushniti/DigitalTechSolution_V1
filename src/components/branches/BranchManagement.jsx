import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Phone, Mail, Building } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  
  const [formData, setFormData] = useState({
    branch_name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    contact_email: '',
    contact_phone: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/saas/branches`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBranch 
        ? `${config.apiUrl}/saas/branches/${editingBranch._id}` 
        : `${config.apiUrl}/saas/branches`;
      
      const method = editingBranch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchBranches();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error saving branch');
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      branch_name: branch.branch_name,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || '',
      zip_code: branch.zip_code || '',
      contact_email: branch.contact_email || '',
      contact_phone: branch.contact_phone || '',
      status: branch.status || 'Active'
    });
    setShowModal(true);
  };

  const openNewBranchModal = () => {
    setEditingBranch(null);
    setFormData({
      branch_name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip_code: '',
      contact_email: '',
      contact_phone: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-6">Loading branches...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage multiple office locations and branches.</p>
        </div>
        <button
          onClick={openNewBranchModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Add Branch</span>
        </button>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => (
          <div key={branch._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden">
            {branch.status !== 'Active' && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Inactive
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                <Building size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{branch.branch_name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {branch.city}{branch.city && branch.state ? ',' : ''} {branch.state}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 flex-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{branch.address}, {branch.city}, {branch.state} {branch.zip_code}, {branch.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <span>{branch.contact_email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>{branch.contact_phone || 'N/A'}</span>
              </div>
            </div>

            <button
              onClick={() => handleEdit(branch)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 size={16} /> Edit Details
            </button>
          </div>
        ))}

        {branches.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-12 text-center">
             <Building size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Branches Found</h3>
             <p className="text-gray-500 mb-6">You haven't added any branches or locations yet.</p>
             <button
               onClick={openNewBranchModal}
               className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
             >
               <Plus size={18} />
               <span>Add Your First Branch</span>
             </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Branch Name</label>
                <input
                  type="text" required
                  className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.branch_name} onChange={e => setFormData({...formData, branch_name: e.target.value})}
                  placeholder="e.g., Downtown Office, Warehouse 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
                <input
                  type="text" required
                  className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                  <input
                    type="text" required
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State/Province</label>
                  <input
                    type="text" required
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
                  <input
                    type="text" required
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ZIP/Postal Code</label>
                  <input
                    type="text" required
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                  {editingBranch ? 'Update Branch' : 'Add Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
