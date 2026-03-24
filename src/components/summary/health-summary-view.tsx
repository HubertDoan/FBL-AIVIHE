'use client'

import { AlertTriangle, FileDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Citation {
  recordId: string
  extractedRecordId: string
  value: string
  unit: string | null
  date: string | null
  category: string | null
}

interface HealthSummaryViewProps {
  summary: string
  citations: Citation[]
  onRegenerate: () => void
  regenerating?: boolean
}

function parseSummaryToSections(text: string) {
  const lines = text.split('\n')
  const sections: { heading: string; content: string[] }[] = []
  let current: { heading: string; content: string[] } | null = null

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { heading: line.replace('## ', ''), content: [] }
    } else if (current && line.trim()) {
      current.content.push(line)
    } else if (!current && line.trim()) {
      current = { heading: '', content: [line] }
    }
  }
  if (current) sections.push(current)
  return sections
}

export function HealthSummaryView({
  summary,
  citations,
  onRegenerate,
  regenerating,
}: HealthSummaryViewProps) {
  const sections = parseSummaryToSections(summary)

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <Card key={i}>
          {section.heading && (
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{section.heading}</CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <div className="space-y-2 text-base leading-relaxed">
              {section.content.map((line, j) => {
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <p key={j} className="pl-4 border-l-2 border-primary/20">
                      {renderWithCitations(line.slice(2), citations)}
                    </p>
                  )
                }
                if (line.startsWith('---')) return <hr key={j} className="my-3" />
                return (
                  <p key={j}>{renderWithCitations(line, citations)}</p>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Disclaimer */}
      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="flex items-start gap-3 pt-4">
          <AlertTriangle className="size-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-base text-amber-800">
            <p className="font-semibold mb-1">Lưu ý quan trọng</p>
            <p>
              Thông tin này chỉ mang tính tổng hợp từ dữ liệu bạn cung cấp.
              AI không chẩn đoán bệnh và không thay thế bác sĩ. Vui lòng tham
              khảo ý kiến bác sĩ để được tư vấn chuyên môn.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={regenerating}
          className="min-h-[48px] text-base gap-2"
        >
          <RefreshCw className={`size-5 ${regenerating ? 'animate-spin' : ''}`} />
          Tạo lại tóm tắt
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="min-h-[48px] text-base gap-2"
        >
          <FileDown className="size-5" />
          Xuất PDF
        </Button>
      </div>

      {/* Citations reference */}
      {citations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nguồn dữ liệu ({citations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {citations.slice(0, 20).map((c) => (
                <li key={c.recordId}>
                  {c.category}: {c.value} {c.unit ?? ''} — {c.date ?? 'Không rõ ngày'}
                </li>
              ))}
              {citations.length > 20 && (
                <li className="italic">...và {citations.length - 20} nguồn khác</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function renderWithCitations(text: string, citations: Citation[]) {
  // Bold text
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}
