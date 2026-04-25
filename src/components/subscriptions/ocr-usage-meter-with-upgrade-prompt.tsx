'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Zap, FileText } from 'lucide-react'

interface OcrUsage {
  plan: string
  pages_used: number
  pages_limit: number | null
  remaining: number | null
  exceeded: boolean
}

/**
 * Hiển thị mức dùng OCR tháng hiện tại + nút nâng cấp khi gần hết
 * Dùng trong: trang upload, sidebar dashboard
 */
export function OcrUsageMeter() {
  const [usage, setUsage] = useState<OcrUsage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subscriptions/ocr-usage')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUsage(d) })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !usage) return null
  // Premium/enterprise: không hiện meter
  if (usage.plan !== 'free' || usage.pages_limit === null) return null

  const pct = Math.min(100, Math.round((usage.pages_used / usage.pages_limit) * 100))
  const nearLimit = pct >= 80

  return (
    <div className={`rounded-lg border p-3 space-y-2 text-sm ${
      usage.exceeded
        ? 'bg-red-50 border-red-200'
        : nearLimit
          ? 'bg-amber-50 border-amber-200'
          : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <FileText className="size-3.5" />
          OCR tháng này
        </span>
        <span className={`font-semibold ${usage.exceeded ? 'text-red-600' : nearLimit ? 'text-amber-700' : 'text-gray-600'}`}>
          {usage.pages_used.toLocaleString()} / {usage.pages_limit.toLocaleString()}
        </span>
      </div>

      <Progress
        value={pct}
        className={`h-2 ${usage.exceeded ? '[&>div]:bg-red-500' : nearLimit ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`}
      />

      {usage.exceeded ? (
        <div className="space-y-1.5">
          <p className="text-red-700 text-xs">Đã dùng hết quota tháng này. Nâng cấp để tiếp tục OCR.</p>
          <Link href="/pricing">
            <Button size="sm" className="w-full h-8 gap-1.5 bg-red-600 hover:bg-red-700 text-white">
              <Zap className="size-3.5" /> Nâng cấp Premium
            </Button>
          </Link>
        </div>
      ) : nearLimit ? (
        <div className="flex items-center justify-between">
          <p className="text-amber-700 text-xs">Còn {usage.remaining?.toLocaleString()} trang</p>
          <Link href="/pricing" className="text-xs text-amber-800 underline font-medium">Nâng cấp</Link>
        </div>
      ) : (
        <p className="text-gray-500 text-xs">Còn {usage.remaining?.toLocaleString()} trang miễn phí</p>
      )}
    </div>
  )
}
