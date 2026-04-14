const STEPS = [
  { icon: '📸', label: 'Chụp ảnh tài liệu', desc: 'Chụp kết quả xét nghiệm, đơn thuốc, phiếu khám bằng điện thoại.' },
  { icon: '🤖', label: 'AI đọc và trích xuất', desc: 'AI tự nhận dạng và trích xuất thông tin quan trọng từ tài liệu.' },
  { icon: '✅', label: 'Bạn xác nhận', desc: 'Kiểm tra dữ liệu AI trích xuất trước khi lưu vào hồ sơ.' },
  { icon: '📊', label: 'Theo dõi liên tục', desc: 'Xem timeline sức khỏe, biểu đồ xu hướng và chuẩn bị đi khám.' },
]

export function HowAiHelpsSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
        AI hỗ trợ bạn như thế nào?
      </h2>
      <p className="text-center text-gray-500 mb-8 text-base">
        4 bước đơn giản để bắt đầu
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((s, i) => (
          <div key={i} className="relative flex flex-col items-center text-center">
            <div className="absolute -top-2 -right-2 size-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shadow">
              {i + 1}
            </div>
            <div className="size-16 rounded-2xl bg-white border-2 border-teal-200 flex items-center justify-center mb-3 shadow-sm text-2xl">
              {s.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{s.label}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
