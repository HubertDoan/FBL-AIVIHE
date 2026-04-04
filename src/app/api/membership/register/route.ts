import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  DEMO_COOKIE_NAME,
  DEMO_ACCOUNTS,
  findDemoAccountById,
} from '@/lib/demo/demo-accounts'

const VALID_ROLES = [
  'member',
  'doctor',
  'staff',
  'director',
  'secretary',
  'admin_staff',
  'accountant',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      citizenId,
      fullName,
      gender,
      dateOfBirth,
      idNumber,
      ethnicity,
      occupation,
      education,
      province,
      commune,
      streetAddress,
      role,
    } = body

    // Validate required fields
    if (!citizenId || !gender || !dateOfBirth || !role || !province || !commune) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' },
        { status: 400 }
      )
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Loại thành viên không hợp lệ.' },
        { status: 400 }
      )
    }

    // Validate CCCD format if provided
    if (idNumber && !/^\d{12}$/.test(idNumber)) {
      return NextResponse.json(
        { error: 'Số CCCD/CMND phải có đúng 12 chữ số.' },
        { status: 400 }
      )
    }

    if (isDemoMode()) {
      // Demo mode: update the in-memory account — set status pending_review
      const cookie = request.cookies.get(DEMO_COOKIE_NAME)
      if (cookie?.value) {
        const session = JSON.parse(cookie.value)
        const account = findDemoAccountById(session.id)
        if (account) {
          const idx = DEMO_ACCOUNTS.findIndex((a) => a.id === account.id)
          if (idx !== -1) {
            // Lưu thông tin đăng ký nhưng chưa chuyển role — chờ duyệt
            const acc = DEMO_ACCOUNTS[idx] as unknown as Record<string, unknown>
            acc.registrationStatus = 'pending_review'
            acc.registrationData = {
              gender, dateOfBirth, idNumber, ethnicity, occupation,
              education, province, commune, streetAddress, role,
            }
            acc.registrationDate = new Date().toISOString()
            if (fullName) acc.fullName = fullName
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Đăng ký thành công! Hồ sơ đang chờ xét duyệt.',
      })
    }

    // Production: update via Supabase
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Build address string from components
    const addressParts = [streetAddress, commune, province].filter(Boolean)
    const fullAddress = addressParts.join(', ')

    const { error } = await supabase
      .from('citizens')
      .update({
        full_name: fullName || undefined,
        role,
        gender,
        date_of_birth: dateOfBirth,
        id_number: idNumber || null,
        ethnicity: ethnicity || null,
        occupation: occupation || null,
        education: education || null,
        province: province || null,
        commune: commune || null,
        street_address: streetAddress || null,
        address: fullAddress,
      })
      .eq('id', citizenId)

    if (error) {
      return NextResponse.json(
        { error: 'Không thể cập nhật thông tin. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành viên thành công!',
    })
  } catch {
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
