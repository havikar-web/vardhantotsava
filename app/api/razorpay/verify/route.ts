import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

const DEFAULT_KEY_SECRET = '30BQTyuKu3OKLkzcp68ZxHPx';
const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_bS8CJPV2eUWt@ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function getDb() {
  const url = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  return neon(url);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      userId
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { ok: false, error: 'Missing Razorpay payment verification parameters' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.warn('Razorpay signature mismatch:', { generatedSignature, receivedSignature: razorpay_signature });
      return NextResponse.json(
        { ok: false, error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // Update booking in Neon PostgreSQL if bookingId is provided
    if (bookingId) {
      try {
        const sql = getDb();
        const validUserId = userId && userId.length === 36 ? userId : null;

        await sql.query(
          `UPDATE bookings 
           SET razorpay_order_id = $1,
               razorpay_payment_id = $2,
               status = 'confirmed',
               user_id = COALESCE($3, user_id)
           WHERE id = $4`,
          [razorpay_order_id, razorpay_payment_id, validUserId, bookingId]
        );
      } catch (dbErr) {
        console.warn('Database booking update on payment verification warning:', dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      bookingId
    });
  } catch (err: any) {
    console.error('Razorpay verification route error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal payment verification error' },
      { status: 500 }
    );
  }
}
