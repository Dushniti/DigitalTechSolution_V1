import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Check, AlertCircle, User, Briefcase, Phone,
  CreditCard, Shield, Hash, Building, Award, Lock, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({ 'Authorization': getToken() || '' });
const getBaseUrl = () => config.apiUrl.replace('/api', '');

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value || <span className="text-gray-400 dark:text-gray-600 italic">Not set</span>}</span>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Icon size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-slate-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmployeeProfileSettings = () => {
  const [empData, setEmpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [form, setForm] = useState({ name: '', mobile: '', password: '', confirmPassword: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const res = await fetch(`${config.apiUrl}/employees/me`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success && data.data) {
          setEmpData(data.data);
          setForm(f => ({
            ...f,
            name: data.data.name || '',
            mobile: data.data.personalInfo?.phone || '',
          }));
          if (data.data.avatar) {
            setAvatarPreview(`${getBaseUrl()}/uploads/${data.data.avatar}`);
          }
        } else {
          setFetchError(data.message || 'Employee profile not found. Please contact HR.');
        }
      } catch {
        setFetchError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setSaveError('Passwords do not match');
      return;
    }
    if (form.password && form.password.length < 6) {
      setSaveError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();
      if (form.name) formData.append('name', form.name);
      if (form.mobile) formData.append('mobile', form.mobile);
      if (form.password) formData.append('password', form.password);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await fetch(`${config.apiUrl}/users/me/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast('Profile updated successfully!');
        setForm(f => ({ ...f, password: '', confirmPassword: '' }));
        setAvatarFile(null);
      } else {
        setSaveError(data.message || 'Update failed');
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const emp = empData || {};
  const pi = emp.personalInfo || {};
  const ec = emp.emergencyContact || {};
  const bd = emp.bankDetails || {};

  const statusColors = {
    Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'On Leave': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Hero Card */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)'}} />
        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center shadow-lg">
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = ''; }} />
                : <User size={36} className="text-white/70" />
              }
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              title="Change photo"
            >
              <Camera size={13} />
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Name, email, badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{emp.name || form.name || 'Employee'}</h2>
            <p className="text-blue-100 text-sm truncate">{emp.email || ''}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {emp.employeeCode && (
                <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                  <Hash size={11} /> {emp.employeeCode}
                </span>
              )}
              {emp.status && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[emp.status] || 'bg-white/20 text-white'}`}>
                  {emp.status}
                </span>
              )}
              {emp.employmentType && (
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">{emp.employmentType}</span>
              )}
            </div>
          </div>

          {/* Designation / Dept (desktop) */}
          <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0">
            {emp.designation?.title && (
              <span className="text-xs bg-white/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                <Award size={12} /> {emp.designation.title}
              </span>
            )}
            {emp.department?.name && (
              <span className="text-xs bg-white/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                <Building size={12} /> {emp.department.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fetch error (non-blocking) */}
      {fetchError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm border border-amber-200 dark:border-amber-800">
          <AlertCircle size={16} className="shrink-0" /> {fetchError}
        </div>
      )}

      {/* ── Editable: Basic Info + Password ── */}
      <SectionCard title="Edit My Profile" icon={User} defaultOpen={true}>
        {saveError && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            <AlertCircle size={15} /> {saveError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Mobile Number</label>
              <input
                type="text" name="mobile" value={form.mobile} onChange={handleChange}
                placeholder="10-digit number"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={13} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Change Password</span>
              <span className="text-xs text-gray-400 italic">(Leave blank to keep current)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                  <button type="button" onClick={() => setShowConfirmPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center gap-2 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Check size={15} /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </SectionCard>

      {/* ── Employment Details (Read-only) ── */}
      {empData && (
        <SectionCard title="Employment Details" icon={Briefcase} defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mt-3">
            <InfoRow label="Employee Code" value={emp.employeeCode} />
            <InfoRow label="Designation" value={emp.designation?.title} />
            <InfoRow label="Department" value={emp.department?.name} />
            <InfoRow label="Employment Type" value={emp.employmentType} />
            <InfoRow label="Work Location" value={emp.workLocation} />
            <InfoRow label="Status" value={emp.status} />
            <InfoRow label="Joining Date" value={emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            <InfoRow label="Probation End Date" value={emp.probationEndDate ? new Date(emp.probationEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            <InfoRow label="Reporting Manager" value={emp.manager?.name} />
          </div>
        </SectionCard>
      )}

      {/* ── Personal Info (Read-only) ── */}
      {empData && (
        <SectionCard title="Personal Information" icon={User} defaultOpen={false}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mt-3">
            <InfoRow label="Date of Birth" value={pi.dob ? new Date(pi.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            <InfoRow label="Gender" value={pi.gender} />
            <InfoRow label="Blood Group" value={pi.bloodGroup} />
            <InfoRow label="Marital Status" value={pi.maritalStatus} />
            <InfoRow label="Nationality" value={pi.nationality} />
            <InfoRow label="Alternate Phone" value={pi.alternatePhone} />
            <InfoRow label="Address" value={pi.address} />
            <InfoRow label="City" value={pi.city} />
            <InfoRow label="State" value={pi.state} />
            <InfoRow label="Pincode" value={pi.pincode} />
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5 italic">
            <Shield size={12} /> Personal details are managed by HR. Contact HR to update.
          </p>
        </SectionCard>
      )}

      {/* ── Emergency Contact (Read-only) ── */}
      {empData && (ec.name || ec.phone) && (
        <SectionCard title="Emergency Contact" icon={Phone} defaultOpen={false}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mt-3">
            <InfoRow label="Contact Name" value={ec.name} />
            <InfoRow label="Phone" value={ec.phone} />
            <InfoRow label="Relation" value={ec.relation} />
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5 italic">
            <Shield size={12} /> Contact HR to update emergency contact.
          </p>
        </SectionCard>
      )}

      {/* ── Bank Details (Read-only / masked) ── */}
      {empData && (bd.bankName || bd.accountNumber) && (
        <SectionCard title="Bank Details" icon={CreditCard} defaultOpen={false}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mt-3">
            <InfoRow label="Bank Name" value={bd.bankName} />
            <InfoRow
              label="Account Number"
              value={bd.accountNumber ? `${'•'.repeat(Math.max(0, bd.accountNumber.length - 4))}${bd.accountNumber.slice(-4)}` : null}
            />
            <InfoRow label="IFSC Code" value={bd.ifscCode} />
            <InfoRow label="Account Holder" value={bd.accountHolderName} />
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5 italic">
            <Shield size={12} /> Bank details are managed by HR/Payroll team.
          </p>
        </SectionCard>
      )}
    </div>
  );
};

export default EmployeeProfileSettings;
