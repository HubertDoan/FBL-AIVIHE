import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

/**
 * Tạo username từ họ tên: tên + chữ cái đầu họ + chữ cái đầu đệm + năm
 * Viết thường toàn bộ, KHÔNG gạch dưới
 * Ví dụ: Nguyễn Văn Minh → minhnv2026
 * Nếu trùng → minhnv12026, minhnv22026, ...
 */
function generateUsername(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const year = new Date().getFullYear()

  if (parts.length === 1) {
    return `${parts[0].toLowerCase()}${year}`
  }

  const ten = parts[parts.length - 1] // Tên (last word)
  const ho = parts[0] // Họ (first word)
  const dem = parts.length > 2 ? parts.slice(1, -1).map(w => w[0]).join('') : '' // Đệm

  const base = `${ten}${ho[0]}${dem}`.toLowerCase()
  return `${base}${year}`
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
      return NextResponse.json({
        username: baseUsername,
        phone,
        fullName,
        password: defaultPassword,
        message: 'Đăng ký thành công!',
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
        auth_id: authData.user.id,
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

  // Tách phần trước năm (4 chữ số cuối)
  const match = base.match(/^(.+?)(\d{4})$/)
  if (!match) return base

  const prefix = match[1]
  const year = match[2]

  let counter = 1
  while (counter < 1000) {
    const candidate = `${prefix}${counter}${year}`
    const { data: exists } = await supabase
      .from('citizens')
      .select('username')
      .eq('username', candidate)
      .maybeSingle()
    if (!exists) return candidate
    counter++
  }

  return `${prefix}${Date.now()}${year}`
}
