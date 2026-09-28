import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, Calendar, MapPin, Clock, Shield, ArrowRight, Phone, MessageSquare, BookOpen } from 'lucide-react';
import { getSavedBooking, getAllBookings, BookingPlan, saveBooking } from '../lib/store';
import { ACHARYA_SCHOLARS, AcharyaScholar } from '../lib/content';
import { executeAcharyaAssignment, getWhatsAppMessages } from '../lib/whatsapp';
import { BrandLogo } from '../components/BrandLogo';

interface Props {
  navigate: (path: string) => void;
}

export const AcharyaAssignmentPage: React.FC<Props> = ({ navigate }) => {
  const [booking, setBooking] = useState<BookingPlan | null>(() => getSavedBooking());
  const [selectedAcharyaId, setSelectedAcharyaId] = useState('acharya-1');
  const [customAcharyaPhone, setCustomAcharyaPhone] = useState('+91 99020 45009');
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignmentTime, setAssignmentTime] = useState('');

  // Extract query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const acharyaParam = params.get('acharyaId');
    if (acharyaParam) {
      setSelectedAcharyaId(acharyaParam);
      const match = ACHARYA_SCHOLARS.find(a => a.id === acharyaParam);
      if (match) setCustomAcharyaPhone(match.phone);
    }
    
    const bookingIdParam = params.get('bookingId');
    let currentBooking = getSavedBooking();
    if (bookingIdParam) {
      const all = getAllBookings();
      const match = all.find(b => b.id === bookingIdParam);
      if (!match) { setBooking(null); return; }
      if (match) {
        currentBooking = match;
        setBooking(match);
      }
    }

    // Check if already assigned
    if (currentBooking && currentBooking.assignedPanditId) {
      setSelectedAcharyaId(currentBooking.assignedPanditId);
      const match = ACHARYA_SCHOLARS.find(a => a.id === currentBooking.assignedPanditId);
      if (match) setCustomAcharyaPhone(match.phone);
      setIsAssigned(true);
      setAssignmentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    }
  }, []);

  const selectedAcharya = ACHARYA_SCHOLARS.find((a) => a.id === selectedAcharyaId) || ACHARYA_SCHOLARS[0];

  const handleSelectAcharya = (acharyaId: string) => {
    if (isAssigned) return;
    setSelectedAcharyaId(acharyaId);
    const match = ACHARYA_SCHOLARS.find(a => a.id === acharyaId);
    if (match) setCustomAcharyaPhone(match.phone);
  };

  const handleConfirmAssignment = () => {
    if(!booking)return;
    const bookingId = booking.id;
    if(!executeAcharyaAssignment(bookingId, selectedAcharyaId, customAcharyaPhone))return;
    setIsAssigned(true);
    setAssignmentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    
    // Refresh booking
    setBooking(getAllBookings().find(b => b.id === bookingId) || null);
  };

  if (!booking) return <main className="p-12 text-center min-h-[60vh]"><h1 className="font-serif text-3xl">Booking not found</h1><p className="my-4">Select a saved booking from the local admin preview.</p><button onClick={() => navigate('/admin')}>Open admin preview</button></main>;
  return (
    <div className="py-12 bg-ivory min-h-screen text-charcoal">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] font-semibold text-gold-dark block">
            ACHARYA COORDINATION DESK
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
            Assign Initiated Acharya
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-lg mx-auto">
            One-tap allocation for incoming Vardhantotsava reservations across Bengaluru.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gold/30 shadow-sacred p-6 sm:p-8 space-y-6">
          
          {/* Reservation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gold/20 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider block">
                Booking ID: {booking ? booking.id : 'MK-2027-8491'}
              </span>
              <h2 className="font-serif text-2xl font-bold text-charcoal">
                {booking ? booking.name : 'Ramesh Hegde'}'s Vardhantotsava
              </h2>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isAssigned 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-gold/15 text-gold-dark border border-gold/40'
              }`}>
                {isAssigned ? 'Acharya Assigned' : 'Awaiting Assignment'}
              </span>
            </div>
          </div>

          {/* Booking Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-cream/30 p-4 rounded-2xl border border-gold/20">
            <div>
              <span className="text-charcoal/60 block">Celebration Date & Slot:</span>
              <strong className="text-charcoal text-sm font-semibold">
                {booking ? booking.celebrationDate : 'Tomorrow'} ({booking ? booking.timeSlot : 'Morning 8:00 AM - 11:30 AM'})
              </strong>
            </div>
            <div>
              <span className="text-charcoal/60 block">Package:</span>
              <strong className="text-charcoal text-sm font-semibold">
                {booking ? booking.packageName : 'Parampara (Heritage Package)'}
              </strong>
            </div>
            <div>
              <span className="text-charcoal/60 block">Gotra & Janma Nakshatra:</span>
              <strong className="text-charcoal">
                {booking?.gotra || 'Kashyapa'} Gotra · {booking?.nakshatra || 'Chitra'} Nakshatra
              </strong>
            </div>
            <div>
              <span className="text-charcoal/60 block">Location:</span>
              <strong className="text-charcoal">
                {booking?.address || 'Malleshwaram, Bengaluru - 560003'}
              </strong>
            </div>
          </div>

          {/* Acharya Selection Card */}
          <div className="space-y-3">
            <label className="block text-xs uppercase font-bold text-gold-dark tracking-wider">
              Selected Vedic Scholar
            </label>

            <div className="space-y-3">
              {ACHARYA_SCHOLARS.map((acharya) => {
                const isSelected = selectedAcharyaId === acharya.id;
                return (
                  <label
                    key={acharya.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-2 border-gold bg-gold/5 shadow-xs' 
                        : 'border-gold/20 bg-ivory hover:border-gold/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        type="radio"
                        name="acharyaSelect"
                        value={acharya.id}
                        checked={isSelected}
                        onChange={() => handleSelectAcharya(acharya.id)}
                        disabled={isAssigned}
                        className="mt-1 text-gold"
                      />
                      <div className="space-y-1">
                        <strong className="font-serif text-base text-charcoal block">
                          {acharya.name}
                        </strong>
                        <p className="text-xs text-gold-dark font-medium">
                          {acharya.title} · {acharya.experienceYears} Years Exp
                        </p>
                        <p className="text-[11px] text-charcoal/70">
                          {acharya.institution} ({acharya.vedicTradition})
                        </p>
                        <p className="text-[11px] text-charcoal/60">
                          Phone: <strong className="font-mono text-charcoal">{acharya.phone}</strong> · Zone: {acharya.area}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Acharya Contact Phone Input */}
          <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5D7C3] text-left">
            <label className="text-xs uppercase font-bold text-gold-dark tracking-wider block">
              Assigned Acharya WhatsApp Contact Number
            </label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-dark shrink-0" />
              <input
                type="tel"
                value={customAcharyaPhone}
                onChange={(e) => setCustomAcharyaPhone(e.target.value)}
                disabled={isAssigned}
                placeholder="+91 98450 88002"
                className="w-full bg-white border border-gold/40 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-gold"
              />
            </div>
            <p className="text-[11px] text-charcoal/60">
              The official booking assignment order containing celebration date ({booking ? booking.celebrationDate : 'Ceremony Date'}), muhurta window ({booking ? booking.timeSlot : 'Morning'}), venue address, host phone, and celebrant Gotra/Nakshatra will be sent directly to this WhatsApp number.
            </p>
          </div>

          {/* Action Button & Confirmation */}
          {!isAssigned ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="w-full bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold py-4 rounded-2xl shadow-sacred flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Accept & Dispatch Assignment Order to {selectedAcharya.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-charcoal/60 text-center mt-2">
                Clicking will update the database, send the ceremony assignment order with Date and Time directly to the Acharya's phone, and alert the customer with the Acharya profile.
              </p>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 text-left">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Acharya Assigned & Ceremony Order Dispatched at {assignmentTime || 'just now'}</span>
              </div>
              <div className="space-y-2 text-xs text-emerald-900 leading-relaxed">
                <p>
                  <strong>1. Message to Assigned Acharya ({customAcharyaPhone}):</strong> Dispatched official assignment order to <strong>{selectedAcharya.name}</strong> with Date (<strong>{booking?.celebrationDate}</strong>), Time Slot (<strong>{booking?.timeSlot}</strong>), venue address, celebrant Nakshatra ({booking?.nakshatra}), and family contact phone ({booking?.phone}).
                </p>
                <p>
                  <strong>2. Message to Family ({booking?.phone || 'Customer'}):</strong> Dispatched notification to the family with <strong>{selectedAcharya.name}</strong>'s bio, tradition, and arrival window.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => navigate('/portal')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  View in Customer Portal
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="border border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Return to Admin Console
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
