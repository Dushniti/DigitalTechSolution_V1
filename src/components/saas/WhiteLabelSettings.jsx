import React, { useState, useEffect } from 'react';
import { Palette, Upload, CheckCircle2, Building, Monitor, Globe } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const WhiteLabelSettings = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    portal_domain: '',
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
    logo_url: '',
    favicon_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const token = getToken();
      const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const payload = JSON.parse(atob(actualToken.split('.')[1]));
      
      const res = await fetch(`${config.apiUrl}/companies/${payload.companyId}`, { headers: authHeaders() });
      const data = await res.json();
      
      if (data.success && data.data) {
        setFormData({
          company_name: data.data.company_name || '',
          portal_domain: data.data.client_portal_domain || '',
          primary_color: data.data.theme_colors?.primary || '#3b82f6',
          secondary_color: data.data.theme_colors?.secondary || '#1e40af',
          logo_url: data.data.logo || '',
          favicon_url: data.data.favicon || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError('');

    try {
      const token = getToken();
      const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const payload = JSON.parse(atob(actualToken.split('.')[1]));

      const updatePayload = {
        company_name: formData.company_name,
        client_portal_domain: formData.portal_domain,
        theme_colors: {
          primary: formData.primary_color,
          secondary: formData.secondary_color
        },
        logo: formData.logo_url,
        favicon: formData.favicon_url
      };

      const res = await fetch(`${config.apiUrl}/companies/${payload.companyId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatePayload)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('White-label settings updated successfully!');
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">White-Labeling & Branding</h2>
        <p className="text-gray-500 text-sm mt-1">Customize the ERP platform and Client Portal to match your brand identity.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
        
        {/* Basic Brand Info */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building size={20} className="text-blue-500" />
            Brand Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company Display Name</label>
              <input
                type="text" required
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                value={formData.company_name}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Custom Client Portal Domain</label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="portal.yourcompany.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.portal_domain}
                  onChange={e => setFormData({...formData, portal_domain: e.target.value})}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Requires CNAME DNS configuration</p>
            </div>
          </div>
        </div>

        {/* Brand Assets */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-purple-500" />
            Brand Assets (URLs)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white mb-2"
                value={formData.logo_url}
                onChange={e => setFormData({...formData, logo_url: e.target.value})}
              />
              {formData.logo_url && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 inline-block">
                   <img src={formData.logo_url} alt="Logo Preview" className="h-10 object-contain" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Favicon URL</label>
              <input
                type="url"
                placeholder="https://example.com/favicon.ico"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white mb-2"
                value={formData.favicon_url}
                onChange={e => setFormData({...formData, favicon_url: e.target.value})}
              />
              {formData.favicon_url && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 inline-block">
                   <img src={formData.favicon_url} alt="Favicon Preview" className="h-6 w-6 object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="pb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Palette size={20} className="text-rose-500" />
            Theme Colors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-12 h-12 p-1 border border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer"
                  value={formData.primary_color}
                  onChange={e => setFormData({...formData, primary_color: e.target.value})}
                />
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.primary_color}
                  onChange={e => setFormData({...formData, primary_color: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-12 h-12 p-1 border border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer"
                  value={formData.secondary_color}
                  onChange={e => setFormData({...formData, secondary_color: e.target.value})}
                />
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  value={formData.secondary_color}
                  onChange={e => setFormData({...formData, secondary_color: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WhiteLabelSettings;
