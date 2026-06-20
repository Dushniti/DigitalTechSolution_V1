import React, { useState, useEffect } from 'react';
import { RefreshCw, CalendarDays, AlertCircle, Wand2 } from 'lucide-react';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const RosterTab = () => {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Generation state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genLoading, setGenLoading] = useState(false);

  // Filters for viewing
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchRosters = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/rosters?date=${viewDate}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setRosters(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch rosters.');
      }
    } catch {
      setError('Network error loading rosters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRosters();
  }, [viewDate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/rosters/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ year: Number(genYear), month: Number(genMonth), autoAssign: true }),
      });
      const data = await res.json();
      if (data.success) {
        setShowGenerateModal(false);
        // Refresh view for the generated month
        setViewDate(`${genYear}-${String(genMonth).padStart(2, '0')}-01`);
      } else {
        alert(data.message);
      }
    } catch {
      alert('Network error while generating roster.');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Roster Assignments</h3>
          <p className="text-sm text-gray-500">View and generate employee shift rosters</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="date" 
            value={viewDate} 
            onChange={e => setViewDate(e.target.value)} 
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white outline-none"
          />
          <button onClick={fetchRosters} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
            <Wand2 size={16} /> Auto-Generate
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 flex items-center gap-2 bg-red-50 p-3 rounded-lg"><AlertCircle size={16} /> {error}</div>}

      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Shift</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Day Type</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Timings</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-500">Loading roster...</td></tr>
            ) : rosters.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No roster records for {viewDate}</p>
                </td>
              </tr>
            ) : (
              rosters.map(r => (
                <tr key={r._id} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{r.employee?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{r.employee?.employeeCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{r.shift?.name || 'No Shift'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      r.dayType === 'WorkingDay' ? 'bg-green-100 text-green-700' :
                      r.dayType === 'WeekOff' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {r.dayType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {r.dayType === 'WorkingDay' && r.shift ? `${r.shift.startTime} - ${r.shift.endTime}` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Generate Roster</h3>
            <p className="text-sm text-gray-500 mb-5">Auto-assign shifts based on employee's designated shift profile.</p>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Month</label>
                  <select value={genMonth} onChange={e => setGenMonth(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Year</label>
                  <input type="number" value={genYear} onChange={e => setGenYear(e.target.value)} min={2020} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="flex-1 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={genLoading} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex justify-center items-center gap-2">
                  {genLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Wand2 size={16} /> Generate</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterTab;
