/**
 * OfficeLocationManagement.jsx
 * Admin / HR — Manage office locations for geo-fencing.
 * Features:
 *   - List, Add, Edit, Delete office locations
 *   - Activate / Deactivate toggle
 *   - Assign employees to a location (multi-select)
 *   - Interactive map picker via OpenStreetMap iframe
 *   - Radius preview on map
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Pencil, Trash2, CheckCircle2, XCircle,
  RefreshCw, X, AlertCircle, Users, Search, Navigation,
  ToggleLeft, ToggleRight, Check, Building2, Target,
  ExternalLink, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import config from '../../config';

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});
const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    return JSON.parse(atob(actualToken.split('.')[1])).role;
  } catch { return null; }
};

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ message, type = 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: -12, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8 }}
    className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border ${
      type === 'success'
        ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/30'
        : 'bg-red-600 text-white border-red-500 shadow-red-200 dark:shadow-red-900/30'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
    {message}
  </motion.div>
);

// ─── Map Preview Component ────────────────────────────────────────────────────
const MapPreview = ({ lat, lng, radius = 200, height = 250 }) => {
  if (!lat || !lng) {
    return (
      <div
        style={{ height }}
        className="rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-slate-600"
      >
        <MapPin size={28} />
        <p className="text-sm">Enter coordinates to preview map</p>
      </div>
    );
  }

  // Use OpenStreetMap via a static iframe embed (free, no API key)
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01
  }&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700" style={{ height }}>
      <iframe
        src={osmUrl}
        width="100%"
        height={height}
        frameBorder="0"
        scrolling="no"
        title="Office Location Map"
        className="w-full"
      />
    </div>
  );
};

// ─── Location Form Modal ──────────────────────────────────────────────────────
const LocationModal = ({ editingLocation, onClose, onSaved, showToast }) => {
  const [form, setForm] = useState({
    officeName: editingLocation?.officeName || '',
    latitude: editingLocation?.latitude || '',
    longitude: editingLocation?.longitude || '',
    allowedRadius: editingLocation?.allowedRadius || 200,
    status: editingLocation?.status || 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapKey, setMapKey] = useState(0); // force map refresh

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Get current location from browser
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setMapKey((k) => k + 1);
      },
      (err) => setError('Could not get current location: ' + err.message),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90.');
      setLoading(false);
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180.');
      setLoading(false);
      return;
    }
    if (parseFloat(form.allowedRadius) <= 0) {
      setError('Allowed radius must be greater than 0.');
      setLoading(false);
      return;
    }

    try {
      const url = editingLocation
        ? `${config.apiUrl}/geofence/locations/${editingLocation._id}`
        : `${config.apiUrl}/geofence/locations`;
      const method = editingLocation ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          allowedRadius: parseFloat(form.allowedRadius),
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(editingLocation ? 'Location updated successfully.' : 'Location created successfully.');
        onSaved();
      } else {
        setError(data.message || 'Operation failed.');
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
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingLocation ? 'Edit Office Location' : 'Add Office Location'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {editingLocation ? 'Update location details' : 'Set geo-fence for employee attendance'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Office Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Office Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="officeName"
              value={form.officeName}
              onChange={handleChange}
              required
              placeholder="e.g. Head Office, Branch A"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Coordinates Row */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Coordinates <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
              >
                <Navigation size={13} />
                Use Current Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={form.latitude}
                  onChange={(e) => { handleChange(e); setMapKey((k) => k + 1); }}
                  required
                  step="any"
                  placeholder="28.6139"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={form.longitude}
                  onChange={(e) => { handleChange(e); setMapKey((k) => k + 1); }}
                  required
                  step="any"
                  placeholder="77.2090"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Allowed Radius */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Allowed Radius <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-full">
                {form.allowedRadius} m
              </span>
            </div>
            <input
              type="range"
              name="allowedRadius"
              min={50}
              max={2000}
              step={50}
              value={form.allowedRadius}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50m</span>
              <span>1km</span>
              <span>2km</span>
            </div>
            <input
              type="number"
              name="allowedRadius"
              min={1}
              value={form.allowedRadius}
              onChange={handleChange}
              className="mt-2 w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter exact metres"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <div className="flex gap-2">
              {['Active', 'Inactive'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.status === s
                      ? s === 'Active'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
                        : 'bg-red-500 border-red-500 text-white shadow-sm shadow-red-200'
                      : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Map Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Location Preview
            </label>
            <MapPreview
              key={mapKey}
              lat={parseFloat(form.latitude) || null}
              lng={parseFloat(form.longitude) || null}
              radius={form.allowedRadius}
            />
            {form.latitude && form.longitude && (
              <a
                href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                <ExternalLink size={12} />
                Open in Google Maps
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={16} />
                  {editingLocation ? 'Update Location' : 'Create Location'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Assign Employees Modal ───────────────────────────────────────────────────
const AssignEmployeesModal = ({ location, onClose, onSaved, showToast }) => {
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, locRes] = await Promise.all([
          fetch(`${config.apiUrl}/employees?limit=500`, { headers: authHeaders() }),
          fetch(`${config.apiUrl}/geofence/locations/${location._id}`, { headers: authHeaders() }),
        ]);
        const [empData, locData] = await Promise.all([empRes.json(), locRes.json()]);

        // Employee API returns { success, employees, total } — NOT { data }
        if (empData.success) setEmployees(empData.employees || []);
        if (locData.success) {
          const assignedUserIds = (locData.data.assignedEmployees || []).map((a) => a.employeeUserId);
          setAssignments(assignedUserIds);
          setSelected(new Set(assignedUserIds));
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location._id]);

  const toggleEmployee = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${config.apiUrl}/geofence/locations/${location._id}/assign`, {
        method: 'POST',
        headers: authHeaders(),
        // employeeUserId in assignment = employee.userId (the auth user's _id)
        // emp.userId is the linked user account ID stored on the employee document
        body: JSON.stringify({ employeeUserIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Employees assigned to "${location.officeName}" successfully.`);
        onSaved();
      } else {
        showToast(data.message || 'Failed to assign employees.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> Assign Employees
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">to "{location.officeName}"</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-slate-700">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-0 outline-none w-full placeholder-gray-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {selected.size} selected · {employees.length} total employees
          </p>
        </div>

        {/* Employee List */}
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No employees found.</div>
          ) : (
            filtered.map((emp) => {
              // Use emp.userId (linked auth user ID) for geo assignment
              // If userId not set, fall back to emp._id string
              const assignKey = emp.userId || emp._id?.toString();
              const isSelected = selected.has(assignKey);
              const wasAssigned = assignments.includes(assignKey);
              return (
                <button
                  key={emp._id}
                  onClick={() => toggleEmployee(assignKey)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-50 dark:border-slate-800/50 ${
                    isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {emp.name?.[0]?.toUpperCase() || 'E'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{emp.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {emp.employeeCode} · {emp.department?.name || emp.workLocation || 'No Dept'}
                    </p>
                    {!emp.userId && (
                      <p className="text-xs text-amber-500 mt-0.5">⚠ No linked user account</p>
                    )}
                  </div>
                  {wasAssigned && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full shrink-0">
                      Assigned
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check size={15} />
                {selected.size > 0 ? `Assign (${selected.size})` : 'Save (Unassign All)'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
const DeleteConfirm = ({ location, onClose, onDeleted, showToast }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/geofence/locations/${location._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${location.officeName}" deleted.`);
        onDeleted();
      } else {
        showToast(data.message || 'Delete failed.', 'error');
        onClose();
      }
    } catch {
      showToast('Network error.', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-6 text-center"
      >
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="text-red-600 dark:text-red-400" size={22} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Location?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          This will permanently delete{' '}
          <strong className="text-gray-700 dark:text-gray-200">"{location.officeName}"</strong>{' '}
          and remove all employee assignments. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Location Card ────────────────────────────────────────────────────────────
const LocationCard = ({ location, index, onEdit, onDelete, onAssign, onToggleStatus, toggling }) => {
  const [expanded, setExpanded] = useState(false);
  const isActive = location.status === 'Active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left info */}
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isActive
                ? 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-sm shadow-blue-200 dark:shadow-blue-900/30'
                : 'bg-gray-200 dark:bg-slate-700'
            }`}>
              <Building2 size={19} className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{location.officeName}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {location.status}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Target size={11} />
                  {location.allowedRadius}m radius
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Users size={11} />
                  {location.assignedEmployeeCount || 0} assigned
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Status */}
            <button
              onClick={() => onToggleStatus(location)}
              disabled={toggling === location._id}
              title={isActive ? 'Deactivate' : 'Activate'}
              className={`p-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {toggling === location._id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isActive ? (
                <ToggleRight size={20} />
              ) : (
                <ToggleLeft size={20} />
              )}
            </button>
            <button
              onClick={() => onAssign(location)}
              title="Assign Employees"
              className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Users size={17} />
            </button>
            <button
              onClick={() => onEdit(location)}
              title="Edit"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(location)}
              title="Delete"
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Coordinates row */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl px-4 py-2.5">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-blue-500" />
            {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
          </span>
          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline transition-colors"
          >
            <ExternalLink size={11} /> View on Map
          </a>
        </div>

        {/* Expand Map */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide Map Preview' : 'Show Map Preview'}
        </button>
      </div>

      {/* Map Preview */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 overflow-hidden"
          >
            <MapPreview lat={location.latitude} lng={location.longitude} radius={location.allowedRadius} height={220} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OfficeLocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [toggling, setToggling] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (search) params.set('search', search);

      const res = await fetch(`${config.apiUrl}/geofence/locations?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setLocations(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch locations.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleToggleStatus = async (location) => {
    const newStatus = location.status === 'Active' ? 'Inactive' : 'Active';
    setToggling(location._id);
    try {
      const res = await fetch(`${config.apiUrl}/geofence/locations/${location._id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${location.officeName}" ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`);
        fetchLocations();
      } else {
        showToast(data.message || 'Status update failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleOpenEdit = (location) => {
    setEditingLocation(location);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
  };

  const handleSaved = () => {
    handleCloseModal();
    fetchLocations();
  };

  const filteredLocations = locations.filter(
    (l) =>
      l.officeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* Location Form Modal */}
      <AnimatePresence>
        {showModal && (
          <LocationModal
            editingLocation={editingLocation}
            onClose={handleCloseModal}
            onSaved={handleSaved}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Assign Employees Modal */}
      <AnimatePresence>
        {assignTarget && (
          <AssignEmployeesModal
            location={assignTarget}
            onClose={() => setAssignTarget(null)}
            onSaved={() => { setAssignTarget(null); fetchLocations(); }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            location={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={() => { setDeleteTarget(null); fetchLocations(); }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={22} className="text-blue-500" />
            Office Location Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage geo-fencing locations for location-based attendance
          </p>
        </div>
        <button
          onClick={() => { setEditingLocation(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white shadow-sm shadow-blue-300 dark:shadow-blue-900/30 transition-all"
        >
          <Plus size={16} />
          Add Location
        </button>
      </div>

      {/* ── Info Banner ── */}
      <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm">
        <Info size={16} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">How it works:</span>{' '}
          Add office locations, set the allowed radius, and assign employees. When an employee punches in/out, their GPS location is verified server-side using the Haversine formula. Attendance is blocked if they are outside the allowed radius.
        </div>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm flex-1 min-w-[200px]">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-0 outline-none w-full placeholder-gray-400"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          onClick={fetchLocations}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Locations', value: locations.length, color: 'text-blue-600' },
          { label: 'Active', value: locations.filter((l) => l.status === 'Active').length, color: 'text-emerald-600' },
          { label: 'Inactive', value: locations.filter((l) => l.status !== 'Active').length, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
            <MapPin size={28} className="text-blue-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold text-base">No office locations found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 mb-5">
            Add your first office location to enable geo-fencing attendance.
          </p>
          <button
            onClick={() => { setEditingLocation(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm transition-all hover:shadow-md"
          >
            <Plus size={15} />
            Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredLocations.map((location, index) => (
            <LocationCard
              key={location._id}
              location={location}
              index={index}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
              onAssign={setAssignTarget}
              onToggleStatus={handleToggleStatus}
              toggling={toggling}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficeLocationManagement;
