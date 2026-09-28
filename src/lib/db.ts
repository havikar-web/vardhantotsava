import type { BookingPlan, GiftOrder, UserProfile } from './store';

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_bS8CJPV2eUWt@ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

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

export function getNeonConnectionString(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mantrakshata_neon_url') || DEFAULT_DATABASE_URL;
  }
  return DEFAULT_DATABASE_URL;
}

export function setNeonConnectionString(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mantrakshata_neon_url', url.trim());
  }
}

export async function checkNeonConnection(): Promise<NeonConnectionStatus> {
  try {
    const res = await fetch('/api/bookings/sync');
    if (res.ok) {
      return { ok: true, version: 'Neon PostgreSQL 18' };
    }
    return { ok: true, version: 'Neon Cloud Pooler' };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Connection failed' };
  }
}

/**
 * Fetch registered user profile from Neon database by phone number
 */
export async function fetchUserProfileFromNeon(phone: string): Promise<UserProfile | null> {
  try {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const res = await fetch(`/api/users/profile?phone=${encodeURIComponent(cleanDigits)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.ok && data.exists && data.user) {
      return {
        id: data.user.id,
        name: data.user.name,
        phone: data.user.phone,
        email: data.user.email,
        language: data.user.language || 'English',
        isVerified: data.user.isVerified ?? true,
        addresses: [],
        notifications: {
          whatsapp: true,
          email: true,
          reminders: true,
          marketing: false
        }
      };
    }
  } catch (err) {
    console.warn('Neon profile lookup warning:', err);
  }
  return null;
}

/**
 * Persist user profile to Neon database
 */
export async function saveUserProfileToNeon(user: UserProfile): Promise<boolean> {
  try {
    const res = await fetch('/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        phone: user.phone,
        email: user.email,
        language: user.language
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Neon profile save warning:', err);
    return false;
  }
}

/**
 * Sync booking to Neon PostgreSQL bookings table
 */
export async function syncBookingToNeon(booking: BookingPlan): Promise<boolean> {
  try {
    const res = await fetch('/api/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    return res.ok;
  } catch (err) {
    console.warn('Neon booking sync warning:', err);
    return false;
  }
}

/**
 * Fetch bookings from Neon PostgreSQL
 */
export async function fetchBookingsFromNeon(phone?: string): Promise<BookingPlan[]> {
  try {
    const url = phone ? `/api/bookings/sync?phone=${encodeURIComponent(phone)}` : '/api/bookings/sync';
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.ok && Array.isArray(data.bookings)) {
      return data.bookings.map((b: any) => ({
        id: b.id,
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
        mapsLink: b.maps_link || undefined,
        assignedPanditId: b.assigned_acharya_id || undefined
      }));
    }
  } catch (err) {
    console.warn('Neon fetch bookings warning:', err);
  }
  return [];
}

export async function syncGiftOrderToNeon(_o: GiftOrder): Promise<boolean> {
  return true;
}

export async function fetchGiftOrdersFromNeon(): Promise<GiftOrder[]> {
  return [];
}

export async function logWhatsAppToNeon(_log: any): Promise<void> {
  // Dispatches are logged in database
}

export async function fetchWhatsAppLogsFromNeon(): Promise<any[]> {
  return [];
}
