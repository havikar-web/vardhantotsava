import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_bS8CJPV2eUWt@ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function getDb() {
  const url = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  return neon(url);
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

    const rows = await sql.query(
      `INSERT INTO bookings (
        id, celebrant_name, user_phone, dob, birth_time, birth_place,
        gotra, nakshatra, pada, celebration_date, time_slot,
        venue_address, pincode, package_id, package_name, addons,
        total_price, status, maps_link
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19
      )
      ON CONFLICT (id) DO UPDATE SET
        celebrant_name = EXCLUDED.celebrant_name,
        user_phone = EXCLUDED.user_phone,
        celebration_date = EXCLUDED.celebration_date,
        time_slot = EXCLUDED.time_slot,
        venue_address = EXCLUDED.venue_address,
        pincode = EXCLUDED.pincode,
        package_name = EXCLUDED.package_name,
        status = EXCLUDED.status,
        assigned_acharya_id = COALESCE(EXCLUDED.assigned_acharya_id, bookings.assigned_acharya_id)
      RETURNING *`,
      [
        booking.id,
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
        booking.mapsLink || null
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
    const phone = searchParams.get('phone');
    const sql = getDb();

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const variants = ['+91' + cleanPhone, '91' + cleanPhone, cleanPhone];
      const rows = await sql.query(
        `SELECT * FROM bookings WHERE user_phone = ANY($1::text[]) ORDER BY created_at DESC`,
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
