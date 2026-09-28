/**
 * Razorpay Payment Gateway Client Integration
 * Securely loads official Razorpay Checkout SDK, creates orders,
 * opens the payment modal, and verifies payments against server API.
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Dynamically loads the Razorpay checkout.js script if not already present in the DOM.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from checkout.razorpay.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayOrderResult {
  ok: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  receipt?: string;
  keyId?: string;
  error?: string;
}

export interface RazorpayVerifyResult {
  ok: boolean;
  verified?: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

/**
 * Calls server API route to generate a real Razorpay Order ID
 */
export async function createRazorpayOrder(params: {
  bookingId: string;
  amount: number;
  packageName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  userId?: string;
}): Promise<RazorpayOrderResult> {
  try {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error requesting Razorpay order' };
  }
}

/**
 * Calls server API route to verify Razorpay HMAC-SHA256 signature
 */
export async function verifyRazorpayPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId?: string;
  userId?: string;
}): Promise<RazorpayVerifyResult> {
  try {
    const res = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error verifying Razorpay payment' };
  }
}

export interface LaunchRazorpayOptions {
  bookingId: string;
  amount: number; // in rupees
  packageName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  userId?: string;
  onSuccess: (result: { paymentId: string; orderId: string; signature: string }) => void;
  onFailure: (errorMessage: string) => void;
  onDismiss?: () => void;
}

/**
 * High-level helper to execute end-to-end Razorpay checkout:
 * 1. Loads SDK
 * 2. Creates order on server
 * 3. Opens Razorpay modal
 * 4. Verifies signature on server
 * 5. Calls onSuccess callback
 */
export async function launchRazorpayCheckout(options: LaunchRazorpayOptions): Promise<void> {
  const {
    bookingId,
    amount,
    packageName,
    customerName,
    customerPhone,
    customerEmail,
    userId,
    onSuccess,
    onFailure,
    onDismiss
  } = options;

  // 1. Ensure Razorpay SDK is loaded
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded || typeof window.Razorpay === 'undefined') {
    onFailure('Razorpay payment gateway script could not be loaded. Please check your internet connection or ad-blocker.');
    return;
  }

  // 2. Generate Razorpay Order
  const orderRes = await createRazorpayOrder({
    bookingId,
    amount,
    packageName,
    customerName,
    customerPhone,
    customerEmail,
    userId
  });

  if (!orderRes.ok || !orderRes.orderId || !orderRes.keyId) {
    onFailure(orderRes.error || 'Could not initiate Razorpay order. Please try again.');
    return;
  }

  const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

  // 3. Configure Razorpay modal
  const rzpOptions = {
    key: orderRes.keyId,
    amount: orderRes.amount,
    currency: orderRes.currency || 'INR',
    name: 'Mantrakshata',
    description: `${packageName} — Booking #${bookingId}`,
    order_id: orderRes.orderId,
    image: '/assets/logo.png',
    prefill: {
      name: customerName,
      contact: cleanPhone ? '+91' + cleanPhone : undefined,
      email: customerEmail || undefined
    },
    theme: {
      color: '#0C2340'
    },
    notes: {
      booking_id: bookingId,
      user_id: userId || ''
    },
    handler: async function (response: any) {
      if (!response.razorpay_payment_id || !response.razorpay_order_id) {
        onFailure('Incomplete payment response received from Razorpay.');
        return;
      }

      // 4. Verify payment on server
      const verifyRes = await verifyRazorpayPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        bookingId,
        userId
      });

      if (verifyRes.ok && verifyRes.verified) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        });
      } else {
        onFailure(verifyRes.error || 'Payment signature verification failed.');
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      }
    }
  };

  try {
    const rzpInstance = new window.Razorpay(rzpOptions);
    rzpInstance.on('payment.failed', function (resp: any) {
      console.warn('Razorpay payment failure event:', resp.error);
      onFailure(resp.error?.description || 'Payment was unsuccessful or cancelled.');
    });
    rzpInstance.open();
  } catch (err: any) {
    console.error('Failed to open Razorpay modal:', err);
    onFailure(err?.message || 'Could not launch Razorpay checkout modal.');
  }
}
