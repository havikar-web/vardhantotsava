import type { BookingPlan, GiftOrder, UserProfile } from './store';

export interface NeonConnectionStatus {
  ok: boolean;
  version?: string;
  error?: string;
  counts?: {
    bookings: number;
    giftOrders: number;
    whatsappLogs: number;
    [key: string]: number;
  };
}

export function getNeonConnectionString(): string {return '';}

export function setNeonConnectionString(url: string): void {throw new Error('Database settings are server-side only.');}

export async function checkNeonConnection(): Promise<NeonConnectionStatus> {try {const r=await fetch('/api/health');return {ok:r.ok,version:'Protected backend'};}catch{return {ok:false,error:'Backend unavailable'};}}

/**
 * Fetch registered user profile from Neon database by phone number
 */
export async function fetchUserProfileFromNeon(phone: string): Promise<UserProfile | null> {const r=await fetch('/api/session');if(!r.ok)return null;return (await r.json()).user;}

/**
 * Persist user profile to Neon database
 */
export async function saveUserProfileToNeon(user: UserProfile): Promise<boolean> {const r=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:user.name,email:user.email,marketing:user.notifications?.marketing===true})});return r.ok;}

/**
 * Sync booking to Neon PostgreSQL bookings table
 */
export async function syncBookingToNeon(booking: BookingPlan): Promise<boolean> {throw new Error('Use the secure ceremony request form.');}

export function mapDbRowToBooking(b: any): BookingPlan {
  return {
    id: b.id,
    userId: b.user_id || undefined,
    name: b.celebrant_name,
    dob: b.dob ? String(b.dob).slice(0, 10) : '',
    birthTime: b.birth_time || undefined,
    birthPlace: b.birth_place || undefined,
    gotra: b.gotra || 'Kashyapa',
    nakshatra: b.nakshatra || 'Chitra',
    pada: b.pada || 1,
    celebrationDate: b.celebration_date,
    timeSlot: b.time_slot,
    address: b.venue_address,
    pincode: b.pincode,
    packageId: b.package_id,
    packageName: b.package_name,
    addons: b.addons || [],
    totalPrice: b.total_price || 0,
    status: b.status || 'confirmed',
    bookedAt: b.created_at || new Date().toISOString(),
    phone: b.user_phone,
    email: b.user_email || b.email || '',
    mapsLink: b.maps_link || undefined,
    assignedPanditId: b.assigned_acharya_id || undefined,
    assignedPanditName: b.assigned_acharya_name || undefined,
    assignedPanditPhone: b.assigned_acharya_phone || undefined,
    giftOrderId: b.gift_order_id || undefined,
    giftDeliveryMode: b.gift_delivery_mode || undefined,
    giftItems: b.gift_items || undefined,
    giftTotal: b.gift_total || 0,
    razorpayOrderId: b.razorpay_order_id || undefined,
    razorpayPaymentId: b.razorpay_payment_id || undefined
  };
}

/**
 * Fetch bookings from Neon PostgreSQL (by userId, phone, booking ID, or all)
 */
export async function fetchBookingsFromNeon(
  identifier?: { phone?: string; userId?: string; id?: string; bookingId?: string } | string
): Promise<BookingPlan[]> {const r=await fetch('/api/bookings');if(!r.ok)return [];return (await r.json()).bookings;}

/**
 * Directly fetch single booking by ID from Neon Cloud database
 */
export async function fetchBookingByIdFromNeon(bookingId: string): Promise<BookingPlan | null> {const r=await fetch('/api/bookings/'+encodeURIComponent(bookingId));if(!r.ok)return null;return (await r.json()).booking;}

export async function syncGiftOrderToNeon(order: GiftOrder): Promise<boolean> {throw new Error('Gift checkout is awaiting server-side pricing and shipping configuration.');}

export async function fetchGiftOrdersFromNeon(identifier?: { phone?: string; userId?: string } | string): Promise<GiftOrder[]> {return [];}

export async function logWhatsAppToNeon(_log: any): Promise<void> {
  // Dispatches are logged in database
}

export async function fetchWhatsAppLogsFromNeon(): Promise<any[]> {
  return [];
}
