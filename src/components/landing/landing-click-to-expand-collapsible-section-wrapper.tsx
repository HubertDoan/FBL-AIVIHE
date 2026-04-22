'use client'

/**
 * Wrapper biến bất kỳ landing section thành collapsible (click-to-expand).
 *
 * Dùng `<details>` HTML native — accessibility + keyboard support tự động.
 * Mặc định đóng để trang ngắn hơn, chỉ user quan tâm mới bấm mở.
 *
 * Usage:
 *   <LandingCollapsibleSection label="Xem cách AI hoạt động" labelOpen="Ẩn chi tiết AI" id="cach-ai">
 *     <HowAiHelpsSection />
 *   </LandingCollapsibleSection>
 */

import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  /** Text trên nút khi đang đóng */
  label: string
  /** Text khi đang mở (optional, fallback reuse label) */
  labelOpen?: string
  /** Anchor id cho deep link (#id) — optional */
  id?: string
  /** Màu accent (Tailwind color name) */
  accent?: 'teal' | 'blue' | 'slate' | 'emerald'
  /** Mặc định mở? (default: false) */
  defaultOpen?: boolean
  children: ReactNode
}

// Accent color classes — tránh Tailwind purge bỏ class động
const ACCENT_CLASSES: Record<NonNullable<Props['accent']>, string> = {
  teal: 'text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border-teal-200',
  blue: 'text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200',
  slate: 'text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200',
  emerald: 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
}

export function LandingCollapsibleSection({
  label,
  labelOpen,
  id,
  accent = 'teal',
  defaultOpen = false,
  children,
}: Props) {
  return (
    <section id={id} className="py-4 bg-white scroll-mt-6">
      <div className="max-w-6xl mx-auto px-4">
        <details className="group" open={defaultOpen}>
          <summary
            className={`list-none cursor-pointer select-none flex items-center justify-center gap-2 text-sm md:text-base font-semibold border rounded-lg px-5 py-3 transition-colors ${ACCENT_CLASSES[accent]}`}
          >
            <span className="group-open:hidden">{label}</span>
            <span className="hidden group-open:inline">{labelOpen ?? label}</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-2">{children}</div>
        </details>
      </div>
    </section>
  )
}
