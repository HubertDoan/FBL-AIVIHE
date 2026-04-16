#!/usr/bin/env node
// Auto-test toàn bộ user roles + upload PDF xét nghiệm
// Tự phát hiện lỗi và báo cáo chi tiết

import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:53228'

// Test accounts — cover mỗi role chính
const TEST_ACCOUNTS = [
  { email: 'minhnv2026@aivihe.vn', password: 'Aivihe@2026', role: 'citizen' },
  { email: 'hain2026@aivihe.vn', password: 'Aivihe@2026', role: 'doctor' },
  { email: 'tramttn2026@aivihe.vn', password: 'Aivihe@2026', role: 'director' },
  { email: 'admina2026@aivihe.vn', password: 'Aivihe@2026', role: 'admin' },
  { email: 'maint2026@aivihe.vn', password: 'Aivihe@2026', role: 'reception' },
]

const results = []

function log(msg, level = 'info') {
  const icons = { info: 'ℹ️ ', pass: '✅', fail: '❌', warn: '⚠️ ' }
  console.log(`${icons[level]} ${msg}`)
}

async function request(method, pathStr, { body, cookie, formData } = {}) {
  const headers = { 'Accept': 'application/json' }
  if (cookie) headers.Cookie = cookie

  let fetchBody = undefined
  if (formData) {
    fetchBody = formData
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  const res = await fetch(BASE_URL + pathStr, { method, headers, body: fetchBody, redirect: 'manual' })
  const setCookie = res.headers.get('set-cookie')
  const contentType = res.headers.get('content-type') || ''
  let data = null
  if (contentType.includes('json')) {
    try { data = await res.json() } catch { data = null }
  } else {
    try { data = await res.text() } catch { data = null }
  }
  return { status: res.status, data, cookie: setCookie }
}

async function login(email, password) {
  const { status, data, cookie } = await request('POST', '/api/demo/login', { body: { email, password } })
  if (status !== 200) throw new Error(`Login fail (${status}): ${JSON.stringify(data)}`)
  // Extract demo-auth-session cookie
  const match = cookie?.match(/demo-auth-session=([^;]+)/)
  if (!match) throw new Error('No session cookie returned')
  return 'demo-auth-session=' + match[1]
}

async function testUser(account) {
  const section = `\n═══ Testing ${account.email} (${account.role}) ═══`
  log(section)
  const report = { account: account.email, role: account.role, tests: [] }

  let sessionCookie
  try {
    sessionCookie = await login(account.email, account.password)
    log('Login OK', 'pass')
    report.tests.push({ name: 'login', status: 'pass' })
  } catch (err) {
    log(`Login FAIL: ${err.message}`, 'fail')
    report.tests.push({ name: 'login', status: 'fail', error: err.message })
    results.push(report)
    return
  }

  // Test 1: /api/demo/me
  {
    const { status, data } = await request('GET', '/api/demo/me', { cookie: sessionCookie })
    if (status === 200 && data?.user) {
      log(`me: ${data.user.fullName} (${data.user.role})`, 'pass')
      report.tests.push({ name: 'me', status: 'pass' })
    } else {
      log(`me FAIL status=${status}`, 'fail')
      report.tests.push({ name: 'me', status: 'fail', status_code: status })
    }
  }

  // Test 2: /api/permissions
  {
    const { status, data } = await request('GET', '/api/permissions', { cookie: sessionCookie })
    if (status === 200) {
      log(`permissions: effective=${data.effectivePermissions?.length || 0}`, 'pass')
      report.tests.push({ name: 'permissions', status: 'pass', count: data.effectivePermissions?.length })
    } else {
      log(`permissions FAIL status=${status}`, 'fail')
      report.tests.push({ name: 'permissions', status: 'fail' })
    }
  }

  // Test 3: /api/medical-record
  {
    const { status, data } = await request('GET', '/api/medical-record', { cookie: sessionCookie })
    if (status === 200) {
      const summary = `admin=${!!data.administrative} vitals=${data.vital_signs?.length || 0} labs=${data.lab_results?.length || 0} chronic=${data.chronic_conditions?.length || 0}`
      log(`medical-record OK: ${summary}`, 'pass')
      report.tests.push({ name: 'medical-record', status: 'pass', summary })
    } else {
      log(`medical-record FAIL status=${status}`, 'fail')
      report.tests.push({ name: 'medical-record', status: 'fail' })
    }
  }

  // Test 4: /api/health-record (4 sections)
  {
    const { status, data } = await request('GET', '/api/health-record', { cookie: sessionCookie })
    if (status === 200) {
      const summary = `daycare=${data.daycare?.length || 0} fd=${data.family_doctor?.length || 0} rehab=${data.rehab?.length || 0} clinic=${data.clinic_visits?.length || 0}`
      log(`health-record OK: ${summary}`, 'pass')
      report.tests.push({ name: 'health-record', status: 'pass', summary })
    } else {
      log(`health-record FAIL status=${status}`, 'fail')
      report.tests.push({ name: 'health-record', status: 'fail' })
    }
  }

  // Test 5: /api/consultation
  {
    const { status, data } = await request('GET', '/api/consultation', { cookie: sessionCookie })
    if (status === 200) {
      log(`consultation list OK: ${data.requests?.length || 0} requests`, 'pass')
      report.tests.push({ name: 'consultation-list', status: 'pass', count: data.requests?.length })
    } else {
      log(`consultation list FAIL status=${status}`, 'fail')
      report.tests.push({ name: 'consultation-list', status: 'fail' })
    }
  }

  // Test 6: Upload PDF (xét nghiệm) — chỉ test với citizen
  if (account.role === 'citizen') {
    await testUploadPdfXetNghiem(account, sessionCookie, report)
  }

  // Test 7: /api/service-registration (danh sách gói)
  if (account.role === 'citizen') {
    const { status, data } = await request('GET', '/api/service-registration', { cookie: sessionCookie })
    if (status === 200) {
      log(`service-registration OK: ${data.registrations?.length || 0} đăng ký`, 'pass')
      report.tests.push({ name: 'service-registration', status: 'pass' })
    } else {
      log(`service-registration FAIL status=${status}`, 'fail')
      report.tests.push({ name: 'service-registration', status: 'fail' })
    }
  }

  // Test 8: /api/ai-chat
  {
    const { status, data } = await request('POST', '/api/ai-chat', {
      cookie: sessionCookie,
      body: { messages: [{ role: 'user', content: 'Huyết áp của tôi có ổn không?' }] },
    })
    if (status === 200 && data?.ok) {
      const preview = (data.reply || '').slice(0, 60)
      log(`ai-chat OK: "${preview}..."`, 'pass')
      report.tests.push({ name: 'ai-chat', status: 'pass' })
    } else {
      log(`ai-chat FAIL status=${status}`, 'fail')
      report.tests.push({ name: 'ai-chat', status: 'fail' })
    }
  }

  results.push(report)
}

async function testUploadPdfXetNghiem(account, cookie, report) {
  log('--- Upload PDF xét nghiệm ---', 'info')

  const citizenId = account.role === 'citizen' ? 'demo-0001-0000-0000-000000000001' : null
  if (!citizenId) return

  // Tạo một "PDF" giả (text file đặt tên .pdf để test)
  const fakeContent = Buffer.from('%PDF-1.4\nXét nghiệm máu\nHbA1c: 6.8%\nGlucose: 7.2 mmol/L\nBệnh nhân: Nguyễn Văn Minh')
  const formData = new FormData()
  formData.append('file', new Blob([fakeContent], { type: 'application/pdf' }), 'xet-nghiem-thang-4.pdf')
  formData.append('citizenId', citizenId)

  // Step 1: Upload
  const { status, data } = await request('POST', '/api/documents/upload', { cookie, formData })
  if (status !== 200) {
    log(`Upload FAIL status=${status}: ${JSON.stringify(data).slice(0, 200)}`, 'fail')
    report.tests.push({ name: 'upload-pdf', status: 'fail', status_code: status, error: data?.error })
    return
  }
  log(`Upload OK: documentId=${data.documentId}`, 'pass')
  report.tests.push({ name: 'upload-pdf', status: 'pass', documentId: data.documentId })

  // Step 2: Classify
  const { status: clsStatus, data: clsData } = await request('POST', '/api/documents/classify-and-extract', {
    cookie,
    body: { filename: 'xet-nghiem-thang-4.pdf', customer_name: 'Nguyễn Văn Minh' },
  })
  if (clsStatus !== 200 || !clsData?.ok) {
    log(`Classify FAIL status=${clsStatus}`, 'fail')
    report.tests.push({ name: 'classify', status: 'fail', status_code: clsStatus })
    return
  }
  log(`Classify OK: category=${clsData.result.category} (${clsData.result.category_label})`, 'pass')
  report.tests.push({ name: 'classify', status: 'pass', category: clsData.result.category })

  // Step 3: Save to health record
  const { status: saveStatus, data: saveData } = await request('POST', '/api/health-record/add', {
    cookie,
    body: {
      category: clsData.result.category,
      data: {
        date: new Date().toISOString().slice(0, 10),
        facility: clsData.result.extracted_facility || 'BV Bạch Mai',
        doctor_name: clsData.result.extracted_doctor || 'BS. Phạm Văn Đức',
        specialty: clsData.result.extracted_specialty || 'Hóa sinh',
        reason: 'Xét nghiệm định kỳ',
        diagnosis: 'HbA1c 6.8%, glucose 7.2 mmol/L',
        tests: ['HbA1c', 'Glucose đói'],
        document_ids: [data.documentId],
      },
    },
  })
  if (saveStatus !== 200 || !saveData?.ok) {
    log(`Save health record FAIL status=${saveStatus}: ${JSON.stringify(saveData).slice(0, 200)}`, 'fail')
    report.tests.push({ name: 'save-record', status: 'fail', error: saveData?.error })
    return
  }
  log(`Save OK: recordId=${saveData.record?.id}`, 'pass')
  report.tests.push({ name: 'save-record', status: 'pass' })
}

async function main() {
  console.log(`\n🧪 AUTO-TEST AIVIHE — ${BASE_URL}\n`)

  // Check server alive
  try {
    await request('GET', '/api/demo/accounts')
  } catch (err) {
    console.error(`❌ Server không chạy tại ${BASE_URL}: ${err.message}`)
    process.exit(1)
  }

  for (const account of TEST_ACCOUNTS) {
    try {
      await testUser(account)
    } catch (err) {
      log(`Unexpected error: ${err.message}`, 'fail')
    }
  }

  // Summary
  console.log('\n\n═══ TỔNG KẾT ═══')
  let passCount = 0, failCount = 0
  for (const r of results) {
    const passed = r.tests.filter(t => t.status === 'pass').length
    const failed = r.tests.filter(t => t.status === 'fail').length
    passCount += passed
    failCount += failed
    console.log(`  ${r.account} (${r.role}): ${passed}✅ ${failed > 0 ? failed + '❌' : ''}`)
    for (const t of r.tests.filter(t => t.status === 'fail')) {
      console.log(`    ❌ ${t.name}: ${t.error || t.status_code || 'unknown'}`)
    }
  }
  console.log(`\nTotal: ${passCount} passed · ${failCount} failed\n`)

  // Write JSON report
  const reportPath = path.join(process.cwd(), 'auto-test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), results, summary: { passCount, failCount } }, null, 2))
  console.log(`Report: ${reportPath}`)

  process.exit(failCount > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('❌ Fatal:', err)
  process.exit(1)
})
