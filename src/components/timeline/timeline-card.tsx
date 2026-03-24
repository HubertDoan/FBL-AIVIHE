'use client'

import { useState } from 'react'
import {
  Stethoscope,
  FlaskConical,
  Pill,
  Syringe,
  ClipboardList,
  Camera,
  Activity,
  Leaf,
  FileUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/format-date'
import type { EventType } from '@/types/database'
import type { TimelineEvent } from '@/hooks/use-timeline'

const EVENT_CONFIG: Record<EventType, {
  icon: React.ElementType
  label: string
  borderColor: string
  bgColor: string
}> = {
  visit:           { icon: Stethoscope,   label: 'Lần khám',            borderColor: 'border-l-blue-500',    bgColor: 'bg-blue-50' },
  lab_result:      { icon: FlaskConical,  label: 'Xét nghiệm',         borderColor: 'border-l-green-500',   bgColor: 'bg-green-50' },
  medication:      { icon: Pill,          label: 'Thuốc',               borderColor: 'border-l-purple-500',  bgColor: 'bg-purple-50' },
  vaccination:     { icon: Syringe,       label: 'Tiêm chủng',          borderColor: 'border-l-teal-500',    bgColor: 'bg-teal-50' },
  diagnosis:       { icon: ClipboardList, label: 'Chẩn đoán',           borderColor: 'border-l-orange-500',  bgColor: 'bg-orange-50' },
  imaging:         { icon: Camera,        label: 'Chẩn đoán hình ảnh',  borderColor: 'border-l-indigo-500',  bgColor: 'bg-indigo-50' },
  vital_sign:      { icon: Activity,      label: 'Chỉ số sinh tồn',     borderColor: 'border-l-red-500',     bgColor: 'bg-red-50' },
  lifestyle:       { icon: Leaf,          label: 'Lối sống',            borderColor: 'border-l-lime-500',    bgColor: 'bg-lime-50' },
  document_upload: { icon: FileUp,        label: 'Tải tài liệu',        borderColor: 'border-l-gray-500',    bgColor: 'bg-gray-50' },
  other:           { icon: HelpCircle,    label: 'Khác',                borderColor: 'border-l-gray-400',    bgColor: 'bg-gray-50' },
}

interface TimelineCardProps {
  event: TimelineEvent
}

export function TimelineCard({ event }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.other
  const Icon = config.icon
  const doc = event.source_documents

  const description = event.description ?? ''
  const isLong = description.length > 120

  return (
    <Card className={`border-l-4 ${config.borderColor} shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 rounded-full p-2 ${config.bgColor}`}>
            <Icon className="size-5 text-foreground/70" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base font-semibold leading-tight">{event.title}</h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {config.label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(event.occurred_at)}
            </p>

            {description && (
              <p className="text-sm mt-2 leading-relaxed text-foreground/80">
                {expanded || !isLong ? description : `${description.slice(0, 120)}...`}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {isLong && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>Thu gọn <ChevronUp className="ml-1 size-3" /></>
                  ) : (
                    <>Xem thêm <ChevronDown className="ml-1 size-3" /></>
                  )}
                </Button>
              )}

              {doc && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="size-3" />
                  {doc.original_filename ?? 'Tài liệu gốc'}
                  {doc.facility_name && ` - ${doc.facility_name}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
