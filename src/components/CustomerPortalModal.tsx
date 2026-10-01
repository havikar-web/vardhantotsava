import { requestDemoOtp, verifyDemoOtp, normalizeIndianPhone, clearDemoVerification } from '../lib/flowValidation';
import { ManualVedicFields, emptyVedic } from './ManualVedicFields';
import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Home as HomeIcon, 
  Calendar, 
  Users, 
  Bell, 
  Settings, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Flame, 
  Gift, 
  Share2, 
  ArrowRight, 
  Plus, 
  Check, 
  Phone, 
  MessageSquare, 
  ChevronRight, 
  CalendarCheck2, 
  ExternalLink,
  ShieldCheck,
  Download,
  AlertCircle,
  Compass,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { 
  UserProfile, 
  FamilyMember, 
  BookingPlan, 
  NotificationMessage,
  getUserProfile, 
  saveUserProfile, 
  clearUserProfile,
  findUserProfileByPhone,
  getFamilyMembers, 
  saveFamilyMember, 
  deleteFamilyMember,
  getSavedBooking,
  getAllBookings,
  getNotifications
} from '../lib/store';
import { ACHARYA_SCHOLARS } from '../lib/content';
import { calculateVedicDetails } from '../lib/panchanga';
import { BrandLogo } from './BrandLogo';
import { sendOtpMessage, sendWelcomeCatalogMessage } from '../lib/whatsapp';
import { fetchUserProfileFromNeon, saveUserProfileToNeon } from '../lib/db';

interface CustomerPortalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  initialTab?: 'home' | 'celebrations' | 'family' | 'messages' | 'profile';
}

export const CustomerPortalModal: React.FC<CustomerPortalProps> = ({ 
  isOpen, 
  onClose, 
  navigate,
  initialTab = 'home'
}) => {
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile());
  const [activeTab, setActiveTab] = useState<'home' | 'celebrations' | 'family' | 'messages' | 'profile'>(initialTab);
  const [booking, setBooking] = useState<BookingPlan | null>(() => getSavedBooking());
  const [allUserBookings, setAllUserBookings] = useState<BookingPlan[]>(() => getAllBookings());
  const [family, setFamily] = useState<FamilyMember[]>(() => getFamilyMembers());
  
  // Auth flow states
  const [authStep, setAuthStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regLanguage, setRegLanguage] = useState<'English' | 'ಕನ್ನಡ' | 'हिन्दी'>('English');

  // Celebrations sub-tab
  const [celebrationSubTab, setCelebrationSubTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedCelebration, setSelectedCelebration] = useState<BookingPlan | null>(null);

  // Add Family Member Modal
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyDob, setNewFamilyDob] = useState('');
  const [manualMode,setManualMode]=useState(false);
  const [manual,setManual]=useState(emptyVedic);

  // Add Address Modal
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrMapsLink, setNewAddrMapsLink] = useState('');

  // Refresh data on open
  useEffect(() => {
    if (isOpen) {
      setUser(getUserProfile());
      setBooking(getSavedBooking());
      setAllUserBookings(getAllBookings());
      setFamily(getFamilyMembers());
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [demoCode, setDemoCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [authStep, resendTimer]);

  if (!isOpen) return null;

  // --- AUTH HANDLERS ---
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = requestDemoOtp(phoneNumber);
    setAuthError(result.error || '');
    if (result.code) {
      setDemoCode(result.code);
      setOtpCode('');
      setAuthStep('otp');
      setResendTimer(30);
      // Dispatch real WhatsApp OTP via Meta Cloud API template hav_otp1
      sendOtpMessage(phoneNumber, result.code);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const result = requestDemoOtp(phoneNumber);
    setAuthError('');
    if (result.code) {
      setDemoCode(result.code);
      setOtpCode('');
      setResendTimer(30);
      sendOtpMessage(phoneNumber, result.code);
    }
  };
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = verifyDemoOtp(phoneNumber, otpCode);
    setAuthError(result.error || '');
    if (!result.ok) return;

    // 1. Check if user already exists in local registry
    const existing = findUserProfileByPhone(phoneNumber);
    if (existing && existing.name && existing.name.trim()) {
      saveUserProfile(existing);
      setUser(existing);
      setAuthStep('phone');
      setOtpCode('');
      setAuthError('');
      return;
    }

    // 2. Query Neon PostgreSQL database backend for existing registered profile
    try {
      const neonUser = await fetchUserProfileFromNeon(phoneNumber);
      if (neonUser && neonUser.name && neonUser.name.trim()) {
        saveUserProfile(neonUser);
        setUser(neonUser);
        setAuthStep('phone');
        setOtpCode('');
        setAuthError('');
        return;
      }
    } catch (err) {
      console.warn('Backend user profile check error:', err);
    }

    // Only for brand new first-time users who have never created a profile: ask for details
    setAuthStep('register');
  };

  const handleCompleteRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: regName.trim(),
      phone: '+' + normalizeIndianPhone(phoneNumber),
      isVerified: true,
      demoVerified: true,
      email: regEmail.trim() || undefined,
      language: regLanguage,
      addresses: [],
      notifications: {
        whatsapp: true,
        email: true,
        reminders: true,
        marketing: false
      }
    };
    saveUserProfile(newUser);
    setUser(newUser);
    // Persist profile to Neon PostgreSQL backend
    saveUserProfileToNeon(newUser).catch(err => console.warn('Failed to save user to Neon:', err));
    // Send welcome catalog message via Meta Cloud API
    sendWelcomeCatalogMessage(newUser.phone, newUser.name);
  };

  const handleLogout = () => {
    clearUserProfile();
    clearDemoVerification();
    setUser(null);
    setAuthStep('phone');
    setPhoneNumber('');
    setOtpCode('');
  };

  // --- FAMILY HANDLERS ---
  const handleSaveFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim() || !newFamilyDob) return;
    
    // Auto-calculate Vedic details if details provided
    const vedic = calculateVedicDetails(
      newFamilyName,
      newFamilyDob,
      '10:00',
      'Bengaluru'
    );

    const member: FamilyMember = {
      id: 'fam_' + Date.now(),
      name: newFamilyName.trim(),
      relationship: newFamilyRelation,
      dob: newFamilyDob,
      nakshatra: manualMode ? manual.nakshatra.trim() : vedic.nakshatra,
      gotra: manualMode ? manual.gotra.trim() : undefined,
      pada: manualMode && manual.pada ? Number(manual.pada) : undefined,
      rashi: manualMode ? manual.rashi.trim() : vedic.rashi.split(' ')[0]
    };

    saveFamilyMember(member);
    setFamily(getFamilyMembers());
    setShowAddFamily(false);
    setNewFamilyName('');
    setNewFamilyDob('');
    setManualMode(false);
    setManual(emptyVedic);
  };

  // --- ADDRESS HANDLERS ---
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAddrText.trim() || !newAddrMapsLink.trim()) return;
    const formattedMaps = newAddrMapsLink.trim().startsWith('http') 
      ? newAddrMapsLink.trim() 
      : `https://${newAddrMapsLink.trim()}`;
    const updated = {
      ...user,
      addresses: [
        ...user.addresses,
        {
          id: 'addr_' + Date.now(),
          label: newAddrLabel,
          address: newAddrText.trim(),
          pincode: newAddrPincode.trim(),
          city: 'Bengaluru',
          mapsLink: formattedMaps
        }
      ]
    };
    saveUserProfile(updated);
    setUser(updated);
    setShowAddAddress(false);
    setNewAddrText('');
    setNewAddrPincode('');
    setNewAddrMapsLink('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      
      {/* Main Container */}
      <div className="bg-[#FAF5ED] w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-md border border-[#D5C2A4] shadow-2xl flex flex-col overflow-hidden text-[#1F1914] relative">
        
        {/* Top Sacred Bar */}
        <div className="px-6 py-4 border-b border-[#E3D6C3] bg-[#FAF5ED]/95 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-9 w-auto" variant="light" />
            <div className="h-4 w-[1px] bg-[#D5C2A4]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#9E6B2D]">
              {user ? 'MY SACRED PROFILE' : 'LOGIN & PROFILE'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button 
                onClick={() => setActiveTab('messages')}
                className="relative p-2 rounded-full hover:bg-[#EFE5D5] text-[#5C5147] transition-colors"
                title="Notifications & Updates"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B37418]" />
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#EFE5D5] text-[#5C5147] transition-colors"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- IF USER NOT LOGGED IN: SHOW AUTH FLOW --- */}
        {!user ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-[#FDFBF7] p-8 rounded-md border border-[#D5C2A4] text-center space-y-6">
              
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF5ED] border border-[#B37418] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#B37418]" />
              </div>

              {authStep === 'phone' && (() => {
                const recognizedUser = phoneNumber.trim().length >= 10 ? findUserProfileByPhone(phoneNumber) : null;
                return (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    {authError && <p role="alert" className="text-xs text-red-700 font-medium">{authError}</p>}
                    <div className="space-y-1">
                      <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1914]">
                        {recognizedUser ? `Welcome Back, ${recognizedUser.name.split(' ')[0]}` : 'Welcome to Mantrakshata'}
                      </h2>
                      <p className="text-xs text-[#5C5147]">
                        {recognizedUser 
                          ? 'We recognized your mobile number. Tap below to receive your WhatsApp OTP for instant sign-in.' 
                          : 'Sign in without passwords. Enter your mobile number for ceremony updates and WhatsApp coordination.'}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-left pt-2">
                      <label className="block text-[11px] font-medium text-[#5C5147]">
                        Mobile Number
                      </label>
                      <div className="flex rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] overflow-hidden focus-within:border-[#B37418]">
                        <span className="px-3.5 py-3 text-xs font-semibold text-[#5C5147] border-r border-[#E3D6C3] bg-[#F4EADA]/50">
                          +91
                        </span>
                        <input 
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter mobile number"
                          required
                          className="w-full px-3 py-3 text-xs bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#B37418] hover:bg-[#9B6210] text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Receive WhatsApp OTP</span>
                      <span>→</span>
                    </button>
                  </form>
                );
              })()}

              {authStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {authError && <p role="alert" className="text-xs text-red-700 font-medium">{authError}</p>}
                  <div className="space-y-1">
                    <h2 className="font-serif text-2xl font-normal text-[#1F1914]">
                      Enter WhatsApp OTP
                    </h2>
                    <p className="text-xs text-[#5C5147]">
                      Enter the verification code sent to your WhatsApp number <strong>+91 {phoneNumber}</strong>
                    </p>
                  </div>

                  <div className="py-2">
                    <input 
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code"
                      required
                      autoFocus
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#B37418] hover:bg-[#9B6210] text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Verify & Continue</span>
                    <span>→</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthStep('phone')}
                      className="text-xs text-[#8C7E72] hover:text-[#B37418] underline"
                    >
                      Change phone number
                    </button>

                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleResendOtp}
                      className="text-xs font-semibold text-[#B37418] hover:text-[#8C5D0D] disabled:opacity-50 disabled:text-[#8C7E72] disabled:cursor-not-allowed cursor-pointer"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              {authStep === 'register' && (
                <form onSubmit={handleCompleteRegister} className="space-y-4 text-left">
                  <div className="space-y-1 text-center">
                    <h2 className="font-serif text-2xl font-normal text-[#1F1914]">
                      Complete your profile
                    </h2>
                    <p className="text-xs text-[#5C5147]">
                      First time visiting Mantrakshata? Let us know how to address you.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-[#5C5147]" htmlFor="customerportalmodal-field-1">
                      Your Name *
                    </label>
                    <input id="customerportalmodal-field-1" 
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Hegde"
                      required
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-[#5C5147]" htmlFor="customerportalmodal-field-2">
                      Email (Optional)
                    </label>
                    <input id="customerportalmodal-field-2" 
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-[#5C5147]">
                      Preferred Language
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['English', 'ಕನ್ನಡ', 'हिन्दी'] as const).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setRegLanguage(lang)}
                          className={`py-2 rounded-xl text-xs border font-medium transition-colors ${
                            regLanguage === lang
                              ? 'border-[#B37418] bg-[#B37418]/10 text-[#B37418]'
                              : 'border-[#E3D6C3] bg-[#FAF8F5] text-[#5C5147]'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#B37418] hover:bg-[#9B6210] text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                  >
                    <span>Enter Portal</span>
                    <span>→</span>
                  </button>
                </form>
              )}

            </div>
          </div>
        ) : (
          /* --- LOGGED IN PORTAL INTERFACE --- */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Desktop Sidebar / Tab Navigation */}
            <div className="hidden md:flex flex-col w-56 bg-[#F4EADA]/40 border-r border-[#E3D6C3] p-4 space-y-1 flex-shrink-0">
              
              {/* User badge */}
              <div className="p-3 mb-3 bg-white rounded-2xl border border-[#E3D6C3] shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B37418] text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#1F1914] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#7A6E62] truncate">{user.phone}</p>
                </div>
              </div>

              {/* Navigation links */}
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  activeTab === 'home'
                    ? 'bg-[#B37418] text-white shadow-xs font-semibold'
                    : 'text-[#5C5147] hover:bg-[#EFE5D5]'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveTab('celebrations')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  activeTab === 'celebrations'
                    ? 'bg-[#B37418] text-white shadow-xs font-semibold'
                    : 'text-[#5C5147] hover:bg-[#EFE5D5]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Celebrations</span>
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  activeTab === 'family'
                    ? 'bg-[#B37418] text-white shadow-xs font-semibold'
                    : 'text-[#5C5147] hover:bg-[#EFE5D5]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Family</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  activeTab === 'messages'
                    ? 'bg-[#B37418] text-white shadow-xs font-semibold'
                    : 'text-[#5C5147] hover:bg-[#EFE5D5]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  activeTab === 'profile'
                    ? 'bg-[#B37418] text-white shadow-xs font-semibold'
                    : 'text-[#5C5147] hover:bg-[#EFE5D5]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <div className="pt-8 mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              
              {/* ======================================================== */}
              {/* TAB 1: HOME */}
              {/* ======================================================== */}
              {activeTab === 'home' && (
                <div className="space-y-6 max-w-2xl mx-auto text-left">
                  
                  {/* Greeting */}
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#9E6B2D]">
                      MANTRAKSHATA PORTAL
                    </span>
                    <h1 className="font-serif text-3xl font-normal text-[#1F1914]">
                      Namaskara, {user.name}
                    </h1>
                  </div>

                  {/* If user has an upcoming booking */}
                  {booking ? (
                    <div className="space-y-6">
                      
                      {/* Celebration Card */}
                      <div className="bg-white rounded-md p-6 border border-[#B37418] shadow-md space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E3D6C3] pb-3">
                          <span className="text-[11px] uppercase tracking-wider text-[#9E6B2D] font-bold">
                            Your Next Vardhantotsava
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Confirmed
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-[#8C7E72] uppercase tracking-widest">
                            {booking.celebrationDate}
                          </p>
                          <h2 className="font-serif text-2xl font-normal text-[#1F1914]">
                            {booking.name}'s Vardhantotsava
                          </h2>
                          <p className="text-xs text-[#5C5147]">
                            Package: <strong>{booking.packageName}</strong> · Location: <strong>Bengaluru</strong>
                          </p>
                        </div>

                        {/* Timings row */}
                        <div className="grid grid-cols-3 gap-2 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E3D6C3] text-center">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-[#7A6E62] block">Acharya arrival</span>
                            <strong className="text-xs text-[#1F1914]">8:00 AM</strong>
                          </div>
                          <div className="space-y-0.5 border-x border-[#E3D6C3]">
                            <span className="text-[10px] text-[#7A6E62] block">Ritual begins</span>
                            <strong className="text-xs text-[#1F1914]">8:30 AM</strong>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-[#7A6E62] block">Ayushya Homa</span>
                            <strong className="text-xs text-[#1F1914]">10:30 AM</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCelebration(booking);
                            setActiveTab('celebrations');
                          }}
                          className="w-full bg-[#FAF5ED] hover:bg-[#F3EBE0] border border-[#B37418] text-[#B37418] text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>View Celebration Details</span>
                          <span>→</span>
                        </button>
                      </div>

                      {/* Your Journey Timeline */}
                      <div className="bg-white rounded-md p-6 border border-[#E3D6C3] shadow-xs space-y-3">
                        <h3 className="font-serif text-lg font-normal text-[#1F1914]">
                          Your Sacred Journey
                        </h3>

                        <div className="space-y-3 text-xs text-[#3E3027] pt-1">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="font-medium text-[#1F1914]">Booking confirmed</span>
                          </div>
                          <div className="w-[1px] h-3 bg-[#E3D6C3] ml-2" />
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="font-medium text-[#1F1914]">Details verified</span>
                          </div>
                          <div className="w-[1px] h-3 bg-[#E3D6C3] ml-2" />
                          {booking.assignedPanditId ? (
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span className="font-medium text-[#1F1914]">
                                Acharya assigned ({booking.assignedPanditName || ACHARYA_SCHOLARS.find(a => a.id === booking.assignedPanditId)?.name || 'Initiated Vedic Pandit'})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-amber-800">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                              <span className="font-medium text-xs">
                                Acharya assignment in review by Main Acharya
                              </span>
                            </div>
                          )}
                          <div className="w-[1px] h-3 bg-[#E3D6C3] ml-2" />
                          <div className="flex items-center gap-3 text-[#8C7E72]">
                            <span className="w-2 h-2 rounded-full border border-[#D5C2A4] bg-cream" />
                            <span>Vardhantotsava Home Rituals</span>
                          </div>
                          <div className="w-[1px] h-3 bg-[#E3D6C3] ml-2" />
                          <div className="flex items-center gap-3 text-[#8C7E72]">
                            <span className="w-2 h-2 rounded-full border border-[#D5C2A4] bg-cream" />
                            <span>Ayushya Homa Livestream</span>
                          </div>
                          <div className="w-[1px] h-3 bg-[#E3D6C3] ml-2" />
                          <div className="flex items-center gap-3 text-[#8C7E72]">
                            <span className="w-2 h-2 rounded-full border border-[#D5C2A4] bg-cream" />
                            <span>Prasada Delivery</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions (Everything you need) */}
                      <div className="space-y-3">
                        <span className="text-[11px] uppercase tracking-wider text-[#9E6B2D] font-bold">
                          Everything you need
                        </span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setSelectedCelebration(booking);
                              setActiveTab('celebrations');
                            }}
                            className="bg-white p-4 rounded-2xl border border-[#E3D6C3] hover:border-[#B37418] transition-all text-left shadow-2xs group cursor-pointer"
                          >
                            <Compass className="w-5 h-5 text-[#B37418] mb-1" />
                            <strong className="text-xs text-[#1F1914] block group-hover:text-[#B37418]">Sankalpa</strong>
                            <p className="text-[10px] text-[#7A6E62]">Gotra, Nakshatra & details.</p>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCelebration(booking);
                              setActiveTab('celebrations');
                            }}
                            className="bg-white p-4 rounded-2xl border border-[#E3D6C3] hover:border-[#B37418] transition-all text-left shadow-2xs group"
                          >
                            <User className="w-5 h-5 text-[#B37418] mb-1" />
                            <strong className="text-xs text-[#1F1914] block group-hover:text-[#B37418]">Your Acharya</strong>
                            <p className="text-[10px] text-[#7A6E62]">View assigned scholar details.</p>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCelebration(booking);
                              setActiveTab('celebrations');
                            }}
                            className="bg-white p-4 rounded-2xl border border-[#E3D6C3] hover:border-[#B37418] transition-all text-left shadow-2xs group"
                          >
                            <Flame className="w-5 h-5 text-[#B37418] mb-1" />
                            <strong className="text-xs text-[#1F1914] block group-hover:text-[#B37418]">Ayushya Homa</strong>
                            <p className="text-[10px] text-[#7A6E62]">Private livestream link.</p>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCelebration(booking);
                              setActiveTab('celebrations');
                            }}
                            className="bg-white p-4 rounded-2xl border border-[#E3D6C3] hover:border-[#B37418] transition-all text-left shadow-2xs group"
                          >
                            <Gift className="w-5 h-5 text-[#B37418] mb-1" />
                            <strong className="text-xs text-[#1F1914] block group-hover:text-[#B37418]">Prasada</strong>
                            <p className="text-[10px] text-[#7A6E62]">Delivery status & tracking.</p>
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Clean Authentic Empty State - No Fake Data */
                    <div className="bg-[#FDFBF7] rounded-md p-8 border border-[#D5C2A4] text-center space-y-5">
                      <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF5ED] border border-[#B37418]/40 flex items-center justify-center">
                        <CalendarCheck2 className="w-8 h-8 text-[#B37418]" />
                      </div>

                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="font-serif text-2xl font-normal text-[#1F1914]">
                          No upcoming Vardhantotsava scheduled yet
                        </h3>
                        <p className="text-xs text-[#5C5147] leading-relaxed">
                          Celebrate another year of life with blessings, not just candles. An initiated Acharya visits your home, sacred Ayushya Homa is performed, and blessings are shared.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            onClose();
                            navigate('/book');
                          }}
                          className="bg-[#B37418] hover:bg-[#9B6210] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <span>Plan a Vardhantotsava</span>
                          <span>→</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('family')}
                          className="border border-[#D5C2A4] hover:bg-[#FAF8F5] text-[#201B18] text-xs font-semibold px-5 py-3 rounded-full transition-colors"
                        >
                          + Add a family member
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: CELEBRATIONS */}
              {/* ======================================================== */}
              {activeTab === 'celebrations' && (
                <div className="space-y-6 max-w-2xl mx-auto text-left">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#1F1914]">
                        My Celebrations
                      </h2>
                      <p className="text-xs text-[#7A6E62]">
                        Your Vedic milestone events and records.
                      </p>
                    </div>

                    <div className="flex rounded-xl bg-white border border-[#E3D6C3] p-1 text-xs">
                      <button
                        onClick={() => setCelebrationSubTab('upcoming')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          celebrationSubTab === 'upcoming' 
                            ? 'bg-[#B37418] text-white' 
                            : 'text-[#5C5147]'
                        }`}
                      >
                        Upcoming
                      </button>
                      <button
                        onClick={() => setCelebrationSubTab('completed')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          celebrationSubTab === 'completed' 
                            ? 'bg-[#B37418] text-white' 
                            : 'text-[#5C5147]'
                        }`}
                      >
                        Completed
                      </button>
                    </div>
                  </div>

                  {/* Upcoming list */}
                  {celebrationSubTab === 'upcoming' && (
                    <div className="space-y-6">
                      {(() => {
                        const upcomingList = allUserBookings.length > 0 
                          ? allUserBookings.filter(b => b.status !== 'completed') 
                          : (booking ? [booking] : []);

                        if (upcomingList.length === 0) {
                          return (
                            <div className="bg-white rounded-md p-8 border border-[#E3D6C3] text-center space-y-4">
                              <p className="text-xs text-[#5C5147]">No upcoming celebrations.</p>
                              <button
                                onClick={() => {
                                  onClose();
                                  navigate('/book');
                                }}
                                className="bg-[#B37418] text-white text-xs font-semibold px-6 py-2.5 rounded-full cursor-pointer"
                              >
                                Book a Vardhantotsava →
                              </button>
                            </div>
                          );
                        }

                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#7A6E62]">
                                Showing {upcomingList.length} scheduled {upcomingList.length === 1 ? 'celebration' : 'celebrations'}
                              </span>
                              <button
                                onClick={() => {
                                  onClose();
                                  navigate('/book');
                                }}
                                className="text-xs font-semibold text-[#B37418] hover:underline cursor-pointer"
                              >
                                + Book Another Vardhantotsava
                              </button>
                            </div>

                            {upcomingList.map((cb) => {
                              const sch = cb.assignedPanditId 
                                ? ACHARYA_SCHOLARS.find(a => a.id === cb.assignedPanditId) || null 
                                : null;

                              return (
                                <div key={cb.id} className="bg-white rounded-md p-6 border border-[#B37418] shadow-xs space-y-4">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs font-bold text-[#9E6B2D] uppercase tracking-wider">
                                        {cb.celebrationDate}
                                      </span>
                                      {cb.occasion && (
                                        <span className="bg-gold/10 text-gold-dark text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-gold/30">
                                          {cb.occasion}
                                        </span>
                                      )}
                                      {cb.relationship && (
                                        <span className="bg-cream text-charcoal/80 text-[10px] px-2.5 py-0.5 rounded-full border border-gold/20">
                                          {cb.relationship}
                                        </span>
                                      )}
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                      Confirmed
                                    </span>
                                  </div>

                                  <div>
                                    <h3 className="font-serif text-2xl font-normal text-[#1F1914]">
                                      {cb.name}'s Vardhantotsava
                                    </h3>
                                    <p className="text-xs text-[#5C5147] mt-0.5">
                                      {cb.packageName} · {cb.address}, Bengaluru - {cb.pincode}
                                    </p>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="py-2 border-y border-[#E3D6C3]/60 flex items-center justify-between text-[11px] text-[#5C5147]">
                                    <span className="text-emerald-700 font-semibold">Booked</span>
                                    <span>→</span>
                                    <span className={cb.assignedPanditId ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                                      {cb.assignedPanditId ? 'Acharya Assigned' : 'Assignment In Progress'}
                                    </span>
                                    <span>→</span>
                                    <span className={cb.assignedPanditId ? 'text-[#B37418] font-bold' : 'text-[#8C7E72]'}>
                                      Ritual
                                    </span>
                                    <span>→</span>
                                    <span className="text-[#8C7E72]">Homa</span>
                                    <span>→</span>
                                    <span className="text-[#8C7E72]">Complete</span>
                                  </div>

                                  {/* Day Schedule */}
                                  <div className="space-y-2 pt-1 text-xs">
                                    <span className="font-bold text-[#1F1914] block">Ceremony Window: {cb.timeSlot}</span>
                                    <div className="space-y-1 text-[#5C5147]">
                                      <p>Acharya arrives 30 mins prior to {cb.timeSlot.split('-')[0]?.trim() || cb.timeSlot} window for home altar preparation.</p>
                                      <p>Consecrated prasada dispatched directly to your residence post-ritual.</p>
                                    </div>
                                  </div>

                                  {/* Celebrant details */}
                                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E3D6C3] space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-[#1F1914]">Celebrant: {cb.name}</span>
                                      <span className="text-[10px] text-emerald-700 font-semibold">Details verified</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#5C5147]">
                                      <div>DOB: <strong>{cb.dob}</strong></div>
                                      <div>Gotra: <strong>{cb.gotra || 'Kashyapa'}</strong></div>
                                      <div>Nakshatra: <strong>{cb.nakshatra || 'Chitra'}</strong></div>
                                    </div>
                                  </div>

                                  {/* Acharya Assigned Status */}
                                  {cb.assignedPanditId && (sch || cb.assignedPanditName) ? (
                                    <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E3D6C3] flex items-center justify-between text-xs">
                                      <div>
                                        <span className="text-[10px] text-[#7A6E62] block">Assigned Acharya</span>
                                        <strong className="text-[#1F1914]">{cb.assignedPanditName || sch?.name}</strong>
                                        <p className="text-[10px] text-[#5C5147]">
                                          {sch ? `${sch.vedicTradition} · ${sch.languages.join(', ')} · ${sch.experienceYears} Yrs Exp` : 'Vedic Acharya · Assigned for Vardhantotsava'}
                                        </p>
                                        {cb.assignedPanditPhone && (
                                          <p className="text-[10.5px] text-[#8C5D0D] font-medium mt-0.5">Contact: {cb.assignedPanditPhone}</p>
                                        )}
                                      </div>
                                      <a
                                        href={`https://wa.me/919902045009?text=${encodeURIComponent(`Namaskara, inquiring about booking #${cb.id} for ${cb.name}`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-[#B37418] hover:underline font-semibold"
                                      >
                                        Contact Support
                                      </a>
                                    </div>
                                  ) : (
                                    <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                      <div>
                                        <div className="flex items-center gap-1.5 pb-0.5">
                                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                                            Acharya Assignment In Progress
                                          </span>
                                        </div>
                                        <strong className="text-[#1F1914] text-xs">Main Acharya is assigning an initiated scholar</strong>
                                        <p className="text-[10px] text-[#5C5147]">Chief Acharya Office (+91 99020 45009) is coordinating based on Gotra and tradition</p>
                                      </div>
                                      <a
                                        href={`https://wa.me/919902045009?text=${encodeURIComponent(`Namaskara, inquiring about Acharya assignment for booking #${cb.id} for ${cb.name}`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-[#B37418] hover:underline font-semibold"
                                      >
                                        Contact Coordinator
                                      </a>
                                    </div>
                                  )}

                                  {/* Action button */}
                                  <div className="p-4 bg-[#18120D] text-white rounded-2xl flex items-center justify-between">
                                    <div>
                                      <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider block">
                                        Sacred Dashboard
                                      </span>
                                      <p className="text-xs text-white/90">Detailed timeline, checklist and tracking</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        onClose();
                                        navigate('/dashboard');
                                      }}
                                      className="bg-[#B37418] hover:bg-[#9B6210] text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase cursor-pointer"
                                    >
                                      View Dashboard →
                                    </button>
                                  </div>

                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Completed list */}
                  {celebrationSubTab === 'completed' && (
                    <div className="bg-white rounded-md p-8 border border-[#E3D6C3] text-center space-y-2">
                      <p className="text-xs text-[#5C5147]">No completed celebrations in this account yet.</p>
                      <p className="text-[11px] text-[#8C7E72]">
                        Completed rituals, photos, and recordings will appear here for lifetime keepsake.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: FAMILY */}
              {/* ======================================================== */}
              {activeTab === 'family' && (
                <div className="space-y-6 max-w-2xl mx-auto text-left">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#1F1914]">
                        My Family
                      </h2>
                      <p className="text-xs text-[#7A6E62]">
                        Keep your family's details ready for future celebrations.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddFamily(true)}
                      className="bg-[#B37418] hover:bg-[#9B6210] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  {/* Family Members Cards */}
                  {family.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {family.map((member) => (
                        <div 
                          key={member.id}
                          className="bg-white p-5 rounded-2xl border border-[#E3D6C3] hover:border-[#B37418] transition-all shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9E6B2D] tracking-wider block">
                                {member.relationship}
                              </span>
                              <h3 className="font-serif text-lg font-normal text-[#1F1914]">
                                {member.name}
                              </h3>
                            </div>
                            <button
                              onClick={() => {
                                deleteFamilyMember(member.id);
                                setFamily(getFamilyMembers());
                              }}
                              className="text-[10px] text-[#8C7E72] hover:text-red-600"
                              title="Remove"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-1 text-xs text-[#5C5147] border-t border-[#E3D6C3]/50 pt-2">
                            <p>DOB: <strong>{member.dob}</strong></p>
                            <p>Nakshatra: <strong>{member.nakshatra || 'Calculated at booking'}</strong></p>
                            {member.gotra && <p>Gotra: <strong>{member.gotra}</strong></p>}
                            {member.pada && <p>Pada: <strong>{member.pada}</strong></p>}
                          </div>

                          <button
                            onClick={() => {
                              onClose();
                              navigate(`/book?celebrant=${encodeURIComponent(member.name)}`);
                            }}
                            className="w-full bg-[#FAF5ED] hover:bg-[#F3EBE0] border border-[#E3D6C3] text-[#B37418] text-[11px] font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Plan Vardhantotsava</span>
                            <span>→</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-md p-8 border border-dashed border-[#E3D6C3] text-center space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF5ED] border border-[#B37418]/40 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#B37418]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-[#1F1914]">No family profiles added yet</p>
                        <p className="text-[11px] text-[#5C5147] max-w-sm mx-auto">
                          Add birthdays of your parents, spouse, or children to calculate their sacred Vedic Tithi in advance.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddFamily(true)}
                        className="bg-[#B37418] text-white text-xs font-semibold px-5 py-2.5 rounded-full"
                      >
                        + Add someone you love
                      </button>
                    </div>
                  )}

                  {/* Add Family Member Modal */}
                  {showAddFamily && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                      <div className="bg-white rounded-md p-6 sm:p-8 max-w-md w-full border border-[#D5C2A4] shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E3D6C3] pb-3">
                          <h3 className="font-serif text-xl font-normal text-[#1F1914]">
                            Add someone you love
                          </h3>
                          <button onClick={() => setShowAddFamily(false)} className="text-xs text-[#5C5147] hover:text-[#1F1914] p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveFamilyMember} className="space-y-3.5 text-xs text-left">
                          <div>
                            <label className="block text-[11px] font-medium text-[#5C5147] mb-1" htmlFor="customerportalmodal-field-3">Full Name *</label>
                            <input id="customerportalmodal-field-3" 
                              type="text"
                              value={newFamilyName}
                              onChange={(e) => setNewFamilyName(e.target.value)}
                              placeholder="Enter full name"
                              required
                              className="w-full px-3 py-2 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#5C5147] mb-1" htmlFor="customerportalmodal-field-4">Relationship</label>
                            <select id="customerportalmodal-field-4"
                              value={newFamilyRelation}
                              onChange={(e) => setNewFamilyRelation(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                            >
                              <option value="Self">Self</option>
                              <option value="Father">Father (Appa)</option>
                              <option value="Mother">Mother (Amma)</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Son">Son</option>
                              <option value="Daughter">Daughter</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Grandparent">Grandparent (Ajja/Ajji)</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#5C5147] mb-1" htmlFor="customerportalmodal-field-5">Date of Birth *</label>
                            <input id="customerportalmodal-field-5" 
                              type="date"
                              value={newFamilyDob}
                              onChange={(e) => setNewFamilyDob(e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                            />
                          </div>

                          <div>
                            <ManualVedicFields enabled={manualMode} onToggle={setManualMode} value={manual} onChange={setManual} />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#B37418] hover:bg-[#9B6210] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
                          >
                            Save Family Member
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: MESSAGES / ACTIVITY CENTRE */}
              {/* ======================================================== */}
              {activeTab === 'messages' && (
                <div className="space-y-6 max-w-2xl mx-auto text-left">
                  
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-[#1F1914]">
                      Updates & Notifications
                    </h2>
                    <p className="text-xs text-[#7A6E62]">
                      Calm, essential operational updates for your ceremony.
                    </p>
                  </div>

                  {/* 3 WhatsApp Operational Messages Showcase */}
                  <div className="space-y-4">
                    
                    {/* Message 1 */}
                    <div className="bg-white p-5 rounded-2xl border border-[#E3D6C3] shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#E7FFDB] text-[#128C7E] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#C2F2B0]">
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp · Booking Confirmed
                        </span>
                        <span className="text-[10px] text-[#8C7E72]">Immediately after payment</span>
                      </div>
                      <div className="text-xs text-[#201B18] space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E3D6C3]/60 leading-relaxed font-sans">
                        <p className="font-bold">Namaskara {user.name}</p>
                        <p>Your Vardhantotsava is confirmed.</p>
                        <p className="text-[11px] text-[#5C5147]">
                          Payment received<br />
                          Birth details verified<br />
                          Booking confirmed
                        </p>
                        <p className="text-[11px] text-[#7A6E62] pt-1">
                          We will take care of all sacred arrangements. Your Acharya details will be shared once assigned.
                        </p>
                      </div>
                    </div>

                    {/* Message 2 */}
                    <div className="bg-white p-5 rounded-2xl border border-[#E3D6C3] shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#E7FFDB] text-[#128C7E] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#C2F2B0]">
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp · Acharya Assigned
                        </span>
                        <span className="text-[10px] text-[#8C7E72]">48h before ritual</span>
                      </div>
                      <div className="text-xs text-[#201B18] space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E3D6C3]/60 leading-relaxed font-sans">
                        <p className="font-bold">Namaskara {user.name}</p>
                        <p>Your Acharya has been assigned for your upcoming Vardhantotsava.</p>
                        <p className="text-[11px] text-[#5C5147]">
                          Acharya: <strong>Vedamurthy Sri Narayan Bhat</strong><br />
                          Expected arrival: <strong>8:00 AM</strong>
                        </p>
                        <p className="text-[11px] text-[#7A6E62] pt-1">
                          You can view the ceremony schedule, preparation details and Acharya information from your Mantrakshata account.
                        </p>
                      </div>
                    </div>

                    {/* Message 3 */}
                    <div className="bg-white p-5 rounded-2xl border border-[#E3D6C3] shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#E7FFDB] text-[#128C7E] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#C2F2B0]">
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp · Ayushya Homa Link
                        </span>
                        <span className="text-[10px] text-[#8C7E72]">When stream is live</span>
                      </div>
                      <div className="text-xs text-[#201B18] space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E3D6C3]/60 leading-relaxed font-sans">
                        <p className="font-bold">Ayushya Homa</p>
                        <p>The Ayushya Homa for your Vardhantotsava is ready to begin.</p>
                        <p className="text-[11px] text-[#5C5147]">
                          You and your family can join through the private link below:
                        </p>
                        <span className="text-xs text-[#B37418] font-bold block">
                          Watch Ayushya Homa Live →
                        </span>
                        <p className="text-[10px] text-[#7A6E62] pt-1">
                          You may forward this viewing link to family members who would like to join.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: PROFILE */}
              {/* ======================================================== */}
              {activeTab === 'profile' && (
                <div className="space-y-6 max-w-2xl mx-auto text-left">
                  
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-[#1F1914]">
                      Account & Settings
                    </h2>
                    <p className="text-xs text-[#7A6E62]">
                      Manage personal details, addresses, language and communications.
                    </p>
                  </div>

                  {/* Personal Details */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E3D6C3] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-[#1F1914]">Personal Details</strong>
                      <span className="text-[10px] text-emerald-700 font-semibold">Verified</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5C5147]">
                      <div>
                        <span className="text-[10px] text-[#7A6E62] block">Full Name</span>
                        <strong className="text-[#1F1914]">{user.name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A6E62] block">Phone</span>
                        <strong className="text-[#1F1914]">{user.phone}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A6E62] block">Email</span>
                        <strong className="text-[#1F1914]">{user.email || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A6E62] block">Preferred Language</span>
                        <strong className="text-[#1F1914]">{user.language}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Saved Addresses */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E3D6C3] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-[#1F1914]">Saved Addresses</strong>
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="text-xs text-[#B37418] hover:underline font-semibold"
                      >
                        + Add Address
                      </button>
                    </div>

                    {user.addresses.length > 0 ? (
                      <div className="space-y-2">
                        {user.addresses.map((addr) => (
                          <div key={addr.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E3D6C3] text-xs">
                            <span className="font-bold text-[#9E6B2D] block">{addr.label}</span>
                            <p className="text-[#5C5147]">{addr.address}, Bengaluru - {addr.pincode}</p>
                            {addr.mapsLink && (
                              <a 
                                href={addr.mapsLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[11px] text-[#B37418] hover:underline font-semibold block mt-1"
                              >
                                Maps: {addr.mapsLink}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8C7E72]">
                        No saved addresses yet. Addresses added during booking will appear here for fast re-booking.
                      </p>
                    )}
                  </div>

                  {/* Add Address Modal */}
                  {showAddAddress && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                      <div className="bg-white rounded-md p-6 sm:p-8 max-w-md w-full border border-[#D5C2A4] shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E3D6C3] pb-3">
                          <h3 className="font-serif text-xl font-normal text-[#1F1914]">Add Address</h3>
                          <button onClick={() => setShowAddAddress(false)} className="text-xs text-[#5C5147] hover:text-[#1F1914] p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <form onSubmit={handleSaveAddress} className="space-y-3 text-xs text-left">
                          <div>
                            <label className="block text-[11px] font-medium text-[#5C5147] mb-1" htmlFor="customerportalmodal-field-6">Label</label>
                            <input id="customerportalmodal-field-6" 
                              type="text"
                              value={newAddrLabel}
                              onChange={(e) => setNewAddrLabel(e.target.value)}
                              placeholder="e.g. Home, Parents' House"
                              required
                              className="w-full px-3 py-2 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#5C5147] mb-1" htmlFor="customerportalmodal-field-7">Address</label>
                            <textarea id="customerportalmodal-field-7" 
                              value={newAddrText}
                              onChange={(e) => setNewAddrText(e.target.value)}
                              placeholder="Apartment, Street, Area"
                              required
                              className="w-full px-3 py-2 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5] h-20"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#5C5147] mb-1" htmlFor="customerportalmodal-field-8">Pincode</label>
                            <input id="customerportalmodal-field-8" 
                              type="text"
                              value={newAddrPincode}
                              onChange={(e) => setNewAddrPincode(e.target.value)}
                              placeholder="560041"
                              className="w-full px-3 py-2 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#5C5147] mb-1">Google Maps Location Link (Compulsory) *</label>
                            <input 
                              type="url" 
                              value={newAddrMapsLink} 
                              onChange={(e) => setNewAddrMapsLink(e.target.value)} 
                              placeholder="https://maps.app.goo.gl/... (Required for Acharya navigation)" 
                              required 
                              className="w-full px-3 py-2 rounded-xl border border-[#E3D6C3] bg-[#FAF8F5]" 
                            />
                            <p className="text-[10px] text-[#8C5D0D] mt-1">
                              Compulsory for the Acharya to navigate to your home.
                            </p>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-[#B37418] text-white text-xs font-semibold py-3 rounded-xl uppercase tracking-wider"
                          >
                            Save Address
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Communication Settings */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E3D6C3] shadow-xs space-y-3 text-xs">
                    <strong className="text-xs font-bold text-[#1F1914] block">Notifications & Communications</strong>
                    <div className="space-y-2 text-[#5C5147]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked disabled />
                        <span>Booking & ceremony updates (Always enabled)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked />
                        <span>WhatsApp updates</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked />
                        <span>Email receipts & invoices</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked />
                        <span>Annual Vedic Vardhantotsava Tithi reminders</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-[#8C7E72]">
                        <input type="checkbox" />
                        <span>Promotional offers & announcements</span>
                      </label>
                    </div>
                  </div>

                  {/* Help & Support */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E3D6C3] shadow-xs space-y-2 text-xs">
                    <strong className="text-xs font-bold text-[#1F1914] block">Help & Support</strong>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a 
                        href="https://wa.me/919845000000" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D6C3] hover:border-[#B37418] text-[#1F1914] font-medium"
                      >
                        WhatsApp Mantrakshata
                      </a>
                      <a 
                        href="tel:+919845000000" 
                        className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E3D6C3] hover:border-[#B37418] text-[#1F1914] font-medium"
                      >
                        Call Coordinator
                      </a>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* Mobile Bottom Tab Bar */}
        {user && (
          <div className="md:hidden border-t border-[#E3D6C3] bg-white py-2 px-4 flex items-center justify-around flex-shrink-0 z-20">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 text-[10px] ${
                activeTab === 'home' ? 'text-[#B37418] font-bold' : 'text-[#7A6E62]'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab('celebrations')}
              className={`flex flex-col items-center gap-1 text-[10px] ${
                activeTab === 'celebrations' ? 'text-[#B37418] font-bold' : 'text-[#7A6E62]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </button>
            <button
              onClick={() => setActiveTab('family')}
              className={`flex flex-col items-center gap-1 text-[10px] ${
                activeTab === 'family' ? 'text-[#B37418] font-bold' : 'text-[#7A6E62]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 text-[10px] ${
                activeTab === 'profile' ? 'text-[#B37418] font-bold' : 'text-[#7A6E62]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
