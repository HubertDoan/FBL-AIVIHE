'use client'

import { useState } from 'react'
import { Stethoscope, ChevronDown, ChevronUp } from 'lucide-react'
import { LandingDoctorApplicationForm } from './landing-doctor-application-form'

/**
 * Section trên trang chủ dành cho BS muốn tham gia mạng lưới Thong Dong
 * Đặt ngay phía trên form "Đăng ký tư vấn" của khách hàng
 */

const BENEFITS = [
  'Tiếp cận mạng lưới khách hàng cao tuổi tại Hà Nội',
  'Lịch làm việc linh hoạt — toàn thời gian hoặc bán thời gian',
  'Hỗ trợ hồ sơ điện tử AIVIHE — theo dõi sức khỏe bệnh nhân liên tục',
  'Thu nhập rõ ràng — theo buổi, theo ngày hoặc theo gói',
]

export function LandingDoctorApplicationSection() {
  const [showForm, setShowForm] = useState(false)

  return (
    <section
      id="dang-ky-bac-si"
      className="py-6 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white scroll-mt-6"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex size-14 rounded-2xl bg-teal-600 items-center justify-center shrink-0">
            <Stethoscope className="size-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-1">
              Dành cho Bác sĩ
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              Bạn là Bác sĩ? Đăng ký tham gia mạng lưới Thong Dong
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Cùng chúng tôi chăm sóc sức khỏe người cao tuổi — phòng khám tại nhà, tư vấn định kỳ, phối hợp đa chuyên khoa.
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <ul className="grid sm:grid-cols-2 gap-2 mb-6">
          {BENEFITS.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 size-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* Toggle form */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md shadow-teal-500/20 hover:shadow-lg transition-all text-sm md:text-base"
          >
            <Stethoscope className="size-4" />
            Đăng ký Bác sĩ gia đình
            {showForm ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {/* Collapsible form */}
        {showForm && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <LandingDoctorApplicationForm />
          </div>
        )}
      </div>
    </section>
  )
}
