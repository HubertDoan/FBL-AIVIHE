'use client'

// TreatmentHealthLogForm — form to add a new daily health log entry to a treatment episode
// Fields: blood pressure, blood sugar, temperature, weight (all optional), symptoms + notes

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'
import type { HealthLog } from '@/lib/demo/demo-treatment-data'

interface Props {
  treatmentId: string
  onSaved: (log: HealthLog) => void
}

export function TreatmentHealthLogForm({ treatmentId, onSaved }: Props) {
  const [bp, setBp] = useState('')
  const [sugar, setSugar] = useState('')
  const [temp, setTemp] = useState('')
  const [weight, setWeight] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')
  const [medTaken, setMedTaken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/treatment/${treatmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_log',
          date: new Date().toISOString().split('T')[0],
          blood_pressure: bp.trim() || null,
          blood_sugar: sugar.trim() || null,
          temperature: temp.trim() || null,
          weight: weight.trim() || null,
          symptoms: symptoms.trim(),
          medication_taken: medTaken,
          notes: notes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Lỗi khi lưu nhật ký.'); return }
      onSaved(data.log)
      setBp(''); setSugar(''); setTemp(''); setWeight(''); setSymptoms(''); setNotes(''); setMedTaken(false)
    } catch {
      setError('Không thể kết nối máy chủ.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="size-5 text-primary" />
            <span className="text-base font-semibold">Ghi nhật ký sức khỏe hôm nay</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Huyết áp (mmHg)</label>
              <input
                type="text"
                placeholder="vd: 130/85"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-base min-h-[48px] bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đường huyết (mmol/L)</label>
              <input
                type="text"
                placeholder="vd: 7.2"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-base min-h-[48px] bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nhiệt độ (°C)</label>
              <input
                type="text"
                placeholder="vd: 36.5"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-base min-h-[48px] bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cân nặng (kg)</label>
              <input
                type="text"
                placeholder="vd: 72.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-base min-h-[48px] bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Triệu chứng</label>
            <textarea
              placeholder="Mô tả triệu chứng hôm nay (nếu có)..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 text-base bg-background resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              placeholder="Ghi chú thêm..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 text-base bg-background resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer min-h-[48px]">
            <input
              type="checkbox"
              checked={medTaken}
              onChange={(e) => setMedTaken(e.target.checked)}
              className="size-5"
            />
            <span className="text-base">Đã uống thuốc hôm nay</span>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={saving} className="w-full min-h-[48px] text-base">
            {saving ? 'Đang lưu...' : 'Lưu nhật ký'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
