import { Watch, Activity, Heart, Wifi } from 'lucide-react'

/**
 * Section giới thiệu thiết bị IoT theo dõi sức khỏe
 * Thong Dong Tech cung cấp wearable devices giám sát realtime
 */
export function IotHealthDevicesSection() {
  return (
    <section className="py-12 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4">
            <Wifi className="size-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">Thong Dong Tech</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Thiết bị IoT theo dõi sức khỏe
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed">
            Bên cạnh trợ lý AI, Thong Dong Tech cung cấp các thiết bị đeo thông minh
            giúp theo dõi và giám sát chỉ số sức khỏe realtime — dữ liệu tự động
            cập nhật lên hệ thống AIVIHE.
          </p>
        </div>

        {/* Metrics tracked */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricBadge icon={Heart} label="Huyết áp" color="red" />
          <MetricBadge icon={Activity} label="Nhịp tim" color="pink" />
          <MetricBadge icon={Watch} label="SpO2" color="blue" />
          <MetricBadge icon={Activity} label="Đường huyết" color="amber" />
        </div>

        {/* Device features */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Wearable Devices thông minh
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Đo huyết áp, nhịp tim, SpO2 liên tục 24/7',
                  'Theo dõi đường huyết không xâm lấn',
                  'Giám sát giấc ngủ và mức vận động',
                  'Cảnh báo tức thì khi chỉ số bất thường',
                  'Dữ liệu tự động đồng bộ lên AIVIHE realtime',
                  'Bác sĩ gia đình theo dõi từ xa qua dashboard',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-teal-500 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Các chỉ số sinh học được giám sát
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Huyết áp', unit: 'mmHg' },
                  { label: 'Nhịp tim', unit: 'BPM' },
                  { label: 'SpO2', unit: '%' },
                  { label: 'Đường huyết', unit: 'mmol/L' },
                  { label: 'Nhiệt độ', unit: '°C' },
                  { label: 'Giấc ngủ', unit: 'giờ' },
                  { label: 'Bước chân', unit: 'bước/ngày' },
                  { label: 'ECG', unit: 'sóng điện tim' },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="font-semibold text-gray-900 text-sm">{m.label}</p>
                    <p className="text-gray-400 text-xs">{m.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricBadge({ icon: Icon, label, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600 border-red-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  }
  return (
    <div className={`flex items-center justify-center gap-2 rounded-xl border p-3 ${colorMap[color]}`}>
      <Icon className="size-5" />
      <span className="font-medium text-sm">{label}</span>
    </div>
  )
}
