import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Tag, DollarSign, Layers } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'Monthly',
    max_users: '',
    max_storage_gb: '',
    features: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/saas/plans`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        max_users: Number(formData.max_users),
        max_storage_gb: Number(formData.max_storage_gb),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };

      const url = editingPlan 
        ? `${config.apiUrl}/saas/plans/${editingPlan._id}` 
        : `${config.apiUrl}/saas/plans`;
      
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchPlans();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error saving plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      features: (plan.features || []).join(', ')
    });
    setShowModal(true);
  };

  const openNewPlanModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      billing_cycle: 'Monthly',
      max_users: '',
      max_storage_gb: '',
      features: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-6">Loading plans...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h2>
          <p className="text-gray-500 text-sm mt-1">Manage pricing and features for your SaaS platform.</p>
        </div>
        <button
          onClick={openNewPlanModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus size={18} />
          <span>New Plan</span>
        </button>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden">
            {plan.status !== 'Active' && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Inactive
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.billing_cycle}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹{plan.price}</span>
              <span className="text-gray-500 text-sm">/{plan.billing_cycle === 'Yearly' ? 'yr' : 'mo'}</span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
            
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Up to {plan.max_users} Users</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>{plan.max_storage_gb} GB Storage</span>
              </div>
              {plan.features?.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleEdit(plan)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 size={16} /> Edit Plan
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
                  <input
                    type="text" required
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.billing_cycle} onChange={e => setFormData({...formData, billing_cycle: e.target.value})}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number" required min="0"
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Users</label>
                  <input
                    type="number" required min="1"
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.max_users} onChange={e => setFormData({...formData, max_users: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Storage (GB)</label>
                  <input
                    type="number" required min="1"
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                    value={formData.max_storage_gb} onChange={e => setFormData({...formData, max_storage_gb: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (comma separated)</label>
                <textarea
                  className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white h-24"
                  value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})}
                  placeholder="Feature 1, Feature 2, Feature 3"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
