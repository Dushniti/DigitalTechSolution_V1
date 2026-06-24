import { useState, useRef } from 'react';
import { Camera, Check, AlertCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Authorization': getToken() || '',
});

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
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

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
    <div className="max-w-2xl mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

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
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
