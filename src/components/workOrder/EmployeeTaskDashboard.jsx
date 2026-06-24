import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Clock, Paperclip, Send, AlertCircle, RefreshCw } from 'lucide-react';
import config from '../../config';

const EmployeeTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Update Form
  const [updateNote, setUpdateNote] = useState('');
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': localStorage.getItem('adminToken') || ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/work-orders`, {
        headers: {
          'Authorization': localStorage.getItem('adminToken') || '',
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch {
      setError('Failed to fetch tasks');
    } finally { setLoading(false); }
  };

  const fetchUpdates = async (taskId) => {
    try {
      const res = await fetch(`${config.apiUrl}/work-orders/${taskId}/updates`, {
        headers: {
          'Authorization': localStorage.getItem('adminToken') || '',
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) setUpdates(data.data);
    } catch (err) {}
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setStatus(task.status);
    setUpdateNote('');
    setFile(null);
    fetchUpdates(task._id);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!updateNote.trim()) return setError('Please enter an update note');
    
    setSubmitting(true);
    setError('');
    
    const formData = new FormData();
    formData.append('update_note', updateNote);
    formData.append('status', status);
    if (file) formData.append('attachment', file);

    try {
      const res = await fetch(`${config.apiUrl}/work-orders/${selectedTask._id}/updates`, {
        method: 'POST',
        headers: getAuthHeaders(), // Do NOT set Content-Type here, let browser set it with boundary
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUpdateNote('');
        setFile(null);
        fetchUpdates(selectedTask._id);
        fetchTasks(); // refresh to update main status
      } else {
        setError(data.message || 'Failed to post update');
      }
    } catch {
      setError('Network error while posting update');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      
      {/* Task List Sidebar */}
      <div className="w-1/3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase size={18}/> My Tasks</h3>
          <button onClick={fetchTasks} className="text-gray-400 hover:text-gray-600"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.map(task => (
            <div 
              key={task._id} 
              onClick={() => handleSelectTask(task)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTask?._id === task._id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-400">WO: {task.work_order_number}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                  ${task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'}`}>
                  {task.status}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{task.customerDetails?.company_name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={12} /> Due: {task.expected_completion_date ? new Date(task.expected_completion_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          ))}
          {tasks.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400 text-sm">No tasks assigned to you.</div>
          )}
        </div>
      </div>

      {/* Task Details & Timeline */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm relative">
        {selectedTask ? (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedTask.customerDetails?.company_name}</h2>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-semibold">WO: {selectedTask.work_order_number}</span>
                <span>Priority: <span className={selectedTask.priority === 'High' || selectedTask.priority === 'Urgent' ? 'text-red-500' : ''}>{selectedTask.priority}</span></span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{selectedTask.notes}</p>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-slate-900/50">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Activity Log</h4>
              <div className="space-y-6">
                {updates.map((upd, i) => (
                  <div key={upd._id} className="relative pl-6 border-l-2 border-blue-100 dark:border-blue-900/50 pb-6 last:pb-0 last:border-0">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 border-2 border-white dark:border-slate-900"></div>
                    <div className="text-xs text-gray-400 mb-1">{new Date(upd.created_at).toLocaleString()}</div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                      {upd.employeeDetails?.name || upd.employeeDetails?.email || 'User'}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 inline-block shadow-sm">
                      {upd.update_note}
                    </div>
                    {upd.attachment && (
                      <div className="mt-2">
                        <a href={upd.attachment} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                          <Paperclip size={14}/> View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                {updates.length === 0 && <div className="text-sm text-gray-500">No activity logged yet.</div>}
              </div>
            </div>

            {/* Post Update Form */}
            {selectedTask.status !== 'Completed' && (
              <form onSubmit={handleSubmitUpdate} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                {error && <div className="mb-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {error}</div>}
                
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 relative">
                    <textarea 
                      rows="2" 
                      placeholder="Type your progress update..."
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none dark:text-white pr-12"
                    ></textarea>
                    
                    <label className="absolute right-3 bottom-3 text-gray-400 hover:text-blue-500 cursor-pointer p-1">
                      <Paperclip size={18} />
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Update Status:</span>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold dark:text-white">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Mark as Completed</option>
                    </select>
                  </div>
                  
                  {file && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded truncate max-w-[150px]">{file.name}</span>}
                  
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-colors text-sm disabled:opacity-50">
                    {submitting ? 'Posting...' : <><Send size={16} /> Post Update</>}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Briefcase size={48} className="mb-4 opacity-20" />
            <p className="font-medium text-lg">Select a task to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTaskDashboard;
