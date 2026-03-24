import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
} from '@/lib/demo/demo-api-helper'

// Demo data matching the admin store categories
const publicDemoAnnouncements = [
  {
    id: 'ann-1',
    title: 'Chào mừng đến AIVIHE',
    content: 'Hệ thống quản lý sức khỏe cá nhân chính thức ra mắt.',
    category: 'admin',
    target_type: 'all',
    published_at: '2026-03-24T08:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'Cập nhật tính năng mới: Trích xuất AI',
    content: 'AI giúp trích xuất thông tin từ giấy khám bệnh tự động.',
    category: 'admin',
    target_type: 'all',
    published_at: '2026-03-20T08:00:00Z',
  },
  {
    id: 'ann-3',
    title: 'Lịch bảo trì hệ thống',
    content: 'Hệ thống sẽ bảo trì từ 22:00 - 02:00 ngày 16/03.',
    category: 'admin',
    target_type: 'all',
    published_at: '2026-03-15T08:00:00Z',
  },
  {
    id: 'ann-4',
    title: 'Chương trình khám sức khỏe miễn phí tại Sóc Sơn',
    content: 'Khám miễn phí cho người cao tuổi trên 60 tuổi.',
    category: 'center',
    target_type: 'all',
    published_at: '2026-03-22T08:00:00Z',
  },
  {
    id: 'ann-5',
    title: 'Hội thảo sức khỏe cộng đồng lần 3',
    content: 'Chủ đề: Phòng chống bệnh tiểu đường cho người lớn tuổi.',
    category: 'center',
    target_type: 'all',
    published_at: '2026-03-18T08:00:00Z',
  },
  {
    id: 'ann-6',
    title: 'Ra mắt Chương trình Thành viên Nâng cao',
    content: 'Đăng ký ngay để nhận ưu đãi đặc biệt trong tháng đầu tiên.',
    category: 'program',
    target_type: 'member',
    published_at: '2026-03-17T08:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    const userRole = demoUser?.role ?? 'guest'

    const roleMap: Record<string, string> = {
      citizen: 'member',
      doctor: 'doctor',
      admin: 'staff',
      staff: 'staff',
    }
    const mappedRole = roleMap[userRole] ?? 'guest'

    const visible = publicDemoAnnouncements.filter((a) => {
      if (a.target_type === 'all') return true
      if (a.target_type === mappedRole) return true
      if (a.target_type === 'individual' && demoUser) {
        return false // no individual targeting in demo
      }
      return false
    })

    return demoResponse(visible)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userRole = 'guest'
    let userId: string | null = null

    if (user) {
      userId = user.id
      const { data: citizen } = await supabase
        .from('citizens')
        .select('role')
        .eq('id', user.id)
        .single()
      if (citizen) {
        const roleMap: Record<string, string> = {
          citizen: 'member',
          doctor: 'doctor',
          admin: 'staff',
          staff: 'staff',
        }
        userRole = roleMap[citizen.role] ?? 'guest'
      }
    }

    // Build filter: published + (target_type='all' OR matches role OR individual)
    let query = supabase
      .from('announcements')
      .select('id, title, content, category, target_type, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(20)

    // We need to use .or() for target filtering
    const conditions = [`target_type.eq.all`, `target_type.eq.${userRole}`]
    if (userId) {
      conditions.push(`and(target_type.eq.individual,target_user_id.eq.${userId})`)
    }
    query = query.or(conditions.join(','))

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi lấy thông báo: ' + message }, { status: 500 })
  }
}
