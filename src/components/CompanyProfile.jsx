import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Check, AlertCircle } from 'lucide-react';
import config from '../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': getToken() || '',
});
const getCompanyId = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.companyId;
  } catch (e) { return null; }
};

const CompanyProfile = () => {
  const [form, setForm] = useState({
    company_name: '',
    logo: '',
    gst_no: '',
    pan_no: '',
    cin_no: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    mobile: '',
    email: '',
    website: '',
    bank_name: '',
    account_no: '',
    ifsc_code: '',
    upi_id: '',
    authorized_signatory: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const companyId = getCompanyId();

  useEffect(() => {
    if (!companyId) {
      setError('Company ID not found in token.');
      setLoading(false);
      return;
    }
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/companies/${companyId}`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) {
          setForm((prev) => ({ ...prev, ...data.data }));
        } else {
          setError(data.message || 'Failed to fetch company details.');
        }
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

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
      const res = await fetch(`${config.apiUrl}/companies/${companyId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Company details updated successfully.');
      } else {
        setError(data.message || 'Failed to update details.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading company details...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        {form.logo ? (
          <img src={form.logo} alt="Company Logo" className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-200 dark:border-slate-700" />
        ) : (
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl">
            {form.company_name?.charAt(0) || <Building />}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{form.company_name || 'Company Profile'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your company settings and details</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 space-y-6">
        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Basic Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
              <input type="text" name="company_name" value={form.company_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
              <input type="text" name="logo" value={form.logo} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mobile</label>
              <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
              <input type="text" name="website" value={form.website} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Legal Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">GST Number</label>
              <input type="text" name="gst_no" value={form.gst_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">PAN Number</label>
              <input type="text" name="pan_no" value={form.pan_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">CIN Number</label>
              <input type="text" name="cin_no" value={form.cin_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Pincode</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bank Name</label>
              <input type="text" name="bank_name" value={form.bank_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Account Number</label>
              <input type="text" name="account_no" value={form.account_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">IFSC Code</label>
              <input type="text" name="ifsc_code" value={form.ifsc_code} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">UPI ID</label>
              <input type="text" name="upi_id" value={form.upi_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Authorized Signatory</label>
              <input type="text" name="authorized_signatory" value={form.authorized_signatory} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Check size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
