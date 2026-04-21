/**
 * Section "Nỗi đau trung tâm" — đứt gãy thông tin trong chăm sóc dài hạn
 * NEW section theo đề xuất chuyên gia (PGS.TS. Doãn Ngọc Hải)
 * Background warm rose/amber để tạo urgency
 */
export function LandingPainPointsCentralSection() {
  const painPoints = [
    {
      emoji: '📄',
      text: 'Đi khám xong, không biết giấy tờ ở đâu',
    },
    {
      emoji: '👨‍👩‍👧',
      text: 'Cha mẹ uống nhiều thuốc, con cái ở xa không nắm được',
    },
    {
      emoji: '🏥',
      text: 'Mỗi lần gặp bác sĩ lại phải kể lại từ đầu',
    },
    {
      emoji: '🏃',
      text: 'Nhiều buổi PHCN nhưng không có hồ sơ tiến triển rõ ràng',
    },
    {
      emoji: '📊',
      text: 'Nhiều chỉ số riêng lẻ — không ai nhìn được xu hướng tổng',
    },
  ]

  return (
    <section className="relative py-6 bg-gradient-to-br from-rose-50 via-amber-50/60 to-orange-50/40 overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#dc2626 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-block text-xs font-bold text-rose-600 tracking-widest uppercase mb-3">
            Vấn đề cốt lõi
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
            Đứt gãy thông tin —{' '}
            <span className="text-rose-600">vấn đề lớn nhất</span>{' '}
            trong chăm sóc dài hạn
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Không phải thiếu dữ liệu, mà dữ liệu{' '}
            <span className="font-semibold text-slate-800">rải rác khắp nơi</span>{' '}
            — không ai nhìn được toàn bộ hành trình sức khỏe
          </p>
        </div>

        {/* Pain point cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className={`bg-white/80 backdrop-blur border border-rose-100 rounded-xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md hover:border-rose-200 transition-all ${
                i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <span className="text-2xl shrink-0 mt-0.5" role="img" aria-hidden="true">
                {point.emoji}
              </span>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">
                {point.text}
              </p>
            </div>
          ))}
        </div>

        {/* Bridge to solution */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white border border-teal-200 rounded-xl px-5 py-3 shadow-sm">
            <span className="text-teal-600 font-bold text-sm">AIVIHE giải quyết điều này</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-600 text-sm">
              Một hồ sơ trung tâm, kết nối tất cả điểm chạm
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
