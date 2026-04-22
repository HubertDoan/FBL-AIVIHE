#!/usr/bin/env node
/**
 * RLS (Row-Level Security) audit — Supabase production safety check.
 *
 * Kiểm tra:
 *  1. Bảng nào chưa bật RLS (nguy hiểm — anon/authenticated có thể đọc hết)
 *  2. Bảng nào RLS bật nhưng KHÔNG có policy (mọi query đều bị deny — broken)
 *  3. Policy nào dùng `qual = true` hoặc `USING (true)` (tương đương không check)
 *  4. Service role key có bị import vào client bundle không
 *
 * Usage:
 *   node scripts/audit-supabase-rls-policies-and-service-role-leak.mjs
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (để query pg_policies system tables)
 *
 * Output:
 *   JSON report trong plans/reports/rls-audit-{date}.json + human summary stdout.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ──────────────────────────────────────────────────────────────────────
// 1. Query pg_tables + pg_policies via RPC (Supabase Postgres introspection)
// ──────────────────────────────────────────────────────────────────────

const CHECK_SQL = `
  SELECT
    t.tablename,
    t.schemaname,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'policyname', p.policyname,
        'cmd', p.cmd,
        'qual', p.qual,
        'with_check', p.with_check,
        'roles', p.roles
      )) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename),
      '[]'::jsonb
    ) AS policies
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
`

async function auditRls() {
  // Supabase JS SDK không có raw SQL trực tiếp — dùng rpc hoặc REST fetch
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: CHECK_SQL }),
  })

  if (!res.ok) {
    // Fallback: nếu không có exec_sql RPC → hướng dẫn user tạo
    console.error('⚠️  exec_sql RPC not found. Run this SQL in Supabase SQL Editor manually:')
    console.error('\n' + CHECK_SQL + '\n')
    console.error('Rồi paste kết quả JSON vào plans/reports/rls-audit-manual.json')
    return null
  }

  return res.json()
}

// ──────────────────────────────────────────────────────────────────────
// 2. Scan client code — phát hiện service role key bị leak
// ──────────────────────────────────────────────────────────────────────

const DANGER_PATTERNS = [
  /SUPABASE_SERVICE_ROLE_KEY/,
  /service_role/i,
]

const SAFE_DIRS = [
  'src/lib/supabase/server.ts', // legitimate server-only usage
  'src/app/api/',                 // server routes
  'scripts/',                     // node scripts
]

function scanClientBundleLeaks(rootDir) {
  const leaks = []

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      const stat = statSync(full)
      if (stat.isDirectory()) {
        if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
        walk(full)
      } else if (/\.(tsx?|jsx?|mjs)$/.test(entry)) {
        const rel = full.replace(rootDir + '/', '').replace(/\\/g, '/')
        // Chỉ check client code — app routes/components/hooks
        const isClient =
          rel.startsWith('src/components/') ||
          rel.startsWith('src/hooks/') ||
          (rel.startsWith('src/app/') && !rel.includes('/api/'))
        if (!isClient) continue

        const content = readFileSync(full, 'utf8')
        // Bỏ qua nếu có 'use server' directive
        if (/^['"]use server['"]/.test(content.trim())) continue
        for (const pattern of DANGER_PATTERNS) {
          if (pattern.test(content)) {
            leaks.push({ file: rel, pattern: pattern.source })
          }
        }
      }
    }
  }

  walk(rootDir)
  return leaks
}

// ──────────────────────────────────────────────────────────────────────
// 3. Analyze + report
// ──────────────────────────────────────────────────────────────────────

function analyze(tables) {
  const issues = { critical: [], high: [], medium: [], info: [] }

  for (const t of tables || []) {
    const name = `${t.schemaname}.${t.tablename}`

    if (!t.rls_enabled) {
      issues.critical.push({
        table: name,
        issue: 'RLS DISABLED — anon/authenticated có thể đọc/ghi tự do',
        fix: `ALTER TABLE ${name} ENABLE ROW LEVEL SECURITY;`,
      })
      continue
    }

    const policies = t.policies || []
    if (policies.length === 0) {
      issues.high.push({
        table: name,
        issue: 'RLS ENABLED nhưng 0 policy → mọi query bị deny',
        fix: `Tạo policy SELECT/INSERT/UPDATE/DELETE phù hợp`,
      })
      continue
    }

    for (const p of policies) {
      if (p.qual === 'true' || p.with_check === 'true') {
        issues.medium.push({
          table: name,
          policy: p.policyname,
          issue: `Policy "${p.policyname}" dùng expression "true" → bypass check`,
          fix: 'Thay bằng điều kiện dùng auth.uid() hoặc role check',
        })
      }
    }
  }

  return issues
}

// ──────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔒 AIVIHE RLS & service-role leak audit\n')

  console.log('→ [1/2] Checking RLS policies...')
  const tables = await auditRls()
  const rlsIssues = tables ? analyze(tables) : null

  console.log('→ [2/2] Scanning client bundle for service role leak...')
  const leaks = scanClientBundleLeaks(process.cwd())

  // Report
  const report = {
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    rls: rlsIssues,
    client_bundle_leaks: leaks,
  }

  const outDir = 'plans/reports'
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const date = new Date().toISOString().slice(0, 10)
  const outFile = join(outDir, `rls-audit-${date}.json`)
  writeFileSync(outFile, JSON.stringify(report, null, 2))

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (rlsIssues) {
    const crit = rlsIssues.critical.length
    const high = rlsIssues.high.length
    const med = rlsIssues.medium.length
    console.log(`🔴 Critical (RLS disabled):    ${crit}`)
    console.log(`🟠 High (RLS no policies):     ${high}`)
    console.log(`🟡 Medium (always-true policy): ${med}`)

    if (crit > 0) {
      console.log('\n🔴 TABLES WITHOUT RLS:')
      for (const i of rlsIssues.critical) console.log(`   - ${i.table}`)
    }
    if (high > 0) {
      console.log('\n🟠 TABLES WITH RLS BUT NO POLICIES:')
      for (const i of rlsIssues.high) console.log(`   - ${i.table}`)
    }
  } else {
    console.log('⚠️  Không query được pg_policies — chạy thủ công SQL ở trên.')
  }

  console.log(`\n🔑 Service role leak in client code: ${leaks.length} file(s)`)
  for (const l of leaks) console.log(`   - ${l.file}`)

  console.log(`\n📝 Full report: ${outFile}`)

  const hasCritical = (rlsIssues?.critical.length ?? 0) > 0 || leaks.length > 0
  process.exit(hasCritical ? 1 : 0)
}

main().catch((err) => {
  console.error('❌ Audit failed:', err)
  process.exit(2)
})
