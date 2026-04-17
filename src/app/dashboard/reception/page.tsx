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

import { useState } from 'react'
import { PhoneCall, UserCheck, CheckCircle, Home, Activity, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { ConsultationRequestListForReception } from '@/components/reception/consultation-request-list-for-reception'
import { ReceptionPendingMemberRegistrationList } from '@/components/reception/reception-pending-member-registration-list'

const RECEPTION_ACCESS_ROLES = ['reception', 'admin', 'admin_staff', 'manager', 'super_admin', 'director', 'branch_director']

type ActiveView = 'pending' | 'contacted' | 'approved' | 'handoff-daycare' | 'handoff-phcn' | 'members'

const MENU_ITEMS: { key: ActiveView; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { key: 'pending', label: 'Chờ tư vấn', icon: PhoneCall, desc: 'Yêu cầu mới từ website' },
  { key: 'contacted', label: 'Đã tư vấn & Trình duyệt', icon: UserCheck, desc: 'Đã liên hệ, chờ GĐ duyệt' },
  { key: 'approved', label: 'Đã duyệt', icon: CheckCircle, desc: 'GĐ đã duyệt → thông báo KH' },
  { key: 'handoff-daycare', label: 'Chuyển lễ tân Daycare', icon: Home, desc: 'KH đăng ký Daycare → chuyển thông tin' },
  { key: 'handoff-phcn', label: 'Chuyển lễ tân PHCN', icon: Activity, desc: 'KH đăng ký PHCN → chuyển thông tin' },
  { key: 'members', label: 'Danh sách khách hàng', icon: Users, desc: 'KH đã tư vấn thành công' },
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
            <ConsultationRequestListForReception userRole={user?.role || ''} defaultFilter="new" />
          </div>
        )}

        {activeView === 'contacted' && (
          <div className="space-y-3">
            <ViewHeader title="Đã tư vấn & Trình duyệt" desc="Đã liên hệ KH, bổ sung đầy đủ thông tin — chuyển GĐ duyệt" />
            <ConsultationRequestListForReception userRole={user?.role || ''} defaultFilter="contacted" />
          </div>
        )}

        {activeView === 'approved' && (
          <div className="space-y-3">
            <ViewHeader title="Đã duyệt" desc="GĐ đã duyệt — liên hệ KH thông báo kết quả, hướng dẫn tạo tài khoản" />
            <ConsultationRequestListForReception userRole={user?.role || ''} defaultFilter="approved" />
          </div>
        )}

        {activeView === 'handoff-daycare' && (
          <div className="space-y-3">
            <ViewHeader title="Chuyển lễ tân Thong Dong Daycare" desc="KH đã duyệt + đăng ký Daycare → chuyển thông tin sang lễ tân Daycare tại thongdonglife.vn" />
            <HandoffCard
              title="Quy trình chuyển KH sang Daycare"
              steps={[
                'KH đã được GĐ duyệt → xác nhận đăng ký gói Daycare',
                'NV hành chính gọi điện KH xác nhận lịch đến trung tâm',
                'Chuyển thông tin KH (tên, SĐT, ghi chú) sang lễ tân Daycare',
                'Lễ tân Daycare tại thongdonglife.vn tiếp nhận và khai hồ sơ Daycare',
                'Hồ sơ sức khỏe trên AIVIHE tự động liên thông khi KH check-in Daycare',
              ]}
              link="https://thongdonglife.vn"
              linkLabel="Mở Thong Dong Daycare"
            />
            <ConsultationRequestListForReception userRole={user?.role || ''} />
          </div>
        )}

        {activeView === 'handoff-phcn' && (
          <div className="space-y-3">
            <ViewHeader title="Chuyển lễ tân PHCN" desc="KH đã duyệt + đăng ký PHCN → chuyển thông tin sang phòng khám PHCN" />
            <HandoffCard
              title="Quy trình chuyển KH sang PHCN"
              steps={[
                'KH đã được GĐ duyệt → xác nhận đăng ký gói Phục hồi chức năng',
                'NV hành chính liên hệ KH xác nhận nhu cầu (tại trung tâm hoặc tại nhà)',
                'Chuyển thông tin KH sang KTV PHCN (tên, SĐT, tình trạng, ghi chú)',
                'KTV PHCN liên hệ KH để đặt lịch đánh giá chức năng ban đầu',
                'Hồ sơ PHCN trên AIVIHE tự động cập nhật sau mỗi buổi trị liệu',
              ]}
              link={undefined}
              linkLabel=""
            />
            <ConsultationRequestListForReception userRole={user?.role || ''} />
          </div>
        )}

        {activeView === 'members' && (
          <div className="space-y-3">
            <ViewHeader title="Danh sách khách hàng" desc="KH đã tư vấn thành công + đang sử dụng AIVIHE" />
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

function HandoffCard({ title, steps, link, linkLabel }: {
  title: string; steps: string[]; link?: string; linkLabel: string
}) {
  return (
    <Card className="border-teal-200 bg-teal-50/30">
      <CardContent className="pt-4 pb-4">
        <h3 className="font-bold text-teal-900 mb-2">{title}</h3>
        <ol className="space-y-1.5 text-sm text-teal-800">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="size-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition"
          >
            {linkLabel} →
          </a>
        )}
      </CardContent>
    </Card>
  )
}
