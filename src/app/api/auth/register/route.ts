import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import {
  DEMO_ACCOUNTS,
  findUniqueDemoUsername,
  addDemoAccount,
} from '@/lib/demo/demo-accounts'

/**
 * Bỏ dấu tiếng Việt: Nguyễn → Nguyen, Minh → Minh, Đức → Duc
 */
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/**
 * Tạo username từ họ tên: tên + chữ cái đầu họ + chữ cái đầu đệm + năm
 * Viết thường, không dấu, không gạch dưới
 * Ví dụ: Nguyễn Văn Minh → minhnv2026
 * Phạm Văn Đức → ducpv2026
 * Nếu trùng → minhnv12026, minhnv22026, ...
 */
function generateUsername(fullName: string): string {
  const parts = removeDiacritics(fullName).trim().split(/\s+/)
  const year = new Date().getFullYear()

  if (parts.length === 1) {
    return `${parts[0].toLowerCase()}${year}@aivihe.vn`
  }

  const ten = parts[parts.length - 1] // Tên (last word)
  const ho = parts[0] // Họ (first word)
  const dem = parts.length > 2 ? parts.slice(1, -1).map(w => w[0]).join('') : '' // Đệm

  const base = `${ten}${ho[0]}${dem}`.toLowerCase()
  return `${base}${year}@aivihe.vn`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const phone = (body.phone ?? '').trim()
    const fullName = (body.full_name ?? '').trim()

    // Validate phone
    if (!phone || !/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.' },
        { status: 400 }
      )
    }

    // Validate name
    if (!fullName || fullName.split(/\s+/).length < 2) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ).' },
        { status: 400 }
      )
    }

    const baseUsername = generateUsername(fullName)
    const defaultPassword = '123456'

    if (isDemoMode()) {
      // Kiểm tra SĐT đã đăng ký chưa
      const existingPhone = DEMO_ACCOUNTS.find((a) => a.phone === phone)
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.' },
          { status: 409 }
        )
      }

      // Kiểm tra trùng username → tự động tăng số
      const uniqueUsername = findUniqueDemoUsername(baseUsername)

      // Lưu vào runtime DEMO_ACCOUNTS để đăng nhập được
      const newId = `demo-reg-${Date.now()}`
      addDemoAccount({
        id: newId,
        email: uniqueUsername,
        password: defaultPassword,
        fullName,
        role: 'guest',
        citizenId: `citizen-${newId}`,
        phone,
        description: `Đăng ký mới (${new Date().toLocaleDateString('vi-VN')})`,
      })

      return NextResponse.json({
        username: uniqueUsername,
        phone,
        fullName,
        password: defaultPassword,
        message: uniqueUsername !== baseUsername
          ? `Đăng ký thành công! Tên "${baseUsername}" đã tồn tại, tài khoản của bạn là "${uniqueUsername}".`
          : 'Đăng ký thành công!',
      })
    }

    // ── PRODUCTION: Supabase ──
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = await createServiceClient()

    // Check if phone already registered
    const { data: existing } = await supabase
      .from('citizens')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.' },
        { status: 409 }
      )
    }

    // Find unique username
    const username = await findUniqueUsername(supabase, baseUsername)

    // Create Supabase auth user
    const fakeEmail = `${username}@aivihe.local`
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      password: defaultPassword,
      email_confirm: true,
      phone,
      phone_confirm: true,
      user_metadata: { username, phone, full_name: fullName },
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return NextResponse.json(
        { error: 'Không thể tạo tài khoản. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    // Create citizen record
    const { error: citizenError } = await supabase
      .from('citizens')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        phone,
        username,
        role: 'guest',
      })

    if (citizenError) {
      console.error('Citizen creation error:', citizenError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Không thể tạo hồ sơ. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      username,
      phone,
      fullName,
      password: defaultPassword,
      message: 'Đăng ký thành công!',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findUniqueUsername(supabase: any, base: string): Promise<string> {
  const { data } = await supabase
    .from('citizens')
    .select('username')
    .eq('username', base)
    .maybeSingle()

  if (!data) return base

  // Tách: prefix + year + @aivihe.vn
  const match = base.match(/^(.+?)(\d{4})(@aivihe\.vn)$/)
  if (!match) return base

  const prefix = match[1]
  const year = match[2]
  const suffix = match[3]

  let counter = 1
  while (counter < 1000) {
    const candidate = `${prefix}${counter}${year}${suffix}`
    const { data: exists } = await supabase
      .from('citizens')
      .select('username')
      .eq('username', candidate)
      .maybeSingle()
    if (!exists) return candidate
    counter++
  }

  return `${prefix}${Date.now()}${year}${suffix}`
}
