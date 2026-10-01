'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
  Phone,
  MessageSquare,
  BookOpen,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Gift,
  Truck,
  User,
  Search,
  UserCheck,
  Edit3
} from 'lucide-react';
import { getSavedBooking, getAllBookings, BookingPlan, saveBooking } from '../lib/store';
import { fetchBookingByIdFromNeon, fetchBookingsFromNeon, syncBookingToNeon } from '../lib/db';
import { executeAcharyaAssignment } from '../lib/whatsapp';

interface Props {
  navigate: (path: string) => void;
}

interface SavedPandit {
  id: string;
  name: string;
  phone: string;
}

const SAVED_PANDITS_KEY = 'mantrakshata_saved_pandits';

function getSavedPandits(): SavedPandit[] {
  try {
    const raw = localStorage.getItem(SAVED_PANDITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePanditToQuickPick(pandit: { name: string; phone: string }): void {
  try {
    const list = getSavedPandits();
    const cleanPhone = pandit.phone.replace(/\D/g, '');
    if (!list.some(p => p.phone.replace(/\D/g, '') === cleanPhone)) {
      list.push({
        id: 'p_' + cleanPhone.slice(-6),
        name: pandit.name.trim(),
        phone: pandit.phone.trim()
      });
      localStorage.setItem(SAVED_PANDITS_KEY, JSON.stringify(list));
    }
  } catch {}
}

export const AcharyaAssignmentPage: React.FC<Props> = ({ navigate }) => {
  const [booking, setBooking] = useState<BookingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Manual search fallback if no URL param
  const [manualBookingId, setManualBookingId] = useState('');
  const [recentBookings, setRecentBookings] = useState<BookingPlan[]>([]);

  // Pandit assignment fields
  const [panditName, setPanditName] = useState('');
  const [panditPhone, setPanditPhone] = useState('');
  const [arrivalTime, setArrivalTime] = useState('07:00 AM IST');
  const [savedPandits, setSavedPandits] = useState<SavedPandit[]>([]);

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignmentTimestamp, setAssignmentTimestamp] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved pandits on mount
  useEffect(() => {
    setSavedPandits(getSavedPandits());
  }, []);

  const loadBookingData = useCallback(async (idToLoad?: string) => {
    setLoading(true);
    setLoadError(null);

    const params = new URLSearchParams(window.location.search);
    const targetId = idToLoad || params.get('bookingId') || params.get('id') || '';

    if (!targetId) {
      // If no ID provided in URL, fetch recent bookings from Neon Cloud to allow selection
      try {
        const cloudBookings = await fetchBookingsFromNeon();
        const local = getAllBookings();
        const combined = cloudBookings.length > 0 ? cloudBookings : local;
        setRecentBookings(combined.slice(0, 10));
        if (combined.length > 0) {
          const firstUnassigned = combined.find(b => !b.assignedPanditName) || combined[0];
          applyBooking(firstUnassigned);
        } else {
          setLoadError('No active ceremony bookings found.');
        }
      } catch (err: any) {
        setLoadError('Failed to fetch ceremony reservations.');
      }
      setLoading(false);
      return;
    }

    // First check local store for immediate render
    const localMatch = getAllBookings().find(b => b.id.toLowerCase() === targetId.toLowerCase().trim());
    if (localMatch) {
      applyBooking(localMatch);
    }

    // Always fetch latest state directly from Neon Cloud database
    try {
      const cloudBooking = await fetchBookingByIdFromNeon(targetId.trim());
      if (cloudBooking) {
        applyBooking(cloudBooking);
      } else if (!localMatch) {
        setLoadError(`Booking #${targetId} was not found in the reservation records.`);
      }
    } catch (err: any) {
      if (!localMatch) {
        setLoadError(`Unable to connect to reservation database: ${err?.message || 'Network error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const applyBooking = (b: BookingPlan) => {
    setBooking(b);
    if (b.assignedPanditName) {
      setPanditName(b.assignedPanditName);
      setPanditPhone(b.assignedPanditPhone || '');
      setIsAssigned(true);
    } else {
      setIsAssigned(false);
    }
  };

  useEffect(() => {
    loadBookingData();
  }, [loadBookingData]);

  const handleSelectQuickPandit = (pandit: SavedPandit) => {
    setPanditName(pandit.name);
    setPanditPhone(pandit.phone);
    setActionError(null);
  };

  const handleConfirmAssignment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!booking) return;

    if (!panditName.trim()) {
      setActionError('Please enter the Pandit’s full name.');
      return;
    }

    const cleanPhone = panditPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setActionError('Please enter a valid 10-digit mobile number for WhatsApp dispatch.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const formattedPhone = cleanPhone.length === 10 ? '+91 ' + cleanPhone : '+' + cleanPhone;

    try {
      const result = await executeAcharyaAssignment(
        booking.id,
        {
          name: panditName.trim(),
          phone: formattedPhone,
          arrivalTime: arrivalTime.trim() || '07:00 AM IST'
        },
        formattedPhone,
        arrivalTime.trim() || '07:00 AM IST',
        booking
      );

      if (result.ok && result.booking) {
        setBooking(result.booking);
        setIsAssigned(true);
        setIsEditing(false);
        setAssignmentTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

        // Persist to quick pick
        savePanditToQuickPick({ name: panditName.trim(), phone: formattedPhone });
        setSavedPandits(getSavedPandits());
      } else {
        setActionError(result.error || 'Failed to complete assignment and message dispatch.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Error occurred during Pandit dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBookingId.trim()) return;
    loadBookingData(manualBookingId.trim());
  };

  return (
    <div className="py-10 bg-ivory min-h-screen text-charcoal">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-dark text-[11px] uppercase tracking-[0.2em] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Main Acharya Coordination Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
            Assign Initiated Pandit
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-lg mx-auto">
            Direct Vedic allocation desk for confirmed Vardhantotsava ceremonies across Bengaluru.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-[#FDFBF7] rounded-md border border-gold/30 p-12 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto" />
            <h2 className="font-serif text-xl font-medium text-charcoal">Retrieving Reservation Records...</h2>
            <p className="text-xs text-charcoal/60">Fetching verified booking details from the central database.</p>
          </div>
        )}

        {/* Load Error / Search Fallback */}
        {!loading && (!booking || loadError) && (
          <div className="bg-[#FDFBF7] rounded-md border border-gold/30 p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Booking Not Found</strong>
                <span>{loadError || 'Please verify the booking ID from your WhatsApp notification link.'}</span>
              </div>
            </div>

            <form onSubmit={handleManualSearch} className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70">
                Look up Booking by ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualBookingId}
                  onChange={(e) => setManualBookingId(e.target.value)}
                  placeholder="e.g. MK-2026-1740..."
                  className="flex-1 bg-ivory border border-gold/30 rounded-xl px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {recentBookings.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase font-bold text-gold-dark tracking-wider block">
                  Recent Ceremony Requests
                </span>
                <div className="space-y-2">
                  {recentBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => applyBooking(b)}
                      className="w-full text-left p-3 rounded-xl border border-gold/20 hover:border-gold/50 bg-ivory/50 hover:bg-gold/5 transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <strong className="text-xs font-semibold text-charcoal block">{b.name}</strong>
                        <span className="text-[11px] text-charcoal/60">
                          {b.id} · {b.celebrationDate} ({b.timeSlot})
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        b.assignedPanditName ? 'bg-emerald-100 text-emerald-800' : 'bg-gold/20 text-gold-dark'
                      }`}>
                        {b.assignedPanditName ? 'Assigned' : 'Awaiting Pandit'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loaded Ceremony Card */}
        {!loading && booking && (
          <div className="bg-[#FDFBF7] rounded-md border border-gold/30 p-6 sm:p-8 space-y-6">

            {/* Reservation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gold/20 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider block">
                  Booking ID: {booking.id}
                </span>
                <h2 className="font-serif text-2xl font-bold text-charcoal">
                  {booking.name}’s Vardhantotsava
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isAssigned && !isEditing
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-gold/15 text-gold-dark border border-gold/40'
                }`}>
                  {isAssigned && !isEditing ? 'Pandit Assigned' : 'Awaiting Assignment'}
                </span>
              </div>
            </div>

            {/* Ceremony Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-gold/20">
              <div>
                <span className="text-charcoal/60 block text-[11px]">Celebration Date & Time:</span>
                <strong className="text-charcoal text-xs font-semibold block mt-0.5">
                  {booking.celebrationDate} ({booking.timeSlot} IST)
                </strong>
              </div>
              <div>
                <span className="text-charcoal/60 block text-[11px]">Selected Package:</span>
                <strong className="text-charcoal text-xs font-semibold block mt-0.5">
                  {booking.packageName}
                </strong>
              </div>
              <div>
                <span className="text-charcoal/60 block text-[11px]">Sankalpa Vedic Lineage:</span>
                <strong className="text-charcoal text-xs font-semibold block mt-0.5">
                  {booking.gotra || 'Kashyapa'} Gotra · {booking.nakshatra || 'Chitra'} Nakshatra (Pada {booking.pada || 1})
                </strong>
              </div>
              <div>
                <span className="text-charcoal/60 block text-[11px]">Host Contact Phone:</span>
                <strong className="text-charcoal text-xs font-mono font-semibold block mt-0.5">
                  {booking.phone}
                </strong>
              </div>
              <div className="sm:col-span-2 pt-1 border-t border-gold/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-charcoal/60 block text-[11px]">Ceremony Venue:</span>
                    <strong className="text-charcoal text-xs font-medium block mt-0.5">
                      {booking.address} {booking.pincode ? `(${booking.pincode})` : ''}
                    </strong>
                  </div>
                  {booking.mapsLink && (
                    <a
                      href={booking.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-gold-dark hover:underline bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sacred Gifts to Carry (if present) */}
            {booking.giftItems && booking.giftItems.length > 0 && (
              <div className="p-4 rounded-2xl border border-gold/30 bg-gold/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gold-dark uppercase tracking-wider">
                    <Gift className="w-4 h-4" />
                    <span>Sacred Gifts Included</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    booking.giftDeliveryMode === 'with_pandit'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}>
                    {booking.giftDeliveryMode === 'with_pandit' ? 'Hand-deliver with Pandit' : 'Dispatched via Courier'}
                  </span>
                </div>
                <div className="text-xs text-charcoal/80 space-y-1">
                  {booking.giftItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                {booking.giftDeliveryMode === 'with_pandit' && (
                  <p className="text-[10px] text-amber-800 font-medium">
                    Note for Assigned Pandit: Please collect these consecrated items prior to arriving at the celebrant residence.
                  </p>
                )}
              </div>
            )}

            {/* Pandit Assignment Card */}
            {(!isAssigned || isEditing) ? (
              <form onSubmit={handleConfirmAssignment} className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs uppercase font-bold text-gold-dark tracking-wider block">
                      Assign Pandit for this Ceremony
                    </label>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-[11px] text-charcoal/60 hover:text-charcoal underline"
                      >
                        Cancel Re-assignment
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-charcoal/70">
                    Enter the initiated Pandit’s name and WhatsApp number. The complete ceremony schedule, route map, and Sankalpa instructions will be dispatched to their phone immediately.
                  </p>
                </div>

                {/* Quick-Pick Saved Pandits */}
                {savedPandits.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-charcoal/50 tracking-wider">
                      Quick Pick Initiated Scholar:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {savedPandits.map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => handleSelectQuickPandit(sp)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                            panditPhone.replace(/\D/g, '') === sp.phone.replace(/\D/g, '')
                              ? 'border-gold bg-gold/15 font-semibold text-charcoal'
                              : 'border-gold/20 bg-ivory hover:border-gold/40 text-charcoal/80'
                          }`}
                        >
                          <User className="w-3 h-3 text-gold-dark" />
                          <span>{sp.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-charcoal block">
                      Pandit Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={panditName}
                      onChange={(e) => setPanditName(e.target.value)}
                      placeholder="e.g. Vidwan Sri Subrahmanya Bhat"
                      className="w-full bg-white border border-gold/40 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-charcoal block">
                      Pandit WhatsApp Number *
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold-dark shrink-0" />
                      <input
                        type="tel"
                        required
                        value={panditPhone}
                        onChange={(e) => setPanditPhone(e.target.value)}
                        placeholder="+91 99020 45009"
                        className="w-full bg-white border border-gold/40 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-charcoal block">
                      Expected Arrival Time IST
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-dark shrink-0" />
                      <input
                        type="text"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        placeholder="07:00 AM IST"
                        className="w-full bg-white border border-gold/40 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-gold"
                      />
                    </div>
                    <span className="text-[10px] text-charcoal/50 block">
                      Recommended: 30 to 45 minutes prior to the muhurta start time.
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-hover disabled:opacity-60 text-white text-xs uppercase tracking-widest font-semibold py-4 rounded-2xl shadow-sacred flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synchronizing & Dispatched WhatsApp Templates...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Confirm & Dispatch Assignment to {panditName || 'Pandit'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-charcoal/60 text-center mt-2">
                    Directly updates the cloud reservation, sends the ritual order to the Pandit’s WhatsApp, and notifies the host family.
                  </p>
                </div>
              </form>
            ) : (
              /* Already Assigned View */
              <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Pandit Assigned & Order Dispatched {assignmentTimestamp ? `at ${assignmentTimestamp}` : 'Successfully'}</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Re-assign Pandit</span>
                  </button>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1.5 text-emerald-950">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800/70 font-medium">Assigned Vedic Scholar:</span>
                    <strong className="font-semibold text-sm">{booking.assignedPanditName || panditName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800/70 font-medium">Pandit WhatsApp Number:</span>
                    <span className="font-mono font-semibold">{booking.assignedPanditPhone || panditPhone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800/70 font-medium">Arrival Time:</span>
                    <span className="font-semibold">{arrivalTime}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-emerald-900 leading-relaxed border-t border-emerald-200 pt-3">
                  <p>
                    <strong>1. Official WhatsApp Dispatch to Pandit:</strong> Dispatched complete ceremony dossier (Nakshatra, Gotra, ceremony muhurta, address and maps link) to <strong>{booking.assignedPanditPhone || panditPhone}</strong>.
                  </p>
                  <p>
                    <strong>2. Official WhatsApp Dispatch to Family:</strong> Notified host family on <strong>{booking.phone}</strong> with the assigned Pandit name and arrival schedule.
                  </p>
                  <p>
                    <strong>3. Central Database Synchronized:</strong> Live database records updated on Neon PostgreSQL.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => navigate('/pandit')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Open Pandit Coordination Panel
                  </button>
                  <button
                    onClick={() => navigate('/admin')}
                    className="border border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Return to Admin Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
