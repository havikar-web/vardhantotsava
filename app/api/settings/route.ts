import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_bS8CJPV2eUWt@ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function getDb() {
  const url = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  return neon(url);
}

const DEFAULT_SETTINGS = {
  mainAcharyaName: 'Vedamurthy Sri Narayan Bhat',
  mainAcharyaPhone: '919902045009',
  adminPhone: '919902045009'
};

export async function GET() {
  try {
    const sql = getDb();
    await sql.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const rows = await sql.query('SELECT key, value FROM system_settings');
    const settingsMap: Record<string, string> = {};
    if (Array.isArray(rows)) {
      rows.forEach((r: any) => {
        settingsMap[r.key] = r.value;
      });
    }

    return NextResponse.json({
      ok: true,
      settings: {
        mainAcharyaName: settingsMap['main_acharya_name'] || DEFAULT_SETTINGS.mainAcharyaName,
        mainAcharyaPhone: settingsMap['main_acharya_phone'] || DEFAULT_SETTINGS.mainAcharyaPhone,
        adminPhone: settingsMap['admin_phone'] || DEFAULT_SETTINGS.adminPhone
      }
    });
  } catch (err: any) {
    console.warn('Error reading system_settings from Neon:', err);
    return NextResponse.json({
      ok: true,
      settings: DEFAULT_SETTINGS,
      warning: err?.message
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mainAcharyaName, mainAcharyaPhone, adminPhone } = body;

    const sql = getDb();
    await sql.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const cleanMainPhone = (mainAcharyaPhone || DEFAULT_SETTINGS.mainAcharyaPhone).replace(/\D/g, '');
    const cleanAdminPhone = (adminPhone || DEFAULT_SETTINGS.adminPhone).replace(/\D/g, '');
    const finalMainName = (mainAcharyaName || DEFAULT_SETTINGS.mainAcharyaName).trim();

    // Standardize phones to 12 digits (with 91 prefix)
    const formattedMainPhone = cleanMainPhone.length === 10 ? '91' + cleanMainPhone : cleanMainPhone;
    const formattedAdminPhone = cleanAdminPhone.length === 10 ? '91' + cleanAdminPhone : cleanAdminPhone;

    await sql.query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES 
        ('main_acharya_name', $1, NOW()),
        ('main_acharya_phone', $2, NOW()),
        ('admin_phone', $3, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    `, [finalMainName, formattedMainPhone, formattedAdminPhone]);

    return NextResponse.json({
      ok: true,
      settings: {
        mainAcharyaName: finalMainName,
        mainAcharyaPhone: formattedMainPhone,
        adminPhone: formattedAdminPhone
      }
    });
  } catch (err: any) {
    console.error('Error saving system_settings to Neon:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}
