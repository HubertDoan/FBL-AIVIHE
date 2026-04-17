#!/usr/bin/env node
/**
 * Test end-to-end consultation request flow:
 * 1. POST /api/consultation-request (như khách đăng ký trên website)
 * 2. Verify Supabase đã lưu record
 * 3. Check filter status='new' (xuất hiện ở "Chờ tư vấn" của reception)
 *
 * Usage: node scripts/test-consultation-request-flow.mjs [BASE_URL]
 * Default BASE_URL: http://localhost:3000
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map((l) => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim()]
  })
)

const BASE_URL = process.argv[2] || 'http://localhost:3000'
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
})

const TEST_CUSTOMER = {
  full_name: 'Trần Thị Nhị Hà',
  phone: '0913219888',
  channel: 'unsure',
}

async function step1PostForm() {
  console.log('\n📤 Step 1: POST form từ landing page')
  console.log(`   URL: ${BASE_URL}/api/consultation-request`)
  console.log(`   Data:`, TEST_CUSTOMER)

  const res = await fetch(`${BASE_URL}/api/consultation-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_CUSTOMER),
  })
  const body = await res.json()
  if (!res.ok) {
    console.error(`   ❌ Failed (${res.status}):`, body)
    throw new Error('POST failed')
  }
  console.log(`   ✅ OK:`, body)
  return body.request_id
}

async function step2VerifySupabase(requestId) {
  console.log('\n🔍 Step 2: Verify record trong Supabase')
  const { data, error } = await supabase
    .from('consultation_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (error) {
    console.error(`   ❌ Query failed:`, error)
    throw error
  }
  console.log(`   ✅ Record found:`)
  console.log(`      id: ${data.id}`)
  console.log(`      full_name: ${data.full_name}`)
  console.log(`      phone: ${data.phone}`)
  console.log(`      channel: ${data.channel}`)
  console.log(`      status: ${data.status}`)
  console.log(`      created_at: ${data.created_at}`)
  return data
}

async function step3CheckNewQueue() {
  console.log('\n📋 Step 3: Check "Chờ tư vấn" queue (status=new)')
  const { data, error } = await supabase
    .from('consultation_requests')
    .select('id, full_name, phone, status, created_at')
    .eq('status', 'new')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error(`   ❌ Query failed:`, error)
    throw error
  }
  console.log(`   ✅ ${data.length} pending request(s):`)
  data.forEach((r, i) => {
    console.log(`      ${i + 1}. ${r.full_name} — ${r.phone} (${r.created_at})`)
  })
  const found = data.find((r) => r.phone === TEST_CUSTOMER.phone)
  if (!found) {
    throw new Error('Test customer not in pending queue')
  }
  console.log(`   ✅ Test customer "${TEST_CUSTOMER.full_name}" có trong queue`)
}

async function cleanup(requestId) {
  console.log('\n🧹 Cleanup: delete test record')
  const { error } = await supabase
    .from('consultation_requests')
    .delete()
    .eq('id', requestId)
  if (error) {
    console.warn(`   ⚠ Cleanup failed:`, error)
  } else {
    console.log(`   ✅ Deleted test record ${requestId}`)
  }
}

;(async () => {
  let requestId
  try {
    requestId = await step1PostForm()
    await step2VerifySupabase(requestId)
    await step3CheckNewQueue()
    console.log('\n✅ ALL TESTS PASSED — flow end-to-end hoạt động')
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message)
    process.exitCode = 1
  } finally {
    if (requestId) await cleanup(requestId)
  }
})()
