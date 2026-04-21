'use client'

import { useState } from 'react'

/**
 * Lợi ích theo 5 nhóm người dùng — tabs interface
 * NEW: tách rõ giá trị cho từng nhóm thay vì chung chung
 * PGS.TS. đề xuất: mỗi nhóm có nỗi đau và lợi ích riêng biệt
 */

type UserGroup = {
  id: string
  label: string
  emoji: string
  tagline: string
  benefits: { icon: string; title: string; desc: string }[]
}

const USER_GROUPS: UserGroup[] = [
  {
    id: 'customer',
    label: 'Khách hàng',
    emoji: '👤',
    tagline: 'Chủ động quản lý sức khỏe của chính mình',
    benefits: [
      {
        icon: '📁',
        title: 'Lưu trữ tập trung',
        desc: 'Đơn thuốc, kết quả xét nghiệm, hình ảnh chụp chiếu — tất cả tại một nơi, không mất, không rời rạc.',
      },
      {
        icon: '📈',
        title: 'Theo dõi xu hướng',
        desc: 'Chỉ số huyết áp, đường huyết, cân nặng theo thời gian — thấy ngay thay đổi để chủ động hơn.',
      },
      {
        icon: '🩺',
        title: 'Chuẩn bị đi khám tốt hơn',
        desc: 'Tạo bản tóm tắt sức khỏe, danh sách thuốc đang dùng — giảm thiếu sót khi gặp bác sĩ.',
      },
    ],
  },
  {
    id: 'family',
    label: 'Gia đình',
    emoji: '👨‍👩‍👧',
    tagline: 'Đồng hành cùng cha mẹ dù ở xa',
    benefits: [
      {
        icon: '📱',
        title: 'Theo dõi từ xa',
        desc: 'Nắm được thuốc đang dùng, chỉ số gần nhất, lịch sinh hoạt — ngay cả khi ở thành phố khác.',
      },
      {
        icon: '🔔',
        title: 'Nhận thông báo kịp thời',
        desc: 'Được cập nhật khi có thay đổi quan trọng — khi cha mẹ cho phép chia sẻ thông tin.',
      },
      {
        icon: '🤝',
        title: 'Phối hợp với đội ngũ chăm sóc',
        desc: 'Kết nối cùng Daycare, bác sĩ gia đình trên một nền tảng — không còn hỏi qua lại nhiều kênh.',
      },
    ],
  },
  {
    id: 'daycare',
    label: 'Daycare',
    emoji: '🏠',
    tagline: 'Vận hành chuyên nghiệp, kết nối liền mạch',
    benefits: [
      {
        icon: '📝',
        title: 'Ghi chép sinh hoạt trong ngày',
        desc: 'Chỉ số, bữa ăn, hoạt động, ghi chú đặc biệt — tất cả lưu vào hồ sơ KH tự động.',
      },
      {
        icon: '👨‍👩‍👧',
        title: 'Báo cáo gia đình tự động',
        desc: 'Tổng kết cuối ngày gửi gia đình — minh bạch, chuyên nghiệp, tiết kiệm nhân lực.',
      },
      {
        icon: '🔗',
        title: 'Kết nối liền mạch với AIVIHE',
        desc: 'Dữ liệu Daycare đồng bộ lên AIVIHE — bác sĩ gia đình và gia đình cùng nhìn thấy toàn bộ.',
      },
    ],
  },
  {
    id: 'doctor',
    label: 'Bác sĩ GĐ',
    emoji: '👨‍⚕️',
    tagline: 'Theo dõi liên tục, tư vấn có căn cứ',
    benefits: [
      {
        icon: '📊',
        title: 'Bức tranh sức khỏe toàn diện',
        desc: 'Xem toàn bộ lịch sử: bệnh nền, thuốc, chỉ số, tài liệu — không cần hỏi lại từ đầu.',
      },
      {
        icon: '📉',
        title: 'Theo dõi xu hướng dài hạn',
        desc: 'Biểu đồ chỉ số theo thời gian — phát hiện thay đổi sớm, tư vấn dự phòng kịp thời.',
      },
      {
        icon: '🔄',
        title: 'Phối hợp đa tuyến',
        desc: 'Kết nối với Daycare, PHCN, chuyên khoa — chuyển tuyến có thông tin đầy đủ.',
      },
    ],
  },
  {
    id: 'rehab',
    label: 'PHCN',
    emoji: '🏥',
    tagline: 'Theo dõi tiến triển, cá nhân hóa điều trị',
    benefits: [
      {
        icon: '📋',
        title: 'Hồ sơ tiến triển rõ ràng',
        desc: 'Mỗi buổi trị liệu có ghi chép — KH, gia đình và BSGĐ đều thấy tiến triển theo thời gian.',
      },
      {
        icon: '💪',
        title: 'Bài tập cá nhân hóa',
        desc: 'Kế hoạch tập phục hồi theo từng người — dựa trên đánh giá chức năng ban đầu.',
      },
      {
        icon: '🤝',
        title: 'Phối hợp BSGĐ + gia đình',
        desc: 'Chia sẻ tiến triển PHCN với bác sĩ gia đình và gia đình — chăm sóc liên tục không đứt gãy.',
      },
    ],
  },
]

export function LandingBenefitsByUserGroupTabs() {
  const [activeTab, setActiveTab] = useState('customer')
  const activeGroup = USER_GROUPS.find((g) => g.id === activeTab) ?? USER_GROUPS[0]

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-block text-xs font-bold text-emerald-700 tracking-widest uppercase mb-2">
            Lợi ích theo từng nhóm
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            AIVIHE phục vụ ai?
          </h2>
          <p className="text-slate-600 text-sm">
            Mỗi nhóm có nỗi đau riêng — AIVIHE giải quyết từng trường hợp cụ thể
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {USER_GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === group.id
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              <span role="img" aria-hidden="true">{group.emoji}</span>
              {group.label}
            </button>
          ))}
        </div>

        {/* Active group content */}
        <div className="bg-gradient-to-br from-teal-50/50 to-emerald-50/30 border border-teal-100 rounded-2xl p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" role="img" aria-hidden="true">{activeGroup.emoji}</span>
              <h3 className="text-xl font-bold text-slate-900">{activeGroup.label}</h3>
            </div>
            <p className="text-slate-600 text-sm">{activeGroup.tagline}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {activeGroup.benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-teal-100/50 shadow-sm"
              >
                <div className="text-2xl mb-2" role="img" aria-hidden="true">
                  {benefit.icon}
                </div>
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">{benefit.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
