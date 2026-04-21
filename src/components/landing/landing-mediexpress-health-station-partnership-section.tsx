'use client'

import Image from 'next/image'
import {
  ExternalLink, Heart, Smartphone, Activity, ShieldCheck,
  Droplets, Thermometer, Wind, Scale, Eye, HeartPulse, Stethoscope,
  Microscope, Monitor, FileText,
} from 'lucide-react'

/**
 * Section "Hợp tác MediExpress" — full info đối tác chiến lược.
 * Layout:
 *  1. Header banner '🤝 Đối tác chiến lược'
 *  2. 50/50 split — image AI Medical Station + 4 benefits chính
 *  3. AI Medical Hub MDEC-003 — 12 chức năng
 *  4. Thiết bị khác kèm theo — 8 devices
 */
export function LandingMediExpressHealthStationPartnershipSection() {
  return (
    <section className="py-10 bg-gradient-to-br from-slate-50 via-white to-blue-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* ═══ HEADER BANNER ═══ */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-1.5 shadow-md mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">🤝 Đối tác chiến lược</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            AIVIHE × <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediExpress Vietnam</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
            Trạm AI Medical Hub + thiết bị wearable + IoT — theo dõi sức khỏe <span className="font-semibold">tự nhiên, không cảm giác đi bệnh viện</span>
          </p>
        </div>

        {/* ═══ 1. 50/50 SPLIT — image + 4 benefits ═══ */}
        <div className="grid md:grid-cols-2 gap-6 items-center mb-8">
          <div className="flex justify-center md:justify-end">
            <div className="relative max-w-xs w-full">
              <div className="absolute -inset-3 bg-gradient-to-br from-blue-200/40 to-teal-200/30 rounded-2xl blur-xl" />
              <div className="relative bg-white rounded-xl border border-slate-200 p-2 shadow-md">
                <Image
                  src="/medi-express-ai-medical-station.jpg"
                  alt="AI Medical Station"
                  width={400}
                  height={500}
                  className="w-full h-64 md:h-72 object-contain rounded-lg"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] px-1">
                  <span className="text-slate-600 font-semibold">AI Medical Station</span>
                  <a href="https://mediexpress.com.vn/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-semibold">
                    mediexpress.com.vn <ExternalLink className="size-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <BenefitRow icon={Heart} color="bg-rose-100 text-rose-600" title="Đo nhanh tại trung tâm" desc="Trạm AI đo HA, cân, cao, BMI, SpO₂... vài phút. Tự đồng bộ AIVIHE." />
            <BenefitRow icon={Smartphone} color="bg-blue-100 text-blue-600" title="Wearable đăng ký" desc="Đeo tay theo dõi nhịp tim, bước, giấc ngủ tại nhà — liên tục." />
            <BenefitRow icon={Activity} color="bg-teal-100 text-teal-600" title="Tự nhiên — không cảm giác BV" desc="Ngồi thoải mái, không xếp hàng, không cần hẹn lịch." />
            <BenefitRow icon={ShieldCheck} color="bg-emerald-100 text-emerald-600" title="Đối tác y tế chính thức" desc="MediExpress + Bệnh viện 199 — chuẩn y khoa, dữ liệu chính xác." />
          </div>
        </div>

        {/* ═══ 2. AI MEDICAL HUB MDEC-003 — 12 chức năng ═══ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Medical Hub <span className="text-sm font-normal text-slate-500">— Model MDEC-003</span></h3>
              <p className="text-xs text-slate-600 mt-0.5">Trung tâm chăm sóc sức khỏe thông minh — 12 chức năng tích hợp</p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">9 tiêu chuẩn + 3 tùy chọn</span>
          </div>

          {/* 9 chức năng tiêu chuẩn */}
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2 mb-3">
            <FeatureChip icon={HeartPulse} label="Huyết áp" />
            <FeatureChip icon={Thermometer} label="Nhiệt độ" />
            <FeatureChip icon={Droplets} label="SpO₂" />
            <FeatureChip icon={Scale} label="BMI" />
            <FeatureChip icon={Scale} label="Body Fat" />
            <FeatureChip icon={Eye} label="Tai mũi họng" />
            <FeatureChip icon={Activity} label="Điện tâm đồ" />
            <FeatureChip icon={Stethoscope} label="Nghe tim phổi" />
            <FeatureChip icon={Wind} label="Chức năng phổi" />
          </div>
          {/* 3 tùy chọn */}
          <div className="border-t border-slate-100 pt-2.5">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">Tính năng tùy chọn</p>
            <div className="grid grid-cols-3 gap-2">
              <FeatureChip icon={Microscope} label="Xét nghiệm" optional />
              <FeatureChip icon={Activity} label="Siêu âm" optional />
              <FeatureChip icon={ShieldCheck} label="Đo loãng xương" optional />
            </div>
          </div>
        </div>

        {/* ═══ 3. THIẾT BỊ KHÁC KÈM THEO — 8 devices ═══ */}
        <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border border-blue-100 p-5">
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest text-center mb-3">📦 Thiết bị khác kèm theo</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <DeviceCard emoji="🫁" name="Hô hấp kế" />
            <DeviceCard emoji="🩺" name="Máy nghe tim phổi" />
            <DeviceCard emoji="👂" name="Máy soi tai mũi họng" />
            <DeviceCard emoji="⚖️" name="Cân BMI" />
            <DeviceCard emoji="💓" name="Máy đo huyết áp" />
            <DeviceCard emoji="📊" name="ECG 6 đạo trình" />
            <DeviceCard emoji="🏠" name="AI Medical Homekit" />
            <DeviceCard emoji="📱" name='Màn hình cảm ứng 24"' />
          </div>
          <p className="text-[11px] text-slate-500 italic text-center mt-3">
            Tất cả thiết bị do MediExpress Vietnam cung cấp — đạt chuẩn y khoa, dữ liệu tự đồng bộ AIVIHE
          </p>
        </div>
      </div>
    </section>
  )
}

function BenefitRow({ icon: Icon, color, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  color: string; title: string; desc: string
}) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 transition-all">
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h3>
        <p className="text-xs text-slate-600 leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function FeatureChip({ icon: Icon, label, optional }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  optional?: boolean
}) {
  return (
    <div className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center ${
      optional ? 'bg-amber-50/60 border border-amber-200' : 'bg-blue-50/60 border border-blue-200'
    }`}>
      <Icon className={`size-5 ${optional ? 'text-amber-600' : 'text-blue-600'}`} />
      <span className={`text-[11px] font-semibold leading-tight ${optional ? 'text-amber-900' : 'text-blue-900'}`}>{label}</span>
    </div>
  )
}

function DeviceCard({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 flex items-center gap-2 hover:border-blue-300 transition-all">
      <span className="text-xl shrink-0" aria-hidden="true">{emoji}</span>
      <span className="text-xs font-semibold text-slate-800 truncate">{name}</span>
    </div>
  )
}
