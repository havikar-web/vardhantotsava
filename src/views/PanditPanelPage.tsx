'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  UserPlus,
  RefreshCw,
  Lock,
  AlertCircle,
  ArrowRight,
  Search,
  ChevronDown,
  ShieldCheck,
  LogOut,
  ExternalLink,
  X,
  Save,
  Gift,
  Truck,
} from 'lucide-react';
import { BookingPlan, getAllBookings, saveBooking } from '../lib/store';
import { fetchBookingsFromNeon } from '../lib/db';
import { sendAcharyaOrderDispatchMessage, sendAcharyaAssignedMessage } from '../lib/whatsapp';
import { AcharyaScholar } from '../lib/content';
import { BrandLogo } from '../components/BrandLogo';

interface Props {
  navigate: (path: string) => void;
}

interface SavedPandit {
  id: string;
  name: string;
  phone: string;
}

const PANDIT_PANEL_PASSWORD = 'havikar2025';
const SAVED_PANDITS_KEY = 'mantrakshata_saved_pandits';

function getSavedPandits(): SavedPandit[] {
  try {
    const raw = localStorage.getItem(SAVED_PANDITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePandits(pandits: SavedPandit[]): void {
  try {
    localStorage.setItem(SAVED_PANDITS_KEY, JSON.stringify(pandits));
  } catch {}
}

export const PanditPanelPage: React.FC<Props> = ({ navigate }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [bookings, setBookings] = useState<BookingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'unassigned'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Assignment form state (per booking)
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignName, setAssignName] = useState('');
  const [assignPhone, setAssignPhone] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Saved pandits quick-pick
  const [savedPandits, setSavedPandits] = useState<SavedPandit[]>([]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setSyncError(null);
    try {
      const neonData = await fetchBookingsFromNeon();
      const loaded = neonData.length > 0 ? neonData : getAllBookings();
      setBookings(loaded);

      // Auto-seed saved pandits list from database bookings
      const currentSaved = getSavedPandits();
      const existingPhones = new Set(currentSaved.map(p => p.phone.replace(/\D/g, '')));
      const discovered: SavedPandit[] = [];
      loaded.forEach(b => {
        if (b.assignedPanditName && b.assignedPanditPhone) {
          const clean = b.assignedPanditPhone.replace(/\D/g, '');
          if (clean && !existingPhones.has(clean)) {
            existingPhones.add(clean);
            discovered.push({
              id: b.assignedPanditId || 'p_' + b.assignedPanditName.toLowerCase().replace(/\s+/g, '_'),
              name: b.assignedPanditName,
              phone: b.assignedPanditPhone
            });
          }
        }
      });
      if (discovered.length > 0) {
        const merged = [...currentSaved, ...discovered];
        setSavedPandits(merged);
        savePandits(merged);
      }

      setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (e: any) {
      setSyncError(e?.message || 'Failed to load from database.');
      setBookings(getAllBookings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('pandit_panel_authed') === '1') setIsAuthed(true);
  }, []);

  useEffect(() => {
    if (isAuthed) {
      loadBookings();
      setSavedPandits(getSavedPandits());
    }
  }, [isAuthed, loadBookings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PANDIT_PANEL_PASSWORD) {
      setIsAuthed(true);
      sessionStorage.setItem('pandit_panel_authed', '1');
      setAuthError('');
    } else {
      setAuthError('Incorrect access code. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pandit_panel_authed');
    setIsAuthed(false);
    setPasswordInput('');
  };

  const openAssignForm = (bookingId: string) => {
    const b = bookings.find(bk => bk.id === bookingId);
    // Pre-fill if already assigned
    const existing = savedPandits.find(p => p.id === b?.assignedPanditId);
    setAssignName(b?.assignedPanditName || existing?.name || '');
    setAssignPhone(b?.assignedPanditPhone || existing?.phone || '');
    setAssignError('');
    setAssigningId(bookingId);
  };

  const handleConfirmAssign = async () => {
    if (!assigningId) return;
    if (!assignName.trim()) { setAssignError('Enter the pandit name.'); return; }
    if (!assignPhone.trim()) { setAssignError('Enter the pandit phone number.'); return; }

    const panditId = 'p_' + assignName.trim().toLowerCase().replace(/\s+/g, '_');

    // Save pandit to quick-pick list if not already there
    const existing = savedPandits.find(p => p.phone.replace(/\D/g,'') === assignPhone.replace(/\D/g,''));
    let updatedPandits = savedPandits;
    if (!existing) {
      updatedPandits = [...savedPandits, { id: panditId, name: assignName.trim(), phone: assignPhone.trim() }];
      setSavedPandits(updatedPandits);
      savePandits(updatedPandits);
    }

    const updated: BookingPlan = {
      ...bookings.find(b => b.id === assigningId)!,
      assignedPanditId: panditId,
      assignedPanditName: assignName.trim(),
      assignedPanditPhone: assignPhone.trim(),
      status: 'confirmed',
    };

    // Save locally
    saveBooking(updated);

    // Sync assigned pandit directly to Neon database backend
    try {
      await fetch('/api/bookings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Neon backend sync failed:', e);
    }

    // Dispatch official Meta WhatsApp templates
    const panditObj: AcharyaScholar = {
      id: panditId,
      name: assignName.trim(),
      title: 'Assigned Pandit',
      institution: 'Vedic Acharya Parishad',
      vedicTradition: 'Rigveda / Yajurveda Prayoga',
      experienceYears: 10,
      languages: ['Kannada', 'Sanskrit'],
      area: 'Bengaluru',
      phone: assignPhone.trim(),
    };

    // 1. Send mantrakshata_pandit_booking_details to assigned Pandit's phone
    const panditDispatch = await sendAcharyaOrderDispatchMessage(updated, panditObj, assignPhone.trim());

    // 2. Send mantrakshata_customer_pandit_details to host Customer's phone
    const customerDispatch = await sendAcharyaAssignedMessage(updated, panditObj);

    if (!panditDispatch.ok) {
      console.warn('Pandit WhatsApp dispatch failed:', panditDispatch.error);
      setAssignError(`Pandit WhatsApp message failed: ${panditDispatch.error || 'Provider rejected message'}`);
      return;
    }

    setBookings(prev => prev.map(b => b.id === assigningId ? updated : b));
    setAssigningId(null);
    setAssignName('');
    setAssignPhone('');
    setAssignSuccess(assigningId);
    setTimeout(() => setAssignSuccess(null), 4000);
  };

  // Filters
  const filtered = bookings
    .filter(b => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        b.name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.celebrationDate || '').includes(q);
      const matchStatus = statusFilter === 'all' ? true
        : statusFilter === 'unassigned' ? !b.assignedPanditId
        : b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => a.celebrationDate > b.celebrationDate ? 1 : -1);

  const pendingCount = bookings.filter(b => !b.assignedPanditId).length;
  const assignedCount = bookings.filter(b => !!b.assignedPanditId && b.status !== 'completed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  // --- LOGIN GATE ---
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#FAF5ED] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3D6C3] shadow-xl p-10 space-y-6 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-12 w-auto" variant="light" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#B37418]">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-bold">Acharya Coordination Panel</span>
            </div>
            <h1 className="font-serif text-2xl text-[#1F1914]">Main Acharya Portal</h1>
            <p className="text-[11px] text-[#7A6B5D]">Enter your panel access code to proceed</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {authError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
                {authError}
              </p>
            )}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[#5C5147]">Access Code</label>
              <div className="flex rounded-xl border border-[#E3D6C3] overflow-hidden focus-within:border-[#B37418]">
                <span className="px-3 py-3 border-r border-[#E3D6C3] bg-[#FAF5ED]">
                  <Lock className="w-4 h-4 text-[#8C5D0D]" />
                </span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter panel access code"
                  required
                  className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#B37418] hover:bg-[#9B6210] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Enter Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- PANDIT PANEL ---
  return (
    <div className="min-h-screen bg-[#FAF5ED] text-[#1F1914]">

      {/* Assignment Modal */}
      {assigningId && (() => {
        const b = bookings.find(bk => bk.id === assigningId);
        if (!b) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl border border-[#E3D6C3] shadow-2xl p-7 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#1F1914]">Assign Pandit</h3>
                  <p className="text-xs text-[#7A6B5D] mt-0.5">
                    Booking for <strong>{b.name}</strong> on {b.celebrationDate}
                  </p>
                </div>
                <button onClick={() => setAssigningId(null)} className="p-1.5 rounded-full hover:bg-[#F4EADA] text-[#7A6B5D]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick-pick from saved pandits */}
              {savedPandits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#B37418]">Quick Select</p>
                  <div className="flex flex-wrap gap-2">
                    {savedPandits.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setAssignName(p.name); setAssignPhone(p.phone); setAssignError(''); }}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          assignName === p.name
                            ? 'border-[#B37418] bg-[#B37418]/10 text-[#8C5D0D]'
                            : 'border-[#D5C2A4] bg-[#FAF5ED] text-[#5C5147] hover:border-[#B37418]'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-[#5C5147]">Pandit Name</label>
                  <input
                    type="text"
                    value={assignName}
                    onChange={e => { setAssignName(e.target.value); setAssignError(''); }}
                    placeholder="e.g. Sri Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B37418]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-[#5C5147]">Pandit Phone Number</label>
                  <div className="flex rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] overflow-hidden focus-within:border-[#B37418]">
                    <span className="px-3 py-2.5 text-xs font-semibold text-[#5C5147] border-r border-[#D5C2A4]">+91</span>
                    <input
                      type="tel"
                      value={assignPhone}
                      onChange={e => { setAssignPhone(e.target.value); setAssignError(''); }}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                {assignError && (
                  <p className="text-xs text-red-700 font-medium">{assignError}</p>
                )}
                <p className="text-[10.5px] text-[#8C7E72]">
                  A WhatsApp order alert will be sent to this pandit's number with the ceremony details, address, and Maps link. The customer will also receive a confirmation.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAssigningId(null)}
                  className="flex-1 py-2.5 border border-[#D5C2A4] rounded-xl text-xs font-semibold text-[#5C5147] hover:bg-[#F4EADA] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssign}
                  className="flex-1 py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E3D6C3] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8 w-auto" variant="light" />
            <div className="h-4 w-px bg-[#D5C2A4]" />
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#B37418] block">Acharya Coordination Panel</span>
              <span className="text-xs font-semibold text-[#1F1914]">Booking Management</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadBookings}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5C2A4] text-xs font-medium text-[#5C5147] hover:bg-[#F4EADA] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Syncing...' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'text-[#1F1914]' },
            { label: 'Awaiting Assignment', value: pendingCount, color: pendingCount > 0 ? 'text-amber-700' : 'text-emerald-700' },
            { label: 'Pandit Assigned', value: assignedCount, color: 'text-emerald-700' },
            { label: 'Completed', value: completedCount, color: 'text-blue-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E3D6C3] p-4 text-center shadow-sm">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#7A6B5D] uppercase tracking-wider mt-0.5 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {syncError && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Database sync issue: {syncError}. Showing locally saved data.</span>
          </div>
        )}
        {lastSync && !syncError && (
          <p className="text-[10.5px] text-[#8C7E72]">Last synced from database at {lastSync}</p>
        )}

        {/* Bookings */}
        <div className="bg-white rounded-2xl border border-[#E3D6C3] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EFE5D5] bg-[#FAF5ED] flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-[#B37418] flex-shrink-0">
              All Ceremony Bookings
            </span>
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E8E7D]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, phone, booking ID, date..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#D5C2A4] text-xs bg-white focus:outline-none focus:border-[#B37418]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-[#D5C2A4] text-xs bg-white focus:outline-none focus:border-[#B37418]"
              >
                <option value="all">All bookings</option>
                <option value="unassigned">Awaiting assignment</option>
                <option value="confirmed">Assigned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="px-5 py-10 text-center text-sm text-[#7A6B5D]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#B37418]" />
              Loading bookings from database...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[#7A6B5D]">
              {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your search or filter.'}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="divide-y divide-[#F0E8DA]">
              {filtered.map(b => {
                const assignedPandit = savedPandits.find(p => p.id === b.assignedPanditId);
                const isExpanded = expandedId === b.id;
                const isJustAssigned = assignSuccess === b.id;

                return (
                  <div key={b.id} className="px-5 py-4">
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#1F1914]">{b.name}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : b.assignedPanditId
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status === 'completed' ? 'Completed' : b.assignedPanditId ? 'Pandit Assigned' : 'Awaiting Assignment'}
                          </span>
                          {isJustAssigned && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              Assigned!
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#7A6B5D] flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {b.celebrationDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {b.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {b.phone}
                          </span>
                          <span className="font-medium text-[#1F1914]">{b.packageName}</span>
                        </div>
                        {b.assignedPanditId && (
                          <p className="text-[11px] text-emerald-700 font-semibold">
                            Pandit: {b.assignedPanditName || assignedPandit?.name || b.assignedPanditId}
                            {(b.assignedPanditPhone || assignedPandit?.phone) && (
                              <span className="text-[#7A6B5D] font-normal ml-2">{b.assignedPanditPhone || assignedPandit?.phone}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 text-[#8C7E72] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5C5147]">
                          <div className="bg-[#FAF5ED] rounded-xl p-3 space-y-1.5">
                            <p className="font-bold text-[#1F1914] text-[10px] uppercase tracking-wider mb-1">Ceremony Details</p>
                            <p><span className="text-[#7A6B5D]">Booking ID:</span> <span className="font-mono">{b.id}</span></p>
                            <p><span className="text-[#7A6B5D]">Package:</span> {b.packageName} — Rs. {b.totalPrice?.toLocaleString('en-IN')}</p>
                            <p><span className="text-[#7A6B5D]">Date & Time:</span> {b.celebrationDate} at {b.timeSlot}</p>
                            {b.gotra && <p><span className="text-[#7A6B5D]">Gotra:</span> {b.gotra}</p>}
                            {b.nakshatra && <p><span className="text-[#7A6B5D]">Nakshatra:</span> {b.nakshatra}</p>}
                            {b.addons && b.addons.length > 0 && (
                              <p><span className="text-[#7A6B5D]">Add-ons:</span> {b.addons.join(', ')}</p>
                            )}
                          </div>
                          <div className="bg-[#FAF5ED] rounded-xl p-3 space-y-1.5">
                            <p className="font-bold text-[#1F1914] text-[10px] uppercase tracking-wider mb-1">Address & Contact</p>
                            <p className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#B37418]" />
                              {b.address}{b.landmark ? `, near ${b.landmark}` : ''}, {b.pincode}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3 flex-shrink-0 text-[#B37418]" />
                              <a href={`tel:${b.phone}`} className="text-[#B37418] hover:underline">{b.phone}</a>
                            </p>
                            {b.email && <p className="text-[#7A6B5D]">Email: {b.email}</p>}
                            {b.mapsLink && (
                              <a
                                href={b.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open in Google Maps
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Sacred Gifts to Hand-Deliver or Shipped via Courier */}
                        {b.giftItems && b.giftItems.length > 0 && (
                          <div className="bg-[#FAF5ED] border border-[#B37418]/40 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#8C5D0D] text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5 text-[#B37418]" />
                                Sacred Gifts &amp; Keepsakes ({b.giftDeliveryMode === 'with_pandit' ? 'Hand-Deliver with Pandit' : 'Direct Courier'})
                              </span>
                              {b.giftTotal ? (
                                <span className="text-[11px] font-semibold text-[#8C5D0D]">
                                  Total: Rs. {b.giftTotal.toLocaleString('en-IN')}
                                </span>
                              ) : null}
                            </div>

                            {b.giftDeliveryMode === 'with_pandit' ? (
                              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 text-xs space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                  <Truck className="w-3.5 h-3.5 text-[#B37418]" />
                                  <span>Instructions for Assigned Pandit:</span>
                                </div>
                                <p className="text-[11px] text-amber-900/90">
                                  Please carry and hand-deliver these sacred gift items directly to the host family at their residence:
                                </p>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium text-xs text-amber-950">
                                  {b.giftItems.map((item, idx) => (
                                    <li key={idx}>
                                      {item.name} &times; {item.quantity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs space-y-1">
                                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Dispatched via Direct Courier to Address:</span>
                                </p>
                                <ul className="list-disc list-inside text-[11px] text-slate-600">
                                  {b.giftItems.map((item, idx) => (
                                    <li key={idx}>
                                      {item.name} &times; {item.quantity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Assign / Reassign button */}
                        {b.status !== 'completed' && (
                          <button
                            onClick={() => openAssignForm(b.id)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            {b.assignedPanditId ? 'Reassign Pandit' : 'Assign Pandit'}
                          </button>
                        )}

                        {b.status === 'completed' && (
                          <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Ceremony completed.
                          </div>
                        )}

                        {(b.razorpayOrderId || b.razorpayPaymentId) && (
                          <div className="text-[10.5px] text-[#7A6B5D] font-mono space-y-0.5">
                            {b.razorpayOrderId && <p>Razorpay Order: {b.razorpayOrderId}</p>}
                            {b.razorpayPaymentId && <p>Payment ID: {b.razorpayPaymentId}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pb-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-xs text-[#B37418] hover:underline flex items-center gap-1 font-medium"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Full Admin Dashboard
          </button>
          <button onClick={() => navigate('/')} className="text-xs text-[#7A6B5D] hover:underline">
            Back to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanditPanelPage;
