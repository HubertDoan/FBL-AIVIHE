#!/usr/bin/env node
/**
 * Apply pending migrations to Supabase using the Management API
 * This script reads SQL files and executes them via Supabase's database/query endpoint
 *
 * Requires SUPABASE_ACCESS_TOKEN (personal access token from dashboard)
 * Get it from: https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node supabase/apply-migrations-via-supabase-api.js
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const PROJECT_REF = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  .replace('https://', '')
  .replace('.supabase.co', '');

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.log('\n❌ SUPABASE_ACCESS_TOKEN not set.');
  console.log('Get it from: https://supabase.com/dashboard/account/tokens');
  console.log('Then run: SUPABASE_ACCESS_TOKEN=sbp_xxx node supabase/apply-migrations-via-supabase-api.js\n');
  process.exit(1);
}

const MIGRATIONS = [
  '00027_add-tdl-customer-code-to-citizens.sql',
  '00028_create-service-enrollments-table.sql',
  '00029_create-integration-events-table.sql',
  '00030_create-daycare-summary-cache-table.sql',
];

async function execSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body.slice(0, 200)}`);
  }
  return await res.json();
}

async function main() {
  console.log(`\nProject: ${PROJECT_REF}`);
  console.log(`Migrations: ${MIGRATIONS.length}\n`);

  // Test connection
  try {
    await execSQL('SELECT 1 as test');
    console.log('✅ Connected to Supabase\n');
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  }

  for (const file of MIGRATIONS) {
    const filePath = path.join(__dirname, 'migrations', file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${file} — not found`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 ${file}`);

    try {
      await execSQL(sql);
      console.log(`   ✅ Applied\n`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`   ⏭️  Already applied\n`);
      } else {
        console.log(`   ❌ Error: ${err.message.slice(0, 150)}\n`);
      }
    }
  }

  // Verify
  console.log('Verifying...');
  try {
    const r = await execSQL("SELECT column_name FROM information_schema.columns WHERE table_name='citizens' AND column_name='tdl_customer_code'");
    console.log('tdl_customer_code column:', r.length > 0 ? '✅ exists' : '❌ missing');
  } catch (e) {
    console.log('Verify error:', e.message.slice(0, 100));
  }

  console.log('\n✅ Done!\n');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
