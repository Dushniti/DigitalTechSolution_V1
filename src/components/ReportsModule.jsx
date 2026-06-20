import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Clock, CalendarDays, Download, Filter, RefreshCw, AlertCircle, Building, Hash } from 'lucide-react';
import config from '../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const ReportsModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [headcountData, setHeadcountData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [lateData, setLateData] = useState([]);

  // Filters
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch(`${config.apiUrl}/reports/dashboard`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setDashboardData(data.data);
      } 
      else if (activeTab === 'headcount') {
        const res = await fetch(`${config.apiUrl}/reports/headcount`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setHeadcountData(data.data);
      }
      else if (activeTab === 'attendance') {
        const res = await fetch(`${config.apiUrl}/reports/attendance?month=${month}&year=${year}`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setAttendanceData(data.data || []);
      }
      else if (activeTab === 'leave') {
        const res = await fetch(`${config.apiUrl}/reports/leave?month=${month}&year=${year}`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setLeaveData(data.data || []);
      }
      else if (activeTab === 'late') {
        const selectedDate = new Date(date);
        const m = selectedDate.getMonth() + 1;
        const y = selectedDate.getFullYear();
        const res = await fetch(`${config.apiUrl}/reports/late-coming?month=${m}&year=${y}`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) {
          const allRecords = data.data?.records || [];
          // Filter to show only the selected date
          const filtered = allRecords.filter(r => r.date === date);
          setLateData(filtered);
        }
      }
    } catch {
      setError('Network error loading reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, month, year, date]);

  const tabs = [
    { id: 'dashboard', label: 'HR Dashboard', icon: BarChart2 },
    { id: 'headcount', label: 'Headcount', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leaves', icon: CalendarDays },
    { id: 'late', label: 'Late Coming', icon: AlertCircle },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Deep dive into HR metrics and employee data</p>
        </div>
        <div className="flex gap-2">
          {['attendance', 'leave'].includes(activeTab) && (
            <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800">
              <select value={month} onChange={e => setMonth(e.target.value)} className="bg-transparent text-sm font-medium px-2 py-1 outline-none">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'short' })}</option>
                ))}
              </select>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-16 bg-transparent text-sm font-medium px-2 py-1 outline-none border-l border-gray-200 dark:border-slate-700" />
            </div>
          )}
          {activeTab === 'late' && (
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 outline-none" />
          )}
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex gap-6 w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Dashboard View */}
            {activeTab === 'dashboard' && dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400"><Users size={18} /> <span className="font-semibold text-sm uppercase">Total Employees</span></div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.totalEmployees}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400"><Building size={18} /> <span className="font-semibold text-sm uppercase">Departments</span></div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.totalDepartments}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400"><CalendarDays size={18} /> <span className="font-semibold text-sm uppercase">Today's Leaves</span></div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.leavesToday}</div>
                </div>
              </div>
            )}

            {/* Headcount View */}
            {activeTab === 'headcount' && headcountData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">By Department</h3>
                  <div className="space-y-3">
                    {headcountData.byDepartment.map(d => (
                      <div key={d._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{d.departmentName}</span>
                        <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">By Status</h3>
                  <div className="space-y-3">
                    {headcountData.byStatus.map(s => (
                      <div key={s._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{s._id}</span>
                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${s._id === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance View */}
            {activeTab === 'attendance' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4 font-semibold text-gray-500">Employee</th>
                      <th className="py-3 px-4 font-semibold text-gray-500 text-center">Present</th>
                      <th className="py-3 px-4 font-semibold text-gray-500 text-center">Absent</th>
                      <th className="py-3 px-4 font-semibold text-gray-500 text-center">Half Days</th>
                      <th className="py-3 px-4 font-semibold text-gray-500 text-center">Total Working Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{row.name}</td>
                        <td className="py-3 px-4 text-center font-bold text-green-600">{row.present}</td>
                        <td className="py-3 px-4 text-center font-bold text-red-600">{row.absent}</td>
                        <td className="py-3 px-4 text-center font-bold text-yellow-600">{row.halfDays}</td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{row.totalWorkingHours.toFixed(2)}h</td>
                      </tr>
                    ))}
                    {attendanceData.length === 0 && (
                      <tr><td colSpan="5" className="py-12 text-center text-gray-500">No attendance data found for this month</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Leave View */}
            {activeTab === 'leave' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4 font-semibold text-gray-500">Employee</th>
                      <th className="py-3 px-4 font-semibold text-gray-500">Leave Type</th>
                      <th className="py-3 px-4 font-semibold text-gray-500">Total Days</th>
                      <th className="py-3 px-4 font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{row.name}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.type}</td>
                        <td className="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">{row.totalDays}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                    {leaveData.length === 0 && (
                      <tr><td colSpan="4" className="py-12 text-center text-gray-500">No leave data found for this month</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Late Coming View */}
            {activeTab === 'late' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4 font-semibold text-gray-500">Employee</th>
                      <th className="py-3 px-4 font-semibold text-gray-500">Punch In Time</th>
                      <th className="py-3 px-4 font-semibold text-gray-500">Shift Start</th>
                      <th className="py-3 px-4 font-semibold text-gray-500 text-red-600">Late By (mins)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lateData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{row.name}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.punchInTime}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.shiftStart}</td>
                        <td className="py-3 px-4 font-bold text-red-600">{row.lateByMinutes} mins</td>
                      </tr>
                    ))}
                    {lateData.length === 0 && (
                      <tr><td colSpan="4" className="py-12 text-center text-gray-500">No late comings for {date}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsModule;
