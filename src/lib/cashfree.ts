/**
 * Cashfree Payment Gateway Client Integration
 * Loads Cashfree JS SDK v3, creates orders, opens modal checkout, and verifies payments.
 */

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => any;
  }
}

let cashfreePromise: Promise<boolean> | null = null;

export function loadCashfreeScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Cashfree) return Promise.resolve(true);
  if (cashfreePromise) return cashfreePromise;

  cashfreePromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Cashfree SDK from sdk.cashfree.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return cashfreePromise;
}

export interface CashfreeOrderResult {
  ok: boolean;
  orderId?: string;
  paymentSessionId?: string;
  amount?: number;
  currency?: string;
  gateway?: string;
  error?: string;
}

export interface CashfreeVerifyResult {
  ok: boolean;
  verified?: boolean;
  paymentId?: string;
  orderId?: string;
  status?: string;
  error?: string;
}

export async function createCashfreeOrder(params: {
  targetId: string;
  kind?: 'booking' | 'gift';
}): Promise<CashfreeOrderResult> {
  try {
    const res = await fetch('/api/cashfree/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error requesting payment order' };
  }
}

export async function verifyCashfreePayment(params: {
  orderId: string;
}): Promise<CashfreeVerifyResult> {
  try {
    const res = await fetch('/api/cashfree/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error verifying payment' };
  }
}

export interface LaunchCashfreeOptions {
  kind?: 'booking' | 'gift';
  bookingId: string;
  packageName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess: (result: { paymentId: string; orderId: string; signature: string }) => void;
  onFailure: (errorMessage: string) => void;
  onDismiss?: () => void;
}

export async function launchCashfreeWithOrder(order: any, options: LaunchCashfreeOptions): Promise<void> {
  try {
    if (!order.paymentSessionId) {
      throw new Error('Payment session is missing from order. Please try again.');
    }
    const loaded = await loadCashfreeScript();
    if (!loaded || !window.Cashfree) {
      throw new Error('Payment gateway could not load. Please check your network and try again.');
    }

    const mode = (import.meta.env.VITE_CASHFREE_ENV === 'sandbox' ? 'sandbox' : 'production') as 'sandbox' | 'production';
    const cashfree = window.Cashfree({ mode });

    const result = await cashfree.checkout({
      paymentSessionId: order.paymentSessionId,
      redirectTarget: '_modal'
    });

    if (result?.error) {
      options.onFailure(result.error.message || 'Payment was cancelled or failed.');
      return;
    }

    if (result?.redirect) {
      return;
    }

    // Modal closed or payment completed; verify authoritative status on server
    const vRes = await fetch('/api/cashfree/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.orderId })
    });
    const data = await vRes.json();
    if (!vRes.ok || !data.verified) {
      throw new Error(data.error || 'Payment verification is pending. Check your dashboard before paying again.');
    }
    if (!['confirmed', 'completed', 'paid', 'packed', 'shipped', 'delivered'].includes(data.status)) {
      throw new Error('Payment received but the request needs staff review. Do not pay again; contact hello@bhatco.com.');
    }
    options.onSuccess({
      paymentId: data.paymentId || order.orderId,
      orderId: data.orderId || order.orderId,
      signature: ''
    });
  } catch (e: any) {
    options.onFailure(e.message || 'Payment verification pending. Please refresh your page.');
  }
}

export async function launchCashfreeCheckout(options: LaunchCashfreeOptions): Promise<void> {
  try {
    const response = await fetch('/api/payments/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId: options.bookingId, kind: options.kind || 'booking' })
    });
    const order = await response.json();
    if (!response.ok || !order.orderId) {
      throw new Error(order.error || 'Could not create your payment order.');
    }
    await launchCashfreeWithOrder(order, options);
  } catch (e: any) {
    options.onFailure(e.message || 'Could not start payment checkout.');
  }
}
