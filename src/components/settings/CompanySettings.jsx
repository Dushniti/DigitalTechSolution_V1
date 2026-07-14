import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Check, AlertCircle, Camera } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
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
const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (e) { return null; }
};

const CompanySettings = () => {
  const [form, setForm] = useState({
    company_name: '',
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
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  
  const logoInputRef = useRef(null);
  const sigInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const role = getRoleFromToken();
  const tokenCompanyId = getCompanyId();

  useEffect(() => {
    if (role === 'Admin') {
      // Fetch all companies for Admin to select
      fetch(`${config.apiUrl}/companies`, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            setCompanies(data.data);
            setSelectedCompanyId(data.data[0]._id);
          } else {
            setLoading(false);
            setError('No companies found.');
          }
        })
        .catch(() => {
          setError('Failed to fetch companies.');
          setLoading(false);
        });
    } else {
      if (!tokenCompanyId) {
        setError('Company ID not found.');
        setLoading(false);
        return;
      }
      setSelectedCompanyId(tokenCompanyId);
    }
  }, [role, tokenCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    
    setLoading(true);
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/companies/${selectedCompanyId}`, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (data.success) {
          const cData = data.data;
          setForm((prev) => ({ ...prev, ...cData }));
          if (cData.logo) setLogoPreview(`${config.apiUrl.replace('/api', '')}/uploads/${cData.logo}`);
          if (cData.signature) setSignaturePreview(`${config.apiUrl.replace('/api', '')}/uploads/${cData.signature}`);
        }
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [selectedCompanyId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setSignatureFile(file);
        setSignaturePreview(URL.createObjectURL(file));
      }
    }
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
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key]);
      });
      if (logoFile) formData.append('logo', logoFile);
      if (signatureFile) formData.append('signature', signatureFile);

      const res = await fetch(`${config.apiUrl}/companies/${selectedCompanyId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast('Company details updated.');
      } else {
        setError(data.message || 'Failed to update details.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading company details...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {role === 'Admin' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Company to Update Profile</label>
          <select
            value={selectedCompanyId || ''}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.company_name}</option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Building className="text-gray-400" size={30} />}
              </div>
              <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700">
                <Camera size={14} />
              </button>
              <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
            </div>
            <div>
              <h4 className="text-md font-bold text-gray-900">Company Logo</h4>
              <p className="text-xs text-gray-500">Used on invoices & reports</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-32 h-16 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                {signaturePreview ? <img src={signaturePreview} alt="Signature" className="w-full h-full object-contain" /> : <span className="text-gray-400 text-xs">No Signature</span>}
              </div>
              <button type="button" onClick={() => sigInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700">
                <Camera size={14} />
              </button>
              <input type="file" ref={sigInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} />
            </div>
            <div>
              <h4 className="text-md font-bold text-gray-900">Digital Signature</h4>
              <p className="text-xs text-gray-500">Auto-applied to documents</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Basic Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
              <input type="text" name="company_name" value={form.company_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile</label>
              <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
              <input type="text" name="website" value={form.website} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Legal Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number</label>
              <input type="text" name="gst_no" value={form.gst_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">PAN Number</label>
              <input type="text" name="pan_no" value={form.pan_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">CIN Number</label>
              <input type="text" name="cin_no" value={form.cin_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank Name</label>
              <input type="text" name="bank_name" value={form.bank_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number</label>
              <input type="text" name="account_no" value={form.account_no} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">IFSC Code</label>
              <input type="text" name="ifsc_code" value={form.ifsc_code} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">UPI ID</label>
              <input type="text" name="upi_id" value={form.upi_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Authorized Signatory Name</label>
              <input type="text" name="authorized_signatory" value={form.authorized_signatory} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
