import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, MessageSquare, Check, AlertCircle } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Authorization': getToken() || '',
  'Content-Type': 'application/json'
});

const NotificationSettings = () => {
  const [form, setForm] = useState({
    email_enabled: true,
    whatsapp_enabled: false,
    reminder_enabled: true,
    email_templates: {
      invoice: 'Dear {CustomerName},\n\nPlease find attached the invoice {InvoiceNo} for the amount of {Amount}.\n\nRegards,\n{CompanyName}',
      quotation: 'Dear {CustomerName},\n\nPlease find attached the quotation {QuotationNo}.\n\nRegards,\n{CompanyName}'
    },
    whatsapp_templates: {
      payment_reminder: 'Hi {CustomerName}, this is a gentle reminder that an amount of {Amount} is due for invoice {InvoiceNo}. Please clear the dues at the earliest.'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/settings/notifications`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success && data.data) {
          setForm(prev => ({
            ...prev,
            ...data.data,
            email_templates: { ...prev.email_templates, ...(data.data.email_templates || {}) },
            whatsapp_templates: { ...prev.whatsapp_templates, ...(data.data.whatsapp_templates || {}) }
          }));
        }
      } catch (err) {
        setError('Failed to fetch notification settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleTemplateChange = (type, key, value) => {
    setForm({
      ...form,
      [type]: { ...form[type], [key]: value }
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`${config.apiUrl}/settings/notifications`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Notification settings updated');
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;

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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" size={20} />
              <span className="font-semibold text-gray-900 text-sm">Email Notifications</span>
            </div>
            <input type="checkbox" name="email_enabled" checked={form.email_enabled} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
          </label>
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-green-600" size={20} />
              <span className="font-semibold text-gray-900 text-sm">WhatsApp</span>
            </div>
            <input type="checkbox" name="whatsapp_enabled" checked={form.whatsapp_enabled} onChange={handleChange} className="w-5 h-5 text-green-600 rounded" />
          </label>
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="text-orange-600" size={20} />
              <span className="font-semibold text-gray-900 text-sm">Auto Reminders</span>
            </div>
            <input type="checkbox" name="reminder_enabled" checked={form.reminder_enabled} onChange={handleChange} className="w-5 h-5 text-orange-600 rounded" />
          </label>
        </div>

        {form.email_enabled && (
          <div className="space-y-4">
            <h4 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-2">Email Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Invoice Email</label>
                <textarea 
                  value={form.email_templates.invoice} 
                  onChange={(e) => handleTemplateChange('email_templates', 'invoice', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quotation Email</label>
                <textarea 
                  value={form.email_templates.quotation} 
                  onChange={(e) => handleTemplateChange('email_templates', 'quotation', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Available tags: {`{CustomerName}, {InvoiceNo}, {QuotationNo}, {Amount}, {CompanyName}`}</p>
          </div>
        )}

        {form.whatsapp_enabled && (
          <div className="space-y-4">
            <h4 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-2">WhatsApp Templates</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
              Note: WhatsApp integration uses mock API for demonstration. Actual integration requires a paid provider (e.g., Twilio).
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Reminder</label>
              <textarea 
                value={form.whatsapp_templates.payment_reminder} 
                onChange={(e) => handleTemplateChange('whatsapp_templates', 'payment_reminder', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;
