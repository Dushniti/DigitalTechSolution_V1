import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, AlertCircle, LayoutTemplate } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Authorization': getToken() || '',
  'Content-Type': 'application/json'
});

const TemplateSettings = () => {
  const [form, setForm] = useState({
    invoice_template: 'Classic',
    quotation_template: 'Classic',
    terms_conditions: '',
    footer_notes: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/settings/company`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success && data.data) {
          setForm(prev => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        setError('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

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
      const res = await fetch(`${config.apiUrl}/settings/company`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Template settings updated successfully');
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading templates...</div>;

  const templates = ['Classic', 'Modern', 'Professional'];

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
            <LayoutTemplate size={18} className="text-blue-600" />
            Document Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Template</label>
              <div className="grid grid-cols-3 gap-3">
                {templates.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, invoice_template: t })}
                    className={`py-3 px-4 border rounded-xl text-sm font-medium transition-all ${
                      form.invoice_template === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quotation Template</label>
              <div className="grid grid-cols-3 gap-3">
                {templates.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, quotation_template: t })}
                    className={`py-3 px-4 border rounded-xl text-sm font-medium transition-all ${
                      form.quotation_template === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Standard Text
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Terms & Conditions</label>
              <textarea 
                name="terms_conditions" 
                value={form.terms_conditions} 
                onChange={handleChange} 
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white transition-colors"
                placeholder="Enter standard terms to appear on all documents..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Footer Notes / Thank You Message</label>
              <input 
                type="text" 
                name="footer_notes" 
                value={form.footer_notes} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50"
                placeholder="e.g. Thank you for your business!"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateSettings;
