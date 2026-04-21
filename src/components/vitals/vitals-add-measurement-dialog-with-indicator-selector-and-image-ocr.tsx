'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  X, Ruler, Scale, HeartPulse, Droplets,
  Camera, Pencil, Sparkles, Loader2, CheckCircle, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Modal "Thêm đo" cho chỉ số sức khỏe.
 * Flow: Chọn indicator → Chọn cách nhập (manual / chụp ảnh máy đo) → Confirm + Save.
 * Image OCR dùng Claude Vision (POST /api/vitals/extract-from-image)
 * Save: POST /api/vitals
 */

type IndicatorKey = 'height' | 'weight' | 'blood_pressure' | 'blood_glucose'

const INDICATORS: Array<{
  key: IndicatorKey
  icon: React.ComponentType<{ className?: string }>
  label: string
  unit: string
  color: string
  manualFields: Array<{ name: string; label: string; placeholder: string; type?: 'number' }>
}> = [
  {
    key: 'height', icon: Ruler, label: 'Chiều cao', unit: 'cm', color: 'bg-purple-100 text-purple-700',
    manualFields: [{ name: 'value', label: 'Chiều cao (cm)', placeholder: 'VD: 165', type: 'number' }],
  },
  {
    key: 'weight', icon: Scale, label: 'Cân nặng', unit: 'kg', color: 'bg-blue-100 text-blue-700',
    manualFields: [{ name: 'value', label: 'Cân nặng (kg)', placeholder: 'VD: 60', type: 'number' }],
  },
  {
    key: 'blood_pressure', icon: HeartPulse, label: 'Huyết áp', unit: 'mmHg', color: 'bg-rose-100 text-rose-700',
    manualFields: [
      { name: 'sys',   label: 'Tâm thu (SYS, mmHg)',  placeholder: 'VD: 120', type: 'number' },
      { name: 'dia',   label: 'Tâm trương (DIA, mmHg)', placeholder: 'VD: 80', type: 'number' },
      { name: 'pulse', label: 'Nhịp tim (PULSE, lần/phút)', placeholder: 'VD: 72', type: 'number' },
    ],
  },
  {
    key: 'blood_glucose', icon: Droplets, label: 'Đường huyết', unit: 'mg/dL', color: 'bg-amber-100 text-amber-700',
    manualFields: [{ name: 'value', label: 'Đường huyết (mg/dL)', placeholder: 'VD: 90', type: 'number' }],
  },
]

type Step = 'choose' | 'mode' | 'manual' | 'image' | 'review'

interface ExtractedReading {
  indicator_type: IndicatorKey
  value: Record<string, number>
  unit: string
  measured_at?: string | null
  confidence?: 'high' | 'medium' | 'low'
  notes?: string
  source_image_url?: string | null  // Storage URL — lưu để truy nguồn gốc
}

export function VitalsAddMeasurementDialogWithIndicatorSelectorAndImageOcr({
  onClose, onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [step, setStep] = useState<Step>('choose')
  const [picked, setPicked] = useState<IndicatorKey | null>(null)
  const [manualValues, setManualValues] = useState<Record<string, string>>({})
  const [extracted, setExtracted] = useState<ExtractedReading | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)

  const def = picked ? INDICATORS.find((i) => i.key === picked) : null

  function reset() {
    setStep('choose'); setPicked(null); setManualValues({}); setExtracted(null)
  }

  async function handleImageUpload(file: File) {
    setExtracting(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/vitals/extract-from-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Không đọc được ảnh', {
          description: 'Hãy thử chụp gần hơn, đủ ánh sáng, hoặc nhập tay.',
        })
        return
      }
      const ex = { ...(data.extracted as ExtractedReading), source_image_url: data.source_image_url || null }
      setExtracted(ex)
      // Map indicator_type từ AI nếu khớp với 4 indicator UI hỗ trợ
      const mappedKey = (['height', 'weight', 'blood_pressure', 'blood_glucose'] as IndicatorKey[])
        .includes(ex.indicator_type) ? ex.indicator_type : null
      if (mappedKey && mappedKey !== picked) {
        setPicked(mappedKey)
        toast.info('AI đã nhận diện', { description: `Đây là chỉ số ${INDICATORS.find((i) => i.key === mappedKey)?.label}` })
      }
      setStep('review')
    } catch (err) {
      toast.error((err as Error).message || 'Lỗi tải ảnh')
    } finally {
      setExtracting(false)
    }
  }

  async function handleSave() {
    if (!picked || !def) return
    let value: Record<string, number>
    let unit = def.unit

    if (extracted && step === 'review') {
      value = extracted.value
      unit = extracted.unit || def.unit
    } else {
      // Manual: parse số từ manualValues
      value = {}
      for (const f of def.manualFields) {
        const raw = manualValues[f.name]
        const n = parseFloat(raw)
        if (isNaN(n)) {
          toast.error(`Vui lòng nhập ${f.label}`)
          return
        }
        value[f.name] = n
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicator_type: picked,
          value,
          unit,
          measured_at: extracted?.measured_at || new Date().toISOString(),
          source: extracted ? 'image_ocr' : 'manual',
          source_image_url: extracted?.source_image_url || null,
          notes: extracted?.notes || null,
        }),
      })
      if (res.ok) {
        toast.success('Đã lưu chỉ số ' + def.label)
        onSaved()
        onClose()
      } else {
        const e = await res.json()
        toast.error(e.error || 'Không lưu được')
      }
    } catch {
      toast.error('Lỗi mạng, vui lòng thử lại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Thêm chỉ số đo</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'choose' && 'Chọn loại chỉ số bạn muốn ghi nhận'}
              {step === 'mode' && def && `Cách nhập ${def.label}`}
              {step === 'manual' && def && `Nhập ${def.label} thủ công`}
              {step === 'image' && def && `Chụp ảnh máy đo ${def.label}`}
              {step === 'review' && 'Xác nhận chỉ số AI đã đọc'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="size-5" />
          </button>
        </div>

        {/* Step 1: Choose indicator */}
        {step === 'choose' && (
          <div className="grid grid-cols-2 gap-2">
            {INDICATORS.map((ind) => {
              const Icon = ind.icon
              return (
                <button
                  key={ind.key}
                  onClick={() => { setPicked(ind.key); setStep('mode') }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition"
                >
                  <div className={`size-12 rounded-xl flex items-center justify-center ${ind.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{ind.label}</span>
                  <span className="text-[11px] text-slate-500">{ind.unit}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 2: Choose mode (manual vs image) */}
        {step === 'mode' && def && (
          <div className="space-y-3">
            <button
              onClick={() => setStep('image')}
              className="w-full flex items-start gap-3 p-4 rounded-xl border-2 border-teal-200 bg-teal-50 hover:border-teal-400 transition text-left"
            >
              <div className="size-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center shrink-0">
                <Camera className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 flex items-center gap-1">
                  Chụp ảnh máy đo <Sparkles className="size-3.5 text-teal-600" />
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  AI tự đọc giá trị từ màn hình máy đo HA / đường huyết / cân
                </p>
              </div>
            </button>

            <button
              onClick={() => setStep('manual')}
              className="w-full flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition text-left"
            >
              <div className="size-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Pencil className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Nhập tay</p>
                <p className="text-xs text-slate-600 mt-0.5">Tự nhập giá trị {def.label.toLowerCase()}</p>
              </div>
            </button>

            <Button variant="ghost" size="sm" onClick={() => setStep('choose')} className="w-full">
              ← Chọn chỉ số khác
            </Button>
          </div>
        )}

        {/* Step 3a: Manual input */}
        {step === 'manual' && def && (
          <div className="space-y-3">
            {def.manualFields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label className="text-sm font-medium">{f.label}</Label>
                <Input
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={manualValues[f.name] || ''}
                  onChange={(e) => setManualValues({ ...manualValues, [f.name]: e.target.value })}
                  className="h-11"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep('mode')} className="flex-1">← Quay lại</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {saving ? <><Loader2 className="size-4 animate-spin mr-1.5" />Đang lưu</> : 'Lưu chỉ số'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3b: Image upload */}
        {step === 'image' && def && (
          <div className="space-y-3">
            <label className="block w-full cursor-pointer">
              <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 text-center hover:border-teal-500 hover:bg-teal-50/30 transition">
                {extracting ? (
                  <>
                    <Loader2 className="size-10 mx-auto text-teal-600 animate-spin mb-2" />
                    <p className="text-sm font-semibold text-teal-700">AI đang đọc ảnh...</p>
                    <p className="text-xs text-slate-500 mt-1">Mất khoảng 5-10 giây</p>
                  </>
                ) : (
                  <>
                    <Camera className="size-10 mx-auto text-teal-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-900">Chụp/chọn ảnh màn hình máy đo</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, HEIC — chụp gần, đủ sáng</p>
                  </>
                )}
              </div>
              <input
                type="file" accept="image/*" capture="environment" className="hidden"
                disabled={extracting}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImageUpload(f)
                }}
              />
            </label>
            <Button variant="outline" onClick={() => setStep('mode')} className="w-full" disabled={extracting}>
              ← Quay lại
            </Button>
          </div>
        )}

        {/* Step 4: Review extracted */}
        {step === 'review' && extracted && def && (
          <div className="space-y-3">
            <div className={`rounded-xl p-3 border ${
              extracted.confidence === 'low'
                ? 'border-amber-300 bg-amber-50'
                : 'border-teal-300 bg-teal-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {extracted.confidence === 'low' ? (
                  <AlertTriangle className="size-4 text-amber-600" />
                ) : (
                  <CheckCircle className="size-4 text-teal-600" />
                )}
                <span className="text-sm font-semibold">
                  AI đọc được ({extracted.confidence === 'low' ? 'độ tin cậy thấp' : 'OK'})
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-1.5">
                <p className="text-xs text-slate-500">{def.label} ({extracted.unit || def.unit})</p>
                {Object.entries(extracted.value).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-slate-600 capitalize">{k.toUpperCase()}</span>
                    <span className="font-bold text-slate-900">{String(v)}</span>
                  </div>
                ))}
              </div>
              {extracted.notes && (
                <p className="text-xs text-slate-600 mt-2 italic">{extracted.notes}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setExtracted(null); setStep('image') }} className="flex-1">
                Chụp lại
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {saving ? <><Loader2 className="size-4 animate-spin mr-1.5" />Đang lưu</> : 'Xác nhận lưu'}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Đo chỉ số khác
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
