#!/usr/bin/env npx tsx
/**
 * Seed 20 demo users into Supabase Auth + citizens table
 * Run: cd aivihe && npx tsx supabase/seed-demo-users-to-supabase.ts
 *
 * Prerequisites:
 * - Supabase project running with migrations applied
 * - .env.local with SUPABASE_URL + SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Demo accounts to seed ───────────────────────────────────────────────────
interface DemoUser {
  email: string
  password: string
  fullName: string
  role: string
  phone: string
  username: string
  description: string
}

// Email = username format: tên + chữ cái đầu họ + đệm + năm@aivihe.vn
// Password chung: Aivihe@2026
const PW = 'Aivihe@2026'

const DEMO_USERS: DemoUser[] = [
  { email: 'minhnv2026@aivihe.vn', password: PW, fullName: 'Nguyễn Văn Minh', role: 'citizen', phone: '0901000001', username: 'minhnv2026@aivihe.vn', description: 'Bệnh nhân chính, nam 62 tuổi' },
  { email: 'lantt2026@aivihe.vn', password: PW, fullName: 'Trần Thị Lan', role: 'citizen', phone: '0901000002', username: 'lantt2026@aivihe.vn', description: 'Vợ, 58 tuổi' },
  { email: 'tuann2026@aivihe.vn', password: PW, fullName: 'Nguyễn Tuấn', role: 'citizen', phone: '0901000003', username: 'tuann2026@aivihe.vn', description: 'Con trai, 35 tuổi' },
  { email: 'ducpv2026@aivihe.vn', password: PW, fullName: 'Phạm Văn Đức', role: 'citizen', phone: '0901000004', username: 'ducpv2026@aivihe.vn', description: 'Hàng xóm, 70 tuổi' },
  { email: 'hain2026@aivihe.vn', password: PW, fullName: 'BS. Nguyễn Hải', role: 'doctor', phone: '0901000005', username: 'hain2026@aivihe.vn', description: 'Bác sĩ gia đình' },
  { email: 'admina2026@aivihe.vn', password: PW, fullName: 'Admin AIVIHE', role: 'admin', phone: '0901000006', username: 'admina2026@aivihe.vn', description: 'Admin hệ thống' },
  { email: 'hoalt2026@aivihe.vn', password: PW, fullName: 'Lê Thị Hoa', role: 'guest', phone: '0901000007', username: 'hoalt2026@aivihe.vn', description: 'Khách' },
  { email: 'tramttn2026@aivihe.vn', password: PW, fullName: 'Trần Thị Ngọc Trâm', role: 'director', phone: '0901000008', username: 'tramttn2026@aivihe.vn', description: 'Giám đốc Thong Dong Care' },
  { email: 'khanhlt2026@aivihe.vn', password: PW, fullName: 'Lưu Tuấn Khanh', role: 'branch_director', phone: '0901000009', username: 'khanhlt2026@aivihe.vn', description: 'GĐ chi nhánh Đông Anh' },
  { email: 'haidn2026@aivihe.vn', password: PW, fullName: 'Doãn Ngọc Hải', role: 'super_admin', phone: '0901000010', username: 'haidn2026@aivihe.vn', description: 'Super Admin' },
  { email: 'maint2026@aivihe.vn', password: PW, fullName: 'Nguyễn Thị Mai', role: 'reception', phone: '0901000011', username: 'maint2026@aivihe.vn', description: 'Tiếp đón' },
  { email: 'namtv2026@aivihe.vn', password: PW, fullName: 'BS. Trần Văn Nam', role: 'exam_doctor', phone: '0901000012', username: 'namtv2026@aivihe.vn', description: 'BS Khám bệnh' },
  { email: 'ducpv12026@aivihe.vn', password: PW, fullName: 'BS. Phạm Văn Đức', role: 'specialist', phone: '0901000013', username: 'ducpv12026@aivihe.vn', description: 'BS Chuyên khoa Tim mạch' },
  { email: 'kythuattm2026@aivihe.vn', password: PW, fullName: 'Trần Minh Kỹ Thuật', role: 'technician', phone: '0901000014', username: 'kythuattm2026@aivihe.vn', description: 'Kỹ thuật' },
  { email: 'phuclv2026@aivihe.vn', password: PW, fullName: 'Lê Văn Phúc', role: 'tech_assistant', phone: '0901000015', username: 'phuclv2026@aivihe.vn', description: 'Kỹ thuật viên' },
  { email: 'huongnt2026@aivihe.vn', password: PW, fullName: 'Nguyễn Thị Hương', role: 'nurse', phone: '0901000016', username: 'huongnt2026@aivihe.vn', description: 'Điều dưỡng' },
  { email: 'ngapt2026@aivihe.vn', password: PW, fullName: 'Phạm Thị Nga', role: 'support_staff', phone: '0901000017', username: 'ngapt2026@aivihe.vn', description: 'NV hỗ trợ' },
  { email: 'anhv2026@aivihe.vn', password: PW, fullName: 'Hoàng Văn An', role: 'intern', phone: '0901000018', username: 'anhv2026@aivihe.vn', description: 'NV thực tập' },
  { email: 'trungvd2026@aivihe.vn', password: PW, fullName: 'Vũ Đức Trung', role: 'manager', phone: '0901000019', username: 'trungvd2026@aivihe.vn', description: 'Quản lý' },
  { email: 'liendt2026@aivihe.vn', password: PW, fullName: 'Đỗ Thị Liên', role: 'admin_staff', phone: '0901000020', username: 'liendt2026@aivihe.vn', description: 'Hành chính' },
]

async function seedUsers() {
  console.log(`\n🌱 Seeding ${DEMO_USERS.length} demo users to ${SUPABASE_URL}\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const user of DEMO_USERS) {
    try {
      // Check if user already exists by phone
      const { data: existing } = await supabase
        .from('citizens')
        .select('id')
        .eq('phone', user.phone)
        .maybeSingle()

      if (existing) {
        console.log(`⏭️  ${user.fullName} (${user.email}) — already exists, skipped`)
        skipped++
        continue
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        phone: user.phone.replace(/^0/, '+84'),
        phone_confirm: true,
        user_metadata: {
          username: user.username,
          phone: user.phone,
          full_name: user.fullName,
        },
      })

      if (authError) {
        // User might exist in auth but not in citizens
        if (authError.message?.includes('already been registered')) {
          console.log(`⏭️  ${user.fullName} — auth exists, checking citizens...`)
          skipped++
          continue
        }
        throw authError
      }

      const authId = authData.user!.id

      // Insert citizen record
      const { error: citizenError } = await supabase.from('citizens').insert({
        id: authId,
        full_name: user.fullName,
        phone: user.phone,
        email: user.email,
        username: user.username,
        role: user.role,
        status: 'active',
        is_active: true,
        has_consented: true,
        member_since: user.role === 'citizen' ? '2025-01-01' : null,
      })

      if (citizenError) throw citizenError

      // Insert health profile for citizen users
      if (['citizen', 'doctor', 'specialist', 'exam_doctor'].includes(user.role)) {
        await supabase.from('health_profiles').insert({
          citizen_id: authId,
          blood_type: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
        })
      }

      console.log(`✅ ${user.fullName} (${user.role}) — ${user.email}`)
      created++
    } catch (err) {
      console.error(`❌ ${user.fullName} — ${(err as Error).message}`)
      failed++
    }
  }

  console.log(`\n📊 Results: ${created} created, ${skipped} skipped, ${failed} failed\n`)
}

seedUsers().catch(console.error)
