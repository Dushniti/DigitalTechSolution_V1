import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, UploadCloud, RefreshCw, AlertCircle } from 'lucide-react';
import config from '../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});
const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    return JSON.parse(atob(payload)).role;
  } catch { return null; }
};
const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    return JSON.parse(atob(payload)).userId;
  } catch { return null; }
};

const DocumentModule = () => {
  const role = getRoleFromToken();
  const isAdminOrHR = role === 'Admin' || role === 'HR';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [filterUserId, setFilterUserId] = useState(isAdminOrHR ? 'all' : getUserIdFromToken());
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    userId: getUserIdFromToken(),
    type: 'Company Policy',
    fileName: '',
  });

  const [users, setUsers] = useState([]); // For HR to select which employee to upload to

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const userIdToFetch = filterUserId;
      if (!userIdToFetch) return;

      const res = await fetch(`${config.apiUrl}/documents/${userIdToFetch}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch documents.');
      }
    } catch {
      setError('Network error loading documents.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdminOrHR) return;
    try {
      const res = await fetch(`${config.apiUrl}/users`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.filter(u => u.role !== 'Admin'));
      }
    } catch (e) { console.error('Error fetching users:', e); }
  };

  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, [filterUserId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please select a file to upload.');
    if (uploadFile.size > 5 * 1024 * 1024) return alert('File is too large. Max size is 5MB.');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('userId', uploadForm.userId);
      formData.append('type', uploadForm.type);
      formData.append('fileName', uploadForm.fileName);
      formData.append('file', uploadFile);

      const res = await fetch(`${config.apiUrl}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': getToken() || ''
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        fetchDocuments();
      } else {
        alert(data.message);
      }
    } catch {
      alert('Network error while uploading document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`${config.apiUrl}/documents/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
      } else {
        alert(data.message);
      }
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Library</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage company policies and employee documents</p>
        </div>
        <div className="flex gap-2">
          {isAdminOrHR && (
            <select 
              value={filterUserId} 
              onChange={e => setFilterUserId(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Documents</option>
              <option value={getUserIdFromToken()}>My Personal Documents</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.email}</option>
              ))}
            </select>
          )}
          <button onClick={fetchDocuments} className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => {
              setUploadForm({ ...uploadForm, fileName: '', fileUrl: '' });
              setShowUploadModal(true);
            }} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-300 transition-all"
          >
            <UploadCloud size={16} /> Upload Document
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No documents found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Upload a document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={doc._id} 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm
                  ${doc.type === 'Company Policy' ? 'bg-purple-500' : 
                    doc.type === 'PAN Card' || doc.type === 'Aadhaar Card' ? 'bg-green-500' : 'bg-blue-500'}`}>
                  <FileText size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"><Download size={16} /></a>
                  {isAdminOrHR && <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg"><Trash2 size={16} /></button>}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate" title={doc.fileName}>{doc.fileName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">{doc.type}</span>
                <span className="text-xs text-gray-500">{(doc.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 flex justify-between">
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-slate-700"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Document Type</label>
                <select value={uploadForm.type} onChange={e => {
                  const type = e.target.value;
                  setUploadForm(prev => ({
                    ...prev, 
                    type,
                    userId: type === 'Company Policy' ? getUserIdFromToken() : prev.userId
                  }));
                }} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none">
                  <option value="Company Policy">Company Policy</option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="Resume">Resume</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Experience Letter">Experience Letter</option>
                  <option value="Education Certificate">Education Certificate</option>
                  <option value="Bank Details">Bank Details</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {isAdminOrHR && uploadForm.type !== 'Company Policy' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Assign To Employee</label>
                  <select required value={uploadForm.userId} onChange={e => setUploadForm({...uploadForm, userId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none">
                    <option value={getUserIdFromToken()}>My Personal Documents</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.email}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Document Name</label>
                <input required type="text" value={uploadForm.fileName} onChange={e => setUploadForm({...uploadForm, fileName: e.target.value})} placeholder="e.g. Employee Handbook 2024" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none" />
              </div>
              <div className="relative p-6 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-center bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                <input required type="file" onChange={e => setUploadFile(e.target.files[0])} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-colors ${uploadFile ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 truncate">
                  {uploadFile ? uploadFile.name : 'Click to browse or drag file here'}
                </p>
                {!uploadFile && <p className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG (Max 5MB)</p>}
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all flex justify-center items-center gap-2">
                  {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Upload'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DocumentModule;
