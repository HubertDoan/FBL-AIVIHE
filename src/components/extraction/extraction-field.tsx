'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { ExtractedRecord } from '@/types/database'

function confidenceColor(score: number | null): string {
  if (!score) return 'bg-gray-200 text-gray-700'
  if (score >= 0.8) return 'bg-green-100 text-green-800'
  if (score >= 0.5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function confidenceLabel(score: number | null): string {
  if (!score) return 'N/A'
  return `${Math.round(score * 100)}%`
}

interface Props {
  record: ExtractedRecord
  onConfirm: (id: string, value: string, unit: string | null) => Promise<void>
}

export function ExtractionField({ record, onConfirm }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(record.field_value ?? '')
  const [unit, setUnit] = useState(record.unit ?? '')
  const [confirming, setConfirming] = useState(false)
  const isConfirmed = record.status === 'confirmed'

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      await onConfirm(record.id, value, unit || null)
      setEditing(false)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div
      className={`rounded-xl border p-4 space-y-2 ${
        isConfirmed ? 'bg-green-50/50 border-green-200' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-medium">{record.field_name}</h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColor(record.confidence_score)}`}
          >
            {confidenceLabel(record.confidence_score)}
          </span>
          {isConfirmed && <Badge variant="default">Đã xác nhận</Badge>}
        </div>
      </div>

      {editing ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-lg min-h-[48px] flex-1"
            placeholder="Giá trị"
          />
          <Input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="text-lg min-h-[48px] w-24"
            placeholder="Đơn vị"
          />
        </div>
      ) : (
        <p className="text-lg">
          <span className="font-semibold">{value}</span>
          {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
        </p>
      )}

      {record.reference_range && (
        <p className="text-sm text-muted-foreground">
          Khoảng tham chiếu: {record.reference_range}
        </p>
      )}

      {!isConfirmed && (
        <div className="flex gap-2 pt-1">
          {!editing && (
            <Button
              variant="outline"
              size="lg"
              className="text-lg min-h-[48px]"
              onClick={() => setEditing(true)}
            >
              Sửa
            </Button>
          )}
          {editing && (
            <Button
              variant="outline"
              size="lg"
              className="text-lg min-h-[48px]"
              onClick={() => {
                setEditing(false)
                setValue(record.field_value ?? '')
                setUnit(record.unit ?? '')
              }}
            >
              Huỷ
            </Button>
          )}
          <Button
            size="lg"
            className="text-lg min-h-[48px]"
            disabled={confirming || !value}
            onClick={handleConfirm}
          >
            {confirming ? 'Đang lưu...' : 'Xác nhận'}
          </Button>
        </div>
      )}
    </div>
  )
}
