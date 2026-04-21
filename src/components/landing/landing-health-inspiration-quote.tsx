import { Heart } from 'lucide-react'

/**
 * Section truyền cảm hứng: tại sao sức khỏe là vốn quý nhất
 * Tạo sự chú ý, gợi cảm xúc để khách hàng hành động
 */
export function HealthInspirationQuote() {
  return (
    <section className="py-6 bg-gradient-to-b from-white to-amber-50/30">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-amber-100 text-amber-600 mb-6">
          <Heart className="size-8" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Sức khỏe là vốn quý nhất
        </h2>

        <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6 italic">
          &ldquo;Khi có sức khỏe, ta có rất nhiều ước mơ.
          Nhưng khi mất sức khỏe, ước mơ là người bình thường cũng khó.&rdquo;
        </blockquote>

        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Sức khỏe là nền tảng để theo đuổi mọi ước mơ. Khi khỏe mạnh, con người có nhiều
          khát vọng — nhưng lúc ốm đau, tất cả chỉ thu về một mong muốn duy nhất:
          được bình phục.
        </p>

        <p className="text-lg text-teal-700 font-semibold leading-relaxed">
          Đừng để ước mơ duy nhất của mình chỉ còn là &ldquo;được khỏe mạnh&rdquo;.
          Hãy trân trọng sức khỏe ngay khi còn có thể.
        </p>
      </div>
    </section>
  )
}
