'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  RefreshCw,
  Lock,
  AlertCircle,
  ArrowRight,
  Search,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { BookingPlan, getAllBookings } from '../lib/store';
import { ACHARYA_SCHOLARS } from '../lib/content';
import { fetchBookingsFromNeon } from '../lib/db';
import { sendAcharyaAssignedMessage, sendAcharyaOrderDispatchMessage } from '../lib/whatsapp';
import { BrandLogo } from '../components/BrandLogo';

interface Props {
  navigate: (path: string) => void;
}

const PANDIT_PANEL_PASSWORD = 'havikar2025';

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

  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setSyncError(null);
    try {
      const neonData = await fetchBookingsFromNeon();
      if (neonData.length > 0) {
        setBookings(neonData);
      } else {
        setBookings(getAllBookings());
      }
      setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (e: any) {
      setSyncError(e?.message || 'Failed to load bookings from database.');
      setBookings(getAllBookings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('pandit_panel_authed');
    if (saved === '1') {
      setIsAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) loadBookings();
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

  const handleAssign = async (bookingId: string, acharyaId: string) => {
    setAssigningId(bookingId + acharyaId);
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) { setAssigningId(null); return; }
    const acharya = ACHARYA_SCHOLARS.find(a => a.id === acharyaId);
    if (!acharya) { setAssigningId(null); return; }

    const updated: BookingPlan = { ...booking, assignedPanditId: acharyaId, status: 'confirmed' };

    try {
      await fetch('/api/bookings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updated,
          assignedPanditId: acharyaId,
        }),
      });
    } catch {}

    // WhatsApp notifications
    sendAcharyaOrderDispatchMessage(updated, acharya);
    sendAcharyaAssignedMessage(updated, acharya);

    setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    setAssigningId(null);
    setAssignSuccess(bookingId);
    setTimeout(() => setAssignSuccess(null), 3000);
  };

  // Filter
  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.name.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.id.toLowerCase().includes(q) ||
      (b.celebrationDate || '').includes(q);
    const matchStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'unassigned'
        ? !b.assignedPanditId
        : b.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => a.celebrationDate > b.celebrationDate ? 1 : -1);

  const pendingCount = bookings.filter(b => !b.assignedPanditId).length;
  const confirmedCount = bookings.filter(b => b.assignedPanditId).length;
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
              <label className="text-[11px] font-semibold uppercase text-[#5C5147]">
                Access Code
              </label>
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
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E3D6C3] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8 w-auto" variant="light" />
            <div className="h-4 w-px bg-[#D5C2A4]" />
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#B37418] block">
                Acharya Coordination Panel
              </span>
              <span className="text-xs font-semibold text-[#1F1914]">
                Main Acharya — Booking Management
              </span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'text-[#1F1914]' },
            { label: 'Awaiting Assignment', value: pendingCount, color: pendingCount > 0 ? 'text-amber-700' : 'text-emerald-700' },
            { label: 'Acharya Assigned', value: confirmedCount, color: 'text-emerald-700' },
            { label: 'Ceremonies Completed', value: completedCount, color: 'text-blue-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E3D6C3] p-4 text-center shadow-sm">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#7A6B5D] uppercase tracking-wider mt-0.5 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sync message */}
        {syncError && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Database sync error: {syncError}. Showing locally saved data.</span>
          </div>
        )}
        {lastSync && !syncError && (
          <p className="text-[10.5px] text-[#8C7E72]">Last synced from Neon at {lastSync}</p>
        )}

        {/* Acharya Availability Summary */}
        <div className="bg-white rounded-2xl border border-[#E3D6C3] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EFE5D5] bg-[#FAF5ED]">
            <span className="text-xs uppercase tracking-widest font-bold text-[#B37418]">
              Acharya Roster
            </span>
          </div>
          <div className="divide-y divide-[#F0E8DA]">
            {ACHARYA_SCHOLARS.map(a => {
              const assigned = bookings.filter(b => b.assignedPanditId === a.id && b.status !== 'completed');
              return (
                <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1F1914]">{a.name}</p>
                    <p className="text-[11px] text-[#7A6B5D]">{a.title} — {a.area}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      assigned.length === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : assigned.length < 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {assigned.length} active booking{assigned.length !== 1 ? 's' : ''}
                    </span>
                    <a
                      href={`tel:${a.phone}`}
                      className="text-[11px] flex items-center gap-1 text-[#B37418] hover:underline font-medium"
                    >
                      <Phone className="w-3 h-3" />
                      {a.phone}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings Table */}
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
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="px-5 py-10 text-center text-sm text-[#7A6B5D]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#B37418]" />
              Loading bookings from Neon database...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[#7A6B5D]">
              No bookings found. {bookings.length > 0 ? 'Try adjusting your search or filter.' : 'No bookings exist yet.'}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="divide-y divide-[#F0E8DA]">
              {filtered.map(b => {
                const assignedAcharya = b.assignedPanditId
                  ? ACHARYA_SCHOLARS.find(a => a.id === b.assignedPanditId)
                  : null;
                const isExpanded = expandedId === b.id;
                const isSuccess = assignSuccess === b.id;

                return (
                  <div key={b.id} className="px-5 py-4">
                    {/* Booking Row */}
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
                            {b.status === 'completed' ? 'Completed' : b.assignedPanditId ? 'Assigned' : 'Awaiting Assignment'}
                          </span>
                          {isSuccess && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
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
                        {assignedAcharya && (
                          <p className="text-[11px] text-emerald-700 font-semibold">
                            Acharya: {assignedAcharya.name}
                          </p>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 text-[#8C7E72] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="mt-4 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5C5147]">
                          <div className="bg-[#FAF5ED] rounded-xl p-3 space-y-1.5">
                            <p className="font-bold text-[#1F1914] text-[10px] uppercase tracking-wider">Ceremony Details</p>
                            <p><span className="text-[#7A6B5D]">Booking ID:</span> <span className="font-mono">{b.id}</span></p>
                            <p><span className="text-[#7A6B5D]">Package:</span> {b.packageName} — Rs. {b.totalPrice?.toLocaleString('en-IN')}</p>
                            <p><span className="text-[#7A6B5D]">Date:</span> {b.celebrationDate} at {b.timeSlot}</p>
                            {b.gotra && <p><span className="text-[#7A6B5D]">Gotra:</span> {b.gotra}</p>}
                            {b.nakshatra && <p><span className="text-[#7A6B5D]">Nakshatra:</span> {b.nakshatra}</p>}
                            {b.addons && b.addons.length > 0 && (
                              <p><span className="text-[#7A6B5D]">Add-ons:</span> {b.addons.join(', ')}</p>
                            )}
                          </div>
                          <div className="bg-[#FAF5ED] rounded-xl p-3 space-y-1.5">
                            <p className="font-bold text-[#1F1914] text-[10px] uppercase tracking-wider">Address & Contact</p>
                            <p className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#B37418]" />
                              {b.address}{b.landmark ? `, near ${b.landmark}` : ''}, {b.pincode}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3 flex-shrink-0 text-[#B37418]" />
                              <a href={`tel:${b.phone}`} className="text-[#B37418] hover:underline">{b.phone}</a>
                            </p>
                            {b.email && (
                              <p className="text-[#7A6B5D]">Email: {b.email}</p>
                            )}
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

                        {/* Acharya Assignment */}
                        {b.status !== 'completed' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                              Assign Acharya for this Ceremony
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {ACHARYA_SCHOLARS.map(a => {
                                const isCurrentlyAssigned = b.assignedPanditId === a.id;
                                const activeCount = bookings.filter(bk => bk.assignedPanditId === a.id && bk.status !== 'completed' && bk.id !== b.id).length;
                                const isWorking = assigningId === b.id + a.id;
                                return (
                                  <button
                                    key={a.id}
                                    onClick={() => !isCurrentlyAssigned && handleAssign(b.id, a.id)}
                                    disabled={isCurrentlyAssigned || isWorking}
                                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                                      isCurrentlyAssigned
                                        ? 'border-emerald-400 bg-emerald-50 cursor-default'
                                        : 'border-[#D5C2A4] bg-white hover:border-[#B37418] hover:bg-[#FDF8F0] cursor-pointer'
                                    }`}
                                  >
                                    <p className="font-bold text-[#1F1914] text-[11px]">{a.name}</p>
                                    <p className="text-[10px] text-[#7A6B5D] mt-0.5">{a.area}</p>
                                    <div className="flex items-center justify-between mt-1.5">
                                      <span className={`text-[10px] font-semibold ${
                                        activeCount === 0 ? 'text-emerald-700' : activeCount < 3 ? 'text-amber-700' : 'text-red-700'
                                      }`}>
                                        {activeCount} active
                                      </span>
                                      {isCurrentlyAssigned && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      )}
                                      {isWorking && (
                                        <RefreshCw className="w-3.5 h-3.5 text-[#B37418] animate-spin" />
                                      )}
                                      {!isCurrentlyAssigned && !isWorking && (
                                        <ArrowRight className="w-3 h-3 text-[#B37418]" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-amber-800">
                              Assigning an Acharya will immediately dispatch a WhatsApp alert to the Acharya and a confirmation to the customer.
                            </p>
                          </div>
                        )}

                        {b.status === 'completed' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            This ceremony has been marked completed.
                          </div>
                        )}

                        {/* Payment info */}
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

        {/* Footer nav */}
        <div className="flex items-center justify-between pb-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-xs text-[#B37418] hover:underline flex items-center gap-1 font-medium"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Full Admin Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-[#7A6B5D] hover:underline"
          >
            Back to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanditPanelPage;
