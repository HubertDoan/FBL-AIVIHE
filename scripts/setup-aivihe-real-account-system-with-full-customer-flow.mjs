#!/usr/bin/env node
/**
 * Setup AIVIHE account system per `docs/he thong acc cua aivihe.docx`:
 * - 6 management accounts (super_admin, director, manager, admin, branch_director)
 * - 3 functional temp accounts (hành chính, kỹ thuật, hỗ trợ)
 * - 1 real customer: Bùi Thị Quỳnh Tâm
 * - 3 test customers with FULL flow: form → reception → director approve → member + health profile
 *
 * Run: cd aivihe && node scripts/setup-aivihe-real-account-system-with-full-customer-flow.mjs
 *
 * Idempotent: phát hiện account đã tồn tại theo phone → skip.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map((l) => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim()]
  })
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Management accounts (per docx) ─────────────────────────────────────────
const MGMT_ACCOUNTS = [
  { email: 'haidn@aivihe.vn',    pw: 'Aivihe@2026', fullName: 'Doãn Ngọc Hải',       role: 'super_admin',     phone: '0904493618', personalEmail: 'Haidoanngoc71@gmail.com' },
  { email: 'ngocnt@aivihe.vn',   pw: 'Aivihe@2026', fullName: 'Nguyễn Thị Ngọc',     role: 'director',        phone: '0968066666', personalEmail: 'Rubynguyen.bbi@gmail.com' },
  { email: 'phuonglm@aivihe.vn', pw: 'Aivihe@2026', fullName: 'Lê Mai Phương',       role: 'manager',         phone: '0975616878', personalEmail: 'lephuong89.sp@gmail.com' },
  { email: 'chipk@aivihe.vn',    pw: 'Aivihe@2026', fullName: 'Phạm Kim Chi',        role: 'manager',         phone: '0963278608', personalEmail: 'phamkimchi76@gmail.com' },
  { email: 'hattn@aivihe.vn',    pw: 'Aivihe@2026', fullName: 'Trần Thị Nhị Hà',     role: 'admin',           phone: '0913219888', personalEmail: 'Tranthinhiha73@gmail.com' }, // Senior Advisor → admin
  { email: 'tramttn@aivihe.vn',  pw: 'Aivihe@2026', fullName: 'Trần Thị Ngọc Trâm',  role: 'branch_director', phone: '0384101895', personalEmail: 'Trinityxhn@gmail.com' },    // GĐ Thong Dong Care
]

// ── Functional temp accounts ───────────────────────────────────────────────
const TEMP_ACCOUNTS = [
  { email: 'hanhchinh@aivihe.vn', pw: 'Hanhchinh@2026', fullName: 'Hành Chính AIVIHE', role: 'reception',     phone: '0900000001' },
  { email: 'kythuat@aivihe.vn',   pw: 'Kythuat@2026',   fullName: 'Kỹ Thuật AIVIHE',   role: 'technician',    phone: '0900000002' },
  { email: 'hotro@aivihe.vn',     pw: 'Hotro@2026',     fullName: 'Hỗ Trợ AIVIHE',     role: 'support_staff', phone: '0900000003' },
]

// ── Real customer (known from docx) ────────────────────────────────────────
const REAL_CUSTOMER = {
  email: 'tambtq@aivihe.vn', pw: 'Aivihe@2026',
  fullName: 'Bùi Thị Quỳnh Tâm', role: 'member', phone: '0437721039',
}

// ── 3 test customers for full-flow simulation ──────────────────────────────
const FLOW_CUSTOMERS = [
  {
    // Bước 1-5: form → contacted → info_completed → approved → converted
    fullName: 'Nguyễn Thị Hoa',    phone: '0987111111', channel: 'family-doctor',
    email: 'hoant@aivihe.vn', pw: 'Aivihe@2026',
    date_of_birth: '1960-03-15', gender: 'female',
    national_id: '001160011111', address: 'Sóc Sơn, Hà Nội',
    extended_info: {
      date_of_birth: '1960-03-15', gender: 'female', national_id: '001160011111',
      address: 'Sóc Sơn, Hà Nội', emergency_contact_name: 'Nguyễn Văn Nam',
      emergency_contact_phone: '0987111112', interested_packages: ['family-doctor'],
      notes: 'BS gia đình theo dõi tim mạch',
    },
    health_profile: {
      blood_type: 'O+', height_cm: 158, weight_kg: 55,
      chronic_conditions: ['Tăng huyết áp độ 1'],
      current_medications: ['Amlodipine 5mg 1 viên/ngày'],
      emergency_contact_name: 'Nguyễn Văn Nam', emergency_contact_phone: '0987111112',
      emergency_contact_relationship: 'Con trai',
    },
  },
  {
    fullName: 'Trần Văn Minh',      phone: '0987222222', channel: 'daycare',
    email: 'minhtv@aivihe.vn', pw: 'Aivihe@2026',
    date_of_birth: '1955-08-22', gender: 'male',
    national_id: '001155022222', address: 'Đông Anh, Hà Nội',
    extended_info: {
      date_of_birth: '1955-08-22', gender: 'male', national_id: '001155022222',
      address: 'Đông Anh, Hà Nội', emergency_contact_name: 'Trần Thị Hương',
      emergency_contact_phone: '0987222223', interested_packages: ['daycare'],
      notes: 'Bố mẹ già muốn đi Daycare ban ngày',
    },
    health_profile: {
      blood_type: 'A+', height_cm: 170, weight_kg: 68,
      chronic_conditions: ['Tiểu đường type 2'],
      current_medications: ['Metformin 850mg 2 viên/ngày'],
      emergency_contact_name: 'Trần Thị Hương', emergency_contact_phone: '0987222223',
      emergency_contact_relationship: 'Con gái',
    },
  },
  {
    fullName: 'Lê Thị Phương',      phone: '0987333333', channel: 'rehabilitation',
    email: 'phuonglt@aivihe.vn', pw: 'Aivihe@2026',
    date_of_birth: '1958-12-01', gender: 'female',
    national_id: '001158033333', address: 'Long Biên, Hà Nội',
    extended_info: {
      date_of_birth: '1958-12-01', gender: 'female', national_id: '001158033333',
      address: 'Long Biên, Hà Nội', emergency_contact_name: 'Lê Văn Hưng',
      emergency_contact_phone: '0987333334', interested_packages: ['rehabilitation'],
      notes: 'Sau đột quỵ, cần PHCN vận động',
    },
    health_profile: {
      blood_type: 'B+', height_cm: 152, weight_kg: 48,
      chronic_conditions: ['Di chứng đột quỵ nhẹ (2024)'],
      current_medications: ['Aspirin 81mg', 'Atorvastatin 20mg'],
      disabilities: ['Yếu nửa người phải sau đột quỵ'],
      emergency_contact_name: 'Lê Văn Hưng', emergency_contact_phone: '0987333334',
      emergency_contact_relationship: 'Con trai',
    },
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────
async function findCitizenByPhone(phone) {
  const { data } = await supabase.from('citizens').select('id').eq('phone', phone).maybeSingle()
  return data?.id || null
}

async function upsertAccount(acc, { isCitizen = false, memberSince = null } = {}) {
  // Check existing by phone
  const existingId = await findCitizenByPhone(acc.phone)
  if (existingId) {
    console.log(`   ⏭  ${acc.fullName} (${acc.phone}) đã tồn tại → skip`)
    return existingId
  }

  // Create auth user — skip phone_confirm for landline (0x 4xx...)
  const isLandline = /^0[234]/.test(acc.phone)
  const authPayload = {
    email: acc.email,
    password: acc.pw,
    email_confirm: true,
    user_metadata: { full_name: acc.fullName, phone: acc.phone },
  }
  if (!isLandline) {
    authPayload.phone = acc.phone.replace(/^0/, '+84')
    authPayload.phone_confirm = true
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser(authPayload)
  if (authError) throw new Error(`Auth create failed for ${acc.email}: ${authError.message}`)
  const authId = authData.user.id

  // Insert citizen record
  const citizenRow = {
    id: authId, full_name: acc.fullName, phone: acc.phone, email: acc.email,
    username: acc.email, role: acc.role, status: 'active', is_active: true,
    has_consented: true, member_since: memberSince,
  }
  if (acc.date_of_birth) citizenRow.date_of_birth = acc.date_of_birth
  if (acc.gender) citizenRow.gender = acc.gender
  if (acc.national_id) citizenRow.national_id = acc.national_id
  if (acc.address) citizenRow.address = acc.address

  const { error: cErr } = await supabase.from('citizens').insert(citizenRow)
  if (cErr) throw new Error(`Citizen insert failed for ${acc.fullName}: ${cErr.message}`)

  console.log(`   ✅ ${acc.fullName} — ${acc.email} (${acc.role})`)
  return authId
}

// ── Steps ──────────────────────────────────────────────────────────────────
async function step1SeedManagement() {
  console.log('\n👥 Step 1: Seed 6 tài khoản quản lý')
  for (const acc of MGMT_ACCOUNTS) {
    await upsertAccount(acc)
  }
}

async function step2SeedTemp() {
  console.log('\n🔧 Step 2: Seed 3 tài khoản functional (hành chính/kỹ thuật/hỗ trợ)')
  for (const acc of TEMP_ACCOUNTS) {
    await upsertAccount(acc)
  }
}

async function step3SeedRealCustomer() {
  console.log('\n👤 Step 3: Seed khách hàng thật — Bùi Thị Quỳnh Tâm')
  const id = await upsertAccount(REAL_CUSTOMER, { isCitizen: true, memberSince: '2026-04-17' })
  if (id) {
    // Ensure health profile
    const { data: existing } = await supabase.from('health_profiles').select('id').eq('citizen_id', id).maybeSingle()
    if (!existing) {
      await supabase.from('health_profiles').insert({ citizen_id: id, blood_type: 'O+' })
      console.log(`   ✅ Health profile cơ bản đã tạo cho Bùi Thị Quỳnh Tâm`)
    }
  }
  return id
}

async function step4FullFlowCustomers() {
  console.log('\n🔁 Step 4: 3 khách hàng full-flow (form → reception → approve → member)')
  const hanhChinhId = await findCitizenByPhone('0900000001')
  const directorId = await findCitizenByPhone('0968066666')

  for (const c of FLOW_CUSTOMERS) {
    console.log(`\n   🧑 ${c.fullName} (${c.phone}) channel=${c.channel}`)

    // 4a. Submit form
    const { data: cr, error: e1 } = await supabase
      .from('consultation_requests')
      .insert({ full_name: c.fullName, phone: c.phone, channel: c.channel, status: 'new' })
      .select('id').single()
    if (e1) { console.error(`      ❌ Form submit: ${e1.message}`); continue }
    console.log(`      ✅ Form submitted (status=new) — id ${cr.id.slice(0, 8)}...`)

    // 4b. Reception contacted
    await supabase.from('consultation_requests').update({
      status: 'contacted', contacted_by: hanhChinhId, contacted_at: new Date().toISOString(),
    }).eq('id', cr.id)
    console.log(`      ✅ Reception contacted (status=contacted)`)

    // 4c. Info completed
    await supabase.from('consultation_requests').update({
      status: 'info_completed', extended_info: c.extended_info,
    }).eq('id', cr.id)
    console.log(`      ✅ Extended info filled (status=info_completed)`)

    // 4d. Director approved
    await supabase.from('consultation_requests').update({
      status: 'approved', approved_by: directorId, approved_at: new Date().toISOString(),
    }).eq('id', cr.id)
    console.log(`      ✅ Director approved (status=approved)`)

    // 4e. Convert to citizen account
    const existingCitizen = await findCitizenByPhone(c.phone)
    let citizenId = existingCitizen
    if (!citizenId) {
      citizenId = await upsertAccount({
        email: c.email, pw: c.pw, fullName: c.fullName, role: 'member', phone: c.phone,
        date_of_birth: c.date_of_birth, gender: c.gender, national_id: c.national_id, address: c.address,
      }, { memberSince: new Date().toISOString().slice(0, 10) })
    }

    // 4f. Link converted_to_citizen_id + status=converted
    await supabase.from('consultation_requests').update({
      status: 'converted', converted_to_citizen_id: citizenId,
    }).eq('id', cr.id)
    console.log(`      ✅ Converted to citizen (status=converted) — citizen_id ${citizenId.slice(0, 8)}...`)

    // 4g. Create health_profile with full data
    const { data: hp } = await supabase.from('health_profiles').select('id').eq('citizen_id', citizenId).maybeSingle()
    if (!hp) {
      const { error: hpErr } = await supabase.from('health_profiles').insert({
        citizen_id: citizenId, ...c.health_profile,
      })
      if (hpErr) console.warn(`      ⚠ Health profile insert error: ${hpErr.message}`)
      else console.log(`      ✅ Health profile đầy đủ (blood ${c.health_profile.blood_type}, ${c.health_profile.chronic_conditions?.length || 0} bệnh mạn)`)
    } else {
      console.log(`      ⏭  Health profile đã tồn tại`)
    }

    // 4h. Upload sample source_document (fake)
    const { error: sdErr } = await supabase.from('source_documents').insert({
      citizen_id: citizenId,
      file_url: `https://example.com/fake-${cr.id}.pdf`,
      file_type: 'application/pdf',
      file_size_bytes: 102400,
      original_filename: `don-thuoc-${c.fullName.replace(/\s+/g, '-')}.pdf`,
      document_type: 'prescription',
      document_date: '2026-04-01',
      facility_name: 'Bệnh viện Bạch Mai',
      uploaded_by: citizenId,
      is_classified: true,
      ai_classification: 'prescription',
      notes: 'Seed sample document cho test flow',
    })
    if (sdErr) console.warn(`      ⚠ Source document: ${sdErr.message}`)
    else console.log(`      ✅ Sample prescription document uploaded`)
  }
}

async function step5Verify() {
  console.log('\n🔍 Step 5: Verify & count')
  const { data: citizens, count: cc } = await supabase.from('citizens').select('*', { count: 'exact', head: false }).limit(100)
  const byRole = {}
  ;(citizens || []).forEach((c) => { byRole[c.role] = (byRole[c.role] || 0) + 1 })
  console.log(`   ✅ Tổng ${cc} citizens, phân loại:`)
  Object.entries(byRole).sort().forEach(([r, n]) => console.log(`      ${r}: ${n}`))

  const { count: crCount } = await supabase.from('consultation_requests').select('*', { count: 'exact', head: true })
  console.log(`   ✅ ${crCount} consultation_requests`)

  const { count: hpCount } = await supabase.from('health_profiles').select('*', { count: 'exact', head: true })
  console.log(`   ✅ ${hpCount} health_profiles`)

  const { count: sdCount } = await supabase.from('source_documents').select('*', { count: 'exact', head: true })
  console.log(`   ✅ ${sdCount} source_documents`)
}

;(async () => {
  try {
    console.log('🚀 AIVIHE Real Account System Setup')
    console.log(`   Target: ${SUPABASE_URL}`)
    await step1SeedManagement()
    await step2SeedTemp()
    await step3SeedRealCustomer()
    await step4FullFlowCustomers()
    await step5Verify()
    console.log('\n✅ DONE — setup + full flow hoàn tất')
  } catch (err) {
    console.error('\n❌ ERROR:', err.message)
    process.exitCode = 1
  }
})()
