import React, { useState, useEffect } from 'react';
import StatCard from './widgets/StatCard';
import { AttendanceTrendChart } from './widgets/ChartWidget';
import { Clock, CalendarDays, IndianRupee, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const EmployeeDashboard = ({ data, loading, onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStatus, setTodayStatus] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  
  const currentHour = currentTime.getHours();
  const isNight = currentHour >= 18 || currentHour < 6;

  const checkTodayStatus = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/attendance/today`, { headers: authHeaders() });
      const result = await res.json();
      if (result.success) setTodayStatus(result.data);
    } catch (err) {
      console.error('Error fetching today status', err);
    }
  };

  useEffect(() => {
    checkTodayStatus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockAction = async (action) => {
    setClockLoading(true);
    if (!navigator.geolocation) {
      alert('Location services are not supported by your browser. Please use a modern browser.');
      setClockLoading(false);
      return;
    }

    const getPosition = () =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

    let latitude, longitude, geoError;
    try {
      const pos = await getPosition();
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch (err) {
      geoError = 'Location permission denied or unavailable. Please check settings.';
    }

    if (geoError) {
      alert(geoError);
      setClockLoading(false);
      return;
    }

    try {
      const res = await fetch(`${config.apiUrl}/attendance/${action}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          latitude,
          longitude,
          browser: navigator.userAgent,
          device: navigator.platform || 'Unknown',
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        alert(resData.message);
        checkTodayStatus();
      } else {
        alert(resData.message || `Failed to punch ${action === 'login' ? 'in' : 'out'}.`);
      }
    } catch {
      alert('Network error.');
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">...loading...</div>;

  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-3xl lg:max-w-4xl pb-10">
      {/* Mobile-first Header */}
      <div className="flex justify-between items-center px-2 pt-2 mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Hello {data?.userName?.split(' ')[0] || data?.employeeName?.split(' ')[0] || 'Employee'} 👋
          </h2>
        </div>
        <div onClick={() => onNavigate('settings')} className="relative w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer text-blue-700 dark:text-blue-300 font-bold hover:scale-105 transition-transform" title="Profile">
          <span className="text-[15px] tracking-wide">
            {(() => {
              const name = data?.userName || data?.employeeName || 'User';
              const parts = name.trim().split(' ').filter(Boolean);
              if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              return name.substring(0, 2).toUpperCase();
            })()}
          </span>
          {(data?.photo || data?.employeePhoto || data?.profilePicture) && (
            <img 
              src={data.photo || data.employeePhoto || data.profilePicture} 
              alt="Profile" 
              className="absolute inset-0 w-full h-full object-cover bg-white" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>
      </div>

      {/* Hero Attendance Card (Refined Original) */}
      <div className={`relative rounded-[32px] overflow-hidden shadow-md border min-h-[220px] flex items-end transition-colors duration-1000 ${
        isNight 
          ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-black border-slate-700/80' 
          : 'bg-gradient-to-br from-sky-50 via-blue-100 to-blue-200 border-blue-200/60 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 dark:border-slate-700'
      }`}>

        {/* Decorative Skyline Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Clouds / Subtle backdrop / Stars for Night */}
          {isNight ? (
            <>
              <div className="absolute top-8 left-12 w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_4px_2px_rgba(255,255,255,0.4)]"></div>
              <div className="absolute top-16 left-32 w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_6px_3px_rgba(255,255,255,0.3)]"></div>
              <div className="absolute top-10 right-24 w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_4px_2px_rgba(255,255,255,0.4)]"></div>
              <div className="absolute top-24 right-40 w-1.5 h-1.5 bg-blue-100/60 rounded-full"></div>
            </>
          ) : (
            <>
              <div className="absolute top-10 left-10 w-32 h-10 bg-white/40 dark:bg-white/5 rounded-full blur-[8px] mix-blend-overlay"></div>
              <div className="absolute top-20 right-32 w-24 h-8 bg-white/40 dark:bg-white/5 rounded-full blur-[6px] mix-blend-overlay"></div>
            </>
          )}
          
          <svg className={`absolute bottom-0 w-full h-[60%] transition-colors duration-1000 ${isNight ? 'text-indigo-900/40' : 'text-blue-500/80 dark:text-blue-900/60'}`} viewBox="0 0 400 150" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,150 L0,110 L15,110 L15,100 L25,100 L25,120 L40,120 L40,90 L55,90 L55,80 L70,80 L70,105 L85,105 L85,70 L100,70 L100,115 L120,115 L120,95 L140,95 L140,85 L155,85 L155,110 L170,110 L170,65 L190,65 L190,100 L210,100 L210,80 L230,80 L230,120 L250,120 L250,75 L270,75 L270,105 L290,105 L290,60 L310,60 L310,115 L330,115 L330,90 L350,90 L350,120 L370,120 L370,85 L385,85 L385,105 L400,105 L400,150 Z" />
            <path fill="currentColor" className={`opacity-40 transition-colors duration-1000 ${isNight ? 'text-black/60' : 'text-blue-700 dark:text-slate-950'}`} d="M0,150 L0,120 L10,120 L10,110 L20,110 L20,125 L35,125 L35,100 L50,100 L50,115 L65,115 L65,80 L80,80 L80,120 L100,120 L100,105 L120,105 L120,90 L140,90 L140,115 L160,115 L160,75 L180,75 L180,110 L200,110 L200,90 L220,90 L220,125 L240,125 L240,85 L260,85 L260,115 L280,115 L280,70 L300,70 L300,120 L320,120 L320,100 L340,100 L340,125 L360,125 L360,95 L380,95 L380,115 L400,115 L400,150 Z" />
          </svg>
          {/* Sun / Moon based on AM/PM */}
          <div 
            className={`absolute top-[15%] right-[20%] md:right-[25%] transition-all duration-1000 ${
              isNight 
                ? 'w-12 h-12 rounded-full bg-transparent shadow-[inset_-12px_-10px_0_0_#f8fafc,0_0_30px_10px_rgba(255,255,255,0.2)] transform -rotate-12' 
                : 'w-14 h-14 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 shadow-[0_0_40px_15px_rgba(251,191,36,0.4)] blur-[1px] opacity-90'
            }`}
          ></div>
        </div>

        <div className="relative z-10 p-6 w-full flex justify-between items-end mt-12">
          <div className="flex flex-col items-center">
            {/* Live Clock inside the circle */}
            <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 backdrop-blur-md flex flex-col items-center justify-center shadow-lg transform -translate-y-2 transition-colors duration-1000 ${isNight ? 'bg-slate-900/60 border-slate-700/80' : 'bg-white/40 dark:bg-slate-900/40 border-white/60 dark:border-slate-700/60'}`}>
              <span className={`text-xl md:text-2xl font-bold drop-shadow-sm tracking-tight ${isNight ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0]}
              </span>
              <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-widest mt-0.5 ${isNight ? 'text-indigo-300' : 'text-blue-600 dark:text-blue-400'}`}>
                {currentTime.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1]}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <p className={`text-sm md:text-base font-bold drop-shadow-sm transition-colors duration-1000 ${isNight ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{dayName} | General Shift</p>
            <p className={`text-[13px] md:text-sm mb-5 drop-shadow-sm font-medium transition-colors duration-1000 ${isNight ? 'text-indigo-200/90' : 'text-gray-600 dark:text-gray-300'}`}>{dateString}</p>
            
            {!todayStatus ? (
              <button
                onClick={() => handleClockAction('login')}
                disabled={clockLoading}
                className="px-8 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {clockLoading ? (
                   <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Locating...</>
                ) : 'Punch In'}
              </button>
            ) : !todayStatus.punchOutTime ? (
              <button
                onClick={() => handleClockAction('logout')}
                disabled={clockLoading}
                className="px-8 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {clockLoading ? (
                   <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Locating...</>
                ) : 'Punch Out'}
              </button>
            ) : (
              <span className="px-6 py-2.5 rounded-full bg-white/60 dark:bg-slate-800/80 text-gray-800 dark:text-gray-200 font-semibold text-sm shadow-sm border border-white/50 dark:border-slate-600 backdrop-blur-md">
                Punched Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Engage Section */}
      <div>
        <h3 className="text-[17px] font-bold text-gray-800 dark:text-gray-100 mb-3 px-2">Engage</h3>
        <div className="bg-gradient-to-br from-orange-50/50 to-rose-50/50 dark:from-slate-800 dark:to-slate-800/80 rounded-[32px] p-8 text-center relative overflow-hidden border border-orange-100 dark:border-slate-700/50">
          <div className="absolute -left-6 top-1/4 w-16 h-32 bg-orange-400/20 rounded-full blur-xl"></div>
          <div className="absolute -right-6 bottom-0 w-20 h-40 bg-rose-400/20 rounded-full blur-xl"></div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-32 h-32 mb-2 opacity-90">
              {/* Minimal Illustration placeholder */}
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path fill="#F97316" d="M37.5,-59.8C49.9,-48.9,62,-38.3,71,-24.1C80,-9.8,85.8,8.2,82.2,24C78.6,39.9,65.6,53.6,50.7,64.1C35.8,74.7,19,82.1,1.9,79.5C-15.3,76.9,-30.5,64.3,-46.2,53.6C-61.9,42.8,-77.9,34,-85.2,19.3C-92.4,4.5,-90.9,-16.1,-81.9,-31.6C-73,-47,-56.7,-57.3,-40.8,-66C-24.9,-74.6,-9.4,-81.6,2.2,-84.5C13.8,-87.5,25.1,-70.7,37.5,-59.8Z" transform="translate(100 100) scale(0.9)" opacity="0.3" />
                <path fill="#F97316" d="M105 130 C110 100 130 90 140 100 C150 110 140 135 125 140 Z" />
                <circle cx="120" cy="80" r="10" fill="#333" />
                <rect x="75" y="50" width="4" height="60" fill="#64748b" rx="2" />
                <rect x="85" y="40" width="4" height="70" fill="#64748b" rx="2" />
                <rect x="95" y="60" width="4" height="50" fill="#64748b" rx="2" />
                <circle cx="77" cy="50" r="6" fill="#8b5cf6" />
                <circle cx="87" cy="40" r="6" fill="#ec4899" />
                <circle cx="97" cy="60" r="6" fill="#3b82f6" />
                <path d="M105 120 Q90 100 85 90" stroke="#333" strokeWidth="3" fill="none" />
              </svg>
            </div>
            <h4 className="text-gray-800 dark:text-white font-bold text-[16px]">Nothing to show!</h4>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-[200px] leading-relaxed">
              Create your first poll and gather your team's input.
            </p>
          </div>
          <button className="absolute top-6 right-6 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="pt-2">
        <h3 className="text-[17px] font-bold text-gray-800 dark:text-gray-100 mb-3 px-2">Quick Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard title="Today's Attendance" value={data?.summary?.attendanceToday || 'N/A'} icon={Clock} gradient="from-blue-500 to-cyan-400" />
          <StatCard title="Leave Balance" value={data?.summary?.leaveBalance || '0'} icon={CalendarDays} gradient="from-orange-500 to-amber-400" />
          <StatCard title="Last Payroll Net" value={`₹${data?.summary?.lastPayrollNet?.toLocaleString() || '0'}`} icon={IndianRupee} gradient="from-emerald-500 to-green-400" />
        </div>
      </div>

      {/* Charts & Extras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        <div className="lg:col-span-2">
          <AttendanceTrendChart data={data?.attendanceTrend} title="My Attendance Trend (Last 7 Days)" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={18} className="text-blue-500" /> Upcoming Holidays
          </h3>
          <div className="space-y-3">
            {data?.upcomingHolidays?.length > 0 ? data.upcomingHolidays.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{new Date(h.date).getDate()}</span>
                  <span className="text-[11px] font-medium text-blue-500 dark:text-blue-500">{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">{h.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{h.type}</p>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-6">No upcoming holidays</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
