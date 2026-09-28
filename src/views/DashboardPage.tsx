import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Flame, 
  Phone, 
  Calendar, 
  Check, 
  ShieldCheck, 
  Compass, 
  FileText 
} from 'lucide-react';
import { getSavedBooking, getAllBookings, BookingPlan } from '../lib/store';
import { ACHARYA_SCHOLARS } from '../lib/content';

interface DashboardProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ navigate }) => {
  const [allBookings] = useState<BookingPlan[]>(() => {
    const list = getAllBookings();
    if (list.length > 0) return list;
    const single = getSavedBooking();
    return single ? [single] : [];
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string>(() => {
    const list = getAllBookings();
    const requested = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('bookingId') : null;
    return requested || list[0]?.id || getSavedBooking()?.id || '';
  });

  const booking = allBookings.find(b => b.id === selectedBookingId) || allBookings[0] || getSavedBooking();

  const requestedId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('bookingId') : null;
  if (requestedId && !allBookings.some(b=>b.id===requestedId)) return <section className="p-12 text-center"><h1 className="font-serif text-3xl">Booking not found</h1><p className="my-4">This booking is not available in this browser.</p><button onClick={()=>navigate('/dashboard')}>View available drafts</button></section>;
  if (!booking) {
    return (
      <div className="py-24 bg-[#FAF5ED] min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-white border border-[#D5C2A4] flex items-center justify-center text-[#B37418] mx-auto shadow-xs">
            <Calendar className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-normal text-[#1F1914]">
              No Active Celebrations
            </h2>
            <p className="text-[14px] text-[#5C5147] leading-relaxed">
              You do not have any active celebrations scheduled yet. Plan a sacred Vardhantotsava with Acharya home rituals and authentic Vedic blessings.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/book')}
              className="bg-[#B37418] hover:bg-[#9B6210] text-white text-[12px] uppercase tracking-wider font-semibold px-8 py-3.5 rounded-full shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Plan a Vardhantotsava
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === 'draft') {
    return (
      <main className="min-h-[65vh] bg-ivory px-6 py-12">
        <section className="max-w-2xl mx-auto rounded-3xl border border-gold/30 bg-white p-8 space-y-5">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-semibold">
            Saved locally · Awaiting Confirmation
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Your Celebration Draft</h1>
          <p className="text-sm text-charcoal/80">
            {booking.name} · {booking.celebrationDate} · {booking.timeSlot}
          </p>
          <p className="text-sm text-charcoal/80">
            Package: {booking.packageName}
          </p>
          <p className="text-sm text-charcoal/80">
            Venue: {booking.address}, Bengaluru - {booking.pincode}
          </p>
          <p className="text-sm text-charcoal/70">
            No celebration has been reserved yet. An Acharya, availability, and ceremony details still need confirmation.
          </p>
          <button 
            onClick={() => navigate('/book?name=' + encodeURIComponent(booking.name) + '&dob=' + booking.dob + '&package=' + booking.packageId)} 
            className="rounded-xl bg-gold hover:bg-gold-hover px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Complete Booking
          </button>
        </section>
      </main>
    );
  }

  const assignedAcharya = booking?.assignedPanditId 
    ? ACHARYA_SCHOLARS.find(a => a.id === booking.assignedPanditId) || null 
    : null;

  const stages = [
    { title: 'Booking Confirmed', desc: 'Reserved in Bengaluru system', completed: true },
    { title: 'Sankalpa Details Review', desc: 'Awaiting coordinator verification', completed: false },
    { 
      title: 'Acharya Assigned', 
      desc: assignedAcharya ? assignedAcharya.name : 'In review with Main Acharya', 
      completed: Boolean(booking?.assignedPanditId) 
    },
    { 
      title: 'Ritual Preparation', 
      desc: 'Preparation confirmation pending', 
      completed: false 
    },
    { 
      title: 'Acharya Arrival', 
      desc: `30 mins prior to ${booking.timeSlot.split('-')[0]?.trim() || booking.timeSlot} window`, 
      completed: false 
    },
    { 
      title: 'Consecrated Prasada', 
      desc: 'Delivered post-ritual', 
      completed: false 
    }
  ];

  const completedCount = stages.filter(s => s.completed).length;
  const waSupportLink = `https://wa.me/918296925577?text=${encodeURIComponent(`Namaskara, inquiring about booking #${booking.id} for ${booking.name}`)}`;

  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Multiple Celebrations Switcher */}
        {allBookings.length > 1 && (
          <div className="bg-white rounded-2xl p-4 border border-gold/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-dark" />
              <span className="text-xs font-semibold text-charcoal">
                Your Scheduled Celebrations ({allBookings.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allBookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                    b.id === booking.id
                      ? 'bg-[#B37418] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF8F5] text-charcoal hover:bg-gold/10 border border-gold/20'
                  }`}
                >
                  {b.name} · {b.celebrationDate}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-sacred-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Confirmed and Active
              </span>
              {booking.occasion && (
                <span className="bg-gold/10 text-gold-dark text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gold/30">
                  {booking.occasion}
                </span>
              )}
              {booking.relationship && (
                <span className="bg-cream text-charcoal/80 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gold/20">
                  Relationship: {booking.relationship}
                </span>
              )}
              <span className="text-xs text-charcoal/60 font-mono">
                Booking ID: {booking.id}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              {booking.name}'s Vardhantotsava
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal/80 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-dark" />
                <span>{booking.celebrationDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold-dark" />
                <span>{booking.timeSlot}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold-dark" />
                <span>{booking.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/book')}
              className="border border-gold text-gold-dark hover:bg-gold/10 text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Book Another Celebration</span>
            </button>
            <a
              href={waSupportLink}
              target="_blank"
              rel="noreferrer"
              className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-full shadow-sacred flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Coordinator</span>
            </a>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold/25 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-charcoal">Ritual Journey Progression</h3>
            <span className="text-xs font-semibold text-gold-dark">Step {completedCount} of 6</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
            {stages.map((stg, i) => (
              <div 
                key={i} 
                className={`p-3.5 rounded-xl border text-left space-y-1.5 ${
                  stg.completed 
                    ? 'border-gold bg-[#FAF8F5] shadow-2xs' 
                    : 'border-gold/15 bg-ivory/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-charcoal/50">0{i+1}</span>
                  {stg.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-dark" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-charcoal/20" />
                  )}
                </div>
                <p className="font-serif text-xs font-bold text-charcoal leading-tight">{stg.title}</p>
                <p className="text-[10px] text-charcoal/60 leading-tight">{stg.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two Columns: Celebration Details + Pandit Profile & Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Ceremony Details & WhatsApp Updates */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Sacred Sankalpa & Reservation Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gold/15">
                <Compass className="w-5 h-5 text-gold-dark" />
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  Sankalpa & Celebration Alignment
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-gold/20 space-y-1">
                  <span className="text-charcoal/60 uppercase tracking-wider text-[10px] font-semibold block">
                    Celebrant
                  </span>
                  <strong className="text-charcoal text-sm font-serif block">
                    {booking.name}
                  </strong>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-gold/20 space-y-1">
                  <span className="text-charcoal/60 uppercase tracking-wider text-[10px] font-semibold block">
                    Vedic Alignment
                  </span>
                  <span className="text-charcoal font-medium block">
                    Gotra: {booking.gotra || 'Kashyapa'} · Nakshatra: {booking.nakshatra || 'Chitra'} {booking.pada ? `(Pada ${booking.pada})` : ''}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-gold/20 space-y-1">
                  <span className="text-charcoal/60 uppercase tracking-wider text-[10px] font-semibold block">
                    Muhurta Time Slot
                  </span>
                  <span className="text-charcoal font-medium block">
                    {booking.celebrationDate} · {booking.timeSlot}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-gold/20 space-y-1">
                  <span className="text-charcoal/60 uppercase tracking-wider text-[10px] font-semibold block">
                    Selected Package
                  </span>
                  <span className="text-charcoal font-medium block">
                    {booking.packageName}
                  </span>
                </div>

                {booking.occasion && (
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-gold/20 space-y-1">
                    <span className="text-charcoal/60 uppercase tracking-wider text-[10px] font-semibold block">
                      Celebration Occasion
                    </span>
                    <span className="text-charcoal font-medium block">
                      {booking.occasion} {booking.relationship ? `(${booking.relationship})` : ''}
                    </span>
                  </div>
                )}

                <div className={`${booking.occasion ? 'sm:col-span-1' : 'sm:col-span-2'} p-3.5 bg-[#FAF8F5] rounded-xl border border-gold/20 space-y-1`}>
                  <span className="text-charcoal/60 uppercase tracking-wider text-[10px] font-semibold block">
                    Venue Address
                  </span>
                  <span className="text-charcoal font-medium block">
                    {booking.address}, Bengaluru - {booking.pincode}
                  </span>
                  {booking.mapsLink && (
                    <a
                      href={booking.mapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold-dark hover:underline text-[11px] font-semibold inline-block pt-1"
                    >
                      Open Google Maps Location
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Assigned Pandit Card */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Acharya Scholar Card (Conditional on assignment) */}
            {booking.assignedPanditId && assignedAcharya ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-xs space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-dark block">
                  Your Assigned Acharya
                </span>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-cream border-2 border-gold/40 flex items-center justify-center font-serif text-xl font-bold text-gold-dark shadow-inner">
                    {assignedAcharya.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-charcoal">
                      {assignedAcharya.name}
                    </h4>
                    <p className="text-xs text-gold-dark font-medium">
                      {assignedAcharya.vedicTradition} · {assignedAcharya.experienceYears} Yrs Exp
                    </p>
                    <p className="text-[11px] text-charcoal/60">
                      Languages: {assignedAcharya.languages.join(', ')}
                    </p>
                  </div>
                </div>

                {assignedAcharya.bio && assignedAcharya.bio.trim() ? (
                  <p className="text-xs text-charcoal/75 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-gold/20">
                    "{assignedAcharya.bio}"
                  </p>
                ) : null}

                <div className="pt-1 space-y-2 text-xs border-t border-gold/15">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60">Coordinator Phone:</span>
                    <strong className="text-charcoal font-semibold">{assignedAcharya.phone}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60">Expected Arrival:</span>
                    <strong className="text-charcoal font-semibold">30 mins prior to {booking.timeSlot.split('-')[0]?.trim() || booking.timeSlot}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B37418] block">
                    Acharya Assignment In Progress
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-charcoal">
                  Main Acharya is Reviewing Your Sankalpa
                </h4>
                <p className="text-xs text-charcoal/75 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-gold/20">
                  Your reservation is confirmed. Our Chief Acharya (+91 99020 45009) is reviewing your sacred alignment and assigning an initiated Vedic scholar matched to your family Gotra ({booking.gotra || 'Kashyapa'}), tradition, and language preference. You will receive an update once assigned.
                </p>
                <div className="pt-1 space-y-2 text-xs border-t border-gold/15">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60">Main Coordinator:</span>
                    <strong className="text-charcoal font-semibold">+91 99020 45009</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60">Status:</span>
                    <strong className="text-amber-700 font-semibold">Scholar Allocation Underway</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
