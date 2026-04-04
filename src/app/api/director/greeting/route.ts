// API quản lý lời chào giám đốc hiển thị trên trang khách
// GET: lấy lời chào hiện tại
// PUT: cập nhật lời chào (chỉ director/super_admin)

import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'

// In-memory store for demo mode
const globalStore = globalThis as unknown as { __AIVIHE_DIRECTOR_GREETING?: DirectorGreeting }

interface DirectorGreeting {
  directorName: string
  centerName: string
  greeting: string
  signature: string
}

const DEFAULT_GREETING: DirectorGreeting = {
  directorName: 'Trần Thị Ngọc Trâm',
  centerName: 'Thong Dong Care',
  greeting:
    'AIVIHE là Trợ lý AI sức khỏe cá nhân giúp khách hàng hiểu và quản lý dữ liệu sức khỏe của mình. ' +
    'Trợ lý AI hỗ trợ tổng hợp và giải thích thông tin, không thay thế bác sĩ. ' +
    'Dữ liệu thuộc về bạn và chỉ được chia sẻ khi bạn cho phép.',
  signature: 'Trần Thị Ngọc Trâm, Giám đốc Thong Dong Care',
}

if (!globalStore.__AIVIHE_DIRECTOR_GREETING) {
  globalStore.__AIVIHE_DIRECTOR_GREETING = { ...DEFAULT_GREETING }
}

export async function GET() {
  if (isDemoMode()) {
    return demoResponse(globalStore.__AIVIHE_DIRECTOR_GREETING)
  }
  // Production: read from settings table
  return NextResponse.json(DEFAULT_GREETING)
}

export async function PUT(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (!['director', 'super_admin'].includes(user.role)) return demoForbidden()

    const body = await request.json()
    const current = globalStore.__AIVIHE_DIRECTOR_GREETING!
    if (body.directorName) current.directorName = body.directorName
    if (body.centerName) current.centerName = body.centerName
    if (body.greeting) current.greeting = body.greeting
    if (body.signature) current.signature = body.signature

    return demoResponse(current)
  }
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
