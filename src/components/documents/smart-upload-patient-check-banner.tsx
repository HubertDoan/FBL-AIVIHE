import { Lock } from 'lucide-react'

/**
 * Banner hiển thị thông tin BN trước khi upload
 * AI sẽ so sánh tên/DOB trên tài liệu với thông tin này
 * Port từ SSK-VNeID "Patient Check Zone"
 */

interface Props {
  fullName: string
  dob?: string | null
  gender?: string | null
  bloodType?: string | null
}

export function SmartUploadPatientCheckBanner({ fullName, dob, gender, bloodType }: Props) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-3">
      <Lock className="size-5 text-slate-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Xác minh bệnh nhân
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Field label="Họ tên" value={fullName} highlight />
          {dob && <Field label="DOB" value={dob} />}
          {gender && <Field label="Giới tính" value={gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'} />}
          {bloodType && <Field label="Nhóm máu" value={bloodType} />}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          AI sẽ kiểm tra tên và ngày sinh trên tài liệu có khớp với hồ sơ của bạn không.
          Nếu không khớp, bạn sẽ được cảnh báo trước khi lưu.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-xs text-slate-500">{label}:</span>
      <span className={`font-medium ${highlight ? 'text-slate-900' : 'text-slate-700'}`}>{value}</span>
    </span>
  )
}
