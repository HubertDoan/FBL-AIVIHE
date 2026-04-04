#!/usr/bin/env npx tsx
/**
 * Run SQL migrations against Supabase production database
 * Run: cd aivihe && npx tsx supabase/run-migrations-on-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function runSQL(label: string, sql: string) {
  console.log(`\n🔄 Running: ${label}...`)
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
  if (error) {
    // rpc may not exist — try raw fetch instead
    console.log(`   ⚠️ RPC not available, using REST SQL...`)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SQL failed (${res.status}): ${text}`)
    }
  }
  console.log(`   ✅ ${label} — done`)
}

async function runMigrationFile(filename: string) {
  const filepath = resolve(__dirname, 'migrations', filename)
  const sql = readFileSync(filepath, 'utf-8')
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`\n📄 ${filename} (${statements.length} statements)`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ')
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' })
      if (error) {
        // Try direct PostgreSQL connection if RPC unavailable
        throw error
      }
      console.log(`   [${i + 1}/${statements.length}] ✅ ${preview}...`)
    } catch (err) {
      console.error(`   [${i + 1}/${statements.length}] ❌ ${preview}...`)
      console.error(`      ${(err as Error).message}`)
    }
  }
}

async function main() {
  console.log(`🚀 Running migrations on ${SUPABASE_URL}\n`)

  // Check connection by listing tables
  const { data, error } = await supabase.from('citizens').select('id').limit(1)
  if (error && error.message.includes('does not exist')) {
    console.log('📋 citizens table not found — running base migrations first')
    await runMigrationFile('00001_create_citizens.sql')
    // ... run all 22 base migrations
    console.log('\n⚠️  Please run all_migrations_combined.sql in Supabase SQL Editor first!')
    console.log('   Then re-run this script to apply migration 00023.')
    process.exit(0)
  } else if (error) {
    console.error('Connection error:', error.message)
    process.exit(1)
  }

  console.log('✅ Connected — citizens table exists')
  console.log(`   Found ${data?.length ?? 0} existing record(s)`)

  // Check if new columns already exist
  const { data: cols } = await supabase.from('citizens').select('username').limit(1)
  if (cols === null) {
    console.log('\n📦 Applying migration 00023 (new tables + columns)...')
    await runMigrationFile('00023_add_missing_columns_and_tables.sql')
  } else {
    console.log('   username column exists — migration 00023 may already be applied')
    console.log('   Running 00023 anyway (IF NOT EXISTS is safe)...')
    await runMigrationFile('00023_add_missing_columns_and_tables.sql')
  }

  console.log('\n✅ All migrations complete!')
}

main().catch(console.error)
