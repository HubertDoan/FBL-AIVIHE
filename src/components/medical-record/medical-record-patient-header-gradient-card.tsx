import type { AdministrativeInfo } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Patient header card — red gradient theo SSK-VNeID v10
 * Hiển thị: avatar + tên + DOB + nhóm máu + BHYT + recent events badges
 */

export function MedicalRecordPatientHeaderGradientCard({
  admin,
  recentEvents,
}: {
  admin: AdministrativeInfo | null
  recentEvents?: string[]
}) {
  if (!admin) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 p-4 text-gray-600 text-center">
        Chưa có thông tin định danh. Vào mục <strong>Hồ sơ → Sửa</strong> để nhập.
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-5 text-white shadow-lg"
      style={{ background: 'linear-gradient(135deg, #991b1b, #dc2626, #e11d48)' }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar circle */}
        <div className="size-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold shrink-0">
          {admin.full_name?.[0]?.toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] tracking-wider text-red-200 uppercase font-semibold">
            I. Thông tin định danh
          </p>
          <h2 className="text-xl font-extrabold truncate mt-0.5">{admin.full_name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-white/90">
            <span>📅 {formatDate(admin.date_of_birth)}</span>
            <span>🩸 Nhóm máu {admin.gender === 'male' ? 'Nam' : 'Nữ'}</span>
            {admin.insurance_number && <span>🏥 BHYT: {admin.insurance_number}</span>}
          </div>
        </div>

        {/* Recent events badges */}
        {recentEvents && recentEvents.length > 0 && (
          <div className="hidden sm:flex flex-col gap-1 shrink-0">
            {recentEvents.slice(0, 3).map((evt, i) => (
              <span
                key={i}
                className="bg-white/20 rounded-lg px-2.5 py-1 text-[11px] font-medium truncate max-w-[180px]"
              >
                {evt}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('vi-VN')
  } catch {
    return d
  }
}
