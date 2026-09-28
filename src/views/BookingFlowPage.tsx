import { requestDemoOtp, verifyDemoOtp, isDemoPhoneVerified, normalizeIndianPhone, nextBirthday, localDate, addressError, earliestCeremonyDate } from '../lib/flowValidation';
import { ManualVedicFields, emptyVedic } from '../components/ManualVedicFields';
import React, { useState, useEffect } from 'react';
import { MapPin, Check, ArrowRight, Shield, CreditCard, CheckCircle2, Lock, Box, Flame, Smartphone, Building2 } from 'lucide-react';
import { PACKAGES, PackageDetail, HAVIKAR_PRODUCTS, VEDIC_TIME_WINDOWS } from '../lib/content';
import { NAKSHATRAS, RASHIS } from '../lib/panchanga';
import { saveBooking, BookingPlan, getUserProfile, saveUserProfile, UserProfile, findUserProfileByPhone } from '../lib/store';
import { AkshataCelebration } from '../components/AkshataCelebration';
import { sendOtpMessage, sendWelcomeCatalogMessage, sendBookingConfirmedMessage, sendAcharyaAlertMessage } from '../lib/whatsapp';
import { syncBookingToNeon, fetchUserProfileFromNeon, saveUserProfileToNeon } from '../lib/db';
import { launchRazorpayCheckout } from '../lib/razorpay';

const VEDIC_GOTRAS = [
  'Kashyapa', 'Bharadwaja', 'Vashistha', 'Vishwamitra', 'Gautama', 
  'Jamadagni', 'Atri', 'Agastya', 'Harita', 'Kaundinya', 
  'Sandilya', 'Mudgala', 'Vatsa', 'Angirasa', 'Kaushika', 'Srivatsa', 'Garga', 'Other'
];

interface BookingProps {
  navigate: (path: string) => void;
  initialPackageId?: string;
}

export const BookingFlowPage: React.FC<BookingProps> = ({ navigate, initialPackageId = 'sampoorna' }) => {
  const [step, setStep] = useState(1);
  
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlPkg = searchParams.get('package');
  const stageLabels: Record<string, string> = { child: 'Your child', adult: 'Yourself', elder: 'Your parents', family: 'Your family' };
  const celebrationFor = stageLabels[searchParams.get('stage') || ''];
  const urlName = searchParams.get('name') || '';
  const urlDob = searchParams.get('dob') || '';

  // Celebrant Vedic Details (100% manual selection, no auto-guess)
  const [nakshatra, setNakshatra] = useState(searchParams.get('nakshatra') || '');
  const initialGotra=searchParams.get('gotra')||'';
  const [gotra, setGotra] = useState(initialGotra && !VEDIC_GOTRAS.includes(initialGotra) ? 'Other' : initialGotra);
  const [customGotra, setCustomGotra] = useState(initialGotra && !VEDIC_GOTRAS.includes(initialGotra) ? initialGotra : '');
  const [rashi, setRashi] = useState(searchParams.get('rashi') || '');
  const [pada, setPada] = useState(searchParams.get('pada') || '0');

  // Form State
  const [occasion, setOccasion] = useState('Janmadina Vardhantotsava (Birthday)');
  const [relationship, setRelationship] = useState('Self (Myself)');
  const [name, setName] = useState(urlName);
  const [dob, setDob] = useState(urlDob);

  const [celebrationDate, setCelebrationDate] = useState(() => {
    if (urlDob) {
      const today = new Date();
      const thisYear = today.getFullYear();
      return nextBirthday(urlDob);
    }
    return '';
  });
  const [timeSlot, setTimeSlot] = useState(VEDIC_TIME_WINDOWS[1].timeSlot);

  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Authentication & Phone Verification State
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Razorpay Checkout State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

  // Check saved profile on mount
  useEffect(() => {
    const profile = getUserProfile();
    if (profile && profile.phone) {
      setPhone(profile.phone);
      if (profile.name && !name) setName(profile.name);
      if (profile.email && !email) setEmail(profile.email);
      if (profile.addresses && profile.addresses.length > 0) {
        const addr = profile.addresses[0];
        if (!address && addr.address) setAddress(addr.address);
        if (!landmark && addr.landmark) setLandmark(addr.landmark);
        if (!pincode && addr.pincode) setPincode(addr.pincode);
        if (!mapsLink && addr.mapsLink) setMapsLink(addr.mapsLink);
      }
      if (isDemoPhoneVerified(profile.phone)) {
        setIsPhoneVerified(true);
      }
    }
  }, []);

  // Package & Upgrades
  const [selectedPackageId, setSelectedPackageId] = useState(
    PACKAGES.some(p => p.id === urlPkg) ? urlPkg! : initialPackageId
  );
  const [upgradeToHomeHoma, setUpgradeToHomeHoma] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [customGiftItems, setCustomGiftItems] = useState<string[]>([
    'sandalwood-bracelet',
    'japa-mala',
    'rose-kumkuma',
    'pure-arishina',
    'mantrakshata'
  ]);
  const [showGiftModal, setShowGiftModal] = useState(false);

  const [isPaying, setIsPaying] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const selectedPkg = PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[1];

  const availableAddons = [
    { id: 'virtual-homa', name: 'Virtual Ayushya Homa streamed live', price: 0, applicableFor: ['aarambha'] },
    { id: 'home-homa', name: 'At-Home Ayushya Homa conducted by Acharya', price: 0, applicableFor: ['aarambha'] },
    { id: 'havikar-gift-box', name: 'Havikar Keepsake Gift Box', price: 0, applicableFor: ['aarambha', 'sampoorna'] },
    { id: 'garlands', name: 'Fresh Jasmine & Marigold floral garlands', price: 0 },
    { id: 'prasada', name: 'Extra Box of Consecrated Prasada', price: 0 },
    { id: 'angavastram', name: 'Handloom Silk Angavastram for Celebrant', price: 0 },
  ];

  const toggleAddon = (nameWithPrice: string) => {
    if (selectedAddons.includes(nameWithPrice)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== nameWithPrice));
    } else {
      setSelectedAddons([...selectedAddons, nameWithPrice]);
    }
  };

  const calculateAddonsTotal = () => {
    let sum = 0;
    selectedAddons.forEach((addonName) => {
      const match = availableAddons.find((a) => a.name === addonName);
      if (match) sum += match.price;
    });
    if (selectedPackageId === 'sampoorna' && upgradeToHomeHoma) {
      sum += 4999;
    }
    return sum;
  };

  const grandTotal = selectedPkg.price + calculateAddonsTotal();

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dob || dob > localDate()) {setOtpError('Enter a name and a date of birth that is not in the future.');return;}
    setOtpError('');
    if (!celebrationDate && dob) {
      const today = new Date();
      const thisYear = today.getFullYear();
      setCelebrationDate(nextBirthday(dob));
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendOtp = () => {
    if (resendCooldown > 0) return;
    const result = requestDemoOtp(phone);
    setOtpError(result.error || '');
    if (!result.code) return;
    setDemoCode(result.code);
    setOtpSent(true);
    setOtpCode('');
    setResendCooldown(30);
    // Dispatch real WhatsApp OTP via Meta Cloud API template hav_otp1
    sendOtpMessage(phone, result.code);
  };

  const handleVerifyOtp = async () => {
    const verification = verifyDemoOtp(phone, otpCode);
    if (verification.ok) {
      setIsPhoneVerified(true);
      setOtpError('');
      
      // Look up existing profile from persistent registry, active store, or Neon backend
      let existing = findUserProfileByPhone(phone);
      if (!existing || !existing.name) {
        try {
          const neonUser = await fetchUserProfileFromNeon(phone);
          if (neonUser) existing = neonUser;
        } catch (e) {
          console.warn('Backend user lookup error:', e);
        }
      }

      if (existing) {
        if (!name && existing.name) setName(existing.name);
        if (!email && existing.email) setEmail(existing.email);
        if (existing.addresses && existing.addresses.length > 0) {
          const addr = existing.addresses[0];
          if (!address && addr.address) setAddress(addr.address);
          if (!landmark && addr.landmark) setLandmark(addr.landmark);
          if (!pincode && addr.pincode) setPincode(addr.pincode);
          if (!mapsLink && addr.mapsLink) setMapsLink(addr.mapsLink);
        }
      }

      // Save / update verified user profile in store, persistent registry, and Neon backend
      const verifiedProfile: UserProfile = {
        id: existing?.id || `usr-${Date.now()}`,
        name: name || existing?.name || 'Vedic Celebrant',
        phone: phone.trim(),
        email: email.trim() || existing?.email,
        isVerified: true,
        demoVerified: true,
        language: existing?.language || 'English',
        addresses: existing?.addresses && existing.addresses.length > 0
          ? existing.addresses
          : (address ? [{
              id: `addr_${Date.now()}`,
              label: 'Home',
              address: address.trim(),
              landmark: landmark.trim() || undefined,
              pincode: pincode.trim(),
              city: 'Bengaluru',
              mapsLink: mapsLink.trim() || undefined
            }] : []),
        notifications: existing?.notifications || { whatsapp: true, email: true, reminders: true, marketing: false }
      };
      saveUserProfile(verifiedProfile);
      saveUserProfileToNeon(verifiedProfile).catch(e => console.warn('Neon save error:', e));
    } else {
      setOtpError(verification.error || 'Incorrect demo code.');
    }
  };

  const processSuccessfulPayment = (paymentId: string, orderId?: string) => {
    const effectiveGotra = gotra === 'Other' ? customGotra.trim() : gotra;
    const effectiveNakshatra = nakshatra.trim() || 'Will verify with Acharya';

    const formattedMaps = mapsLink.trim().startsWith('http') 
      ? mapsLink.trim() 
      : `https://${mapsLink.trim()}`;

    const profile = getUserProfile();
    const resolvedUserId = profile?.id && profile.id.length === 36 ? profile.id : undefined;

    const newPlan: BookingPlan = {
      id: `MK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: resolvedUserId,
      name,
      occasion,
      relationship,
      dob,
      nakshatra: effectiveNakshatra,
      gotra: effectiveGotra,
      pada: pada && pada !== '0' ? Number(pada) : undefined,
      vedicSource: 'manual',
      rashi: rashi.trim() || undefined,
      celebrationDate,
      timeSlot,
      address,
      mapsLink: formattedMaps,
      apartment: '',
      landmark,
      pincode,
      phone,
      email,
      packageId: selectedPackageId,
      packageName: selectedPkg.name + (upgradeToHomeHoma && selectedPackageId === 'sampoorna' ? ' (Upgraded to At-Home Homa)' : ''),
      addons: selectedAddons,
      totalPrice: grandTotal,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      assignedPanditId: undefined,
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId
    };
    if (!saveBooking(newPlan)) {setOtpError('Could not save this draft. Check browser storage and try again.');setIsPaying(false);return;}

    // 1. Dispatch Booking Confirmed WhatsApp message to Customer
    sendBookingConfirmedMessage(newPlan);

    // 2. Dispatch Alert with dynamic one-tap link to Admin and Main Acharya (919902045009)
    sendAcharyaAlertMessage(newPlan);

    // 3. Asynchronously sync to Neon Cloud PostgreSQL
    syncBookingToNeon(newPlan).catch(err => console.warn('Neon sync warning:', err));

    setIsPaying(false);
    setIsProcessingRazorpay(false);
    setShowRazorpayModal(false);
    setShowCelebrationModal(true);
  };

  const handleCompleteBooking = () => {
    if (!isPhoneVerified) {
      setStep(3);
      setOtpError('Please verify your phone number before proceeding.');
      return;
    }

    if (!isDemoPhoneVerified(phone)) {
      setIsPhoneVerified(false);
      setStep(3);
      setOtpError('Phone verification expired. Request another verification code.');
      return;
    }
    if (celebrationDate < earliestCeremonyDate()) {
      setStep(2);
      setOtpError('Please allow at least two days to arrange your ceremony.');
      return;
    }
    if (!mapsLink || !mapsLink.trim()) {
      setStep(3);
      setOtpError('Google Maps location link is compulsory for the Acharya to navigate to your venue.');
      return;
    }

    setIsPaying(true);
    setOtpError('');

    const profile = getUserProfile();
    const tempBookingId = `MK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectivePackageName = selectedPkg.name + (upgradeToHomeHoma && selectedPackageId === 'sampoorna' ? ' (Upgraded to At-Home Homa)' : '');

    // Launch official Razorpay Checkout modal
    launchRazorpayCheckout({
      bookingId: tempBookingId,
      amount: grandTotal,
      packageName: effectivePackageName,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      userId: profile?.id,
      onSuccess: (res) => {
        processSuccessfulPayment(res.paymentId, res.orderId);
      },
      onFailure: (errMsg) => {
        setIsPaying(false);
        setOtpError(errMsg || 'Payment was not completed. You can try again or use direct UPI.');
        setShowRazorpayModal(true);
      },
      onDismiss: () => {
        setIsPaying(false);
      }
    });
  };

  const stepLabels = ['1. Details', '2. Date & Time', '3. Verification & Address', '4. Package', '5. Review & Confirm'];

  return (
    <div className="py-8 bg-[#FAF6EE] min-h-screen text-[#1F1914] select-none">
      
      {showCelebrationModal && (
        <AkshataCelebration
          onDismiss={() => {
            setShowCelebrationModal(false);
            navigate('/dashboard');
          }}
          onBookAnother={() => {
            setShowCelebrationModal(false);
            setStep(1);
            setName('');
            setDob('');
            setGotra('');
            setCustomGotra('');
            setNakshatra('');
            setRashi('');
            setPada('0');
            setCelebrationDate('');
            setTimeSlot(VEDIC_TIME_WINDOWS[1].timeSlot);
            setSelectedAddons([]);
            setUpgradeToHomeHoma(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <section className="max-w-4xl mx-auto px-4 text-center mb-6">
        <span className="text-[10.5px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] block mb-1">
          RESERVE VARDHANTOTSAVA
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#1F1914]">
          Plan Your Vedic Birthday Celebration
        </h1>
        
        {celebrationFor && (
          <p className="mt-2 text-xs text-[#8C5D0D]">
            Celebration for <strong>{celebrationFor.toLowerCase()}</strong>
          </p>
        )}

        <div className="flex items-center justify-between max-w-2xl mx-auto mt-6 border-b border-[#D5C2A4] pb-3 text-[11px] sm:text-xs font-semibold uppercase tracking-wider overflow-x-auto">
          {stepLabels.map((lbl, idx) => (
            <span 
              key={idx} 
              className={`px-2 py-1 whitespace-nowrap ${
                step === idx + 1 
                  ? 'text-[#8C5D0D] font-bold border-b-2 border-[#B37418] -mb-3.5' 
                  : step > idx + 1 
                    ? 'text-[#8C5D0D]' 
                    : 'text-[#8C7A6E]/50'
              }`}
            >
              {lbl}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#D5C2A4] shadow-sacred">

          {otpError && <p role="alert" className="mb-4 text-sm text-red-700">{otpError}</p>}
          {/* SCREEN 1: DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNextFromStep1} className="space-y-4 animate-fadeIn text-left">
              <div className="border-b border-[#E5D7C3] pb-3">
                <span className="text-[10px] uppercase font-semibold text-[#8C5D0D]">Step 1 of 5</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914]">Celebrant Information</h2>
                <p className="text-xs text-[#5C5147] mt-0.5">Enter celebrant details for the Vedic Sankalpa and Maha Ashirvada.</p>
              </div>

              {/* Occasion & Relationship Selection */}
              <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#D5C2A4] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#8C5D0D] block tracking-wider">
                  Occasion & Family Relationship
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-1">
                      Celebration Occasion *
                    </label>
                    <select id="bookingflowpage-field-1"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-white text-sm focus:outline-none focus:border-[#B37418]"
                    >
                      <option value="Janmadina Vardhantotsava (Birthday)">Birthday (Janmadina Vardhantotsava)</option>
                      <option value="Vivaha Vardhantotsava (Wedding Anniversary)">Wedding Anniversary (Vivaha Vardhantotsava)</option>
                      <option value="Shashtyabdapoorti (60th Milestone)">Shashtyabdapoorti (60th Birthday)</option>
                      <option value="Bhimaratha Shanti (70th Milestone)">Bhimaratha Shanti (70th Milestone)</option>
                      <option value="Sahasra Chandra Darshana (80th/84th)">Sahasra Chandra Darshana (80th/84th)</option>
                      <option value="Special Sacred Milestone">Special Sacred Milestone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-2">
                      Relationship with Celebrant *
                    </label>
                    <select id="bookingflowpage-field-2"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-white text-sm focus:outline-none focus:border-[#B37418]"
                    >
                      <option value="Self (Myself)">Self (Myself)</option>
                      <option value="Spouse (Husband / Wife)">Spouse (Husband / Wife)</option>
                      <option value="Child (Son / Daughter)">Child (Son / Daughter)</option>
                      <option value="Parents (Father / Mother)">Parents (Father / Mother)</option>
                      <option value="Grandparents">Grandparents</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Relative / Friend">Relative / Friend</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-3">
                  {occasion.includes('Anniversary') ? "Couple / Celebrants' Full Names *" : "Celebrant Full Name *"}
                </label>
                <input id="bookingflowpage-field-3" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder={occasion.includes('Anniversary') ? "e.g. Ramesh & Suma Hegde" : "Enter full name"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-4">
                  {occasion.includes('Anniversary') ? "Anniversary / Marriage Date *" : "Date of Birth *"}
                </label>
                <input id="bookingflowpage-field-4" 
                  type="date" 
                  max={localDate()} value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm"
                />
              </div>

              {/* Vedic Astrological Details - Manual Selection */}
              <div className="p-4 rounded-xl bg-[#FAF5ED] border border-[#B37418]/30 space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#8C5D0D] block">Vedic Lineage & Astrological Details (Sankalpa)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-6">Janma Nakshatra</label>
                    <select id="bookingflowpage-field-6"
                      value={nakshatra}
                      onChange={(e) => setNakshatra(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C2A4] bg-white text-xs text-[#1F1914]"
                    >
                      <option value="">Select Janma Nakshatra (or Unsure)</option>
                      {NAKSHATRAS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name} ({n.sanskrit})
                        </option>
                      ))}
                      <option value="Will confirm with Acharya">Unsure - Acharya will verify during Sankalpa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-7">Pada (Quarter)</label>
                    <select id="bookingflowpage-field-7"
                      value={pada}
                      onChange={(e) => setPada(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C2A4] bg-white text-xs text-[#1F1914]"
                    >
                      <option value="0">Unsure / confirm with Acharya</option><option value="1">Pada 1 (First Quarter)</option>
                      <option value="2">Pada 2 (Second Quarter)</option>
                      <option value="3">Pada 3 (Third Quarter)</option>
                      <option value="4">Pada 4 (Fourth Quarter)</option>
                      <option value="0">Not sure</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-8">Gotra</label>
                    <select id="bookingflowpage-field-8"
                      value={gotra}
                      onChange={(e) => setGotra(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C2A4] bg-white text-xs text-[#1F1914]"
                    >
                      {VEDIC_GOTRAS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {gotra === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter your Gotra"
                        value={customGotra}
                        onChange={(e) => setCustomGotra(e.target.value)}
                        className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-[#D5C2A4] bg-white text-xs"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-9">Rashi (Moon Sign)</label>
                    <select id="bookingflowpage-field-9"
                      value={rashi}
                      onChange={(e) => setRashi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C2A4] bg-white text-xs text-[#1F1914]"
                    >
                      <option value="">Select Rashi (Optional)</option>
                      {RASHIS.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name} ({r.sanskrit})
                        </option>
                      ))}
                      <option value="Not Sure">Not Sure</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-sacred transition-all cursor-pointer"
                >
                  Next: Date and Time Window
                </button>
              </div>
            </form>
          )}

          {/* SCREEN 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn text-left">
              <div className="border-b border-[#E5D7C3] pb-3">
                <span className="text-[10px] uppercase font-semibold text-[#8C5D0D]">Step 2 of 5</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914]">Celebration Date and Time Window</h2>
                <p className="text-xs text-[#5C5147] mt-0.5">Select the exact date and auspicious time window for the Acharya home visit.</p>
              </div>

              {/* Celebrant summary capsule */}
              <div className="p-3 bg-[#FAF5ED] rounded-xl border border-[#B37418]/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8C5D0D] font-bold block">{name}</span>
                  <span className="text-[#5C5147] text-[11px]">
                    Gotra: {gotra === 'Other' ? (customGotra || 'To be confirmed') : gotra} • Nakshatra: {nakshatra || 'Will verify with Acharya'} {pada && pada !== '0' ? `(Pada ${pada})` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-[#B37418] underline font-semibold"
                >
                  Edit Details
                </button>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-10">Celebration Date *</label>
                <input id="bookingflowpage-field-10" 
                  type="date" 
                  required 
                  aria-label="Specific celebration date" 
                  min={earliestCeremonyDate()} value={celebrationDate} 
                  
                  onChange={(e) => setCelebrationDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm"
                />
              </div>

              {/* Quick shortcut button */}
              {dob && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const thisYear = today.getFullYear();
                      setCelebrationDate(`${thisYear}-${dob.slice(5)}`);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#D5C2A4] bg-[#FAF8F5] hover:bg-[#FAF5ED] text-[11px] font-medium text-[#6E5D4E]"
                  >
                    Use Birthday ({dob.slice(5)})
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase font-semibold text-[#1F1914]">
                    Preferred Time Window (1.5-Hour Ceremonial Slots) *
                  </label>
                  <span className="text-[11px] text-[#8C5D0D] font-medium">From 6:00 AM</span>
                </div>
                <select 
                  value={timeSlot} 
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B37418]"
                >
                  <optgroup label="Morning Vedic Muhurtas (6:00 AM - 12:00 PM)">
                    {VEDIC_TIME_WINDOWS.filter(w => w.period === 'morning').map(w => (
                      <option key={w.id} value={w.timeSlot}>{w.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Afternoon Windows (12:00 PM - 4:30 PM)">
                    {VEDIC_TIME_WINDOWS.filter(w => w.period === 'afternoon').map(w => (
                      <option key={w.id} value={w.timeSlot}>{w.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Evening & Sandhya Windows (4:30 PM - 9:00 PM)">
                    {VEDIC_TIME_WINDOWS.filter(w => w.period === 'evening').map(w => (
                      <option key={w.id} value={w.timeSlot}>{w.label}</option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-[#6E5D4E] mt-1.5">
                  Consecrated home ceremonies run in continuous 1.5-hour sacred windows. The initiated Acharya arrives 30 minutes prior for deepa prajwalana and altar preparation.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 border border-[#D5C2A4] rounded-xl text-xs uppercase font-semibold text-[#6E5D4E] hover:bg-[#FAF5ED] transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!celebrationDate}
                  onClick={() => { if(!celebrationDate || celebrationDate<earliestCeremonyDate()){setOtpError('Please choose a ceremony date at least two days from today.');return;}setOtpError('');setStep(3); }}
                  className="w-2/3 py-3 bg-[#B37418] hover:bg-[#8C5D0D] disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-sacred transition-all cursor-pointer"
                >
                  Next: Contact Details
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: VERIFICATION & ADDRESS */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn text-left">
              <div className="border-b border-[#E5D7C3] pb-3">
                <span className="text-[10px] uppercase font-semibold text-[#8C5D0D]">Step 3 of 5</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914]">Customer Verification and Address</h2>
                <div className="flex items-center gap-1.5 text-xs text-[#8C5D0D] font-medium mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Serving all localities across Bengaluru</span>
                </div>
              </div>

              {/* Identity & Phone Verification Section */}
              <div className={`p-4 rounded-xl border ${isPhoneVerified ? 'bg-emerald-50/80 border-emerald-300' : 'bg-[#FAF5ED] border-[#B37418]/40'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPhoneVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#8C5D0D]" />
                    )}
                    <strong className="text-xs text-[#1F1914]">
                      {isPhoneVerified ? 'Preview Code Verified' : 'Preview Phone Verification'}
                    </strong>
                  </div>
                  {isPhoneVerified && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                      Verified
                    </span>
                  )}
                </div>

                {!isPhoneVerified ? (
                  <div className="space-y-2.5 pt-1">
                    <p className="text-[11.5px] text-[#5C5147]">
                      Try the verification flow with your mobile number. This local preview displays the code here; it sends no message.
                    </p>

                    <div className="flex gap-2">
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => { setPhone(e.target.value); setIsPhoneVerified(false); setOtpSent(false); setOtpCode(''); setDemoCode(''); }} 
                        required
                        placeholder="10-digit mobile number"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#D5C2A4] bg-white text-xs sm:text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendCooldown > 0}
                        className="px-4 py-2 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {otpSent ? (resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code') : 'Send Code'}
                      </button>
                    </div>

                    {otpSent && (
                      <div className="p-3 bg-white rounded-lg border border-[#D5C2A4] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-semibold text-[#1F1914]">Enter Verification Code</label>
                          <span className="text-[10.5px] text-[#8C5D0D]">Preview code: {demoCode}</span>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            maxLength={6}
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)} 
                            placeholder="6-digit preview code"
                            className="w-28 px-3 py-1.5 rounded border border-[#D5C2A4] text-center font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded"
                          >
                            Verify Mobile
                          </button>
                        </div>
                      </div>
                    )}

                    {otpError && (
                      <p className="text-[11px] text-red-600 font-medium">{otpError}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800">
                    Verified Mobile: <strong>+91 {phone}</strong>. Preview only; this does not verify ownership of the phone.
                  </p>
                )}
              </div>

              {/* Address Fields */}
              <div>
                <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-11">House, Flat No, and Street Address</label>
                <input id="bookingflowpage-field-11" 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required
                  placeholder="e.g. 402, Shanti Nilaya, 5th Main, Jayanagar 4th Block"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-12">Landmark</label>
                  <input id="bookingflowpage-field-12" 
                    type="text" 
                    value={landmark} 
                    onChange={(e) => setLandmark(e.target.value)} 
                    placeholder="Nearby temple / park"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-13">PIN Code (Bengaluru)</label>
                  <input id="bookingflowpage-field-13" 
                    type="text" 
                    value={pincode} 
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value)} 
                    required
                    placeholder="560041"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-14">
                  Google Maps Location Link (Compulsory) *
                </label>
                <input id="bookingflowpage-field-14" 
                  type="url" 
                  required
                  value={mapsLink} 
                  onChange={(e) => {
                    setMapsLink(e.target.value);
                    if (otpError) setOtpError('');
                  }} 
                  placeholder="https://maps.app.goo.gl/... (Required for Acharya navigation)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B37418] ${
                    otpError && (otpError.includes('Google Maps') || otpError.includes('Maps'))
                      ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400'
                      : 'border-[#D5C2A4]'
                  }`}
                />
                <p className="text-[11px] text-[#8C5D0D] font-medium mt-1">
                  Compulsory: Shared directly with the assigned Acharya and the WhatsApp alert to ensure on-time arrival.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#1F1914] mb-1" htmlFor="bookingflowpage-field-15">Email Address for Booking Receipt</label>
                <input id="bookingflowpage-field-15" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2A4] bg-[#FAF8F5] text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-[#D5C2A4] rounded-xl text-xs uppercase font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!isPhoneVerified}
                  onClick={() => {
                    const err = addressError(address, pincode, email, mapsLink);
                    if (err) {
                      setOtpError(err);
                      return;
                    }
                    setStep(4);
                  }}
                  className={`flex-1 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-xl shadow-sacred transition-all ${
                    isPhoneVerified
                      ? 'bg-[#B37418] hover:bg-[#8C5D0D] text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isPhoneVerified ? 'Next: Package Selection' : 'Verify Mobile to Proceed'}
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: PACKAGE SELECTION & ADDONS */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn text-left">
              <div className="border-b border-[#E5D7C3] pb-3">
                <span className="text-[10px] uppercase font-semibold text-[#8C5D0D]">Step 4 of 5</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914]">Choose Your Celebration Package</h2>
              </div>

              <div className="space-y-2.5">
                {PACKAGES.map((pkg) => (
                  <label 
                    key={pkg.id} 
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedPackageId === pkg.id 
                        ? 'border-2 border-[#B37418] bg-[#FAF5ED]' 
                        : 'border-[#D5C2A4] bg-white hover:border-[#B37418]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="planPackage" 
                        checked={selectedPackageId === pkg.id} 
                        onChange={() => {
                          setSelectedPackageId(pkg.id); setSelectedAddons([]);
                          if (pkg.id !== 'sampoorna') setUpgradeToHomeHoma(false);
                        }}
                        className="accent-[#B37418]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-base font-bold text-[#1F1914]">{pkg.name}</p>
                          {pkg.tag && (
                            <span className="text-[9px] bg-[#B37418] text-white px-2 py-0.5 rounded-full font-bold uppercase">
                              {pkg.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[#5C5147] mt-0.5">{pkg.tagline}</p>
                      </div>
                    </div>
                    <span className="font-serif text-base font-bold text-[#8C5D0D]">{pkg.priceFormatted}</span>
                  </label>
                ))}
              </div>

              {/* Sampoorna Upgrade Option */}
              {selectedPackageId === 'sampoorna' && (
                <div className="p-3 bg-[#F4EADA] rounded-xl border border-[#B37418]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={upgradeToHomeHoma}
                        onChange={(e) => setUpgradeToHomeHoma(e.target.checked)}
                        className="accent-[#B37418] w-4 h-4"
                      />
                      <div>
                        <strong className="text-xs text-[#1F1914] block">Upgrade to At-Home Ayushya Homa</strong>
                        <span className="text-[10.5px] text-[#6E4F18]">
                          Conduct the Ayushya Homa at your residence instead of virtually at Kshetra.
                        </span>
                      </div>
                    </label>
                    <span className="text-xs font-semibold text-[#8C5D0D]">At-Home Option</span>
                  </div>
                </div>
              )}

              {/* Parampara Gift Box Included Note & Customize Button */}
              {selectedPackageId === 'parampara' && (
                <div className="p-3 bg-[#FAF5ED] rounded-xl border border-[#8C5D0D]/40 flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#1F1914] block">Curated Havikar Gift Box Included</strong>
                    <span className="text-[10.5px] text-[#7A6E62]">
                      Sandalwood bracelet, Japa mala, Rose kumkuma, and Arishina included.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGiftModal(true)}
                    className="px-3 py-1.5 border border-[#8C5D0D] text-[#8C5D0D] hover:bg-[#8C5D0D] hover:text-white rounded-lg text-xs font-semibold"
                  >
                    Customize Items
                  </button>
                </div>
              )}

              {/* Add-ons */}
              <div className="pt-3 border-t border-[#E5D7C3] space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#8C5D0D]">Optional Ritual Additions</h4>
                <div className="space-y-1.5">
                  {availableAddons
                    .filter(a => !a.applicableFor || a.applicableFor.includes(selectedPackageId))
                    .map((addon) => {
                      const isChecked = selectedAddons.includes(addon.name);
                      return (
                        <label 
                          key={addon.id} 
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer ${
                            isChecked ? 'border-[#B37418] bg-[#FAF5ED]' : 'border-[#E3D6C3]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleAddon(addon.name)}
                              className="accent-[#B37418]"
                            />
                            <span>{addon.name}</span>
                          </div>
                          <span className="font-semibold text-xs text-[#8C5D0D]">Sacred Addition</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 border border-[#D5C2A4] rounded-xl text-xs uppercase font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex-1 py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-sacred"
                >
                  Next: Review and Confirm
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: REVIEW & SUMMARY */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn text-left">
              <div className="border-b border-[#E5D7C3] pb-3">
                <span className="text-[10px] uppercase font-semibold text-[#8C5D0D]">Step 5 of 5</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914]">Vardhantotsava Reservation Summary</h2>
              </div>

              <div className="bg-[#FAF5ED] p-4 sm:p-5 rounded-2xl border border-[#D5C2A4] space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Occasion & Relation:</span>
                  <strong className="text-[#1F1914] text-right">
                    {occasion} ({relationship})
                  </strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Celebrating:</span>
                  <strong className="text-[#1F1914] text-right">
                    {name} (Gotra: {gotra === 'Other' ? (customGotra || 'Kashyapa') : gotra}, {nakshatra || 'Nakshatra to be confirmed with Acharya'}{pada && pada !== '0' ? `, Pada ${pada}` : ''})
                  </strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Celebration Date:</span>
                  <strong className="text-[#1F1914]">{celebrationDate}</strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Auspicious Window:</span>
                  <strong className="text-[#1F1914]">{timeSlot}</strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Home Address:</span>
                  <strong className="text-[#1F1914]">{address}, PIN {pincode}</strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Google Maps Pin:</span>
                  <a 
                    href={mapsLink.trim().startsWith('http') ? mapsLink.trim() : `https://${mapsLink.trim()}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#B37418] hover:underline font-semibold text-right truncate max-w-[200px] sm:max-w-xs block"
                  >
                    {mapsLink}
                  </a>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Verified Contact:</span>
                  <strong className="text-emerald-700">+91 {phone} (Verified)</strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Selected Package:</span>
                  <strong className="text-[#1F1914]">
                    {selectedPkg.name}
                    {selectedPackageId === 'sampoorna' && upgradeToHomeHoma && ' + At-Home Homa Upgrade'}
                  </strong>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E5D7C3]">
                  <span className="text-[#7A6E62]">Ayushya Homa Type:</span>
                  <strong className="text-[#1F1914]">
                    {selectedPackageId === 'parampara' || upgradeToHomeHoma 
                      ? 'At-Home Ayushya Homa' 
                      : selectedPackageId === 'sampoorna' 
                        ? 'Virtual Ayushya Homa (Live Broadcast)' 
                        : 'Available as Add-on'}
                  </strong>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="pt-1 pb-2 border-b border-[#E5D7C3]">
                    <span className="text-[#7A6E62] block mb-1">Additions:</span>
                    <ul className="list-disc list-inside text-xs text-[#1F1914] space-y-0.5">
                      {selectedAddons.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-sm">
                  <span className="font-serif font-bold text-[#1F1914]">Reservation Status:</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Payment via Razorpay</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D5C2A4] text-xs text-[#5C5147] flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#B37418] flex-shrink-0" />
                  <span>256-bit SSL Encrypted & PCI-DSS Compliant</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#0C2340] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#D5C2A4]">
                  RAZORPAY
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-3 border border-[#D5C2A4] rounded-xl text-xs uppercase font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={handleCompleteBooking}
                  className="flex-1 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-xs uppercase tracking-wider font-semibold py-3 rounded-xl shadow-sacred flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isPaying ? (
                    <span>Launching Razorpay Checkout...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Pay via Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Gift Box Customization Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-[#D5C2A4] shadow-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5D7C3] pb-2">
              <h3 className="font-serif text-base font-bold text-[#1F1914]">Customize Parampara Gift Box</h3>
              <button onClick={() => setShowGiftModal(false)} className="text-xs font-bold text-[#7A6E62]">X</button>
            </div>
            <p className="text-xs text-[#5C5147]">Select items included in your keepsake box:</p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {HAVIKAR_PRODUCTS.map((prod) => (
                <label key={prod.id} className="p-2 rounded-lg border border-[#E3D6C3] flex items-center justify-between text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={customGiftItems.includes(prod.id)} 
                      onChange={() => {
                        if (customGiftItems.includes(prod.id)) {
                          setCustomGiftItems(customGiftItems.filter(id => id !== prod.id));
                        } else {
                          setCustomGiftItems([...customGiftItems, prod.id]);
                        }
                      }}
                      className="accent-[#B37418]"
                    />
                    <span>{prod.name}</span>
                  </div>
                  <span className="font-semibold text-xs text-[#8C5D0D]">Sacred Item</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowGiftModal(false)}
              className="w-full py-2 bg-[#B37418] text-white rounded-lg text-xs font-semibold"
            >
              Save Gift Box Selection
            </button>
          </div>
        </div>
      )}

      {/* Razorpay Secure Checkout Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#D5C2A4] shadow-2xl overflow-hidden text-left space-y-0">
            
            {/* Razorpay Brand Bar */}
            <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#3395FF]">
                    Razorpay
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">
                    Trusted Business
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold mt-1 text-white">
                  Mantrakshata Vardhantotsava
                </h4>
                <p className="text-[11px] text-white/70">
                  {selectedPkg.name} · {name}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-white/60 uppercase block">Confirmation</span>
                <span className="font-serif text-sm font-bold text-white">
                  Vedic Reservation
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex rounded-xl bg-[#FAF6EE] p-1 border border-[#D5C2A4]">
                <button
                  type="button"
                  onClick={() => setRazorpayMethod('upi')}
                  className={`flex-1 py-2 text-center rounded-lg font-semibold transition-all ${
                    razorpayMethod === 'upi' ? 'bg-[#0C2340] text-white shadow-xs' : 'text-charcoal/70'
                  }`}
                >
                  UPI (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayMethod('card')}
                  className={`flex-1 py-2 text-center rounded-lg font-semibold transition-all ${
                    razorpayMethod === 'card' ? 'bg-[#0C2340] text-white shadow-xs' : 'text-charcoal/70'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayMethod('netbanking')}
                  className={`flex-1 py-2 text-center rounded-lg font-semibold transition-all ${
                    razorpayMethod === 'netbanking' ? 'bg-[#0C2340] text-white shadow-xs' : 'text-charcoal/70'
                  }`}
                >
                  NetBanking
                </button>
              </div>

              {razorpayMethod === 'upi' && (
                <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E3D6C3]">
                  <label className="block text-[11px] font-semibold text-charcoal" htmlFor="bookingflowpage-field-16">
                    Enter UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                  </label>
                  <input id="bookingflowpage-field-16"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi"
                    className="w-full p-2.5 rounded-xl border border-[#D5C2A4] bg-white text-xs font-mono"
                  />
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-white px-2 py-1 rounded border border-[#D5C2A4] text-charcoal/70">Google Pay</span>
                    <span className="text-[10px] bg-white px-2 py-1 rounded border border-[#D5C2A4] text-charcoal/70">PhonePe</span>
                    <span className="text-[10px] bg-white px-2 py-1 rounded border border-[#D5C2A4] text-charcoal/70">Paytm</span>
                  </div>
                </div>
              )}

              {razorpayMethod === 'card' && (
                <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E3D6C3]">
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1" htmlFor="bookingflowpage-field-17">Card Number</label>
                    <input id="bookingflowpage-field-17"
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      defaultValue="4111 2222 3333 4444"
                      className="w-full p-2.5 rounded-xl border border-[#D5C2A4] bg-white text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-charcoal mb-1" htmlFor="bookingflowpage-field-18">Expiry</label>
                      <input id="bookingflowpage-field-18"
                        type="text"
                        placeholder="12/28"
                        defaultValue="12/28"
                        className="w-full p-2.5 rounded-xl border border-[#D5C2A4] bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-charcoal mb-1" htmlFor="bookingflowpage-field-19">CVV</label>
                      <input id="bookingflowpage-field-19"
                        type="password"
                        placeholder="•••"
                        defaultValue="123"
                        maxLength={3}
                        className="w-full p-2.5 rounded-xl border border-[#D5C2A4] bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {razorpayMethod === 'netbanking' && (
                <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E3D6C3]">
                  <label className="block text-[11px] font-semibold text-charcoal">Select Popular Banks</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="p-2 bg-white rounded-lg border border-[#D5C2A4] text-left text-xs font-medium">HDFC Bank</button>
                    <button type="button" className="p-2 bg-white rounded-lg border border-[#D5C2A4] text-left text-xs font-medium">State Bank of India</button>
                    <button type="button" className="p-2 bg-white rounded-lg border border-[#D5C2A4] text-left text-xs font-medium">ICICI Bank</button>
                    <button type="button" className="p-2 bg-white rounded-lg border border-[#D5C2A4] text-left text-xs font-medium">Axis Bank</button>
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isProcessingRazorpay}
                  onClick={() => {
                    setIsProcessingRazorpay(true);
                    setTimeout(() => {
                      processSuccessfulPayment(`pay_${Date.now()}`);
                    }, 1200);
                  }}
                  className="w-full bg-[#0C2340] hover:bg-[#07182c] text-white text-xs font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isProcessingRazorpay 
                      ? 'Securing Reservation...' 
                      : 'Confirm Sacred Reservation'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="w-full text-center text-xs text-charcoal/60 hover:text-charcoal py-1"
                >
                  Cancel and review booking
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-charcoal/50 pt-2 border-t border-gold/15">
                <Shield className="w-3 h-3 text-[#3395FF]" />
                <span>256-bit SSL Encrypted & PCI-DSS Compliant via Razorpay</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
