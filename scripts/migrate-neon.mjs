import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;

const connectionString = 'postgresql://neondb_owner:npg_bS8CJPV2eUWt@ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

async function runMigration() {
  console.log('Connecting to Neon PostgreSQL...');
  try {
    const versionResult = await sql`SELECT version()`;
    console.log('Connected successfully!');
    console.log('PostgreSQL Version:', versionResult[0].version);

    console.log('Enabling uuid extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    console.log('Creating table users...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(160),
        is_verified BOOLEAN DEFAULT TRUE,
        preferred_language VARCHAR(30) DEFAULT 'English',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('Creating table bookings...');
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(40) PRIMARY KEY,
        user_phone VARCHAR(20) NOT NULL,
        celebrant_name VARCHAR(120) NOT NULL,
        dob DATE,
        birth_time VARCHAR(20),
        birth_place VARCHAR(100),
        gotra VARCHAR(60) NOT NULL,
        nakshatra VARCHAR(60) NOT NULL,
        pada INT DEFAULT 1,
        celebration_date VARCHAR(50) NOT NULL,
        time_slot VARCHAR(60) NOT NULL,
        venue_address TEXT NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        package_id VARCHAR(50) NOT NULL,
        package_name VARCHAR(100) NOT NULL,
        addons TEXT[] DEFAULT '{}',
        total_price INT NOT NULL,
        assigned_acharya_id VARCHAR(50),
        razorpay_payment_id VARCHAR(100),
        status VARCHAR(30) DEFAULT 'confirmed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('Creating table gift_orders...');
    await sql`
      CREATE TABLE IF NOT EXISTS gift_orders (
        id VARCHAR(40) PRIMARY KEY,
        customer_name VARCHAR(120) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(160),
        recipient_name VARCHAR(120),
        gift_message TEXT,
        delivery_address TEXT NOT NULL,
        city VARCHAR(60) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        items JSONB NOT NULL,
        box_packaging BOOLEAN DEFAULT TRUE,
        box_price INT DEFAULT 150,
        total_amount INT NOT NULL,
        razorpay_payment_id VARCHAR(100) NOT NULL,
        tracking_number VARCHAR(100),
        status VARCHAR(30) DEFAULT 'paid',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('Creating table whatsapp_logs...');
    await sql`
      CREATE TABLE IF NOT EXISTS whatsapp_logs (
        id VARCHAR(60) PRIMARY KEY,
        recipient_phone VARCHAR(20) NOT NULL,
        recipient_name VARCHAR(120),
        template_name VARCHAR(100) NOT NULL,
        message_type VARCHAR(50) NOT NULL,
        booking_id VARCHAR(40),
        wamid VARCHAR(120),
        status VARCHAR(30) DEFAULT 'delivered',
        dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create indices
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(celebration_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(user_phone)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gift_orders_phone ON gift_orders(customer_phone)`;

    console.log('\n--- VERIFYING INITIALIZED TABLES IN NEON ---');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    tables.forEach(t => console.log('✓ ' + t.table_name));

    console.log('\nSUCCESS: Neon database successfully connected and all tables initialized!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
