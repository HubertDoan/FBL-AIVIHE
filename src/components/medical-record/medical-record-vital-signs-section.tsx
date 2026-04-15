import type { VitalSignsRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/** Section V — Sinh hiệu & Khám toàn thân */
export function MedicalRecordVitalSignsSection({ items }: { items: VitalSignsRecord[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 italic py-3">Chưa có kết quả đo sinh hiệu.</p>
  }

  // Show latest + history
  const [latest, ...older] = items

  return (
    <div className="space-y-3 pt-3">
      {/* Latest values as metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric label="Huyết áp" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" flag={bpFlag(latest)} />
        <Metric label="Nhịp tim" value={String(latest.pulse)} unit="nhịp/phút" flag={pulseFlag(latest.pulse)} />
        <Metric label="Nhiệt độ" value={latest.temperature.toFixed(1)} unit="°C" flag={tempFlag(latest.temperature)} />
        <Metric label="SpO2" value={latest.spo2 ? `${latest.spo2}` : '—'} unit="%" flag={spo2Flag(latest.spo2)} />
        <Metric label="Nhịp thở" value={String(latest.respiratory_rate)} unit="/phút" />
        <Metric label="Cân nặng" value={`${latest.weight_kg}`} unit="kg" />
        <Metric label="Chiều cao" value={`${latest.height_cm}`} unit="cm" />
        <Metric label="BMI" value={latest.bmi.toFixed(1)} unit="" flag={bmiFlag(latest.bmi)} />
      </div>

      <div className="text-xs text-gray-500">
        Đo lúc: {new Date(latest.measured_at).toLocaleString('vi-VN')} · Nguồn: {latest.source} ·
        Ý thức: <strong>{latest.consciousness}</strong> · Da: <strong>{latest.skin}</strong>
      </div>

      {older.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-teal-700 font-medium">
            Xem lịch sử ({older.length} lần đo trước)
          </summary>
          <div className="mt-2 space-y-1.5">
            {older.map(v => (
              <div key={v.id} className="bg-slate-50 rounded p-2 text-xs">
                <p className="text-gray-600">
                  {new Date(v.measured_at).toLocaleString('vi-VN')} · {v.source}
                </p>
                <p className="font-mono mt-0.5">
                  HA {v.blood_pressure_systolic}/{v.blood_pressure_diastolic} · Nhịp {v.pulse} · SpO2 {v.spo2 ?? '—'}% · Nhiệt {v.temperature}°C
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function Metric({ label, value, unit, flag }: {
  label: string; value: string; unit: string; flag?: 'H' | 'L' | 'N'
}) {
  const flagColor = flag === 'H' ? 'bg-red-50 border-red-200' : flag === 'L' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
  return (
    <div className={`rounded-lg border p-2 ${flagColor}`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{unit}</p>
    </div>
  )
}

function bpFlag(v: VitalSignsRecord): 'H' | 'L' | 'N' {
  if (v.blood_pressure_systolic >= 140 || v.blood_pressure_diastolic >= 90) return 'H'
  if (v.blood_pressure_systolic < 90 || v.blood_pressure_diastolic < 60) return 'L'
  return 'N'
}
function pulseFlag(p: number): 'H' | 'L' | 'N' {
  if (p > 100) return 'H'
  if (p < 60) return 'L'
  return 'N'
}
function tempFlag(t: number): 'H' | 'L' | 'N' {
  if (t >= 37.5) return 'H'
  if (t < 36.0) return 'L'
  return 'N'
}
function spo2Flag(s: number | null): 'H' | 'L' | 'N' {
  if (s === null) return 'N'
  if (s < 95) return 'L'
  return 'N'
}
function bmiFlag(b: number): 'H' | 'L' | 'N' {
  if (b >= 25) return 'H'
  if (b < 18.5) return 'L'
  return 'N'
}
