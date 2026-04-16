import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Two side-by-side panels — port từ SSK-VNeID v10 dashboard:
 * Left: Chỉ số gần nhất (height, weight, BP, SpO2)
 * Right: Bất thường (abnormal lab results with severity badges)
 */

export function MedicalRecordLatestVitalsAndAbnormalPanel({ record }: { record: MedicalRecord11Sections }) {
  const latest = record.vital_signs[0]
  const abnormals = record.lab_results.filter(l => l.flag === 'H' || l.flag === 'L')
  const abnormalImaging = record.imaging.filter(i => i.status !== 'normal')

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Chỉ số gần nhất */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            📊 Chỉ số gần nhất
          </h3>
          {latest && (
            <span className="text-xs text-gray-400">
              {new Date(latest.measured_at).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>

        {!latest ? (
          <p className="text-sm text-gray-400 italic">Chưa có dữ liệu chỉ số.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <VitalMetric
              icon="📏"
              label="Chiều cao"
              value={String(latest.height_cm)}
              unit="cm"
              color="#3b82f6"
            />
            <VitalMetric
              icon="⚖️"
              label="Cân nặng"
              value={String(latest.weight_kg)}
              unit="kg"
              color="#8b5cf6"
            />
            <VitalMetric
              icon="🩺"
              label="Huyết áp"
              value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`}
              unit="mmHg"
              color="#dc2626"
              alert={latest.blood_pressure_systolic >= 140}
            />
            <VitalMetric
              icon="🫁"
              label="SpO₂"
              value={latest.spo2 !== null ? String(latest.spo2) : '—'}
              unit="%"
              color="#0284c7"
              alert={latest.spo2 !== null && latest.spo2 < 95}
            />
          </div>
        )}
      </div>

      {/* Bất thường */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm flex items-center gap-1.5 mb-3">
          ⚠️ Bất thường
          {(abnormals.length + abnormalImaging.length) > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {abnormals.length + abnormalImaging.length}
            </span>
          )}
        </h3>

        {abnormals.length === 0 && abnormalImaging.length === 0 ? (
          <p className="text-sm text-green-600 font-medium">✅ Không có chỉ số bất thường.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {abnormals.map(lab => (
              <div key={lab.id} className="flex items-center justify-between gap-2 bg-red-50 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{lab.test_name}</p>
                  <p className="text-xs text-gray-500">{lab.date} · {lab.facility}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${lab.flag === 'H' ? 'text-red-600' : 'text-blue-600'}`}>
                  {lab.value} {lab.unit}
                </span>
              </div>
            ))}
            {abnormalImaging.map(img => (
              <div key={img.id} className="flex items-center justify-between gap-2 bg-amber-50 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    ⚠️ {img.conclusion}
                  </p>
                  <p className="text-xs text-gray-500">{img.date} · {img.facility}</p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                  {img.status === 'severe' ? 'TB-Nặng' : 'Bất thường'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VitalMetric({ icon, label, value, unit, color, alert }: {
  icon: string; label: string; value: string; unit: string; color: string; alert?: boolean
}) {
  return (
    <div className={`rounded-lg p-2.5 ${alert ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <span>{icon}</span> {label}
      </p>
      <p className="text-xl font-extrabold mt-0.5" style={{ color: alert ? '#dc2626' : color }}>
        {value}
        <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  )
}
