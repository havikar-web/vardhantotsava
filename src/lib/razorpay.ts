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
  kind?: 'booking' | 'gift';
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
  kind?: 'booking' | 'gift';
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
  try {
    const response=await fetch('/api/razorpay/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetId:options.bookingId,kind:options.kind||'booking'})});
    const order=await response.json();
    if(!response.ok||!order.orderId)throw new Error(order.error||'Could not create your payment order.');
    if(!await loadRazorpayScript())throw new Error('Payment checkout could not load. Please try again.');
    const checkout=new window.Razorpay({key:order.keyId,order_id:order.orderId,amount:order.amount,currency:order.currency,name:'Mantrakshata',description:options.packageName,
      prefill:{name:options.customerName,contact:options.customerPhone,email:options.customerEmail||''},notes:{booking_id:options.kind==='gift'?'':options.bookingId,target_id:options.bookingId},
      modal:{ondismiss:()=>options.onDismiss?.()},handler:async(result:any)=>{
        try{const r=await fetch('/api/razorpay/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result)});const data=await r.json();if(!r.ok||!data.verified)throw new Error(data.error||'Payment verification is pending. Check your dashboard before paying again.');if(!['confirmed','completed','paid','packed','shipped','delivered'].includes(data.status))throw new Error('Payment received but the request needs staff review. Do not pay again; contact hello@bhatco.com.');options.onSuccess({paymentId:data.paymentId,orderId:data.orderId,signature:result.razorpay_signature});}catch(e:any){options.onFailure(e.message||'Payment verification is pending. Check your dashboard before paying again.');}
      }});
    checkout.on('payment.failed',()=>options.onFailure('Payment was not completed. Your request is still unpaid.'));
    checkout.open();
  }catch(e:any){options.onFailure(e.message||'Could not start checkout.');}
}
