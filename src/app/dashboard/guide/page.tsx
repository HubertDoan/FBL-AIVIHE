'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen, Upload, Brain, CheckCircle, TrendingUp, ArrowLeft, ArrowRight,
  FileText, HeartPulse, Sparkles, FileBarChart,
  Home, Stethoscope, Activity, Hospital, MessageCircle, CalendarCheck,
  FolderHeart, Bookmark, Bell, MessageSquare, Users,
  UserCircle, Settings, Camera, ShieldCheck, Lock, Phone,
} from 'lucide-react'

/**
 * Hướng dẫn sử dụng AIVIHE — tổng hợp đầy đủ chức năng cho khách hàng
 * Phiên bản 2026-04 với 5 sidebar sections + 4 sections dashboard + 11 tabs hồ sơ
 */
export default function GuidePage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-2">
          <ArrowLeft className="size-4" /> Về tổng quan
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
          <BookOpen className="size-6 text-teal-600" />
          Hướng dẫn sử dụng AIVIHE
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Nền tảng quản lý thông tin sức khỏe cá nhân của hệ sinh thái Thong Dong
        </p>
      </div>

      {/* ============= 4 BƯỚC CƠ BẢN ============= */}
      <Card className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 border-teal-200">
        <CardContent className="pt-5 pb-5 space-y-4">
          <h2 className="text-base font-bold text-teal-900">🚀 4 bước quản lý sức khỏe</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <StepCard step={1} icon={Upload} title="Cập nhật" desc="Upload kết quả xét nghiệm, đơn thuốc, phiếu khám. AI tự đọc và trích xuất." />
            <StepCard step={2} icon={Brain} title="AI phân tích" desc="AI tổng hợp dữ liệu, lập báo cáo đánh giá chung sức khỏe." />
            <StepCard step={3} icon={CheckCircle} title="Bạn xác nhận" desc="Kiểm tra dữ liệu AI trích xuất trước khi lưu. Bạn luôn quyết định." />
            <StepCard step={4} icon={TrendingUp} title="Theo dõi & nâng cấp" desc="Xem xu hướng. Cần chuyên sâu → đăng ký BSGĐ, PHCN, chuyên khoa." />
          </div>
        </CardContent>
      </Card>

      {/* ============= TỔNG QUAN DASHBOARD ============= */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">🏠 Trang Dashboard tổng hợp</h2>
          <p className="text-sm text-slate-600">Khi mở AIVIHE, bạn thấy 4 mục chính:</p>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-teal-600 font-bold">1.</span><span><strong>Tình trạng sức khỏe chung</strong> — AI tổng hợp từ hồ sơ + cảnh báo cần chú ý</span></li>
            <li className="flex gap-2"><span className="text-teal-600 font-bold">2.</span><span><strong>Hoạt động mới nhất</strong> — đợt khám/xét nghiệm/điều trị gần đây</span></li>
            <li className="flex gap-2"><span className="text-teal-600 font-bold">3.</span><span><strong>Gói dịch vụ đang dùng</strong> + nút đăng ký gói mới (collapsible)</span></li>
            <li className="flex gap-2"><span className="text-teal-600 font-bold">4.</span><span><strong>Thông tin từ trung tâm</strong> — thông báo + chương trình & khuyến mãi (đăng ký được)</span></li>
          </ol>
        </CardContent>
      </Card>

      {/* ============= MENU SIDEBAR ============= */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">📋 Menu trong tài khoản — 5 nhóm chức năng</h2>

          {/* Group 1: THÔNG TIN SỨC KHỎE CÁ NHÂN */}
          <SidebarGroup
            title="THÔNG TIN SỨC KHỎE CÁ NHÂN"
            color="teal"
            items={[
              { href: '/dashboard/medical-record', icon: FileText, label: 'Thông tin sức khỏe của tôi', desc: 'Thông tin theo dõi sức khỏe 11 mục: dị ứng, tiền sử bệnh, bệnh nền, tiêm chủng... Bạn tự nhập được 5 mục bằng nút "+ Thêm"' },
              { href: '/dashboard/vitals', icon: HeartPulse, label: 'Chỉ số sức khỏe', desc: '4 chỉ số cơ bản (cao, nặng, HA, đường huyết). 📸 Chụp ảnh máy đo (Omron, OneTouch...) — AI tự đọc giá trị' },
              { href: '/dashboard/upload', icon: Upload, label: 'Upload tài liệu', desc: 'Tải kết quả khám/đơn thuốc/MRI. AI đọc, kiểm tra tên+ngày sinh, bạn xác nhận trước khi lưu' },
              { href: '/dashboard/ai-summary', icon: Sparkles, label: 'AI tổng hợp', desc: 'Báo cáo AI phân tích toàn bộ dữ liệu sức khỏe' },
              { href: '/dashboard/health-report', icon: FileBarChart, label: 'Báo cáo sức khỏe', desc: 'Xuất bản tóm tắt PDF mang đi khám hoặc gửi BS' },
            ]}
          />

          {/* Group 2: 4 KHU VỰC DỊCH VỤ */}
          <SidebarGroup
            title="4 KHU VỰC CHĂM SÓC (mở khi đăng ký gói)"
            color="emerald"
            items={[
              { href: '/dashboard/health-record?tab=daycare', icon: Home, label: 'Daycare', desc: 'Hoạt động hằng ngày tại Thong Dong Daycare — check-in, ăn uống, sinh hoạt, ghi chú NV' },
              { href: '/dashboard/choose-doctor', icon: Stethoscope, label: 'Bác sĩ gia đình', desc: 'Tìm + đăng ký BS gia đình. GĐ sẽ duyệt. Sau đó: Hỏi BS, xem khám/đơn thuốc/khuyến nghị' },
              { href: '/dashboard/health-record?tab=rehab', icon: Activity, label: 'Phục hồi chức năng', desc: 'Buổi trị liệu PHCN — bài tập, mức đau trước/sau, tiến triển' },
              { href: '/dashboard/treatment', icon: Hospital, label: 'Khám chữa bệnh', desc: 'Đợt điều trị hiện tại + đã hoàn thành. Upload bổ sung tài liệu mới (xét nghiệm, MRI từ BV khác) — AI verify khớp tên/SĐT/ngày sinh trước khi lưu' },
            ]}
          />

          {/* Group 3: TÀI LIỆU */}
          <SidebarGroup
            title="TÀI LIỆU"
            color="cyan"
            items={[
              { href: '/dashboard/documents/health', icon: FolderHeart, label: 'Tài liệu sức khỏe', desc: 'Tất cả tài liệu y tế bạn đã upload — đối chiếu/minh chứng khi cần. Filter theo loại (đơn thuốc/xét nghiệm/imaging...)' },
              { href: '/dashboard/documents/personal', icon: Bookmark, label: 'Tài liệu cá nhân', desc: 'Bookmark bài viết hay về sức khỏe (article/link/sách/video/ghi chú). Đánh dấu ⭐ yêu thích để tìm nhanh' },
            ]}
          />

          {/* Group 4: GIAO TIẾP */}
          <SidebarGroup
            title="GIAO TIẾP"
            color="rose"
            items={[
              { href: '/dashboard/notifications', icon: Bell, label: 'Thông báo', desc: '3 loại: 🔧 hệ thống (kỹ thuật), 📢 sự kiện/khuyến mãi (GĐ), 🩺 cá nhân (lịch tái khám, thuốc)' },
              { href: '/dashboard/messages', icon: MessageSquare, label: 'Tin nhắn', desc: 'Chat 2-chiều với Hành chính (Realtime). Read receipt ✓✓. Hỗ trợ 8h-17h, ngoài giờ trả lời trong 24h' },
              { href: '/dashboard/family', icon: Users, label: 'Gia đình', desc: 'Mời người thân (con/cháu) xem thông tin sức khỏe của bạn. Bạn quyết định ai được xem gì' },
            ]}
          />

          {/* Group 5: TÀI KHOẢN */}
          <SidebarGroup
            title="TÀI KHOẢN"
            color="slate"
            items={[
              { href: '/dashboard/profile', icon: UserCircle, label: 'Thông tin tài khoản', desc: 'Họ tên, ngày sinh, CCCD, địa chỉ, email cá nhân, người liên hệ khẩn cấp' },
              { href: '/dashboard/guide', icon: BookOpen, label: 'Hướng dẫn', desc: 'Trang này — tổng hợp toàn bộ chức năng' },
              { href: '/dashboard/settings', icon: Settings, label: 'Cài đặt', desc: 'Đổi mật khẩu, ngôn ngữ, tùy chọn thông báo' },
            ]}
          />
        </CardContent>
      </Card>

      {/* ============= AI FEATURES ============= */}
      <Card className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-blue-200">
        <CardContent className="pt-5 pb-5 space-y-3">
          <h2 className="text-base font-bold text-blue-900 flex items-center gap-2">
            <Sparkles className="size-5" /> Tính năng AI
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <AiFeature icon={Camera} title="OCR ảnh máy đo" desc="Chụp màn hình máy HA Omron, máy đường huyết OneTouch... AI tự đọc SYS/DIA/PULSE/glucose, lưu vào đúng chỉ số" />
            <AiFeature icon={FileText} title="OCR tài liệu y tế" desc="Upload PDF/ảnh đơn thuốc, kết quả xét nghiệm, MRI. AI trích xuất chỉ số + ngày + bệnh viện" />
            <AiFeature icon={ShieldCheck} title="Verify thông tin" desc="AI kiểm tra tên+SĐT+ngày sinh trên tài liệu khớp với tài khoản. Sai → cảnh báo cho bạn sửa" />
            <AiFeature icon={Brain} title="Tổng hợp sức khỏe" desc="AI phân tích toàn bộ dữ liệu, lập báo cáo: bệnh nền, thuốc đang dùng, chỉ số bất thường" />
          </div>
        </CardContent>
      </Card>

      {/* ============= QUY TRÌNH KHI CẦN HỖ TRỢ ============= */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">📞 Khi bạn cần hỗ trợ</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <FlowStep num="1" title="Đăng ký gói dịch vụ" desc="Vào Dashboard → 'Đăng ký gói dịch vụ mới' → chọn gói → thông tin tự động điền → submit. Hành chính sẽ gọi xác nhận." />
            <FlowStep num="2" title="Đăng ký BS gia đình" desc="Sidebar → 'Chọn BS gia đình' → xem danh sách BS đã verify → click 'Đăng ký'. Giám đốc sẽ duyệt trong 24h." />
            <FlowStep num="3" title="Tham gia chương trình/khuyến mãi" desc="Dashboard → 'Thông tin từ trung tâm' → tab 'Chương trình & khuyến mãi' → click → 'Đăng ký tham gia'. Hành chính liên hệ xác nhận." />
            <FlowStep num="4" title="Hỏi BS gia đình" desc="Sidebar → 'Hỏi Bác sĩ' (cần đã có BS gia đình). Hoặc nhắn Hành chính qua 'Tin nhắn'." />
            <FlowStep num="5" title="Chuẩn bị đi khám" desc="Sidebar → 'Đi khám bệnh' → AI tạo bản tóm tắt SK + danh mục tài liệu cần mang. Mang theo khi gặp BS." />
          </div>
        </CardContent>
      </Card>

      {/* ============= 3 ĐIỀU CAM KẾT ============= */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-5 pb-5 space-y-2">
          <h2 className="text-base font-bold text-amber-900">⚖ 3 điều bạn cần biết</h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <CheckCircle className="size-4 shrink-0 mt-0.5 text-amber-700" />
              <span>AIVIHE giúp bạn <strong>hiểu và quản lý dữ liệu sức khỏe của mình</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="size-4 shrink-0 mt-0.5 text-amber-700" />
              <span>AI chỉ <strong>tổng hợp và giải thích</strong> thông tin, <strong>không thay thế bác sĩ</strong> và không chẩn đoán bệnh.</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="size-4 shrink-0 mt-0.5 text-amber-700" />
              <span>Dữ liệu sức khỏe <strong>thuộc về bạn</strong>, chỉ chia sẻ khi có sự cho phép của bạn.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* ============= 3 KÊNH TIẾP CẬN ============= */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Phone className="size-5 text-teal-600" /> 3 điểm chạm vật lý của Thong Dong Life
          </h2>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li><strong>Thong Dong Daycare</strong> — trung tâm chăm sóc ban ngày, sinh hoạt + chỉ số hằng ngày</li>
            <li><strong>Phòng khám Bác sĩ gia đình</strong> — khám tổng quát, theo dõi sức khỏe định kỳ</li>
            <li><strong>Phòng khám Phục hồi chức năng</strong> — đánh giá chức năng, trị liệu</li>
          </ol>
          <p className="text-xs text-slate-500 italic mt-2">
            Mọi điểm chạm đều đồng bộ với tài khoản AIVIHE — bạn xem được tất cả thông tin sức khỏe ở 1 nơi.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function StepCard({ step, icon: Icon, title, desc }: {
  step: number; icon: React.ComponentType<{ className?: string }>; title: string; desc: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-teal-100">
      <div className="size-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className="size-3.5 text-teal-600" />
          <p className="font-semibold text-sm text-slate-900">{title}</p>
        </div>
        <p className="text-xs text-slate-600 leading-snug">{desc}</p>
      </div>
    </div>
  )
}

const COLOR_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    dot: 'bg-teal-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-500' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  slate:   { bg: 'bg-slate-50',   text: 'text-slate-700',   dot: 'bg-slate-500' },
}

function SidebarGroup({ title, color, items }: {
  title: string; color: string;
  items: Array<{ href: string; icon: React.ComponentType<{ className?: string }>; label: string; desc: string }>
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.teal
  return (
    <div>
      <div className={`flex items-center gap-2 mb-2 ${c.text}`}>
        <span className={`size-1.5 rounded-full ${c.dot}`} />
        <h3 className="text-xs font-bold tracking-widest uppercase">{title}</h3>
      </div>
      <ul className={`rounded-lg ${c.bg} p-1.5 space-y-0.5`}>
        {items.map((it) => {
          const Icon = it.icon
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className="flex items-start gap-2.5 p-2 rounded-md hover:bg-white transition group"
              >
                <Icon className={`size-4 ${c.text} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-sm text-slate-900">{it.label}</p>
                    <ArrowRight className="size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-xs text-slate-600 leading-snug mt-0.5">{it.desc}</p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AiFeature({ icon: Icon, title, desc }: {
  icon: React.ComponentType<{ className?: string }>; title: string; desc: string
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-blue-100">
      <div className="size-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900">{title}</p>
        <p className="text-xs text-slate-600 leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function FlowStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50">
      <span className="size-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
        {num}
      </span>
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  )
}
