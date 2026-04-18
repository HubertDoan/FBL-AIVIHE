#!/usr/bin/env node
/**
 * Cleanup 20 old demo accounts (phone 0901000001-0901000020, email *2026@aivihe.vn)
 * Keep ONLY 9 canonical accounts per docx `he thong acc cua aivihe.docx`
 * + 4 customers (Bùi Thị Quỳnh Tâm, Hoa, Minh, Phương).
 *
 * Delete từ: auth.users (cascade → citizens + related tables)
 * Run: node scripts/cleanup-old-demo-accounts-keep-only-canonical-per-docx.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
    .split('\n').filter(Boolean).map((l) => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Canonical accounts per docx (NEVER DELETE) ────────────────────────────
const KEEP_EMAILS = new Set([
  // 6 management per docx
  'haidn@aivihe.vn',
  'ngocnt@aivihe.vn',
  'phuonglm@aivihe.vn',
  'chipk@aivihe.vn',
  'hattn@aivihe.vn',
  'tramttn@aivihe.vn',
  // 3 functional temp per docx
  'hanhchinh@aivihe.vn',
  'kythuat@aivihe.vn',
  'hotro@aivihe.vn',
  // 4 customers (1 real + 3 fake flow per thầy: "giữ 3 fake customer")
  'tambtq@aivihe.vn',     // Bùi Thị Quỳnh Tâm
  'hoant@aivihe.vn',      // Nguyễn Thị Hoa
  'minhtv@aivihe.vn',     // Trần Văn Minh
  'phuonglt@aivihe.vn',   // Lê Thị Phương
])

async function main() {
  console.log('🧹 Cleanup old demo accounts (keep only canonical per docx)')

  // Fetch all citizens
  const { data: citizens } = await supabase.from('citizens').select('id,email,full_name,phone,role')
  console.log(`   Current: ${citizens.length} accounts`)

  const toDelete = citizens.filter((c) => !KEEP_EMAILS.has(c.email))
  const toKeep = citizens.filter((c) => KEEP_EMAILS.has(c.email))

  console.log(`\n   Keep ${toKeep.length}:`)
  toKeep.forEach((c) => console.log(`     ✅ [${c.role}] ${c.full_name} — ${c.email}`))

  console.log(`\n   Delete ${toDelete.length}:`)
  toDelete.forEach((c) => console.log(`     ❌ [${c.role}] ${c.full_name} — ${c.email} (${c.phone})`))

  if (toDelete.length === 0) { console.log('\n   ✅ Nothing to delete.'); return }

  console.log('\n🗑  Deleting via supabase.auth.admin.deleteUser (cascade)...')
  let deleted = 0
  let failed = 0
  for (const c of toDelete) {
    const { error } = await supabase.auth.admin.deleteUser(c.id)
    if (error) {
      console.warn(`     ⚠ ${c.email}: ${error.message}`)
      failed++
    } else {
      deleted++
    }
  }
  console.log(`\n   Deleted: ${deleted}, Failed: ${failed}`)

  // Verify
  const { count: finalCount } = await supabase.from('citizens').select('*', { count: 'exact', head: true })
  console.log(`\n✅ Final: ${finalCount} accounts (expected ${KEEP_EMAILS.size})`)
}

main().catch((err) => { console.error('ERROR:', err); process.exit(1) })
