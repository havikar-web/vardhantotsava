import { PanchangaResult } from './panchanga';
import { syncBookingToNeon, syncGiftOrderToNeon } from './db';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  isVerified?: boolean;
  demoVerified?: boolean;
  language: 'English' | 'ಕನ್ನಡ' | 'हिन्दी';
  addresses: SavedAddress[];
  notifications: {
    whatsapp: boolean;
    email: boolean;
    reminders: boolean;
    marketing: boolean;
  };
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  landmark?: string;
  pincode: string;
  city: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dob: string;
  birthTime?: string;
  noExactTime?: boolean;
  birthPlace?: string;
  gotra?: string;
  pada?: number;
  vedicSource?: 'manual' | 'calculated';
  nakshatra?: string;
  rashi?: string;
}

export interface NotificationMessage {
  id: string;
  title: string;
  date: string;
  time: string;
  body: string;
  category: 'booking' | 'pandit' | 'homa' | 'general';
  linkPath?: string;
  read: boolean;
}

export interface BookingPlan {
  id: string;
  name: string;
  occasion?: string;
  relationship?: string;
  dob: string;
  birthTime?: string;
  birthPlace?: string;
  gotra?: string;
  pada?: number;
  vedicSource?: 'manual' | 'calculated';
  nakshatra?: string;
  rashi?: string;
  celebrationDate: string;
  timeSlot: string;
  address: string;
  mapsLink?: string;
  apartment?: string;
  landmark?: string;
  pincode: string;
  phone: string;
  email: string;
  packageId: string;
  packageName: string;
  addons: string[];
  totalPrice: number;
  status: 'confirmed' | 'draft' | 'completed';
  bookedAt: string;
  assignedPanditId?: string;
}

export interface GiftPlan {
  itemIds?: string[];
  giftMode?: 'package' | 'custom_box';
  id: string;
  recipientName: string;
  relationship: string;
  birthday: string;
  senderName: string;
  senderPhone: string;
  personalMessage: string;
  packageId: string;
  packageName: string;
  totalPrice: number;
  status: 'gifted' | 'draft';
  createdAt: string;
}

const STORAGE_USER_KEY = 'mantrakshata_user_profile';
const STORAGE_BOOKING_KEY = 'mantrakshata_booking_plan';
const STORAGE_FAMILY_KEY = 'mantrakshata_family_members';
const STORAGE_NOTIFICATIONS_KEY = 'mantrakshata_user_notifications';
const STORAGE_GIFT_KEY = 'mantrakshata_gift_plan';

const STORAGE_USERS_REGISTRY_KEY = 'mantrakshata_registered_users';

export function getRegisteredUsers(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRegisteredUser(user: UserProfile): void {
  try {
    const registry = getRegisteredUsers();
    const cleanPhone = user.phone.replace(/\D/g, '');
    const normalizedKey = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    if (normalizedKey) {
      registry[normalizedKey] = user;
      localStorage.setItem(STORAGE_USERS_REGISTRY_KEY, JSON.stringify(registry));
    }
  } catch (e) {
    console.error('Failed to save to registered users registry', e);
  }
}

export function findUserProfileByPhone(phone: string): UserProfile | null {
  const cleanPhone = phone.replace(/\D/g, '');
  const normalizedKey = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  if (!normalizedKey) return null;

  // 1. Check current active session
  const active = getUserProfile();
  if (active) {
    const activeClean = active.phone.replace(/\D/g, '');
    const activeKey = activeClean.length === 10 ? `91${activeClean}` : activeClean;
    if (activeKey === normalizedKey && active.name && active.name.trim()) {
      return active;
    }
  }

  // 2. Check registered users registry (persists across logouts and browser sessions)
  const registry = getRegisteredUsers();
  if (registry[normalizedKey] && registry[normalizedKey].name && registry[normalizedKey].name.trim()) {
    return registry[normalizedKey];
  }

  // 3. Fallback: check past bookings for this phone number
  const allBookings = getAllBookings();
  const pastBooking = allBookings.find((b) => {
    const bClean = b.phone.replace(/\D/g, '');
    const bKey = bClean.length === 10 ? `91${bClean}` : bClean;
    return bKey === normalizedKey && b.name && b.name.trim();
  });

  if (pastBooking) {
    const recoveredProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: pastBooking.name.trim(),
      phone: `+${normalizedKey}`,
      isVerified: true,
      demoVerified: true,
      email: pastBooking.email || undefined,
      language: 'English',
      addresses: pastBooking.address
        ? [
            {
              id: `addr_${Date.now()}`,
              label: 'Home',
              address: pastBooking.address,
              landmark: pastBooking.landmark,
              pincode: pastBooking.pincode,
              city: 'Bengaluru'
            }
          ]
        : [],
      notifications: {
        whatsapp: true,
        email: true,
        reminders: true,
        marketing: false
      }
    };
    saveRegisteredUser(recoveredProfile);
    return recoveredProfile;
  }

  return null;
}

// --- User Profile ---
export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserProfile(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    saveRegisteredUser(user);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user_profile_updated', { detail: user }));
    }
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem(STORAGE_USER_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user_profile_updated', { detail: null }));
    }
  } catch (e) {
    console.error('Failed to clear user profile', e);
  }
}

// --- Bookings ---
const STORAGE_ALL_BOOKINGS_KEY = 'mantrakshata_all_bookings';

export function getAllBookings(): BookingPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_ALL_BOOKINGS_KEY);
    if (raw) { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
    const single = getSavedBooking();
    return single ? [single] : [];
  } catch { return []; }
}

export function saveAllBookings(bookings: BookingPlan[]): void {
  try {
    localStorage.setItem(STORAGE_ALL_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save all bookings', e);
  }
}

export function updateBookingInList(updated: BookingPlan): void {
  const all = getAllBookings();
  const idx = all.findIndex(b => b.id === updated.id);
  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.unshift(updated);
  }
  saveAllBookings(all);
  saveBooking(updated);
}

export function getSavedBooking(): BookingPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBooking(plan: BookingPlan): boolean {
  try {
    localStorage.setItem(STORAGE_BOOKING_KEY, JSON.stringify(plan));
    // Also sync to all bookings list
    const all = getAllBookings();
    const idx = all.findIndex(b => b.id === plan.id);
    if (idx >= 0) {
      all[idx] = plan;
    } else {
      all.unshift(plan);
    }
    localStorage.setItem(STORAGE_ALL_BOOKINGS_KEY, JSON.stringify(all));

    // Asynchronously synchronize to Neon Cloud Database
    syncBookingToNeon(plan).catch(err => console.warn('Neon background sync error:', err));
    return true;
  } catch (e) {
    console.error('Failed to save booking', e);
    return false;
  }
}

export function clearBooking(): void {
  localStorage.removeItem(STORAGE_BOOKING_KEY);
}

// --- Family Members ---
export function getFamilyMembers(): FamilyMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_FAMILY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFamilyMember(member: FamilyMember): void {
  try {
    const current = getFamilyMembers();
    const existingIdx = current.findIndex(m => m.id === member.id);
    if (existingIdx >= 0) {
      current[existingIdx] = member;
    } else {
      current.push(member);
    }
    localStorage.setItem(STORAGE_FAMILY_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save family member', e);
  }
}

export function deleteFamilyMember(id: string): void {
  try {
    const current = getFamilyMembers().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_FAMILY_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete family member', e);
  }
}

// --- Notifications ---
export function getNotifications(): NotificationMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotification(msg: NotificationMessage): void {
  try {
    const current = getNotifications();
    current.unshift(msg);
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save notification', e);
  }
}

// --- Gifts ---
export function getSavedGift(): GiftPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_GIFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGift(gift: GiftPlan): boolean {
  try {
    localStorage.setItem(STORAGE_GIFT_KEY, JSON.stringify(gift));
    return true;
  } catch (e) {
    console.error('Failed to save gift', e);
    return false;
  }
}

// --- Direct Gift Store Orders ---
export interface GiftOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand?: 'Mantrakshata' | 'HAVIKAR';
}

export interface GiftOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  recipientName?: string;
  giftMessage?: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  items: GiftOrderItem[];
  boxPackaging: boolean;
  boxPrice: number;
  totalAmount: number;
  paymentId: string;
  status: 'draft' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
}

const STORAGE_GIFT_ORDERS_KEY = 'mantrakshata_gift_orders';

export function getGiftOrders(): GiftOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_GIFT_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

export function saveGiftOrder(order: GiftOrder): boolean {
  try {
    const current = getGiftOrders();
    current.unshift(order);
    localStorage.setItem(STORAGE_GIFT_ORDERS_KEY, JSON.stringify(current));

    // Asynchronously synchronize to Neon Cloud Database
    syncGiftOrderToNeon(order).catch(err => console.warn('Neon gift sync error:', err));
    return true;
  } catch (e) {
    console.error('Failed to save gift order', e);
    return false;
  }
}

export function updateGiftOrderStatus(
  orderId: string, 
  status: 'paid' | 'shipped' | 'delivered', 
  trackingNumber?: string
): void {
  try {
    const orders = getGiftOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = status;
      if (trackingNumber) {
        (orders[idx] as any).trackingNumber = trackingNumber;
      }
      localStorage.setItem(STORAGE_GIFT_ORDERS_KEY, JSON.stringify(orders));

      // Asynchronously synchronize to Neon Cloud Database
      syncGiftOrderToNeon(orders[idx]).catch(err => console.warn('Neon gift update error:', err));
    }
  } catch (e) {
    console.error('Failed to update gift order status', e);
  }
}

