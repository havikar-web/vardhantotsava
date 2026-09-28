import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_bS8CJPV2eUWt@ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function getDb() {
  const url = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  return neon(url);
}

function normalizePhoneVariants(phone: string): string[] {
  const digits = phone.replace(/\D/g, '');
  const tenDigit = digits.slice(-10);
  return [
    '+91' + tenDigit,
    '91' + tenDigit,
    tenDigit,
    '+' + digits,
    digits
  ];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ ok: false, error: 'Phone parameter required' }, { status: 400 });
    }

    const variants = normalizePhoneVariants(phone);
    const sql = getDb();

    const rows = await sql.query(
      `SELECT id, name, phone, email, preferred_language, is_verified, created_at
       FROM users
       WHERE phone = ANY($1::text[])
       LIMIT 1`,
      [variants]
    );

    if (rows && rows.length > 0) {
      const u = rows[0];
      return NextResponse.json({
        ok: true,
        exists: true,
        user: {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email || undefined,
          language: u.preferred_language || 'English',
          isVerified: u.is_verified
        }
      });
    }

    return NextResponse.json({ ok: true, exists: false });
  } catch (error: any) {
    console.error('Error fetching user profile from Neon:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, language = 'English' } = body;

    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: 'Name and phone are required' }, { status: 400 });
    }

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const standardPhone = '+91' + cleanDigits;
    const sql = getDb();

    const rows = await sql.query(
      `INSERT INTO users (name, phone, email, preferred_language, is_verified)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (phone)
       DO UPDATE SET
         name = EXCLUDED.name,
         email = COALESCE(EXCLUDED.email, users.email),
         preferred_language = COALESCE(EXCLUDED.preferred_language, users.preferred_language),
         is_verified = true
       RETURNING id, name, phone, email, preferred_language, is_verified`,
      [name.trim(), standardPhone, email ? email.trim() : null, language]
    );

    const u = rows[0];

    // Associate any unlinked bookings with this user's phone to this user's account ID
    try {
      const variants = normalizePhoneVariants(phone);
      await sql.query(
        `UPDATE bookings 
         SET user_id = $1 
         WHERE user_id IS NULL 
           AND user_phone = ANY($2::text[])`,
        [u.id, variants]
      );
    } catch (e) {
      console.warn('Could not backfill user_id on bookings:', e);
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email || undefined,
        language: u.preferred_language || 'English',
        isVerified: u.is_verified
      }
    });
  } catch (error: any) {
    console.error('Error saving user profile to Neon:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Database save error' }, { status: 500 });
  }
}
