import type { AdministrativeInfo } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/** Section I — Thông tin hành chính */
export function MedicalRecordAdministrativeSection({ data }: { data: AdministrativeInfo | null }) {
  if (!data) {
    return <p className="text-sm text-gray-500 italic py-3">Chưa có thông tin hành chính.</p>
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm pt-3">
      <Field label="Họ tên" value={data.full_name} />
      <Field label="Ngày sinh" value={formatDate(data.date_of_birth)} />
      <Field label="Giới tính" value={data.gender === 'male' ? 'Nam' : data.gender === 'female' ? 'Nữ' : 'Khác'} />
      <Field label="CCCD" value={data.national_id} />
      <Field label="SĐT" value={data.phone} />
      <Field label="Dân tộc" value={data.ethnicity || '—'} />
      <Field label="Nghề nghiệp" value={data.occupation || '—'} />
      <Field label="BHYT" value={data.insurance_number || '—'} />
      {data.insurance_facility && <Field label="Nơi KCB ban đầu" value={data.insurance_facility} />}
      <Field label="Địa chỉ" value={data.address} fullWidth />
      {data.emergency_contact && (
        <Field
          label="Người thân liên hệ"
          value={`${data.emergency_contact.name} (${data.emergency_contact.relation}) · ${data.emergency_contact.phone}`}
          fullWidth
        />
      )}
    </div>
  )
}

function Field({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
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
