import { lifecycleTemplates } from './whatsappTemplates';
/**
 * Mantrakshata WhatsApp Automation Engine
 * Handles real-time message templates, dispatch pipeline, dynamic action links,
 * and customer/Acharya lifecycle coordination.
 */

import { BookingPlan, getSavedBooking, getAllBookings, saveBooking } from './store';
import { ACHARYA_SCHOLARS, AcharyaScholar } from './content';
import { logWhatsAppToNeon, syncBookingToNeon } from './db';

export type WhatsAppMessageType =
  | 'otp'
  | 'welcome_catalog'
  | 'booking_confirmed'
  | 'acharya_alert'
  | 'acharya_assigned'
  | 'acharya_order'
  | 'reminder_1day'
  | 'morning_stream'
  | 'completed_thankyou';

export interface WhatsAppMessage {
  id: string;
  bookingId?: string;
  recipientPhone: string;
  recipientName: string;
  recipientRole: 'customer' | 'admin' | 'acharya';
  type: WhatsAppMessageType;
  title: string;
  body: string;
  sentAt: string;
  status: 'draft' | 'sent' | 'delivered' | 'read';
  dynamicLink?: string;
  actionRequired?: boolean;
  actionCompleted?: boolean;
}

const STORAGE_WHATSAPP_KEY = 'mantrakshata_whatsapp_messages';

export function getWhatsAppMessages(): WhatsAppMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_WHATSAPP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWhatsAppMessage(msg: WhatsAppMessage): void {
  try {
    const current = getWhatsAppMessages();
    current.unshift({ ...msg, status: msg.status || 'draft' });
    localStorage.setItem(STORAGE_WHATSAPP_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save WhatsApp message', e);
  }
}

export function updateWhatsAppMessageStatus(id: string, status: 'draft' | 'sent' | 'delivered' | 'read'): void {
  try {
    const current = getWhatsAppMessages();
    const target = current.find((m) => m.id === id);
    if (target) {
      target.status = status;
      localStorage.setItem(STORAGE_WHATSAPP_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Failed to update WhatsApp message status', e);
  }
}

export function clearWhatsAppMessages(): void {
  localStorage.removeItem(STORAGE_WHATSAPP_KEY);
}

/**
 * 1. Dispatch OTP Verification Code (Exact Meta Approved Template Format)
 */
export function sendOtpMessage(phone: string, code = '1008'): WhatsAppMessage {
  const msg: WhatsAppMessage = {
    id: `WA-OTP-${Date.now()}`,
    recipientPhone: phone,
    recipientName: 'Customer',
    recipientRole: 'customer',
    type: 'otp',
    title: 'Verification Code (OTP)',
    body: `OTP Code: ${code}. This is your OTP for Verification. The OTP is valid for 10 mins. Call +91 82969 25577 if you did not perform this request.`,
    sentAt: new Date().toISOString(),
    status: 'draft'
  };
  saveWhatsAppMessage(msg);

  dispatchMetaCloudTemplate(
    phone,
    'hav_otp1',
    [code, 'Verification', '10 mins', '918296925577'],
    code
  )
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('OTP dispatch failed:', res.error);
    })
    .catch((err) => console.warn('OTP dispatch error:', err));

  return msg;
}

/**
 * Format venue address combined with Google Maps pin/link
 */
export function formatVenueWithMaps(booking: BookingPlan): string {
  const parts: string[] = [booking.address];
  if (booking.landmark) {
    parts.push(`Near ${booking.landmark}`);
  }
  if (booking.pincode) {
    parts.push(`Bengaluru - ${booking.pincode}`);
  }
  if (booking.mapsLink && booking.mapsLink.trim()) {
    parts.push(`Google Maps: ${booking.mapsLink.trim()}`);
  }
  return parts.join(', ');
}

/**
 * Dispatch Official Booking Assignment Order Directly to the Assigned Pandit
 */
export function sendAcharyaOrderDispatchMessage(booking: BookingPlan, acharya: AcharyaScholar, customPhone?: string): WhatsAppMessage {
  const targetPhone = customPhone || acharya.phone || '+91 98450 88002';
  const venue = formatVenueWithMaps(booking);
  const sankalpaDetails = `Gotra: ${booking.gotra || 'Kashyapa'}, Nakshatra: ${booking.nakshatra || 'Chitra'}, Pada: ${booking.pada || 1}`;
  const specialInstructions = 'Arrive 30 mins prior with sacred patras and samagri. Celebrant family will prepare fruits and deepa mane.';

  const msg: WhatsAppMessage = {
    id: `WA-ACHARYA-ORDER-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: targetPhone,
    recipientName: acharya.name,
    recipientRole: 'acharya',
    type: 'acharya_order',
    title: 'Pandit Booking Details & Schedule',
    body: `Namaskara Pandit ${acharya.name}, Main Acharya has assigned this Vardhantotsava to you.\n\nBooking ID: ${booking.id}\nCelebrant: ${booking.name}\nCustomer contact: ${booking.phone}\nDate: ${booking.celebrationDate}\nCeremony time: ${booking.timeSlot} IST\nArrival time: 07:00 AM IST\nVenue: ${venue}\nRitual / package: ${booking.packageName}\nSankalpa details: ${sankalpaDetails}\nSpecial instructions: ${specialInstructions}\n\nPlease review the details and contact the Main Acharya promptly if you cannot attend.`,
    dynamicLink: `/portal?id=${booking.id}`,
    actionRequired: true,
    actionCompleted: false,
    sentAt: new Date().toISOString(),
    status: 'draft'
  };
  saveWhatsAppMessage(msg);

  const params = [
    acharya.name,
    booking.id,
    booking.name,
    booking.phone,
    booking.celebrationDate,
    `${booking.timeSlot} IST`,
    '07:00 AM IST',
    venue,
    booking.packageName,
    sankalpaDetails,
    specialInstructions
  ];

  dispatchMetaCloudTemplate(targetPhone, 'mantrakshata_pandit_booking_details', params)
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('Pandit booking dispatch failed:', res.error);
    })
    .catch((err) => console.warn('Pandit booking dispatch error:', err));

  return msg;
}

/**
 * 2. Welcome & Products Catalog (Post-Verification)
 */
export function sendWelcomeCatalogMessage(phone: string, name: string): WhatsAppMessage {
  const msg: WhatsAppMessage = {
    id: `WA-WELCOME-${Date.now()}`,
    recipientPhone: phone,
    recipientName: name,
    recipientRole: 'customer',
    type: 'welcome_catalog',
    title: 'Welcome to Mantrakshata',
    body: `Namaskara ${name}, welcome to Mantrakshata. Your mobile number has been verified. In Havikar tradition, every birthday is celebrated with Vedic blessings, consecrated Sandalwood bracelets, and sacred fire. Tap the button below to explore our authentic offerings and sacred keepsakes.`,
    sentAt: new Date().toISOString(),
    status: 'draft',
    dynamicLink: '/gifts'
  };
  saveWhatsAppMessage(msg);

  dispatchMetaCloudTemplate(phone, 'mantrakshata_welcome_catalog', [name])
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('Welcome catalog dispatch failed:', res.error);
    })
    .catch((err) => console.warn('Welcome catalog dispatch error:', err));

  return msg;
}

/**
 * 3. Booking Confirmation to Customer
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://www.mantrakshata.com';
}

export function sendBookingConfirmedMessage(booking: BookingPlan): WhatsAppMessage {
  const customerBookingUrl = `${getBaseUrl()}/dashboard?bookingId=${booking.id}`;
  const msg: WhatsAppMessage = {
    id: `WA-CONFIRM-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: booking.phone,
    recipientName: booking.name,
    recipientRole: 'customer',
    type: 'booking_confirmed',
    title: 'Vardhantotsava Booking Confirmed',
    body: `Shubhamastu ${booking.name}! Your Vardhantotsava celebration booking #${booking.id} for ${booking.name} (Gotra: ${booking.gotra || 'Kashyapa'}, Nakshatra: ${booking.nakshatra || 'Chitra'}) is confirmed for ${booking.celebrationDate} during ${booking.timeSlot}. Selected Package: ${booking.packageName}. Our Chief Vedic Coordinator is assigning an initiated Acharya. View details: ${customerBookingUrl}\nThank You`,
    sentAt: new Date().toISOString(),
    status: 'draft',
    dynamicLink: `/portal?id=${booking.id}`
  };
  saveWhatsAppMessage(msg);

  const params = [
    booking.name,
    booking.id,
    booking.name,
    booking.gotra || 'Kashyapa',
    booking.nakshatra || 'Chitra',
    booking.celebrationDate,
    booking.timeSlot,
    booking.packageName,
    customerBookingUrl
  ];

  dispatchMetaCloudTemplate(booking.phone, 'mantrakshata_booking_confirmed', params)
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('Booking confirmed WhatsApp dispatch failed:', res.error);
    })
    .catch((err) => console.warn('Booking confirmed WhatsApp dispatch error:', err));

  return msg;
}

/**
 * 4. Alert to Main Acharya to Assign Pandit
 */
export function sendAcharyaAlertMessage(booking: BookingPlan): WhatsAppMessage {
  const venue = formatVenueWithMaps(booking);
  const dynamicLink = `/acharya/assign?bookingId=${booking.id}`;
  const creds = getWhatsAppCredentials();
  const primaryAdminPhone = creds.adminPhones?.[0] || '919902045009';

  const msg: WhatsAppMessage = {
    id: `WA-ALERT-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: primaryAdminPhone,
    recipientName: 'Vedamurthy Sri Narayan Bhat (Main Acharya)',
    recipientRole: 'acharya',
    type: 'acharya_alert',
    title: 'Assign Pandit for Confirmed Vardhantotsava',
    body: `Namaskara Acharya Vedamurthy Sri Narayan Bhat, please assign a Pandit for this confirmed Vardhantotsava.\n\nBooking ID: ${booking.id}\nCelebrant: ${booking.name}\nDate: ${booking.celebrationDate}\nTime: ${booking.timeSlot} IST\nRitual / package: ${booking.packageName}\nVenue: ${venue}\n\nTap Assign Pandit below. Enter the Pandit's name, WhatsApp number and expected arrival time, then confirm the assignment.\n\n— Mantrakshata Coordination`,
    dynamicLink,
    actionRequired: true,
    actionCompleted: false,
    sentAt: new Date().toISOString(),
    status: 'draft'
  };
  saveWhatsAppMessage(msg);

  const params = [
    'Vedamurthy Sri Narayan Bhat',
    booking.id,
    booking.name,
    booking.celebrationDate,
    `${booking.timeSlot} IST`,
    booking.packageName,
    venue
  ];

  const targetPhones = creds.adminPhones && creds.adminPhones.length > 0 ? creds.adminPhones : [primaryAdminPhone];
  targetPhones.forEach((phone) => {
    dispatchMetaCloudTemplate(phone, 'mantrakshata_main_acharya_assignment', params, booking.id)
      .then((res) => {
        if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
        else console.warn(`Acharya alert dispatch to ${phone} failed:`, res.error);
      })
      .catch((err) => console.warn('Acharya alert dispatch error:', err));
  });

  return msg;
}

/**
 * 5. Customer Notification with Pandit Details
 */
export function sendAcharyaAssignedMessage(booking: BookingPlan, acharya: AcharyaScholar): WhatsAppMessage {
  const msg: WhatsAppMessage = {
    id: `WA-ASSIGNED-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: booking.phone,
    recipientName: booking.name,
    recipientRole: 'customer',
    type: 'acharya_assigned',
    title: 'Pandit Assigned Details',
    body: `Namaskara ${booking.name}, your Pandit has been assigned for the Vardhantotsava.\n\nBooking ID: ${booking.id}\nPandit: ${acharya.name}\nContact: ${acharya.phone}\nDate: ${booking.celebrationDate}\nCeremony time: ${booking.timeSlot} IST\nExpected arrival: 07:00 AM IST\n\nPlease keep your phone available for coordination. Reply here if you need help.`,
    sentAt: new Date().toISOString(),
    status: 'draft',
    dynamicLink: `/portal?id=${booking.id}`
  };
  saveWhatsAppMessage(msg);

  const params = [
    booking.name,
    booking.id,
    acharya.name,
    acharya.phone,
    booking.celebrationDate,
    `${booking.timeSlot} IST`,
    '07:00 AM IST'
  ];

  dispatchMetaCloudTemplate(booking.phone, 'mantrakshata_customer_pandit_details', params)
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('Customer Pandit details dispatch failed:', res.error);
    })
    .catch((err) => console.warn('Customer Pandit details dispatch error:', err));

  return msg;
}

/**
 * 6. 1 Day Before Reminder & Home Checklist
 */
export function sendOneDayReminderMessage(booking: BookingPlan, acharya?: AcharyaScholar): WhatsAppMessage {
  const venue = formatVenueWithMaps(booking);
  const preparationChecklist = 'Clean prayer space, low seating mane, brass deepa plate, 5 bananas, fresh loose flowers, celebrant bathed & ready in traditional vastra 15 mins prior.';

  const msg: WhatsAppMessage = {
    id: `WA-REMIND-1D-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: booking.phone,
    recipientName: booking.name,
    recipientRole: 'customer',
    type: 'reminder_1day',
    title: '1-Day Before Reminder & Preparation Checklist',
    body: `Namaskara ${booking.name}, a reminder that ${booking.name}'s Vardhantotsava is scheduled for ${booking.celebrationDate} at ${booking.timeSlot} IST.\n\nBooking ID: ${booking.id}\nVenue: ${venue}\nPreparation checklist: ${preparationChecklist}\n\nPlease keep the space ready and inform us of any changes. We look forward to celebrating with your family.`,
    sentAt: new Date().toISOString(),
    status: 'draft'
  };
  saveWhatsAppMessage(msg);

  const params = [
    booking.name,
    booking.name,
    booking.celebrationDate,
    `${booking.timeSlot} IST`,
    booking.id,
    venue,
    acharya?.name || 'Vedamurthy Sri Narayan Bhat'
  ];

  dispatchMetaCloudTemplate(booking.phone, 'mantrakshata_reminder_1day', params)
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('1-Day reminder dispatch failed:', res.error);
    })
    .catch((err) => console.warn('1-Day reminder dispatch error:', err));

  return msg;
}

/**
 * 7. 2 Hours Before Reminder
 */
export function sendTwoHourReminderMessage(booking: BookingPlan): WhatsAppMessage {
  const venue = formatVenueWithMaps(booking);
  const msg: WhatsAppMessage = {
    id: `WA-REMIND-2H-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: booking.phone,
    recipientName: booking.name,
    recipientRole: 'customer',
    type: 'reminder_1day',
    title: '2 Hours Before Ceremony Reminder',
    body: `Namaskara ${booking.name}, ${booking.name}'s Vardhantotsava begins in 2 hours, at ${booking.timeSlot} IST.\n\nBooking ID: ${booking.id}\nVenue: ${venue}\n\nPlease have the family and preparation items ready, and keep your phone available for coordination. Reply here if you need assistance.`,
    sentAt: new Date().toISOString(),
    status: 'draft'
  };
  saveWhatsAppMessage(msg);

  const params = [
    booking.name,
    booking.name,
    `${booking.timeSlot} IST`,
    booking.id,
    venue
  ];

  dispatchMetaCloudTemplate(booking.phone, 'mantrakshata_reminder_2hours', params)
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('2-Hour reminder dispatch failed:', res.error);
    })
    .catch((err) => console.warn('2-Hour reminder dispatch error:', err));

  return msg;
}

/**
 * 8. Morning of Ceremony & Private Family Livestream Link
 */
export function sendMorningStreamMessage(booking: BookingPlan, acharya: AcharyaScholar): WhatsAppMessage {
  const msg: WhatsAppMessage = {
    id: `WA-STREAM-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: booking.phone,
    recipientName: booking.name,
    recipientRole: 'customer',
    type: 'morning_stream',
    title: 'Ayushya Homa Livestream',
    body: `Shubhodaya ${booking.name}! May this auspicious day bring abundant health, longevity, and spiritual peace.\n\nAcharya ${acharya.name} is on the way to your residence.\n\nPrivate Family Broadcast Link:\nhttps://www.mantrakshata.com/portal?id=${booking.id}`,
    sentAt: new Date().toISOString(),
    status: 'draft'
  };
  saveWhatsAppMessage(msg);
  return msg;
}

/**
 * 9. Next-Day Follow-Up & Experience Review
 */
export function sendNextDayFollowupMessage(booking: BookingPlan): WhatsAppMessage {
  const msg: WhatsAppMessage = {
    id: `WA-FOLLOWUP-${Date.now()}`,
    bookingId: booking.id,
    recipientPhone: booking.phone,
    recipientName: booking.name,
    recipientRole: 'customer',
    type: 'completed_thankyou',
    title: 'Next-Day Experience Follow-up',
    body: `Namaskara ${booking.name}, thank you for celebrating ${booking.name}'s Vardhantotsava with Mantrakshata. We hope the ceremony brought joy and blessings to your family.\n\nBooking ID: ${booking.id}\nHow was your experience? Please reply with your feedback or any support you need.\n\nReply STOP to stop feedback messages.`,
    sentAt: new Date().toISOString(),
    status: 'draft'
  };
  saveWhatsAppMessage(msg);

  const params = [
    booking.name,
    booking.name,
    booking.id
  ];

  dispatchMetaCloudTemplate(booking.phone, 'mantrakshata_next_day_followup', params)
    .then((res) => {
      if (res.ok) updateWhatsAppMessageStatus(msg.id, 'sent');
      else console.warn('Next day followup dispatch failed:', res.error);
    })
    .catch((err) => console.warn('Next day followup dispatch error:', err));

  return msg;
}

/**
 * Legacy Completion Thank You
 */
export function sendCompletionThankYouMessage(booking: BookingPlan): WhatsAppMessage {
  return sendNextDayFollowupMessage(booking);
}

/**
 * Execute the Dynamic Link Action when Main Acharya taps "Accept & Assign"
 */
export function executeAcharyaAssignment(bookingId: string, acharyaId = 'acharya-1', customPhone?: string): boolean {
  const booking = getAllBookings().find(item => item.id === bookingId);
  if (!booking) return false;

  const acharya = ACHARYA_SCHOLARS.find((a) => a.id === acharyaId);
  if (!acharya) return false;

  // 1. Update Booking state
  const updatedBooking: BookingPlan = {
    ...booking,
    assignedPanditId: acharya.id,
    status: booking.status
  };
  saveBooking(updatedBooking);
  syncBookingToNeon(updatedBooking).catch((e) => console.warn('Neon sync error:', e));

  // 2. Mark the alert message action as completed
  const messages = getWhatsAppMessages();
  const alertMsg = messages.find(m => m.bookingId === bookingId && m.type === 'acharya_alert');
  if (alertMsg) {
    alertMsg.actionCompleted = true;
    localStorage.setItem(STORAGE_WHATSAPP_KEY, JSON.stringify(messages));
  }

  // 3. Dispatch official ceremony assignment order directly to the assigned Acharya's phone!
  sendAcharyaOrderDispatchMessage(updatedBooking, acharya, customPhone);

  // 4. Dispatch the update message to the customer with Acharya details
  sendAcharyaAssignedMessage(updatedBooking, acharya);

  return true;
}

/**
 * Generate click-to-chat real WhatsApp Web / App link
 */
export function getWhatsAppShareLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const urlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${urlPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Meta Business Cloud API Official Template Specifications with {{1}}, {{2}} Numbered Variables
 */
export interface MetaTemplateVariable {
  position: string;
  name: string;
  description: string;
  sample: string;
}

export interface MetaTemplateButton {
  type: 'URL' | 'QUICK_REPLY' | 'COPY_CODE';
  text: string;
  url?: string;
}

export interface MetaTemplateSpec {
  name: string;
  category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
  language: string;
  header?: string;
  body: string;
  buttons?: MetaTemplateButton[];
  variables: MetaTemplateVariable[];
  variableKeys: string[];
  sampleVariables: string[];
  purpose: string;
}

export const META_WHATSAPP_TEMPLATES: MetaTemplateSpec[] = lifecycleTemplates as MetaTemplateSpec[];

export interface WhatsAppCredentials {
  phoneNumberId: string;
  wabaId: string;
  token: string;
  adminPhones: string[];
}

const DEFAULT_WA_CREDS: WhatsAppCredentials = {
  phoneNumberId: '1337239006142926',
  wabaId: '2192002941638802',
  token: 'EAA3srEndgnwBSoBJqylF683YKswnIEOeYC1aGFYE2MHu8rBVGHLDhvx5MfucH3ISPm06x40A7FAiKALrkFWc7BlB9VAEvjvnPtkC8HNE6USZBLcPhaZAux4ykwZBuYlfTV8pzm3R11H0ZABhFGZB7hgkAUMRTWQtCU7ZBbeU88zgead9ch36CZCZC8ZBr6h2TYS7YtQZDZD',
  adminPhones: ['919902045009']
};

export function getWhatsAppCredentials(): WhatsAppCredentials {
  if (typeof window === 'undefined') return DEFAULT_WA_CREDS;
  try {
    const raw = localStorage.getItem('mantrakshata_whatsapp_creds');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        phoneNumberId: parsed.phoneNumberId || DEFAULT_WA_CREDS.phoneNumberId,
        wabaId: parsed.wabaId || DEFAULT_WA_CREDS.wabaId,
        token: parsed.token || DEFAULT_WA_CREDS.token,
        adminPhones: parsed.adminPhones?.length ? parsed.adminPhones : DEFAULT_WA_CREDS.adminPhones,
      };
    }
  } catch (e) {
    // fallback to defaults
  }
  return DEFAULT_WA_CREDS;
}

export function saveWhatsAppCredentials(creds: Partial<WhatsAppCredentials>): void {
  if (typeof window === 'undefined') return;
  const current = getWhatsAppCredentials();
  const updated = { ...current, ...creds };
  localStorage.setItem('mantrakshata_whatsapp_creds', JSON.stringify(updated));
}

export interface TemplateMetaDefinition {
  name: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  bodyVarCount: number;
  hasDynamicButton: boolean;
  buttonType?: 'url' | 'copy_code';
}

export const META_APPROVED_SCHEMAS: Record<string, TemplateMetaDefinition> = {
  mantrakshata_booking_confirmed: {
    name: 'mantrakshata_booking_confirmed',
    language: 'en',
    status: 'APPROVED',
    bodyVarCount: 9,
    hasDynamicButton: false
  },
  mantrakshata_main_acharya_assignment: {
    name: 'mantrakshata_main_acharya_assignment',
    language: 'en',
    status: 'APPROVED',
    bodyVarCount: 7,
    hasDynamicButton: true,
    buttonType: 'url'
  },
  mantrakshata_welcome_catalog: {
    name: 'mantrakshata_welcome_catalog',
    language: 'en',
    status: 'APPROVED',
    bodyVarCount: 1,
    hasDynamicButton: false
  },
  mantrakshata_pandit_booking_details: {
    name: 'mantrakshata_pandit_booking_details',
    language: 'en',
    status: 'APPROVED',
    bodyVarCount: 11,
    hasDynamicButton: false
  },
  hav_otp1: {
    name: 'hav_otp1',
    language: 'en_US',
    status: 'APPROVED',
    bodyVarCount: 4,
    hasDynamicButton: true,
    buttonType: 'url'
  },
  mantrakshata_customer_pandit_details: {
    name: 'mantrakshata_customer_pandit_details',
    language: 'en',
    status: 'PENDING',
    bodyVarCount: 7,
    hasDynamicButton: false
  },
  mantrakshata_reminder_1day: {
    name: 'mantrakshata_reminder_1day',
    language: 'en',
    status: 'PENDING',
    bodyVarCount: 7,
    hasDynamicButton: false
  },
  mantrakshata_reminder_2hours: {
    name: 'mantrakshata_reminder_2hours',
    language: 'en',
    status: 'PENDING',
    bodyVarCount: 5,
    hasDynamicButton: false
  },
  mantrakshata_next_day_followup: {
    name: 'mantrakshata_next_day_followup',
    language: 'en',
    status: 'APPROVED',
    bodyVarCount: 3,
    hasDynamicButton: false
  }
};

export async function dispatchMetaCloudTemplate(
  to: string,
  name: string,
  parameters: string[],
  button?: string
): Promise<{ ok: boolean; messageId?: string; error?: string; raw?: any }> {
  const cleanTo = to.replace(/\D/g, '');
  const formattedTo = cleanTo.length === 10 ? '91' + cleanTo : cleanTo;

  // 1. Try local server-side API proxy route first
  try {
    const apiRes = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: formattedTo,
        templateName: name,
        parameters,
        buttonParam: button
      })
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.ok) return { ok: true, messageId: data.messageId, raw: data };
    }
  } catch (e) {
    // Continue to direct dispatch fallback
  }

  // 2. Direct Meta Graph API call fallback
  try {
    const creds = getWhatsAppCredentials();
    const token = creds.token || DEFAULT_WA_CREDS.token;
    const phoneId = creds.phoneNumberId || DEFAULT_WA_CREDS.phoneNumberId;

    const isEnUs = name === 'hav_otp1' || name === 'samuha_confirmation' || name === 'hello_world';
    const langCode = isEnUs ? 'en_US' : 'en';

    const components: any[] = [];
    if (name === 'hav_otp1') {
      const code = String(parameters[0] || '123456');
      components.push({
        type: 'body',
        parameters: [
          { type: 'text', text: code },
          { type: 'text', text: String(parameters[1] || 'Verification') },
          { type: 'text', text: String(parameters[2] || '10 mins') },
          { type: 'text', text: String(parameters[3] || '918296925577') }
        ]
      });
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: code }]
      });
    } else {
      if (parameters.length > 0) {
        components.push({
          type: 'body',
          parameters: parameters.map(p => ({ type: 'text', text: String(p ?? '') }))
        });
      }
      if (button) {
        components.push({
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: String(button) }]
        });
      }
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedTo,
      type: 'template',
      template: {
        name,
        language: { code: langCode },
        components
      }
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('Meta WhatsApp direct API rejection:', data);
      return { ok: false, error: data.error?.message || 'Meta API rejected dispatch', raw: data };
    }

    return {
      ok: true,
      messageId: data.messages?.[0]?.id,
      raw: data
    };
  } catch (err: any) {
    console.error('Meta WhatsApp dispatch error:', err);
    return { ok: false, error: err?.message || 'Failed to dispatch Meta message' };
  }
}

export async function registerPhoneNumberPin(pin: string): Promise<{ ok: boolean; error?: string; raw?: any }> {
  const creds = getWhatsAppCredentials();
  const token = creds.token || DEFAULT_WA_CREDS.token;
  const phoneId = creds.phoneNumberId || DEFAULT_WA_CREDS.phoneNumberId;
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', pin })
    });
    const data = await res.json();
    return { ok: res.ok, error: data.error?.message, raw: data };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}

export async function fetchMetaPhoneNumberStatus(): Promise<any> {
  const creds = getWhatsAppCredentials();
  const token = creds.token || DEFAULT_WA_CREDS.token;
  const phoneId = creds.phoneNumberId || DEFAULT_WA_CREDS.phoneNumberId;
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      return {
        ok: true,
        verifiedName: data.verified_name,
        displayPhoneNumber: data.display_phone_number,
        qualityRating: data.quality_rating,
        codeVerificationStatus: data.code_verification_status
      };
    }
    return { ok: false, error: data.error?.message || 'Failed to fetch status' };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}
