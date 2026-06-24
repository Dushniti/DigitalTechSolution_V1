import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Building, Trash2, Pencil, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import config from '../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': getToken() || '',
});

const CompanyModal = ({ company, onClose, onSaved }) => {
  const [form, setForm] = useState(
    company || {
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
      status: 'Active',
      // Company Admin fields (only for new company)
      admin_name: '',
      admin_email: '',
      admin_mobile: '',
      admin_password: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isEdit = !!company;
      const url = isEdit ? `${config.apiUrl}/companies/${company._id}` : `${config.apiUrl}/companies`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        companyData: {
          company_name: form.company_name,
          logo: form.logo,
          gst_no: form.gst_no,
          pan_no: form.pan_no,
          cin_no: form.cin_no,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
          mobile: form.mobile,
          email: form.email,
          website: form.website,
          bank_name: form.bank_name,
          account_no: form.account_no,
          ifsc_code: form.ifsc_code,
          upi_id: form.upi_id,
          authorized_signatory: form.authorized_signatory,
          status: form.status,
        }
      };

      if (!isEdit) {
        payload.adminData = {
          name: form.admin_name,
          email: form.admin_email,
          mobile: form.admin_mobile,
          password: form.admin_password,
        };
      } else {
        // Just send the fields to update directly for PUT
        Object.assign(payload, payload.companyData);
        delete payload.companyData;
      }

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        setError(data.message || 'Failed to save company.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {company ? 'Edit Company' : 'Add New Company'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Details */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">Company Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company Name *</label>
                <input type="text" name="company_name" value={form.company_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
                <input type="text" name="logo" value={form.logo} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Legal Details */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">Legal Details</h4>
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

          {/* Address */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
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

          {/* Bank Details */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">Bank Details</h4>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Authorized Signatory Name</label>
                <input type="text" name="authorized_signatory" value={form.authorized_signatory} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Company Admin Settings (Only visible during creation) */}
          {!company && (
            <div>
              <h4 className="text-md font-semibold text-blue-600 dark:text-blue-400 mb-3 border-b border-blue-100 dark:border-blue-900/30 pb-2">Assign Company Admin</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Admin Name *</label>
                  <input type="text" name="admin_name" value={form.admin_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Admin Email *</label>
                  <input type="email" name="admin_email" value={form.admin_email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Admin Mobile</label>
                  <input type="text" name="admin_mobile" value={form.admin_mobile} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Admin Password *</label>
                  <input type="password" name="admin_password" value={form.admin_password} onChange={handleChange} required minLength="6" className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Check size={16} /> Save Company</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const CompanyMaster = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [toast, setToast] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/companies`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch companies.');
      }
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleStatusToggle = async (company) => {
    try {
      const newStatus = company.status === 'Active' ? 'Inactive' : 'Active';
      const res = await fetch(`${config.apiUrl}/companies/${company._id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status updated successfully.');
        fetchCompanies();
      } else {
        setError(data.message || 'Failed to update status.');
      }
    } catch {
      setError('Network error.');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <CompanyModal
            company={editingCompany}
            onClose={() => {
              setIsModalOpen(false);
              setEditingCompany(null);
            }}
            onSaved={() => {
              setIsModalOpen(false);
              setEditingCompany(null);
              showToast(editingCompany ? 'Company updated successfully' : 'Company created successfully');
              fetchCompanies();
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="text-blue-600 dark:text-blue-400" size={24} /> Company Master
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage multiple companies and their details</p>
        </div>
        <button
          onClick={() => {
            setEditingCompany(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus size={18} /> Add New Company
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search companies by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>
          <button onClick={fetchCompanies} className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-16 ml-auto"></div>
                </div>
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Companies Found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                {searchQuery ? "No companies matched your search." : "No companies added yet."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-xl">Company Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredCompanies.map((comp) => (
                  <motion.tr key={comp._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {comp.logo ? (
                          <img src={comp.logo} alt="logo" className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold">{comp.company_name.charAt(0)}</div>
                        )}
                        <p className="font-semibold text-gray-900 dark:text-white">{comp.company_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{comp.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{comp.mobile || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(comp)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          comp.status === 'Active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {comp.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setEditingCompany(comp); setIsModalOpen(true); }}
                        className="p-2 inline-flex text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        title="Edit Company"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyMaster;
