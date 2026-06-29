/**
 * GeoAttendanceReport.jsx
 * Admin / HR — Location-Based Attendance Reports.
 * Tabs:
 *   1. Daily Geo Report     — punch records with geo data + Google Maps links
 *   2. Failed Attempts      — blocked punch-in/out log
 *   3. Outside Radius       — per-employee summary of outside-radius attempts
 *
 * Export to CSV available on all tabs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, MapPin, AlertTriangle, Calendar, Download,
  RefreshCw, AlertCircle, CheckCircle2, XCircle, Users,
  ExternalLink, Target, Navigation, Clock, Search,
  Filter, ChevronDown
} from 'lucide-react';
import config from '../../config';

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

// ─── CSV Export ───────────────────────────────────────────────────────────────
const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Geo Status Badge ─────────────────────────────────────────────────────────
const GeoStatusBadge = ({ insideRadius, geoValidated }) => {
  if (!geoValidated) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400">
        No Geo
      </span>
    );
  }
  if (insideRadius) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <CheckCircle2 size={11} /> Inside
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <XCircle size={11} /> Outside
    </span>
  );
};

// ─── Date Range Filter ────────────────────────────────────────────────────────
const DateRangeFilter = ({ startDate, endDate, onStartChange, onEndChange, onSearch, loading }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
      <Calendar size={14} className="text-gray-400" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="bg-transparent border-none text-xs text-gray-600 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer"
      />
    </div>
    <span className="text-sm text-gray-400">to</span>
    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
      <Calendar size={14} className="text-gray-400" />
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="bg-transparent border-none text-xs text-gray-600 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer"
      />
    </div>
    <button
      onClick={onSearch}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
    >
      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      Refresh
    </button>
  </div>
);

// ─── Tab 1: Daily Geo Report ──────────────────────────────────────────────────
const DailyGeoReport = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`${config.apiUrl}/geofence/reports/daily?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setRecords(data.data || []);
      else setError(data.message || 'Failed to fetch report.');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const filtered = records.filter(
    (r) =>
      !search ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.officeName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filtered.map((r) => ({
      Date: r.date,
      Email: r.email,
      'Punch In': r.punchInTime ? new Date(r.punchInTime).toLocaleTimeString() : '-',
      'Punch Out': r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString() : '-',
      'Office Name': r.officeName || '-',
      'Latitude': r.latitude || '-',
      'Longitude': r.longitude || '-',
      'Distance (m)': r.distanceFromOffice ?? '-',
      'Allowed Radius (m)': r.allowedRadius ?? '-',
      'Inside Radius': r.geoValidated ? (r.insideRadius ? 'Yes' : 'No') : 'N/A',
      'IP Address': r.ipAddress || '-',
      'Geo Validated': r.geoValidated ? 'Yes' : 'No',
    }));
    downloadCSV(exportData, `geo-attendance-${startDate}-to-${endDate}.csv`);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onSearch={fetchRecords}
          loading={loading}
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search email / office…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-gray-600 dark:text-gray-300 focus:ring-0 outline-none w-36 placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Records', value: filtered.length, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Geo Validated', value: filtered.filter((r) => r.geoValidated).length, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Inside Radius', value: filtered.filter((r) => r.geoValidated && r.insideRadius).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Outside Radius', value: filtered.filter((r) => r.geoValidated && !r.insideRadius).length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart2 className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No records found for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  {['Date', 'Employee', 'Punch In', 'Punch Out', 'Office', 'Distance', 'Status', 'Map'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r._id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[140px]" title={r.email}>{r.email}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {r.punchInTime ? new Date(r.punchInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{r.officeName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.distanceFromOffice != null ? (
                        <span className={`text-xs font-semibold ${r.distanceFromOffice <= (r.allowedRadius || Infinity) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {Math.round(r.distanceFromOffice)}m
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <GeoStatusBadge insideRadius={r.insideRadius} geoValidated={r.geoValidated} />
                    </td>
                    <td className="px-4 py-3">
                      {r.latitude && r.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium hover:underline whitespace-nowrap"
                        >
                          <MapPin size={12} /> View
                        </a>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab 2: Failed Attempts ───────────────────────────────────────────────────
const FailedAttemptsReport = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`${config.apiUrl}/geofence/reports/failed-attempts?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setRecords(data.data || []);
      else setError(data.message || 'Failed to fetch report.');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleExport = () => {
    const exportData = records.map((r) => ({
      Timestamp: r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN') : '-',
      Email: r.email,
      Action: r.action === 'punch_in' ? 'Punch In' : 'Punch Out',
      Reason: r.reason,
      Latitude: r.latitude ?? '-',
      Longitude: r.longitude ?? '-',
      'Distance (m)': r.distanceFromOffice ?? '-',
      'Office Name': r.officeName || '-',
      'Allowed Radius (m)': r.allowedRadius ?? '-',
      'IP Address': r.ipAddress || '-',
      Browser: r.browser || '-',
      Device: r.device || '-',
    }));
    downloadCSV(exportData, `failed-geo-attempts-${startDate}-to-${endDate}.csv`);
  };

  const reasonLabel = (reason) => {
    const map = {
      outside_radius: 'Outside Radius',
      invalid_coordinates: 'Invalid GPS',
      no_location_assigned: 'No Location Assigned',
    };
    return map[reason] || reason;
  };

  const reasonColor = (reason) => {
    if (reason === 'outside_radius') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (reason === 'invalid_coordinates') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400';
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onSearch={fetchRecords}
          loading={loading}
        />
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Alert Banner */}
      {records.length > 0 && (
        <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <strong>{records.length}</strong> failed punch attempt{records.length !== 1 ? 's' : ''} detected in this period. Review below.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 dark:text-emerald-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No failed attempts in this period</p>
            <p className="text-xs text-gray-400 mt-1">All punch attempts were within the allowed radius.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  {['Time', 'Employee', 'Action', 'Reason', 'Distance', 'Office', 'Map', 'IP'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {records.map((r, i) => (
                  <motion.tr
                    key={r._id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                      {r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[140px]" title={r.email}>{r.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.action === 'punch_in'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {r.action === 'punch_in' ? 'Punch In' : 'Punch Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${reasonColor(r.reason)}`}>
                        {reasonLabel(r.reason)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.distanceFromOffice != null ? (
                        <span className="text-red-600 dark:text-red-400 text-xs font-semibold">
                          {Math.round(r.distanceFromOffice)}m
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs truncate max-w-[100px]">{r.officeName || '—'}</td>
                    <td className="px-4 py-3">
                      {r.latitude && r.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline text-xs"
                        >
                          <MapPin size={12} /> View
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[80px]" title={r.ipAddress}>{r.ipAddress || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab 3: Outside Radius Summary ───────────────────────────────────────────
const OutsideRadiusSummary = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`${config.apiUrl}/geofence/reports/outside-radius?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setRecords(data.data || []);
      else setError(data.message || 'Failed to fetch report.');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleExport = () => {
    const exportData = records.map((r) => ({
      'User ID': r._id,
      Email: r.email,
      'Outside Radius Count': r.count,
      'Avg Distance (m)': r.avgDistance ? Math.round(r.avgDistance) : '-',
      'Last Attempt': r.lastAttempt ? new Date(r.lastAttempt).toLocaleString('en-IN') : '-',
    }));
    downloadCSV(exportData, `outside-radius-summary-${startDate}-to-${endDate}.csv`);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onSearch={fetchRecords}
          loading={loading}
        />
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 dark:text-emerald-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No outside-radius attendance found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Violations</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Distance</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Attempt</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {records.map((r, i) => {
                  const riskLevel = r.count >= 5 ? 'high' : r.count >= 2 ? 'medium' : 'low';
                  const riskStyle = {
                    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  }[riskLevel];

                  return (
                    <motion.tr
                      key={r._id || i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-4 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                            {r.email?.[0]?.toUpperCase() || 'E'}
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]" title={r.email}>{r.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xl font-bold text-red-600 dark:text-red-400">{r.count}</span>
                        <span className="text-xs text-gray-400 ml-1">time{r.count !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400 font-medium">
                        {r.avgDistance ? `${Math.round(r.avgDistance)}m` : '—'}
                      </td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {r.lastAttempt ? new Date(r.lastAttempt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${riskStyle}`}>
                          {riskLevel}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const GeoAttendanceReport = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const tabs = [
    { id: 'daily', label: 'Daily Geo Report', icon: BarChart2, color: 'text-blue-600', activeBg: 'bg-blue-600' },
    { id: 'failed', label: 'Failed Attempts', icon: AlertTriangle, color: 'text-red-600', activeBg: 'bg-red-600' },
    { id: 'outside', label: 'Outside Radius', icon: XCircle, color: 'text-orange-600', activeBg: 'bg-orange-600' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart2 size={22} className="text-blue-500" />
          Geo-Fencing Reports
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Location-based attendance analytics and audit trail
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ id, label, icon: Icon, color, activeBg }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id
                ? `${activeBg} text-white shadow-sm`
                : `bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 ${color} hover:bg-gray-50 dark:hover:bg-slate-800`
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'daily' && <DailyGeoReport />}
          {activeTab === 'failed' && <FailedAttemptsReport />}
          {activeTab === 'outside' && <OutsideRadiusSummary />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GeoAttendanceReport;
