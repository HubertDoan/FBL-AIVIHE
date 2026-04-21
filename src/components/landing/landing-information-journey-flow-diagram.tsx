/**
 * Sơ đồ hành trình thông tin — AIVIHE ở trung tâm, kết nối các bên
 * NEW section: visual minh họa "không đứt gãy thông tin"
 * AIVIHE = hub trung tâm, tỏa ra 4 nhóm: KH, Gia đình, Daycare, BSGĐ/PHCN
 */
export function LandingInformationJourneyFlowDiagram() {
  const connections = [
    {
      emoji: '👤',
      label: 'Khách hàng',
      desc: 'Khởi tạo & kiểm soát hồ sơ',
      color: 'teal',
      position: 'top',
    },
    {
      emoji: '👨‍👩‍👧',
      label: 'Gia đình',
      desc: 'Theo dõi từ xa khi được phép',
      color: 'emerald',
      position: 'right',
    },
    {
      emoji: '🏠',
      label: 'Thong Dong Daycare',
      desc: 'Ghi chép sinh hoạt hàng ngày',
      color: 'amber',
      position: 'bottom',
    },
    {
      emoji: '👨‍⚕️',
      label: 'Bác sĩ GĐ & PHCN',
      desc: 'Theo dõi chuyên môn liên tục',
      color: 'rose',
      position: 'left',
    },
  ]

  const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-700',
      dot: 'bg-teal-400',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-400',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-400',
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-400',
    },
  }

  return (
    <section className="py-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-2">
            Hành trình thông tin
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            AIVIHE — Trung tâm kết nối không đứt gãy
          </h2>
          <p className="text-slate-600 text-sm">
            Một hồ sơ duy nhất — tất cả các bên nhìn thấy cùng một sự thật
          </p>
        </div>

        {/* Flow diagram — hub + spokes layout */}
        <div className="relative">
          {/* Center hub */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl px-8 py-5 text-white text-center shadow-xl shadow-teal-500/20">
                <div className="text-xs font-bold tracking-widest uppercase text-teal-200 mb-1">
                  Trung tâm dữ liệu
                </div>
                <div className="text-2xl font-bold">AIVIHE</div>
                <div className="text-teal-100 text-xs mt-1">Hồ sơ sức khỏe số trung tâm</div>
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-2xl bg-teal-400/20 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Connection arrows visual (simplified for web) */}
          <div className="flex justify-center mb-6">
            <div className="text-slate-400 text-xs text-center">
              ↕ kết nối hai chiều, an toàn, có kiểm soát ↕
            </div>
          </div>

          {/* Connected nodes grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {connections.map((conn) => {
              const colors = colorMap[conn.color]
              return (
                <div
                  key={conn.label}
                  className={`${colors.bg} ${colors.border} border rounded-xl p-4 text-center relative`}
                >
                  {/* Connector dot */}
                  <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full ${colors.dot} border-2 border-white`} />

                  <div className="text-2xl mb-2" role="img" aria-hidden="true">
                    {conn.emoji}
                  </div>
                  <div className={`font-semibold text-sm ${colors.text} mb-1`}>
                    {conn.label}
                  </div>
                  <div className="text-slate-500 text-xs leading-relaxed">
                    {conn.desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Caption */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 bg-white border border-slate-200 rounded-xl px-6 py-3 shadow-sm">
            {[
              { icon: '🔒', text: 'Dữ liệu thuộc về người dùng' },
              { icon: '✅', text: 'Chia sẻ chỉ khi được phép' },
              { icon: '📡', text: 'Đồng bộ realtime' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span role="img" aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
