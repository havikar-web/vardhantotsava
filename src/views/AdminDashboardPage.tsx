import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Package, 
  Gift, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter, 
  ShieldCheck, 
  Database, 
  Copy, 
  Check, 
  Truck, 
  AlertCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  getAllBookings, 
  updateBookingInList, 
  BookingPlan, 
  getGiftOrders, 
  updateGiftOrderStatus, 
  GiftOrder 
} from '../lib/store';
import { ACHARYA_SCHOLARS } from '../lib/content';
import { 
  getWhatsAppMessages, 
  sendCompletionThankYouMessage, 
  sendAcharyaAssignedMessage,
  sendAcharyaOrderDispatchMessage 
} from '../lib/whatsapp';
import { checkNeonConnection, fetchBookingsFromNeon, fetchGiftOrdersFromNeon, syncBookingToNeon } from '../lib/db';
import { WhatsAppTesterTab } from '../components/admin/WhatsAppTesterTab';
import { CredentialsTab } from '../components/admin/CredentialsTab';

interface Props {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<Props> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'gifts' | 'acharyas' | 'tester' | 'credentials' | 'database'>('bookings');
  const [bookings, setBookings] = useState<BookingPlan[]>(() => getAllBookings());
  const [giftOrders, setGiftOrders] = useState<GiftOrder[]>(() => getGiftOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'draft' | 'completed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [sqlCopied, setSqlCopied] = useState(false);
  const [syncingNeon, setSyncingNeon] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [neonTest, setNeonTest] = useState<{ testing: boolean; tested: boolean; ok: boolean; version?: string; error?: string }>({
    testing: false,
    tested: false,
    ok: false,
  });

  const handleSyncWithNeon = async () => {
    setSyncingNeon(true);
    setSyncMessage(null);
    try {
      const neonBookings = await fetchBookingsFromNeon();
      const neonGifts = await fetchGiftOrdersFromNeon();
      if (neonBookings.length > 0) {
        setBookings(neonBookings);
      }
      if (neonGifts.length > 0) {
        setGiftOrders(neonGifts);
      }
      setSyncMessage(`Synced ${neonBookings.length} bookings and ${neonGifts.length} gift orders from Neon Cloud Database.`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (e: any) {
      setSyncMessage(`Neon sync failed: ${e?.message || 'Database error'}`);
    } finally {
      setSyncingNeon(false);
    }
  };

  const handleTestNeon = async () => {
    setNeonTest(prev => ({ ...prev, testing: true }));
    const res = await checkNeonConnection();
    setNeonTest({
      testing: false,
      tested: true,
      ok: res.ok,
      version: res.version,
      error: res.error,
    });
  };

  // Quick stats calculation
  const totalCeremonyRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalGiftRevenue = giftOrders.reduce((acc, g) => acc + (g.totalAmount || 0), 0);
  const totalRevenue = totalCeremonyRevenue + totalGiftRevenue;
  const pendingAssignments = bookings.filter(b => !b.assignedPanditId).length;
  const recentMessages = getWhatsAppMessages();

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      (b.nakshatra && b.nakshatra.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.gotra && b.gotra.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAcharyaChange = (bookingId: string, newAcharyaId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const acharya = ACHARYA_SCHOLARS.find(a => a.id === newAcharyaId) || ACHARYA_SCHOLARS[0];
    const updated: BookingPlan = {
      ...booking,
      assignedPanditId: newAcharyaId,
      assignedPanditName: acharya.name,
      assignedPanditPhone: acharya.phone,
      status: 'confirmed'
    };
    updateBookingInList(updated);
    setBookings(getAllBookings());
    syncBookingToNeon(updated).catch(e => console.warn('Neon sync warning:', e));

    // 1. Dispatch ceremony order with Date, Time, Venue directly to the assigned Acharya's phone
    sendAcharyaOrderDispatchMessage(updated, acharya);

    // 2. Trigger WhatsApp notification to customer
    sendAcharyaAssignedMessage(updated, acharya);
  };

  const handleMarkCompleted = (booking: BookingPlan) => {
    const updated: BookingPlan = {
      ...booking,
      status: 'completed'
    };
    updateBookingInList(updated);
    setBookings(getAllBookings());
    syncBookingToNeon(updated).catch(e => console.warn('Neon sync warning:', e));
    sendCompletionThankYouMessage(updated);
  };

  const handleUpdateGiftStatus = (orderId: string, status: 'paid' | 'shipped' | 'delivered') => {
    const tracking = trackingInputs[orderId] || 'HVK-' + Math.floor(100000 + Math.random() * 900000) + '-BLR';
    updateGiftOrderStatus(orderId, status, tracking);
    setGiftOrders(getGiftOrders());
  };

  const copyBookingSummary = (b: BookingPlan) => {
    const acharya = ACHARYA_SCHOLARS.find(a => a.id === b.assignedPanditId);
    const summary = `MANTRAKSHATA VARDHANTOTSAVA ASSIGNMENT
Booking ID: ${b.id}
Celebrant: ${b.name}
Gotra: ${b.gotra || 'Kashyapa'} | Nakshatra: ${b.nakshatra || 'Chitra'}
Date: ${b.celebrationDate} (${b.timeSlot})
Package: ${b.packageName}
Address: ${b.address}, Bengaluru
Host Phone: ${b.phone}
Assigned Acharya: ${acharya ? acharya.name : 'Pending Allocation'}
Google Maps: ${b.mapsLink || 'Available'}
Status: Confirmed Ceremony Reservation`;

    navigator.clipboard.writeText(summary);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const POSTGRES_SCHEMA_SQL = `-- Mantrakshata Production PostgreSQL Database Schema
-- Ready for Supabase, Neon, or AWS RDS

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Celebrants & Host Profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160),
  is_verified BOOLEAN DEFAULT TRUE,
  preferred_language VARCHAR(30) DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vardhantotsava Ceremony Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(40) PRIMARY KEY,
  user_phone VARCHAR(20) NOT NULL,
  celebrant_name VARCHAR(120) NOT NULL,
  dob DATE,
  birth_time VARCHAR(20),
  birth_place VARCHAR(100),
  gotra VARCHAR(60) NOT NULL,
  nakshatra VARCHAR(60) NOT NULL,
  pada INT DEFAULT 1,
  celebration_date VARCHAR(50) NOT NULL,
  time_slot VARCHAR(60) NOT NULL,
  venue_address TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  package_id VARCHAR(50) NOT NULL,
  package_name VARCHAR(100) NOT NULL,
  addons TEXT[] DEFAULT '{}',
  total_price INT NOT NULL,
  assigned_acharya_id VARCHAR(50),
  razorpay_payment_id VARCHAR(100),
  status VARCHAR(30) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Havikar Gifts & Keepsakes Store Orders
CREATE TABLE IF NOT EXISTS gift_orders (
  id VARCHAR(40) PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(160),
  recipient_name VARCHAR(120),
  gift_message TEXT,
  delivery_address TEXT NOT NULL,
  city VARCHAR(60) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  items JSONB NOT NULL,
  box_packaging BOOLEAN DEFAULT TRUE,
  box_price INT DEFAULT 150,
  total_amount INT NOT NULL,
  razorpay_payment_id VARCHAR(100) NOT NULL,
  tracking_number VARCHAR(100),
  status VARCHAR(30) DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. WhatsApp Message Audit Trail
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id VARCHAR(60) PRIMARY KEY,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(120),
  template_name VARCHAR(100) NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  booking_id VARCHAR(40),
  wamid VARCHAR(120),
  status VARCHAR(30) DEFAULT 'delivered',
  dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(celebration_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(user_phone);
CREATE INDEX IF NOT EXISTS idx_gift_orders_phone ON gift_orders(customer_phone);
`;

  return (
    <div className="py-8 bg-[#FAF6EE] min-h-screen text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Console Bar */}
        <div className="bg-white p-6 rounded-3xl border border-gold/30 shadow-sacred flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-gold-dark">
                MANTRAKSHATA CENTRAL OPERATIONS CONSOLE
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
              Master Admin Panel
            </h1>
            <p className="text-xs text-charcoal/70">
              Manage Vardhantotsava home visits, Havikar sacred gift shipments, and Acharya dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSyncWithNeon}
              disabled={syncingNeon}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-blue-700" />
              <span>{syncingNeon ? 'Syncing...' : 'Sync from Neon Cloud'}</span>
            </button>
            <button
              onClick={() => setActiveTab('tester')}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp Delivery Tester</span>
            </button>
            <button
              onClick={() => navigate('/acharya/assign')}
              className="px-4 py-2.5 bg-cream hover:bg-gold/10 border border-gold/30 text-charcoal rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-gold-dark" />
              <span>Acharya Allocation Desk</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl text-xs text-blue-950 font-medium">
            {syncMessage}
          </div>
        )}

        {/* Operational KPI Metrics (Clean of Prices) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gold/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-[11px] uppercase font-semibold">Total Ceremonies</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-serif text-charcoal">
              {bookings.length}
            </p>
            <span className="text-[10px] text-charcoal/50 block">
              Confirmed: {bookings.filter(b => b.status === 'confirmed').length} · Completed: {bookings.filter(b => b.status === 'completed').length}
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gold/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-[11px] uppercase font-semibold">Pending Allocations</span>
              <Clock className="w-4 h-4 text-[#B37418]" />
            </div>
            <p className="text-2xl font-bold font-serif text-charcoal">
              {pendingAssignments}
            </p>
            <span className="text-[10px] text-charcoal/50 block">
              Awaiting Chief Acharya assignment
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gold/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-[11px] uppercase font-semibold">Havikar Gift Orders</span>
              <Gift className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold font-serif text-charcoal">
              {giftOrders.length}
            </p>
            <span className="text-[10px] text-charcoal/50 block">
              Sandalwood bracelets, Malnad Rasapanchaka, Japa Malas
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gold/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-[11px] uppercase font-semibold">Acharyas on Duty</span>
              <ShieldCheck className="w-4 h-4 text-gold-dark" />
            </div>
            <p className="text-2xl font-bold font-serif text-charcoal">
              {ACHARYA_SCHOLARS.length}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold block">
              Gokarna, Mysuru & Sringeri Scholars
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gold/20 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings' ? 'bg-[#B37418] text-white shadow-xs' : 'text-charcoal/70 hover:text-charcoal bg-white/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Vardhantotsava Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'gifts' ? 'bg-[#B37418] text-white shadow-xs' : 'text-charcoal/70 hover:text-charcoal bg-white/60'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Havikar Gifts Store Orders ({giftOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'tester' ? 'bg-[#B37418] text-white shadow-xs' : 'text-charcoal/70 hover:text-charcoal bg-white/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Delivery Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'credentials' ? 'bg-[#B37418] text-white shadow-xs' : 'text-charcoal/70 hover:text-charcoal bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Credentials & Cloud APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('acharyas')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'acharyas' ? 'bg-[#B37418] text-white shadow-xs' : 'text-charcoal/70 hover:text-charcoal bg-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Acharya Roster ({ACHARYA_SCHOLARS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'database' ? 'bg-[#B37418] text-white shadow-xs' : 'text-charcoal/70 hover:text-charcoal bg-white/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Architecture</span>
          </button>
        </div>

        {/* TAB 1: CEREMONY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Search & Filter Controls */}
            <div className="bg-white p-4 rounded-2xl border border-gold/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by celebrant, ID, gotra, nakshatra..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-charcoal/60 font-semibold">Filter:</span>
                {(['all', 'confirmed', 'draft', 'completed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      statusFilter === st 
                        ? 'bg-gold/20 text-gold-dark border border-gold/50' 
                        : 'bg-[#FAF8F5] text-charcoal/60 hover:text-charcoal'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map((b) => {
                const assignedAcharya = ACHARYA_SCHOLARS.find(a => a.id === b.assignedPanditId);

                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-gold/30 p-5 shadow-xs space-y-4 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gold/15">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cream border border-gold/30 text-gold-dark">
                          {b.id}
                        </span>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-charcoal">
                            {b.name}'s Vardhantotsava
                          </h3>
                          <span className="text-[11px] text-charcoal/60">
                            Gotra: <strong>{b.gotra || 'Kashyapa'}</strong> · Nakshatra: <strong>{b.nakshatra || 'Chitra'}</strong> (Pada {b.pada || 1})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                          b.status === 'confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : b.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                        <button
                          onClick={() => copyBookingSummary(b)}
                          className="px-2.5 py-1 bg-cream hover:bg-gold/10 border border-gold/30 rounded-lg text-xs font-semibold text-charcoal flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy Ceremony Summary for WhatsApp"
                        >
                          {copiedId === b.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gold-dark" />
                              <span>Copy Summary</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-charcoal/50 uppercase text-[10px] font-bold block">Ceremony Itinerary</span>
                        <p className="font-semibold text-charcoal flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#B37418]" />
                          <span>{b.celebrationDate}</span>
                        </p>
                        <p className="text-charcoal/80 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-charcoal/40" />
                          <span>{b.timeSlot}</span>
                        </p>
                        <p className="text-gold-dark font-medium pt-0.5">
                          Package: {b.packageName}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-charcoal/50 uppercase text-[10px] font-bold block">Residence & Host</span>
                        <p className="text-charcoal/80 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#B37418] shrink-0 mt-0.5" />
                          <span>{b.address}, Bengaluru ({b.pincode})</span>
                        </p>
                        <p className="text-charcoal/80 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-charcoal/40" />
                          <span>{b.phone}</span>
                        </p>
                      </div>

                      <div className="space-y-1.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5D7C3]">
                        <span className="text-gold-dark uppercase text-[10px] font-bold block">
                          Assigned Vedic Acharya
                        </span>
                        
                        <select
                          value={b.assignedPanditId || ''}
                          onChange={(e) => handleAcharyaChange(b.id, e.target.value)}
                          className="w-full bg-white border border-gold/40 rounded-lg px-2.5 py-1.5 text-xs text-charcoal font-semibold focus:outline-none focus:border-gold"
                        >
                          <option value="">-- Assign Acharya --</option>
                          {ACHARYA_SCHOLARS.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({a.vedicTradition.split(' ')[0]})
                            </option>
                          ))}
                        </select>

                        {assignedAcharya ? (
                          <div className="text-[11px] text-charcoal/70 space-y-1">
                            <span className="text-emerald-700 font-semibold block">Active: {assignedAcharya.name}</span>
                            <span>{assignedAcharya.institution} · {assignedAcharya.area}</span>
                            <span className="text-charcoal/80 block font-mono text-[10px]">Acharya Phone: {assignedAcharya.phone}</span>
                            <span className="inline-block text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                              Ceremony Order Dispatched to Acharya Phone ({b.celebrationDate}, {b.timeSlot})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-red-600 font-semibold block">
                            Action required: No Acharya allocated yet.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gold/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-charcoal/60">
                        <span>Add-ons:</span>
                        {b.addons && b.addons.length > 0 ? (
                          <span className="font-semibold text-charcoal">{b.addons.join(', ')}</span>
                        ) : (
                          <span className="italic">Standard package inclusions</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status !== 'completed' && (
                          <button
                            onClick={() => handleMarkCompleted(b)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Mark Completed & Send Thank You
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/portal?id=${b.id}`)}
                          className="px-3 py-1 bg-cream hover:bg-gold/10 text-charcoal border border-gold/30 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Customer Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: HAVIKAR GIFTS STORE ORDERS */}
        {activeTab === 'gifts' && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-left">
              <span className="text-xs uppercase font-bold text-purple-900 block mb-0.5">
                Direct Havikar Gifts & Sacred Keepsakes Fulfillment
              </span>
              <p className="text-xs text-purple-800/80">
                Standalone orders placed through the `/gifts` store for Sandalwood bracelets, Japa malas, Havikar Rasapanchaka, Rose Kumkum, and sacred dravyas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {giftOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-gold/30 p-5 shadow-xs space-y-4 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gold/15">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 border border-purple-300 text-purple-900">
                        {order.id}
                      </span>
                      <div>
                        <h3 className="font-serif text-base font-bold text-charcoal">
                          Order for {order.recipientName || order.customerName}
                        </h3>
                        <span className="text-[11px] text-charcoal/60">
                          Placed by {order.customerName} ({order.customerPhone}) · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className="font-mono text-xs font-bold text-charcoal">
                        {order.items.length} Consecrated Items
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                    {/* Items List */}
                    <div className="md:col-span-6 space-y-2">
                      <span className="text-charcoal/50 uppercase text-[10px] font-bold block">
                        Ordered Items & Quantities
                      </span>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E5D7C3]">
                            <span className="font-semibold text-charcoal">
                              {item.name} <strong className="text-gold-dark">x{item.quantity}</strong>
                            </span>
                            <span className="font-mono text-charcoal/70">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.boxPackaging && (
                          <div className="flex items-center justify-between bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-900">
                            <span>Includes Rigid Sacred Keepsake Gift Box</span>
                            <span className="font-mono font-semibold text-xs text-amber-800">Box Packaging Included</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="md:col-span-6 space-y-2">
                      <span className="text-charcoal/50 uppercase text-[10px] font-bold block">
                        Shipping Address & Dispatch Actions
                      </span>
                      <p className="text-charcoal/80">
                        {order.deliveryAddress}, {order.city} - {order.pincode}
                      </p>
                      {order.giftMessage && (
                        <p className="text-[11px] italic bg-[#FAF8F5] p-2 rounded-lg border border-[#E5D7C3] text-charcoal/80">
                          "{order.giftMessage}"
                        </p>
                      )}

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          placeholder="Tracking # (e.g. HVK-829104-BLR)"
                          value={trackingInputs[order.id] || (order as any).trackingNumber || ''}
                          onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                          className="px-3 py-1.5 bg-[#FAF8F5] border border-gold/30 rounded-lg text-xs text-charcoal font-mono flex-1 focus:outline-none focus:border-gold"
                        />
                        <button
                          onClick={() => handleUpdateGiftStatus(order.id, 'shipped')}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Mark Shipped</span>
                        </button>
                        <button
                          onClick={() => handleUpdateGiftStatus(order.id, 'delivered')}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Mark Delivered</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACHARYA ROSTER */}
        {activeTab === 'acharyas' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ACHARYA_SCHOLARS.map((acharya) => {
                const assignedCount = bookings.filter(b => b.assignedPanditId === acharya.id).length;

                return (
                  <div key={acharya.id} className="bg-white rounded-2xl border border-gold/30 p-5 shadow-xs space-y-4 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-gold/15">
                      <span className="font-mono text-xs font-bold text-gold-dark">{acharya.id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {assignedCount} Ceremonies Assigned
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-base font-bold text-charcoal">
                        {acharya.name}
                      </h3>
                      <p className="text-xs text-gold-dark font-medium">{acharya.title}</p>
                      <p className="text-[11px] text-charcoal/60 mt-0.5">{acharya.institution}</p>
                    </div>

                    <div className="text-xs space-y-1.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5D7C3]">
                      <div>
                        <span className="text-charcoal/50 text-[10px] uppercase font-bold block">Tradition</span>
                        <strong className="text-charcoal">{acharya.vedicTradition}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal/50 text-[10px] uppercase font-bold block">Coverage Area</span>
                        <strong className="text-charcoal">{acharya.area}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal/50 text-[10px] uppercase font-bold block">Languages</span>
                        <span className="text-charcoal/80">{acharya.languages.join(', ')}</span>
                      </div>
                    </div>

                    {acharya.bio && acharya.bio.trim() ? (
                      <p className="text-xs text-charcoal/70 leading-relaxed italic">
                        "{acharya.bio}"
                      </p>
                    ) : null}

                    <button
                      onClick={() => navigate(`/acharya/assign?acharyaId=${acharya.id}`)}
                      className="w-full py-2 bg-cream hover:bg-gold/10 border border-gold/30 text-charcoal rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Allocation Desk</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold-dark" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE & CLOUD ARCHITECTURE */}
        {activeTab === 'database' && (
          <div className="space-y-5 text-left">
            <div className="bg-white p-6 rounded-2xl border border-gold/30 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gold/15">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-gold-dark" />
                  <div>
                    <h2 className="font-serif text-lg font-bold text-charcoal">
                      Neon Serverless PostgreSQL Database
                    </h2>
                    <p className="text-xs text-charcoal/60">
                      Live Cloud Centralized Storage with Dual-Layer Client Persistence
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Neon Cloud: Connected & Active
                  </span>
                  <button
                    onClick={handleTestNeon}
                    disabled={neonTest.testing}
                    className="px-3 py-1 bg-cream hover:bg-gold/15 text-charcoal border border-gold/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {neonTest.testing ? 'Testing...' : 'Ping Neon DB'}
                  </button>
                </div>
              </div>

              {neonTest.tested && (
                <div className={`p-3 rounded-xl border text-xs ${neonTest.ok ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
                  {neonTest.ok ? (
                    <div>
                      <span className="font-bold block">Neon Connection Verified:</span>
                      <span className="font-mono text-[11px] block mt-0.5">{neonTest.version}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold block">Neon Connection Error:</span>
                      <span className="font-mono text-[11px] block mt-0.5">{neonTest.error}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-charcoal/80 leading-relaxed">
                Ceremony bookings, gift purchases, customer records, and WhatsApp notification audit trails are automatically mirrored to your live Neon cloud database cluster (<code className="bg-sand/30 px-1 py-0.5 rounded font-mono text-[11px]">ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech</code>).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5D7C3] text-xs">
                  <strong className="text-gold-dark block mb-0.5">Table: bookings</strong>
                  <span className="text-charcoal/70 text-[11px]">Ceremony records, Gotra, Nakshatra, Pandit allocation, status.</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5D7C3] text-xs">
                  <strong className="text-gold-dark block mb-0.5">Table: gift_orders</strong>
                  <span className="text-charcoal/70 text-[11px]">Havikar gifts, Rasapanchaka, keepsake boxes, dispatch tracking.</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5D7C3] text-xs">
                  <strong className="text-gold-dark block mb-0.5">Table: users</strong>
                  <span className="text-charcoal/70 text-[11px]">Verified WhatsApp numbers, celebrant names, family Gotra.</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5D7C3] text-xs">
                  <strong className="text-gold-dark block mb-0.5">Table: whatsapp_logs</strong>
                  <span className="text-charcoal/70 text-[11px]">Audit trail of triggered notifications, dynamic link parameters.</span>
                </div>
              </div>
            </div>

            {/* SQL Migration Script Box */}
            <div className="bg-white p-6 rounded-2xl border border-gold/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-gold-dark">
                  Complete PostgreSQL Schema & DDL Migration Script:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(POSTGRES_SCHEMA_SQL);
                    setSqlCopied(true);
                    setTimeout(() => setSqlCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-[#FAF5ED] hover:bg-[#F4EADA] border border-[#D5C2A4] rounded-lg text-xs font-semibold text-[#8C5D0D] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {sqlCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Migration SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-[#1F1914] text-[#E5D5C0] font-mono text-xs rounded-xl overflow-x-auto leading-relaxed max-h-96">
                {POSTGRES_SCHEMA_SQL}
              </pre>
            </div>
          </div>
        )}

        {/* TAB: WHATSAPP TESTER */}
        {activeTab === 'tester' && <WhatsAppTesterTab />}

        {/* TAB: CREDENTIALS */}
        {activeTab === 'credentials' && <CredentialsTab />}

      </div>
    </div>
  );
};
