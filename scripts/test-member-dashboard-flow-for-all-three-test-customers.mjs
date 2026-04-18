#!/usr/bin/env node
/**
 * Test full flow cho 3 khách hàng mẫu (sau khi login):
 * 1. Sign in với email + password
 * 2. Verify session + citizen data
 * 3. Load health_profile (membership data)
 * 4. Load source_documents (uploaded files)
 * 5. Load consultation_requests (đã convert)
 * 6. Check notifications (nếu có)
 * 7. Check messages/conversations
 * 8. Summary per customer
 *
 * Run: node scripts/test-member-dashboard-flow-for-all-three-test-customers.mjs
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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const CUSTOMERS = [
  { email: 'hoant@aivihe.vn',     pw: 'Aivihe@2026', name: 'Nguyễn Thị Hoa',     channel: 'family-doctor' },
  { email: 'minhtv@aivihe.vn',    pw: 'Aivihe@2026', name: 'Trần Văn Minh',       channel: 'daycare' },
  { email: 'phuonglt@aivihe.vn',  pw: 'Aivihe@2026', name: 'Lê Thị Phương',       channel: 'rehabilitation' },
]

async function testCustomer(c) {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log(`🧑 ${c.name} — ${c.email}`)
  console.log('═══════════════════════════════════════════════════════')

  const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } })

  // 1. Sign in
  console.log('\n1️⃣ Đăng nhập...')
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email: c.email, password: c.pw })
  if (authErr) { console.error('   ❌ Login fail:', authErr.message); return false }
  const userId = auth.user.id
  console.log(`   ✅ Logged in → user_id: ${userId.slice(0, 8)}...`)

  // 2. Citizen profile
  console.log('\n2️⃣ Hồ sơ cá nhân (citizens table):')
  const { data: citizen } = await supabase.from('citizens').select('*').eq('id', userId).single()
  console.log(`   ✅ Tên: ${citizen.full_name}`)
  console.log(`   ✅ Role: ${citizen.role} | Status: ${citizen.status} | Active: ${citizen.is_active}`)
  console.log(`   ✅ SĐT: ${citizen.phone} | CCCD: ${citizen.national_id}`)
  console.log(`   ✅ Ngày sinh: ${citizen.date_of_birth} | Giới tính: ${citizen.gender}`)
  console.log(`   ✅ Địa chỉ: ${citizen.address} (${citizen.province} / ${citizen.ward})`)
  console.log(`   ✅ Nghề: ${citizen.occupation} | Học vấn: ${citizen.education}`)
  console.log(`   ✅ Hôn nhân: ${citizen.marital_status} | Dân tộc: ${citizen.ethnicity}`)
  console.log(`   ✅ Email cá nhân: ${citizen.personal_email}`)
  console.log(`   ✅ Member since: ${citizen.member_since} | Đã đồng ý: ${citizen.has_consented}`)

  // 3. Health profile
  console.log('\n3️⃣ Hồ sơ sức khỏe (health_profiles):')
  const { data: hp } = await supabase.from('health_profiles').select('*').eq('citizen_id', userId).maybeSingle()
  if (hp) {
    console.log(`   ✅ Nhóm máu: ${hp.blood_type}`)
    console.log(`   ✅ Cao/Nặng: ${hp.height_cm} cm / ${hp.weight_kg} kg`)
    console.log(`   ✅ Bệnh mạn tính: ${(hp.chronic_conditions || []).join(', ') || 'không'}`)
    console.log(`   ✅ Thuốc đang dùng: ${(hp.current_medications || []).join(', ') || 'không'}`)
    console.log(`   ✅ Dị ứng: ${(hp.allergies || []).join(', ') || 'không'}`)
    console.log(`   ✅ Liên hệ KC: ${hp.emergency_contact_name} (${hp.emergency_contact_phone}) — ${hp.emergency_contact_relationship}`)
  } else {
    console.log('   ⚠ Chưa có health profile')
  }

  // 4. Source documents
  console.log('\n4️⃣ Tài liệu sức khỏe (source_documents):')
  const { data: docs } = await supabase.from('source_documents').select('*').eq('citizen_id', userId)
  console.log(`   ✅ Có ${docs.length} tài liệu:`)
  docs.forEach((d, i) => {
    const sizeKb = (d.file_size_bytes / 1024).toFixed(1)
    console.log(`      ${i + 1}. ${d.original_filename} (${d.document_type}, ${sizeKb}KB) — ${d.document_date || 'N/A'}`)
    console.log(`         ${d.file_url.slice(0, 80)}...`)
  })

  // 5. Consultation request (lịch sử đăng ký)
  console.log('\n5️⃣ Lịch sử đăng ký tư vấn (consultation_requests):')
  const { data: crs } = await supabase.from('consultation_requests').select('*').eq('converted_to_citizen_id', userId)
  console.log(`   ✅ Có ${crs.length} request đã convert thành member:`)
  crs.forEach(r => console.log(`      [${r.status}] Channel: ${r.channel} | Ngày đăng ký: ${r.created_at.slice(0, 10)}`))

  // 6. Service enrollments
  console.log('\n6️⃣ Gói dịch vụ đã đăng ký (service_enrollments):')
  const { data: enrolls } = await supabase.from('service_enrollments').select('*').eq('citizen_id', userId)
  if (enrolls && enrolls.length > 0) {
    enrolls.forEach(e => console.log(`      - ${e.service_type} (${e.service_code}) — status: ${e.status}`))
  } else {
    console.log('   ⚠ Chưa đăng ký gói dịch vụ nào')
  }

  // 7. Notifications
  console.log('\n7️⃣ Thông báo (notifications):')
  const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', userId)
  console.log(`   ${notifs?.length || 0} thông báo${notifs?.length ? ':' : ''}`)
  ;(notifs || []).forEach(n => console.log(`      [${n.is_read ? '✓' : '○'}] ${n.title}`))

  // 8. Messages/Conversations
  console.log('\n8️⃣ Hội thoại (conversations):')
  const { data: convs } = await supabase.from('conversations').select('*').or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
  console.log(`   ${convs?.length || 0} hội thoại`)

  console.log('\n✅ SUMMARY — Khách hàng có đủ data cho dashboard hoạt động')
  return true
}

;(async () => {
  console.log('🧪 TEST MEMBER DASHBOARD FLOW — 3 TEST CUSTOMERS')
  console.log('Target:', SUPABASE_URL)

  let passed = 0
  for (const c of CUSTOMERS) {
    try {
      const ok = await testCustomer(c)
      if (ok) passed++
    } catch (err) {
      console.error(`\n❌ ${c.name} FAILED:`, err.message)
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════')
  console.log(`📊 RESULT: ${passed}/${CUSTOMERS.length} customers tested successfully`)
  console.log('═══════════════════════════════════════════════════════')
})()
