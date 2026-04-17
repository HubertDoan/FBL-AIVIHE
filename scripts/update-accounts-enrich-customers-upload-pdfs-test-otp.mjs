#!/usr/bin/env node
/**
 * Apply thầy's answers to 7 unresolved questions:
 * 1. Không có branch → Trâm role 'admin' (thay 'branch_director')
 * 2. Cập nhật personal_email + thông tin cá nhân cho 6 mgmt
 * 3. Enrich 3 fake customers: ethnicity, occupation, family, additional docs
 * 4. Create 'documents' bucket + upload real PDFs + link source_documents.file_url
 * 5. Test OTP flow qua supabase.auth.admin.generateLink
 *
 * Prereq: Migration 00032 applied (personal_email + marital_status + ward + position_title + department + notes).
 * Run: cd aivihe && node scripts/update-accounts-enrich-customers-upload-pdfs-test-otp.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
    .split('\n').filter(Boolean).map((l) => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKET = 'documents'
const SAMPLE_DIR = join(__dirname, '..', 'public', 'sample-pdfs')

// ── 6 Management accounts — update with personal info ─────────────────────
const MGMT_UPDATES = [
  {
    phone: '0904493618', role: 'super_admin', personal_email: 'Haidoanngoc71@gmail.com',
    position_title: 'Super Admin', department: 'Ban Lãnh Đạo',
    notes: 'Sáng lập AIVIHE + Thong Dong Life',
  },
  {
    phone: '0968066666', role: 'director', personal_email: 'Rubynguyen.bbi@gmail.com',
    position_title: 'Giám đốc', department: 'Ban Lãnh Đạo',
    notes: 'Giám đốc điều hành AIVIHE',
  },
  {
    phone: '0975616878', role: 'manager', personal_email: 'lephuong89.sp@gmail.com',
    position_title: 'Quản lý vận hành', department: 'Vận hành',
  },
  {
    phone: '0963278608', role: 'manager', personal_email: 'phamkimchi76@gmail.com',
    position_title: 'Quản lý sản phẩm', department: 'Sản phẩm',
  },
  {
    phone: '0913219888', role: 'admin', personal_email: 'Tranthinhiha73@gmail.com',
    position_title: 'Cố vấn cao cấp', department: 'Cố vấn',
    notes: 'Senior Advisor — tư vấn chiến lược',
  },
  {
    // Thầy's instruction: không có branch → Trâm role 'admin' (quản trị)
    phone: '0384101895', role: 'admin', personal_email: 'Trinityxhn@gmail.com',
    position_title: 'Quản trị viên', department: 'Hành chính - Quản trị',
    notes: 'GĐ Thong Dong Care (daycare vận hành). Role DB = admin vì AIVIHE không có branch riêng.',
  },
]

// ── 3 Fake customers — additional enrichment ──────────────────────────────
const CUSTOMER_ENRICH = [
  {
    phone: '0987111111', fullName: 'Nguyễn Thị Hoa',
    ethnicity: 'Kinh', occupation: 'Giáo viên về hưu', education: 'Đại học Sư phạm',
    marital_status: 'married', province: 'Hà Nội', ward: 'Sóc Sơn',
    personal_email: 'hoant.teacher@gmail.com',
    additional_docs: [
      { type: 'lab_report',      name: 'ket-qua-xet-nghiem-mau-ngay-2026-03-15.pdf', content: 'Kết quả xét nghiệm máu\nNgày: 15/03/2026\nBệnh viện: Bạch Mai\n\nGlucose: 5.6 mmol/L (bình thường)\nCholesterol toàn phần: 5.2 mmol/L (hơi cao)\nHuyết áp: 145/92 mmHg (tăng độ 1)\nHemoglobin: 13.5 g/dL (bình thường)' },
      { type: 'prescription',    name: 'don-thuoc-cao-huyet-ap-ngay-2026-04-01.pdf',  content: 'ĐƠN THUỐC\nHọ tên: Nguyễn Thị Hoa\nSinh: 15/03/1960\nChẩn đoán: Tăng huyết áp độ 1\n\n1. Amlodipine 5mg — 1 viên x sáng, sau ăn\n2. Aspirin 81mg — 1 viên x sáng, sau ăn\n3. Omega-3 1000mg — 1 viên/ngày\n\nTái khám sau 30 ngày.\nBS. Nguyễn Hải — BV Bạch Mai' },
    ],
  },
  {
    phone: '0987222222', fullName: 'Trần Văn Minh',
    ethnicity: 'Kinh', occupation: 'Kỹ sư xây dựng về hưu', education: 'Đại học Xây dựng',
    marital_status: 'married', province: 'Hà Nội', ward: 'Đông Anh',
    personal_email: 'tranvanminh.engineer@gmail.com',
    additional_docs: [
      { type: 'lab_report',      name: 'xet-nghiem-duong-huyet-HbA1c-2026-02-10.pdf', content: 'XÉT NGHIỆM ĐƯỜNG HUYẾT & HbA1c\nHọ tên: Trần Văn Minh\nNgày: 10/02/2026\n\nGlucose lúc đói: 7.8 mmol/L (cao)\nHbA1c: 7.2% (kiểm soát chưa tốt)\nInsulin: 15 μU/mL (bình thường)\n\nKết luận: Tiểu đường type 2, cần điều chỉnh liều Metformin' },
      { type: 'discharge_summary', name: 'tom-tat-xuat-vien-ngay-2026-01-20.pdf',     content: 'TÓM TẮT XUẤT VIỆN\nBệnh nhân: Trần Văn Minh\nNhập viện: 15/01/2026\nXuất viện: 20/01/2026\n\nChẩn đoán: Tiểu đường type 2 mất kiểm soát + biến chứng thần kinh ngoại biên\nXử trí: Điều chỉnh insulin, bổ sung vitamin B1-B6-B12\n\nDặn dò: Theo dõi đường huyết mao mạch 4 lần/ngày, tái khám sau 2 tuần.' },
    ],
  },
  {
    phone: '0987333333', fullName: 'Lê Thị Phương',
    ethnicity: 'Kinh', occupation: 'Nội trợ', education: 'Trung học phổ thông',
    marital_status: 'widowed', province: 'Hà Nội', ward: 'Long Biên',
    personal_email: 'lethiphuong.1958@gmail.com',
    additional_docs: [
      { type: 'imaging',         name: 'mri-so-nao-ngay-2026-03-05.pdf', content: 'KẾT QUẢ MRI SỌ NÃO\nHọ tên: Lê Thị Phương\nNgày chụp: 05/03/2026\n\nTổn thương cũ vùng thái dương đỉnh trái (đột quỵ nhồi máu 2024)\nKhông phát hiện tổn thương mới\nMạch não lưu thông bình thường\n\nKết luận: Di chứng đột quỵ cũ, không tiến triển mới.\nBS. Phạm Văn Đức — Khoa Chẩn đoán hình ảnh' },
      { type: 'referral',        name: 'giay-chuyen-phcn-ngay-2026-03-10.pdf', content: 'GIẤY GIỚI THIỆU CHUYỂN PHỤC HỒI CHỨC NĂNG\nHọ tên: Lê Thị Phương\nNgày: 10/03/2026\n\nChẩn đoán: Di chứng đột quỵ nhẹ — yếu nửa người phải\nYêu cầu: Tập PHCN vận động 3 buổi/tuần, 8 tuần\n\nMục tiêu: Cải thiện khả năng cầm nắm tay phải, đi lại tự tin hơn.\nBS. Nguyễn Hải — Phòng khám BS gia đình' },
    ],
  },
]

// ── PDF Generator ─────────────────────────────────────────────────────────
async function generatePDF(filename, title, content) {
  if (!existsSync(SAMPLE_DIR)) mkdirSync(SAMPLE_DIR, { recursive: true })
  const filepath = join(SAMPLE_DIR, filename)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60 })
    const stream = doc.pipe(createWriteStream(filepath))
    doc.fontSize(18).text(title, { align: 'center' }).moveDown()
    doc.fontSize(11).text(content, { align: 'left' }).moveDown()
    doc.fontSize(9).fillColor('gray').text(`Sample generated ${new Date().toISOString()} — AIVIHE test data`, { align: 'right' })
    doc.end()
    stream.on('finish', () => resolve(filepath))
    stream.on('error', reject)
  })
}

// ── Steps ─────────────────────────────────────────────────────────────────
async function step1EnsureBucket() {
  console.log('\n📦 Step 1: Ensure "documents" bucket exists')
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === BUCKET)
  if (exists) { console.log(`   ⏭  Bucket "${BUCKET}" đã tồn tại`); return }
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true, fileSizeLimit: 10485760, // 10 MB
  })
  if (error) throw new Error(`Create bucket failed: ${error.message}`)
  console.log(`   ✅ Created public bucket "${BUCKET}"`)
}

async function step2UpdateMgmt() {
  console.log('\n👥 Step 2: Update 6 mgmt accounts — role + personal_email + info')
  for (const u of MGMT_UPDATES) {
    const patch = {
      role: u.role, personal_email: u.personal_email,
      position_title: u.position_title, department: u.department,
      notes: u.notes ?? null,
    }
    const { data, error } = await supabase.from('citizens').update(patch).eq('phone', u.phone).select('id,full_name,role,personal_email').single()
    if (error) { console.error(`   ❌ ${u.phone}: ${error.message}`); continue }
    console.log(`   ✅ ${data.full_name} — role=${data.role}, personal=${data.personal_email}`)
  }
}

async function step3EnrichCustomers() {
  console.log('\n🧑 Step 3: Enrich 3 customers + upload real PDFs')

  for (const c of CUSTOMER_ENRICH) {
    console.log(`\n   🧑 ${c.fullName} (${c.phone})`)

    // Get citizen_id
    const { data: citizen } = await supabase.from('citizens').select('id').eq('phone', c.phone).single()
    if (!citizen) { console.error(`      ❌ Not found`); continue }

    // 3a. Patch citizen with more info
    const patch = {
      ethnicity: c.ethnicity, occupation: c.occupation, education: c.education,
      marital_status: c.marital_status, province: c.province, ward: c.ward,
      personal_email: c.personal_email,
    }
    const { error: pErr } = await supabase.from('citizens').update(patch).eq('id', citizen.id)
    if (pErr) console.warn(`      ⚠ Patch: ${pErr.message}`)
    else console.log(`      ✅ Bổ sung personal info (occupation, education, marital_status, ward)`)

    // 3b. Upload additional PDFs
    for (const doc of c.additional_docs) {
      const pdfPath = await generatePDF(doc.name, doc.name.replace(/\.pdf$/, '').replace(/-/g, ' ').toUpperCase(), doc.content)
      const pdfBuffer = readFileSync(pdfPath)
      const storagePath = `${citizen.id}/${crypto.randomUUID()}.pdf`

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, pdfBuffer, {
        cacheControl: '3600', upsert: false, contentType: 'application/pdf',
      })
      if (upErr) { console.warn(`      ⚠ Upload ${doc.name}: ${upErr.message}`); continue }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

      const { error: sdErr } = await supabase.from('source_documents').insert({
        citizen_id: citizen.id,
        file_url: urlData.publicUrl,
        file_type: 'application/pdf',
        file_size_bytes: pdfBuffer.length,
        original_filename: doc.name,
        document_type: doc.type,
        document_date: doc.name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || null,
        facility_name: 'Sample facility',
        uploaded_by: citizen.id,
        is_classified: true,
        ai_classification: doc.type,
        notes: 'Enrichment sample document (real PDF in Supabase Storage)',
      })
      if (sdErr) console.warn(`      ⚠ source_documents insert: ${sdErr.message}`)
      else console.log(`      ✅ Uploaded ${doc.name} (${(pdfBuffer.length / 1024).toFixed(1)}KB) → ${urlData.publicUrl.slice(0, 60)}...`)
    }
  }
}

async function step4TestOTP() {
  console.log('\n🔐 Step 4: Test OTP flow — generate magiclink + OTP')

  const testEmails = ['haidn@aivihe.vn', 'hoant@aivihe.vn', 'tambtq@aivihe.vn']

  for (const email of testEmails) {
    // Generate magiclink type (returns OTP token)
    const { data, error } = await supabase.auth.admin.generateLink({ type: 'magiclink', email })
    if (error) { console.warn(`   ⚠ ${email}: ${error.message}`); continue }
    const otp = data.properties?.email_otp || '(no OTP)'
    console.log(`   ✅ ${email} → OTP: ${otp} (hết hạn trong 60p)`)
  }
  console.log(`\n   ℹ OTP qua phone cần Twilio/SMS provider — hiện Supabase chưa config SMS.`)
  console.log(`   ℹ Landline 0437721039 (Bùi Thị Quỳnh Tâm) → dùng email OTP thay SMS.`)
}

async function step5Verify() {
  console.log('\n🔍 Step 5: Verify final state')
  const { data: roles } = await supabase.from('citizens').select('role').in('role', ['admin', 'super_admin', 'director', 'manager', 'branch_director'])
  const byRole = {}
  ;(roles || []).forEach((r) => { byRole[r.role] = (byRole[r.role] || 0) + 1 })
  console.log('   Admin/management roles:', JSON.stringify(byRole))

  const { data: pe } = await supabase.from('citizens').select('full_name,personal_email').not('personal_email', 'is', null)
  console.log(`   ${pe.length} accounts có personal_email:`)
  pe.forEach((p) => console.log(`      - ${p.full_name} → ${p.personal_email}`))

  const { count: sdCount } = await supabase.from('source_documents').select('*', { count: 'exact', head: true })
  console.log(`   ${sdCount} source_documents`)
}

;(async () => {
  try {
    console.log('🚀 Apply thầy\'s instructions — update accounts + enrich + upload + OTP')
    await step1EnsureBucket()
    await step2UpdateMgmt()
    await step3EnrichCustomers()
    await step4TestOTP()
    await step5Verify()
    console.log('\n✅ DONE')
  } catch (err) {
    console.error('\n❌ ERROR:', err.message)
    process.exitCode = 1
  }
})()
