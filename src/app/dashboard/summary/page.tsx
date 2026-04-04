'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HealthSummaryView } from '@/components/summary/health-summary-view'
import { createClient } from '@/lib/supabase/client'

interface Citation {
  recordId: string
  extractedRecordId: string
  value: string
  unit: string | null
  date: string | null
  category: string | null
}

export default function SummaryPage() {
  const [citizenId, setCitizenId] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCitizen() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('citizens')
        .select('id')
        .eq('id', user.id)
        .single()
      if (data) setCitizenId(data.id)
    }
    loadCitizen()
  }, [])

  async function generateSummary() {
    if (!citizenId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Không thể tạo tóm tắt.')
        return
      }

      setSummary(data.summary)
      setCitations(data.citations ?? [])
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Tóm tắt sức khỏe</h1>
        <p className="text-muted-foreground mt-1">
          AI tổng hợp dữ liệu sức khỏe của bạn từ các tài liệu đã xác nhận
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-base">
          {error}
        </div>
      )}

      {!summary && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Chưa có bản tóm tắt
            </p>
            <p className="text-base text-muted-foreground mb-6">
              Nhấn nút bên dưới để AI tổng hợp dữ liệu sức khỏe của bạn
            </p>
            <Button
              onClick={generateSummary}
              disabled={!citizenId}
              className="min-h-[48px] text-base px-6"
            >
              Tạo tóm tắt mới
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="size-10 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">AI đang tổng hợp dữ liệu sức khỏe...</p>
            <p className="text-base text-muted-foreground mt-2">
              Quá trình này có thể mất vài giây
            </p>
          </CardContent>
        </Card>
      )}

      {summary && !loading && (
        <HealthSummaryView
          summary={summary}
          citations={citations}
          onRegenerate={generateSummary}
          regenerating={loading}
        />
      )}
    </div>
  )
}
