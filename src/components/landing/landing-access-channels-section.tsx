import { Home, Stethoscope, Activity, ArrowRight } from 'lucide-react'

/**
 * Section giải thích 3 kênh tiếp cận khách hàng của AIVIHE
 * AIVIHE KHÔNG có điểm tiếp xúc vật lý riêng — khách đến qua:
 * 1. Thong Dong Daycare
 * 2. Phòng khám Bác sĩ gia đình
 * 3. Phòng khám Phục hồi chức năng
 */
export function LandingAccessChannelsSection() {
  return (
    <section className="py-6 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Khách hàng tiếp cận AIVIHE qua 3 điểm chạm của hệ sinh thái Thong Dong
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            AIVIHE là nền tảng quản lý thông tin sức khỏe cá nhân trực tuyến — khách hàng được giới thiệu
            và hỗ trợ khởi tạo tài khoản tại 3 điểm vật lý của hệ sinh thái Thong Dong Life
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ChannelCard
            icon={Home}
            number={1}
            title="Thong Dong Daycare"
            desc="Khách đến trung tâm Daycare sinh hoạt hàng ngày. Lễ tân hỗ trợ khởi tạo tài khoản AIVIHE để quản lý thông tin sức khỏe cá nhân liên tục."
            steps={[
              'Khách đến Daycare',
              'Lễ tân hỗ trợ khởi tạo tài khoản AIVIHE',
              'Cập nhật sinh hoạt, chỉ số và ghi chú chăm sóc hằng ngày khi khách hàng đồng ý',
              'Gia đình theo dõi khi được cho phép',
            ]}
          />
          <ChannelCard
            icon={Stethoscope}
            number={2}
            title="Phòng khám Bác sĩ gia đình"
            desc="Bác sĩ gia đình gặp khách, đánh giá sức khỏe tổng thể và giới thiệu AIVIHE để theo dõi định kỳ, tư vấn dự phòng."
            steps={[
              'Khách đến phòng khám bác sĩ gia đình',
              'Bác sĩ khám, đánh giá',
              'Khách hàng khởi tạo tài khoản AIVIHE',
              'Bác sĩ theo dõi thông tin được chia sẻ và tư vấn dự phòng theo định kỳ',
            ]}
          />
          <ChannelCard
            icon={Activity}
            number={3}
            title="Phòng khám Phục hồi chức năng"
            desc="Kỹ thuật viên phục hồi chức năng đánh giá chức năng vận động và chỉ định trị liệu. AIVIHE hỗ trợ ghi nhận nhật ký trị liệu, bài tập và tiến triển."
            steps={[
              'Khách đến phòng khám phục hồi chức năng',
              'KTV đánh giá chức năng',
              'Khởi tạo tài khoản AIVIHE',
              'Ghi nhận nhật ký trị liệu và tiến triển phục hồi chức năng',
            ]}
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6 italic">
          💡 Chưa từng sử dụng dịch vụ nào? Hãy đăng ký tư vấn bên dưới —
          nhân viên sẽ gọi điện hướng dẫn bạn chọn kênh phù hợp.
        </p>
      </div>
    </section>
  )
}

function ChannelCard({ icon: Icon, number, title, desc, steps }: {
  icon: React.ComponentType<{ className?: string }>
  number: number
  title: string
  desc: string
  steps: string[]
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-teal-100 p-6 hover:shadow-md transition-shadow">
      <div className="absolute -top-3 -left-3 size-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shadow">
        {number}
      </div>
      <div className="inline-flex items-center justify-center size-12 rounded-xl bg-teal-50 text-teal-600 mb-3">
        <Icon className="size-6" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{desc}</p>
      <ol className="space-y-1.5 border-t border-gray-100 pt-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <ArrowRight className="size-3 text-teal-500 shrink-0" />
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
