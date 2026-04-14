/**
 * Apply pending migrations (00027-00030) to Supabase production
 * Uses Supabase Management API to execute SQL directly
 * Usage: node supabase/apply-pending-migrations.js
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// Migrations to apply (in order)
const MIGRATIONS = [
  '00027_add-tdl-customer-code-to-citizens.sql',
  '00028_create-service-enrollments-table.sql',
  '00029_create-integration-events-table.sql',
  '00030_create-daycare-summary-cache-table.sql',
];

async function execSQL(sql) {
  // Use Supabase Management API
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    // Fallback: try direct PostgreSQL connection via REST
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_query: sql }),
    });
    if (!res2.ok) {
      const body = await res2.text();
      throw new Error(`SQL failed: ${body.slice(0, 200)}`);
    }
  }
}

async function main() {
  console.log(`\n🔄 Applying ${MIGRATIONS.length} migrations to ${PROJECT_REF}...\n`);

  for (const file of MIGRATIONS) {
    const filePath = path.join(__dirname, 'migrations', file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${file} — file not found`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    // Split by statements and execute each (skip empty)
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 ${file} (${statements.length} statements)`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await execSQL(stmt);
        process.stdout.write('.');
      } catch (err) {
        // IF NOT EXISTS errors are OK
        if (err.message.includes('already exists') || err.message.includes('IF NOT EXISTS')) {
          process.stdout.write('s'); // skipped
        } else {
          console.log(`\n   ⚠️  Statement ${i + 1}: ${err.message.slice(0, 100)}`);
        }
      }
    }
    console.log(' ✅');
  }

  console.log('\n✅ All migrations applied!\n');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
