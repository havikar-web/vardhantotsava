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
    const order = await request.json();
    if (!order || !order.id || !order.customerPhone) {
      return NextResponse.json({ ok: false, error: 'Valid gift order object required' }, { status: 400 });
    }

    const sql = getDb();
    const cleanPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
    const standardPhone = '+91' + cleanPhone;
    const variants = getPhoneVariants(order.customerPhone);

    // Resolve user_id
    let resolvedUserId: string | null = null;
    const isUuid = order.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.userId);
    if (isUuid) {
      resolvedUserId = order.userId;
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
      `INSERT INTO gift_orders (
        id, user_id, customer_name, customer_phone, customer_email,
        recipient_name, gift_message, delivery_address, city, pincode,
        items, box_packaging, box_price, total_amount, razorpay_payment_id,
        razorpay_order_id, status
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11::jsonb, $12, $13, $14, $15,
        $16, $17
      )
      ON CONFLICT (id) DO UPDATE SET
        user_id = COALESCE(EXCLUDED.user_id, gift_orders.user_id),
        status = EXCLUDED.status,
        razorpay_payment_id = COALESCE(EXCLUDED.razorpay_payment_id, gift_orders.razorpay_payment_id),
        razorpay_order_id = COALESCE(EXCLUDED.razorpay_order_id, gift_orders.razorpay_order_id)
      RETURNING *`,
      [
        order.id,
        resolvedUserId,
        order.customerName || 'Sacred Patron',
        standardPhone,
        order.customerEmail || null,
        order.recipientName || null,
        order.giftMessage || null,
        order.deliveryAddress || '',
        order.city || 'Bengaluru',
        order.pincode || '',
        JSON.stringify(order.items || []),
        Boolean(order.boxPackaging),
        Number(order.boxPrice || 0),
        Number(order.totalAmount || 0),
        order.paymentId || 'pending_payment',
        order.razorpayOrderId || null,
        order.status || 'paid'
      ]
    );

    return NextResponse.json({ ok: true, order: rows[0] });
  } catch (error: any) {
    console.error('Error syncing gift order to Neon:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Database error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');
    const sql = getDb();

    if (userId) {
      const rows = await sql.query(
        `SELECT * FROM gift_orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return NextResponse.json({ ok: true, orders: rows });
    }

    if (phone) {
      const variants = getPhoneVariants(phone);
      const rows = await sql.query(
        `SELECT * FROM gift_orders 
         WHERE customer_phone = ANY($1::text[]) 
            OR user_id = (SELECT id FROM users WHERE phone = ANY($1::text[]) LIMIT 1)
         ORDER BY created_at DESC`,
        [variants]
      );
      return NextResponse.json({ ok: true, orders: rows });
    }

    const rows = await sql.query(`SELECT * FROM gift_orders ORDER BY created_at DESC LIMIT 50`);
    return NextResponse.json({ ok: true, orders: rows });
  } catch (error: any) {
    console.error('Error fetching gift orders from Neon:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Database error' }, { status: 500 });
  }
}
