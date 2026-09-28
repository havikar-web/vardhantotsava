import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_bS8CJPV2eUWt@ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function getDb() {
  const url = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  return neon(url);
}

function getPhoneVariants(phone: string): string[] {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  return ['+91' + cleanPhone, '91' + cleanPhone, cleanPhone];
}

export async function POST(request: Request) {
  try {
    const booking = await request.json();
    if (!booking || !booking.id || !booking.phone) {
      return NextResponse.json({ ok: false, error: 'Valid booking object with id and phone required' }, { status: 400 });
    }

    const sql = getDb();
    const cleanPhone = booking.phone.replace(/\D/g, '').slice(-10);
    const standardPhone = '+91' + cleanPhone;
    const variants = getPhoneVariants(booking.phone);

    // Resolve user_id: prefer booking.userId, fallback to resolving from users table
    let resolvedUserId: string | null = null;
    const isUuid = booking.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(booking.userId);
    if (isUuid) {
      resolvedUserId = booking.userId;
    } else {
      const userLookup = await sql.query(
        `SELECT id FROM users WHERE phone = ANY($1::text[]) LIMIT 1`,
        [variants]
      );
      if (userLookup && userLookup.length > 0) {
        resolvedUserId = userLookup[0].id;
      }
    }

    const rows = await sql.query(
      `INSERT INTO bookings (
        id, user_id, celebrant_name, user_phone, dob, birth_time, birth_place,
        gotra, nakshatra, pada, celebration_date, time_slot,
        venue_address, pincode, package_id, package_name, addons,
        total_price, status, maps_link, razorpay_order_id, razorpay_payment_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22
      )
      ON CONFLICT (id) DO UPDATE SET
        user_id = COALESCE(EXCLUDED.user_id, bookings.user_id),
        celebrant_name = EXCLUDED.celebrant_name,
        user_phone = EXCLUDED.user_phone,
        celebration_date = EXCLUDED.celebration_date,
        time_slot = EXCLUDED.time_slot,
        venue_address = EXCLUDED.venue_address,
        pincode = EXCLUDED.pincode,
        package_name = EXCLUDED.package_name,
        status = EXCLUDED.status,
        maps_link = COALESCE(EXCLUDED.maps_link, bookings.maps_link),
        razorpay_order_id = COALESCE(EXCLUDED.razorpay_order_id, bookings.razorpay_order_id),
        razorpay_payment_id = COALESCE(EXCLUDED.razorpay_payment_id, bookings.razorpay_payment_id),
        assigned_acharya_id = COALESCE(EXCLUDED.assigned_acharya_id, bookings.assigned_acharya_id)
      RETURNING *`,
      [
        booking.id,
        resolvedUserId,
        booking.name || 'Celebrant',
        standardPhone,
        booking.dob && booking.dob.length === 10 ? booking.dob : null,
        booking.birthTime || null,
        booking.birthPlace || null,
        booking.gotra || 'Kashyapa',
        booking.nakshatra || 'Chitra',
        booking.pada ? Number(booking.pada) : 1,
        booking.celebrationDate || '',
        booking.timeSlot || '',
        booking.address || '',
        booking.pincode || '',
        booking.packageId || 'sampoorna',
        booking.packageName || 'Sampoorna Vardhantotsava',
        booking.addons || [],
        booking.totalPrice || 0,
        booking.status || 'confirmed',
        booking.mapsLink || null,
        booking.razorpayOrderId || null,
        booking.razorpayPaymentId || null
      ]
    );

    return NextResponse.json({ ok: true, booking: rows[0] });
  } catch (error: any) {
    console.error('Error syncing booking to Neon:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Database error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');
    const sql = getDb();

    if (userId && phone) {
      const variants = getPhoneVariants(phone);
      const rows = await sql.query(
        `SELECT * FROM bookings 
         WHERE user_id = $1 OR user_phone = ANY($2::text[])
         ORDER BY created_at DESC`,
        [userId, variants]
      );
      return NextResponse.json({ ok: true, bookings: rows });
    }

    if (userId) {
      const rows = await sql.query(
        `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return NextResponse.json({ ok: true, bookings: rows });
    }

    if (phone) {
      const variants = getPhoneVariants(phone);
      const rows = await sql.query(
        `SELECT * FROM bookings 
         WHERE user_phone = ANY($1::text[])
            OR user_id = (SELECT id FROM users WHERE phone = ANY($1::text[]) LIMIT 1)
         ORDER BY created_at DESC`,
        [variants]
      );
      return NextResponse.json({ ok: true, bookings: rows });
    }

    const rows = await sql.query(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 50`);
    return NextResponse.json({ ok: true, bookings: rows });
  } catch (error: any) {
    console.error('Error retrieving bookings from Neon:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Database error' }, { status: 500 });
  }
}
