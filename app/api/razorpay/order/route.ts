import { NextResponse } from 'next/server';

const DEFAULT_KEY_ID = 'rzp_test_TM656gFCGoH0nD';
const DEFAULT_KEY_SECRET = '30BQTyuKu3OKLkzcp68ZxHPx';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount,
      currency = 'INR',
      receipt,
      bookingId,
      userId,
      customerName,
      customerPhone,
      customerEmail,
      notes = {}
    } = body;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || DEFAULT_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { ok: false, error: 'Razorpay API credentials not configured' },
        { status: 500 }
      );
    }

    // Ensure amount in paise (minimum 1 INR = 100 paise)
    const numericAmount = Math.max(1, Math.round(Number(amount) || 1));
    const amountInPaise = numericAmount * 100;

    const cleanReceipt = String(receipt || bookingId || `rcpt_${Date.now()}`).slice(0, 40);

    const payload = {
      amount: amountInPaise,
      currency,
      receipt: cleanReceipt,
      notes: {
        booking_id: String(bookingId || receipt || ''),
        user_id: String(userId || ''),
        customer_name: String(customerName || ''),
        customer_phone: String(customerPhone || ''),
        customer_email: String(customerEmail || ''),
        ...notes
      }
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Razorpay order creation failed:', data);
      return NextResponse.json(
        { ok: false, error: data.error?.description || 'Failed to create Razorpay order', raw: data },
        { status: res.status }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      keyId
    });
  } catch (err: any) {
    console.error('Razorpay order route error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal server error creating Razorpay order' },
      { status: 500 }
    );
  }
}
