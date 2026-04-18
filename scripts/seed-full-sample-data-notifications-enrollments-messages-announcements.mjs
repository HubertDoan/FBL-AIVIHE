#!/usr/bin/env node
/**
 * Seed full sample data cho 3 bảng còn trống để test UI đầy đủ:
 * 1. notifications — 9 thông báo (3/customer, từ admin/director/hành chính)
 * 2. service_enrollments — 3 gói (1/customer, match channel đăng ký ban đầu)
 * 3. conversations + messages — 3 chat 2-chiều KH ↔ hành chính
 * 4. director_announcements — 3 broadcast event/program/promotion
 *
 * Idempotent: check existing trước khi insert.
 * Run: node scripts/seed-full-sample-data-notifications-enrollments-messages-announcements.mjs
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

async function getIds() {
  const { data } = await supabase.from('citizens').select('id,email,full_name')
  const map = Object.fromEntries(data.map((c) => [c.email, { id: c.id, name: c.full_name }]))
  return map
}

async function step1Notifications(ids) {
  console.log('\n🔔 Step 1: Seed notifications (9 thông báo)')
  const customers = [
    { email: 'hoant@aivihe.vn', name: 'Hoa' },
    { email: 'minhtv@aivihe.vn', name: 'Minh' },
    { email: 'phuonglt@aivihe.vn', name: 'Phương' },
  ]
  const adminId = ids['kythuat@aivihe.vn'].id
  const directorId = ids['ngocnt@aivihe.vn'].id
  const receptionId = ids['hanhchinh@aivihe.vn'].id

  const rows = []
  for (const c of customers) {
    const uid = ids[c.email].id
    rows.push(
      // Từ admin (kỹ thuật)
      { user_id: uid, title: 'Hệ thống bảo trì đêm nay', content: 'AIVIHE sẽ bảo trì từ 22h-23h hôm nay 18/04. Vui lòng lưu công việc trước giờ bảo trì.', category: 'system' },
      // Từ giám đốc (sự kiện)
      { user_id: uid, title: 'Sự kiện "Sống Khỏe 60+" Chủ Nhật 25/04', content: 'Thong Dong Life tổ chức buổi sinh hoạt Sống Khỏe 60+ tại trung tâm Sóc Sơn, 8h-11h ngày 25/04. Có khám đo chỉ số miễn phí, tư vấn dinh dưỡng. Mời anh/chị tham dự!', category: 'announcement' },
      // Từ hành chính (cá nhân)
      { user_id: uid, title: 'Nhắc lịch tái khám BS gia đình', content: `${c.name} thân, ngày 22/04 tới (thứ 3) là lịch tái khám BS Nguyễn Hải. Vui lòng xác nhận tham gia giúp em. Cảm ơn!`, category: 'personal' },
    )
  }

  // Check existing để idempotent
  const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true })
  if (count && count >= rows.length) {
    console.log(`   ⏭  Đã có ${count} notifications — skip`)
    return
  }

  const { error } = await supabase.from('notifications').insert(rows)
  if (error) { console.error('   ❌', error.message); return }
  console.log(`   ✅ Inserted ${rows.length} notifications (3/customer × 3 loại)`)
}

async function step2ServiceEnrollments(ids) {
  console.log('\n📦 Step 2: Seed service_enrollments (3 gói)')

  const receptionId = ids['hanhchinh@aivihe.vn'].id

  const enrollments = [
    {
      citizen_id: ids['hoant@aivihe.vn'].id,
      service_type: 'FD', service_code: 'TDL-HN-FD-000101',
      status: 'active', enrolled_by: receptionId,
      notes: 'Gói BS gia đình — BS Nguyễn Hải phụ trách theo dõi tim mạch',
      metadata: { doctor_id: null, subscription_months: 12, fee_per_visit: 300000, visits_per_month: 2 },
    },
    {
      citizen_id: ids['minhtv@aivihe.vn'].id,
      service_type: 'DC', service_code: 'TDL-HN-DC-000102',
      status: 'active', enrolled_by: receptionId,
      notes: 'Daycare 3 buổi/tuần (T2, T4, T6) — ưu tiên suất ăn kiêng tiểu đường',
      metadata: { days_per_week: 3, special_diet: 'diabetic', fee_per_month: 4500000 },
    },
    {
      citizen_id: ids['phuonglt@aivihe.vn'].id,
      service_type: 'RH', service_code: 'TDL-HN-RH-000103',
      status: 'active', enrolled_by: receptionId,
      notes: 'PHCN 8 tuần — trị liệu vận động tay phải sau đột quỵ, tại nhà',
      metadata: { sessions_total: 24, sessions_per_week: 3, location: 'home', therapist_id: null },
    },
  ]

  const { count } = await supabase.from('service_enrollments').select('*', { count: 'exact', head: true })
  if (count && count >= enrollments.length) {
    console.log(`   ⏭  Đã có ${count} enrollments — skip`)
    return
  }

  const { error } = await supabase.from('service_enrollments').insert(enrollments)
  if (error) { console.error('   ❌', error.message); return }
  console.log(`   ✅ Inserted 3 enrollments: FD (Hoa), DC (Minh), RH (Phương)`)
}

async function step3ConversationsAndMessages(ids) {
  console.log('\n💬 Step 3: Seed conversations + messages (3 chat)')

  const hanhChinh = ids['hanhchinh@aivihe.vn']
  const customers = [
    { email: 'hoant@aivihe.vn', greeting: 'Chào chị Hoa, em là Hành Chính AIVIHE. Có gì cần hỗ trợ chị nhắn em nhé!', reply: 'Cảm ơn em. Chị muốn hỏi lịch BS gia đình tuần sau.' },
    { email: 'minhtv@aivihe.vn', greeting: 'Chào anh Minh, em là Hành Chính. Gói Daycare của anh bắt đầu từ thứ 2. Có gì cần sắp xếp anh báo em.', reply: 'OK em, thứ 2 tới anh đến 8h sáng nhé.' },
    { email: 'phuonglt@aivihe.vn', greeting: 'Chào cô Phương, em là Hành Chính. KTV PHCN sẽ đến nhà lúc 14h thứ 3. Có cần điều chỉnh thời gian không cô?', reply: 'Em sắp xếp giúp cô lịch 15h tốt hơn được không?' },
  ]

  const { count: existing } = await supabase.from('conversations').select('*', { count: 'exact', head: true })
  if (existing && existing >= customers.length) {
    console.log(`   ⏭  Đã có ${existing} conversations — skip`)
    return
  }

  for (const c of customers) {
    const customer = ids[c.email]
    // Tạo conversation
    const { data: conv, error: convErr } = await supabase.from('conversations')
      .insert({
        participant_ids: [hanhChinh.id, customer.id],
        last_message: c.reply,
        last_message_at: new Date().toISOString(),
      })
      .select('id').single()
    if (convErr) { console.error(`   ❌ Conv ${c.email}:`, convErr.message); continue }

    // Messages: 3 tin nhắn 2 chiều
    const now = new Date()
    const messages = [
      { conversation_id: conv.id, sender_id: hanhChinh.id, content: c.greeting, is_read: true,
        created_at: new Date(now.getTime() - 3600000 * 2).toISOString() },
      { conversation_id: conv.id, sender_id: customer.id, content: c.reply, is_read: true,
        created_at: new Date(now.getTime() - 3600000).toISOString() },
      { conversation_id: conv.id, sender_id: hanhChinh.id, content: 'Dạ em nhận được rồi, em sẽ sắp xếp và báo lại cô/anh/chị trong hôm nay ạ.', is_read: false,
        created_at: new Date(now.getTime() - 1800000).toISOString() },
    ]
    const { error: msgErr } = await supabase.from('messages').insert(messages)
    if (msgErr) console.warn(`   ⚠ Msg ${c.email}:`, msgErr.message)
    else console.log(`   ✅ ${customer.name} ↔ Hành Chính: 3 messages`)
  }
}

async function step4DirectorAnnouncements(ids) {
  console.log('\n📣 Step 4: Seed director_announcements (3 broadcast)')

  const directorId = ids['ngocnt@aivihe.vn'].id
  const announcements = [
    {
      title: 'Sự kiện "Sống Khỏe 60+" — Chủ Nhật 25/04',
      content: 'Thong Dong Life hân hạnh mời quý khách hàng và người thân tham dự sự kiện "Sống Khỏe 60+" tại trung tâm Sóc Sơn. Chương trình gồm: đo chỉ số miễn phí, tư vấn dinh dưỡng, bài tập thể dục dưỡng sinh, giao lưu âm nhạc. Thời gian: 8h-11h sáng Chủ Nhật 25/04/2026.',
      category: 'event', is_published: true, created_by: directorId,
    },
    {
      title: 'Chương trình khuyến mãi tháng 5: Gói PHCN giảm 20%',
      content: 'Từ 01/05 đến 31/05, đăng ký gói Phục hồi chức năng sẽ được giảm 20% phí trị liệu. Áp dụng cho cả gói 4 tuần và 8 tuần. Đặc biệt miễn phí 1 buổi đánh giá ban đầu.',
      category: 'promotion', is_published: true, created_by: directorId,
    },
    {
      title: 'Buổi tư vấn dinh dưỡng miễn phí — Thứ 7 hàng tuần',
      content: 'Hàng tuần vào thứ 7 (9h-11h), Thong Dong Care tổ chức buổi tư vấn dinh dưỡng miễn phí dành cho người cao tuổi, do chuyên gia TS. BS Phạm Kim Chi trực tiếp chủ trì. Đăng ký trước qua hành chính hoặc tại dashboard.',
      category: 'program', is_published: true, created_by: directorId,
    },
  ]

  const { count } = await supabase.from('director_announcements').select('*', { count: 'exact', head: true })
  if (count && count >= announcements.length) {
    console.log(`   ⏭  Đã có ${count} director_announcements — skip`)
    return
  }

  const { error } = await supabase.from('director_announcements').insert(announcements)
  if (error) { console.error('   ❌', error.message); return }
  console.log(`   ✅ Inserted 3 director announcements (event, promotion, program)`)
}

async function verify(ids) {
  console.log('\n🔍 Verify final state:')
  const { count: n } = await supabase.from('notifications').select('*', { count: 'exact', head: true })
  const { count: e } = await supabase.from('service_enrollments').select('*', { count: 'exact', head: true })
  const { count: c } = await supabase.from('conversations').select('*', { count: 'exact', head: true })
  const { count: m } = await supabase.from('messages').select('*', { count: 'exact', head: true })
  const { count: da } = await supabase.from('director_announcements').select('*', { count: 'exact', head: true })
  console.log(`   notifications:          ${n}`)
  console.log(`   service_enrollments:    ${e}`)
  console.log(`   conversations:          ${c}`)
  console.log(`   messages:               ${m}`)
  console.log(`   director_announcements: ${da}`)
}

;(async () => {
  try {
    console.log('🚀 Seed full sample data cho 3 khách hàng test')
    const ids = await getIds()
    await step1Notifications(ids)
    await step2ServiceEnrollments(ids)
    await step3ConversationsAndMessages(ids)
    await step4DirectorAnnouncements(ids)
    await verify(ids)
    console.log('\n✅ DONE')
  } catch (err) {
    console.error('\n❌ ERROR:', err)
    process.exit(1)
  }
})()
