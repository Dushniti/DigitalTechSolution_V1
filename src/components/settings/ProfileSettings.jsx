import { useState, useEffect, useRef } from 'react';
import { Camera, Check, AlertCircle, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Authorization': getToken() || '',
});
const getBaseUrl = () => config.apiUrl.replace('/api', '');

const ProfileSettings = () => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/users/me/profile`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setForm({
            name: data.data.name || '',
            mobile: data.data.mobile || '',
            password: '',
            confirmPassword: '',
          });
          if (data.data.avatar) {
            setAvatarPreview(`${getBaseUrl()}/uploads/${data.data.avatar}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
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
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    setError('');

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
        showToast('Profile updated successfully');
        setForm({ ...form, password: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 font-medium"
          >
            <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
              <Check size={18} />
            </div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal settings</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-sm overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Camera size={14} />
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Picture</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload a new avatar (JPG, PNG)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mobile Number</label>
              <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div className="md:col-span-2 pt-4 pb-2 border-b border-gray-100 dark:border-slate-800">
              <h4 className="text-md font-bold text-gray-900 dark:text-white">Change Password</h4>
              <p className="text-xs text-gray-500">Leave blank if you don't want to change it</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;
