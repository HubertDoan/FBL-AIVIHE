'use client'

import {
  FileText,
  Brain,
  TrendingUp,
  Stethoscope,
  Users,
  HeartPulse,
  CheckCircle,
} from 'lucide-react'

const BENEFITS = [
  { icon: FileText, text: 'Quản lý hồ sơ sức khỏe trọn đời' },
  { icon: Brain, text: 'AI trích xuất dữ liệu y tế' },
  { icon: TrendingUp, text: 'Theo dõi xu hướng sức khỏe' },
  { icon: Stethoscope, text: 'Chuẩn bị đi khám bệnh' },
  { icon: Users, text: 'Chia sẻ hồ sơ gia đình' },
  { icon: HeartPulse, text: 'Tư vấn bác sĩ gia đình' },
]

interface MembershipCardProps {
  fullName: string
  memberId: string // username@aivihe.vn
  memberSince?: string
  tier?: 'silver' | 'gold' | 'platinum'
}

export function MembershipCard({
  fullName,
  memberId,
  memberSince,
  tier = 'silver',
}: MembershipCardProps) {
  const now = new Date()
  const sinceLabel =
    memberSince ??
    `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

  const tierLabel = tier === 'silver' ? 'BẠC / SILVER' : tier === 'gold' ? 'VÀNG / GOLD' : 'BẠCH KIM / PLATINUM'

  // QR data = JSON with card info (for scanning)
  const qrData = JSON.stringify({
    platform: 'AIVIHE',
    id: memberId,
    name: fullName,
    tier,
    since: sinceLabel,
  })

  return (
    <div className="space-y-6">
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400 p-5 shadow-xl max-w-md mx-auto aspect-[1.6/1] flex flex-col justify-between">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-white/10" />

        {/* Top: FBL logo + Tier badge */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2">
            <img
              src="/fbl-logo.jpg"
              alt="FBL"
              className="h-10 w-auto object-contain rounded"
            />
          </div>
          <div className="bg-gray-700/80 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider">
            {tierLabel}
          </div>
        </div>

        {/* Middle: Name + Member ID */}
        <div className="relative z-10 space-y-1">
          <p className="text-xl font-bold text-gray-900 truncate">
            {fullName || 'Họ và tên'}
          </p>
          <p className="text-base text-gray-700 font-mono font-bold tracking-wide">
            {memberId || '---'}
          </p>
        </div>

        {/* Bottom: Info + QR */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-sm text-gray-600">
              Thành viên từ: <span className="font-semibold">{sinceLabel}</span>
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            {/* QR Code placeholder — contains card data for scanning */}
            <div
              className="size-16 rounded-lg bg-white flex items-center justify-center border border-gray-300 shadow-sm"
              title={qrData}
            >
              <div className="grid grid-cols-5 gap-px p-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`size-2 ${
                      [0,1,2,4,5,6,10,12,14,18,20,21,22,24].includes(i)
                        ? 'bg-gray-800'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[8px] text-gray-500 font-medium">SCAN</p>
          </div>
        </div>

        {/* Bottom right: AIVIHE logo */}
        <div className="absolute bottom-2 right-2 z-10 opacity-30">
          <p className="text-lg font-black text-gray-700 tracking-wider">AIVIHE</p>
        </div>
      </div>

      {/* Benefits list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center">
          Quyền lợi thành viên
        </h3>
        <ul className="space-y-2.5">
          {BENEFITS.map((b) => (
            <li key={b.text} className="flex items-center gap-3 text-base">
              <CheckCircle className="size-5 text-green-600 shrink-0" />
              <b.icon className="size-5 text-purple-600 shrink-0" />
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
