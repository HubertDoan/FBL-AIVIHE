const STEPS = [
  {
    icon: '📸',
    label: 'Tải lên hoặc chụp ảnh tài liệu',
    desc: 'Chụp kết quả xét nghiệm, đơn thuốc, phiếu khám, giấy hẹn, chỉ số theo dõi hoặc tài liệu sức khỏe liên quan.',
  },
  {
    icon: '🤖',
    label: 'AI hỗ trợ đọc và trích xuất',
    desc: 'AI nhận diện nội dung, trích xuất chỉ số quan trọng, phân nhóm thông tin và gợi ý bản tóm tắt dễ hiểu.',
  },
  {
    icon: '✅',
    label: 'Người dùng kiểm tra và xác nhận',
    desc: 'AIVIHE chỉ lưu thông tin sau khi bạn kiểm tra và xác nhận. Bạn có thể chỉnh sửa, bổ sung hoặc không lưu.',
  },
  {
    icon: '📊',
    label: 'Theo dõi trên hành trình sức khỏe',
    desc: 'Thông tin đã xác nhận hiển thị theo thời gian, giúp khách hàng, gia đình và đội ngũ chăm sóc theo dõi liên tục khi được phân quyền.',
  },
]

export function HowAiHelpsSection() {
  return (
    <section id="cach-aivihe-hoat-dong" className="max-w-5xl mx-auto px-4 py-6 scroll-mt-6">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
        AIVIHE hoạt động như thế nào?
      </h2>
      <p className="text-center text-gray-500 mb-8 text-base">
        4 bước đơn giản để quản lý thông tin sức khỏe cá nhân
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
