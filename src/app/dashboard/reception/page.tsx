'use client'

/**
 * Trang Tiếp đón (Reception) — dành cho NHÂN VIÊN công ty, KHÔNG phải khách hàng.
 *
 * Flow công việc:
 * 1. Yêu cầu tư vấn mới từ website + các nguồn → NV xử lý
 * 2. Tư vấn xong → bổ sung info → trình GĐ duyệt
 * 3. GĐ duyệt xong → NV thông báo KH → tạo tài khoản
 * 4. Check mã dịch vụ khi KH đến trung tâm
 *
 * Sidebar cho staff khác hoàn toàn sidebar KH — đơn giản, vào thẳng công việc.
 */

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ClipboardList, PhoneCall, UserCheck, CheckCircle, QrCode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { ConsultationRequestListForReception } from '@/components/reception/consultation-request-list-for-reception'
import { StaffServiceCodeCheckAndDeductTool } from '@/components/services/staff-service-code-check-and-deduct-tool'
import { ReceptionPendingMemberRegistrationList } from '@/components/reception/reception-pending-member-registration-list'
import { ReceptionPatientCard } from '@/components/dashboard/reception-patient-card'
import type { ExamRegistration } from '@/lib/demo/demo-exam-registration-data'

const RECEPTION_ACCESS_ROLES = ['reception', 'admin', 'admin_staff', 'manager', 'super_admin', 'director', 'branch_director']

type ActiveView = 'pending' | 'contacted' | 'approved' | 'service-code' | 'exam' | 'members'

const MENU_ITEMS: { key: ActiveView; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { key: 'pending', label: 'Chờ tư vấn', icon: PhoneCall, desc: 'Yêu cầu mới từ website' },
  { key: 'contacted', label: 'Đã tư vấn & Trình duyệt', icon: UserCheck, desc: 'Đã liên hệ, chờ GĐ duyệt' },
  { key: 'approved', label: 'Đã duyệt', icon: CheckCircle, desc: 'GĐ đã duyệt, thông báo KH' },
  { key: 'service-code', label: 'Check mã dịch vụ', icon: QrCode, desc: 'KH đến trung tâm, trừ lượt' },
  { key: 'exam', label: 'Tiếp nhận khám', icon: ClipboardList, desc: 'Hồ sơ khám đang xử lý' },
  { key: 'members', label: 'Đăng ký thành viên', icon: UserCheck, desc: 'Chờ duyệt thành viên' },
]

export default function ReceptionPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeView, setActiveView] = useState<ActiveView>('pending')

  if (!authLoading && !RECEPTION_ACCESS_ROLES.includes(user?.role || '')) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 max-w-6xl">
      {/* Left menu — danh sách công việc */}
      <div className="w-56 shrink-0 hidden md:block">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Công việc</p>
        <div className="space-y-1">
          {MENU_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeView === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition text-sm ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="size-4 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className={`font-semibold leading-tight ${isActive ? '' : 'text-gray-900'}`}>{item.label}</p>
                  <p className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-teal-100' : 'text-gray-500'}`}>{item.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile menu — horizontal scroll */}
      <div className="md:hidden w-full mb-3 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeView === item.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right content — active view */}
      <div className="flex-1 min-w-0">
        {activeView === 'pending' && (
          <div className="space-y-3">
            <ViewHeader title="Chờ tư vấn" desc="Yêu cầu mới từ trang web và các nguồn — gọi điện liên hệ KH" />
            <ConsultationRequestListForReception userRole={user?.role || ''} />
          </div>
        )}

        {activeView === 'contacted' && (
          <div className="space-y-3">
            <ViewHeader title="Đã tư vấn & Trình duyệt" desc="Đã liên hệ KH, bổ sung đầy đủ thông tin — chuyển GĐ duyệt" />
            <ConsultationRequestListForReception userRole={user?.role || ''} />
          </div>
        )}

        {activeView === 'approved' && (
          <div className="space-y-3">
            <ViewHeader title="Đã duyệt" desc="GĐ đã duyệt — liên hệ KH thông báo kết quả, hướng dẫn tạo tài khoản" />
            <ConsultationRequestListForReception userRole={user?.role || ''} />
          </div>
        )}

        {activeView === 'service-code' && (
          <div className="space-y-3">
            <ViewHeader title="Check mã dịch vụ" desc="KH đến trung tâm — nhập mã SVC-HN-xxx để trừ lượt sử dụng" />
            <StaffServiceCodeCheckAndDeductTool />
          </div>
        )}

        {activeView === 'exam' && (
          <div className="space-y-3">
            <ViewHeader title="Tiếp nhận khám" desc="Hồ sơ khám bệnh đang chờ xử lý" />
            <ExamReceptionContent />
          </div>
        )}

        {activeView === 'members' && (
          <div className="space-y-3">
            <ViewHeader title="Đăng ký thành viên" desc="Danh sách đăng ký thành viên chờ duyệt" />
            <ReceptionPendingMemberRegistrationList />
          </div>
        )}
      </div>
    </div>
  )
}

function ViewHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="pb-2 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  )
}

function ExamReceptionContent() {
  const { loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/exam-registration')
      if (!res.ok) return
      const data = await res.json()
      setRegistrations(data.registrations ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authLoading) loadData()
  }, [authLoading, loadData])

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="size-6 animate-spin" /></div>

  if (registrations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <ClipboardList className="size-10 text-gray-300 mb-2" />
          <p className="text-gray-500">Không có hồ sơ nào đang chờ</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {registrations.map(reg => (
        <ReceptionPatientCard key={reg.id} reg={reg} onUpdated={loadData} />
      ))}
    </div>
  )
}
