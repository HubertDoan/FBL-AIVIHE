import {
  Watch, Activity, Heart, Wifi, AlertTriangle,
  HeartPulse, Thermometer, Droplets, Scale, Eye, Stethoscope, Wind, Microscope, ShieldCheck,
} from 'lucide-react'

/**
 * Section thiết bị IoT — viết lại cẩn thận theo đề xuất chuyên gia
 * Phân biệt rõ: "đã có" vs "đang triển khai" vs "dự kiến"
 * Thêm disclaimer: IoT chỉ hỗ trợ theo dõi, không thay thế đánh giá y khoa
 */
export function IotHealthDevicesSection() {
  return (
    <section className="py-12 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4">
            <Wifi className="size-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">Thong Dong Tech · Lộ trình thiết bị</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Tích hợp thiết bị theo dõi sức khỏe
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed">
            Phối hợp cùng MediExpress — đơn vị IoT y tế tại Việt Nam —
            Thong Dong Tech đang từng bước tích hợp thiết bị wearable
            để dữ liệu chỉ số tự động cập nhật lên AIVIHE.
          </p>
        </div>

        {/* Deployment status legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-teal-500 inline-block" />
            <span className="text-slate-600">Đã triển khai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-slate-600">Đang triển khai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-300 inline-block" />
            <span className="text-slate-600">Dự kiến</span>
          </div>
        </div>

        {/* Metrics tracked with status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricBadge icon={Heart} label="Huyết áp" color="red" status="active" />
          <MetricBadge icon={Activity} label="Nhịp tim" color="pink" status="active" />
          <MetricBadge icon={Watch} label="SpO2" color="blue" status="in-progress" />
          <MetricBadge icon={Activity} label="Đường huyết" color="amber" status="planned" />
        </div>

        {/* Device features */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Lộ trình tích hợp thiết bị
              </h3>
              <ul className="space-y-2.5">
                {[
                  { text: 'Nhập thủ công chỉ số huyết áp, nhịp tim vào AIVIHE', status: 'active' },
                  { text: 'Kết nối GoTrust Box — đồng bộ tự động (đang triển khai)', status: 'in-progress' },
                  { text: 'Wearable theo dõi SpO2, bước chân liên tục', status: 'in-progress' },
                  { text: 'Theo dõi đường huyết, nhiệt độ, ECG', status: 'planned' },
                  { text: 'Cảnh báo tự động khi chỉ số vượt ngưỡng', status: 'planned' },
                  { text: 'Bác sĩ gia đình xem dashboard realtime', status: 'planned' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <StatusDot status={item.status} />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Chỉ số dự kiến giám sát
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Huyết áp', unit: 'mmHg', status: 'active' },
                  { label: 'Nhịp tim', unit: 'BPM', status: 'active' },
                  { label: 'SpO2', unit: '%', status: 'in-progress' },
                  { label: 'Bước chân', unit: 'bước/ngày', status: 'in-progress' },
                  { label: 'Đường huyết', unit: 'mmol/L', status: 'planned' },
                  { label: 'Nhiệt độ', unit: '°C', status: 'planned' },
                  { label: 'Giấc ngủ', unit: 'giờ', status: 'planned' },
                  { label: 'ECG', unit: 'sóng điện tim', status: 'planned' },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 text-center relative">
                    <div className="absolute top-1.5 right-1.5">
                      <StatusDot status={m.status} size="sm" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{m.label}</p>
                    <p className="text-gray-400 text-xs">{m.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CẢM BIẾN THEO DÕI SỨC KHỎE — AI Medical Hub MDEC-003 ═══ */}
        <div id="thiet-bi-mediexpress" className="mt-6 bg-white rounded-2xl border border-blue-100 p-5">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mb-2">
              <Wifi className="size-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Cảm biến theo dõi sức khỏe</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              12 cảm biến y tế tích hợp
              <span className="block text-xs font-normal text-slate-500 mt-0.5">Trạm AI Medical Hub MDEC-003 · MediExpress Vietnam</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 max-w-xl mx-auto">
              Mỗi cảm biến ghi nhận một chỉ số sinh hiệu — dữ liệu tự đồng bộ hồ sơ sức khỏe AIVIHE, không nhập tay.
            </p>
          </div>

          {/* 9 cảm biến tiêu chuẩn */}
          <div className="mb-3">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-blue-500 inline-block" />
              9 cảm biến tiêu chuẩn
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
              <SensorChip icon={HeartPulse} label="Huyết áp" unit="mmHg" />
              <SensorChip icon={Thermometer} label="Nhiệt độ" unit="°C" />
              <SensorChip icon={Droplets} label="SpO₂" unit="%" />
              <SensorChip icon={Scale} label="BMI" unit="kg/m²" />
              <SensorChip icon={Scale} label="Body Fat" unit="%" />
              <SensorChip icon={Eye} label="Tai mũi họng" unit="soi nội" />
              <SensorChip icon={Activity} label="Điện tâm đồ" unit="ECG" />
              <SensorChip icon={Stethoscope} label="Nghe tim phổi" unit="âm thanh" />
              <SensorChip icon={Wind} label="Chức năng phổi" unit="FEV1" />
            </div>
          </div>

          {/* 3 cảm biến tùy chọn */}
          <div className="pt-2.5 border-t border-slate-100">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
              3 cảm biến tùy chọn
            </p>
            <div className="grid grid-cols-3 gap-2">
              <SensorChip icon={Microscope} label="Xét nghiệm" unit="máu" optional />
              <SensorChip icon={Activity} label="Siêu âm" unit="2D/3D" optional />
              <SensorChip icon={ShieldCheck} label="Đo loãng xương" unit="BMD" optional />
            </div>
          </div>

          {/* Phần cứng cảm biến kèm theo */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-slate-400 inline-block" />
              Phần cứng cảm biến đi kèm (8 thiết bị)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SensorHardwareCard emoji="💓" name="Đầu đo huyết áp" />
              <SensorHardwareCard emoji="🫁" name="Cảm biến hô hấp" />
              <SensorHardwareCard emoji="🩺" name="Cảm biến tim phổi" />
              <SensorHardwareCard emoji="👂" name="Cảm biến tai mũi họng" />
              <SensorHardwareCard emoji="⚖️" name="Cảm biến cân BMI" />
              <SensorHardwareCard emoji="📊" name="Cảm biến ECG 6 đạo" />
              <SensorHardwareCard emoji="🏠" name="Homekit cảm biến" />
              <SensorHardwareCard emoji="📱" name='Màn hình cảm ứng 24"' />
            </div>
            <p className="text-[11px] text-slate-500 italic text-center mt-3">
              Toàn bộ cảm biến do MediExpress Vietnam cung cấp — đạt chuẩn y khoa, dữ liệu tự đồng bộ AIVIHE.
            </p>
          </div>
        </div>

        {/* Important disclaimer */}
        <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-xs leading-relaxed">
            <span className="font-semibold">Lưu ý quan trọng:</span>{' '}
            Thiết bị IoT chỉ hỗ trợ theo dõi chỉ số sinh hiệu thường ngày —
            không thay thế đánh giá y khoa của bác sĩ.
            Mọi quyết định điều trị cần có chuyên môn y tế đảm nhận.
          </p>
        </div>
      </div>
    </section>
  )
}

function SensorChip({ icon: Icon, label, unit, optional }: {
  icon: React.ComponentType<{ className?: string }>; label: string; unit: string; optional?: boolean
}) {
  return (
    <div className={`relative flex flex-col items-center gap-0.5 p-2 rounded-lg text-center ${
      optional ? 'bg-amber-50/60 border border-amber-200' : 'bg-blue-50/60 border border-blue-200'
    }`}>
      {/* Pulse dot — signal from sensor */}
      <span className={`absolute top-1 right-1 size-1.5 rounded-full ${
        optional ? 'bg-amber-500' : 'bg-blue-500'
      } animate-pulse`} />
      <Icon className={`size-5 ${optional ? 'text-amber-600' : 'text-blue-600'}`} />
      <span className={`text-[11px] font-semibold leading-tight ${optional ? 'text-amber-900' : 'text-blue-900'}`}>{label}</span>
      <span className={`text-[9px] leading-tight ${optional ? 'text-amber-700/70' : 'text-blue-700/70'}`}>{unit}</span>
    </div>
  )
}

function SensorHardwareCard({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 flex items-center gap-2 hover:border-blue-300 transition-all">
      <span className="text-xl shrink-0" aria-hidden="true">{emoji}</span>
      <span className="text-xs font-semibold text-slate-800 truncate">{name}</span>
    </div>
  )
}

function StatusDot({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'size-2' : 'size-2.5'
  const colorMap: Record<string, string> = {
    active: 'bg-teal-500',
    'in-progress': 'bg-amber-400',
    planned: 'bg-slate-300',
  }
  return (
    <span className={`${sizeClass} rounded-full ${colorMap[status] ?? 'bg-slate-300'} inline-block shrink-0 mt-1`} />
  )
}

function MetricBadge({ icon: Icon, label, color, status }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  status: string
}) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600 border-red-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  }
  const statusLabel: Record<string, string> = {
    active: 'Đã có',
    'in-progress': 'Đang triển khai',
    planned: 'Dự kiến',
  }
  return (
    <div className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 ${colorMap[color]}`}>
      <Icon className="size-5" />
      <span className="font-medium text-sm">{label}</span>
      <span className="text-xs opacity-70">{statusLabel[status]}</span>
    </div>
  )
}

