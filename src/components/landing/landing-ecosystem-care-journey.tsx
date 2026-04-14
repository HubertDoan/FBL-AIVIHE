import Image from 'next/image'
import { ArrowRight, Brain, Stethoscope, Activity, ShieldCheck } from 'lucide-react'

/**
 * Section mô tả hành trình chăm sóc sức khỏe trong hệ sinh thái Thong Dong Life:
 * AI tổng hợp → Bác sĩ gia đình → Chuyên khoa PHCN → Chuyên khoa sâu
 */
export function EcosystemCareJourney() {
  return (
    <section className="py-12 bg-gradient-to-b from-teal-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <Image
            src="/thong-dong-life-logo.png"
            alt="Thong Dong Life"
            width={160}
            height={64}
            className="h-12 w-auto mx-auto mb-3"
          />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Hệ sinh thái Thong Dong Life đồng hành cùng bạn
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
            Khi dữ liệu sức khỏe được tập trung, trợ lý AI sẽ tổng hợp và cho bạn
            bức tranh toàn cảnh về sức khỏe — để bạn tự quyết định cần làm gì
            với chính sức khỏe của mình.
          </p>
        </div>

        {/* Journey steps */}
        <div className="grid md:grid-cols-4 gap-6">
          <JourneyStep
            icon={Brain}
            step={1}
            title="AI tổng hợp"
            desc="Dữ liệu tập trung một nơi, AI vẽ ra bức tranh sức khỏe toàn diện cho bạn."
          />
          <JourneyStep
            icon={Stethoscope}
            step={2}
            title="Bác sĩ gia đình"
            desc="Theo dõi sự thay đổi sức khỏe theo thời gian, ảnh hưởng của lối sống, ăn uống, tuổi tác và môi trường. Phát hiện từ sớm, từ xa, dự phòng."
          />
          <JourneyStep
            icon={Activity}
            step={3}
            title="Chuyên khoa & PHCN"
            desc="Bác sĩ chuyên khoa, phục hồi chức năng — dự phòng, phát hiện sớm, phục hồi sức khỏe khi cần."
          />
          <JourneyStep
            icon={ShieldCheck}
            step={4}
            title="Mỗi ngày hạnh phúc"
            desc="Tất cả để đảm bảo mỗi ngày của bạn là một ngày khỏe mạnh, an vui và có ý nghĩa."
          />
        </div>

        {/* Ecosystem brands + link */}
        <div className="mt-10 text-center">
          <div className="flex flex-wrap justify-center gap-3 text-sm text-teal-700 mb-4">
            {['🌿 Thong Dong Life', '🏠 Daycare', '🏡 Home', '🌳 Land', '💻 Tech'].map((t) => (
              <span key={t} className="bg-white/70 px-3 py-1.5 rounded-full border border-teal-200">{t}</span>
            ))}
          </div>
          <a
            href="https://thongdonglife.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium text-sm underline underline-offset-2"
          >
            Tìm hiểu thêm tại thongdonglife.vn <ArrowRight className="size-3" />
          </a>
        </div>
      </div>
    </section>
  )
}

function JourneyStep({ icon: Icon, step, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  step: number
  title: string
  desc: string
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-teal-100 p-6 text-center hover:shadow-md transition-shadow">
      <div className="absolute -top-3 -right-2 size-8 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center shadow">
        {step}
      </div>
      <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-teal-50 text-teal-600 mb-4">
        <Icon className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
