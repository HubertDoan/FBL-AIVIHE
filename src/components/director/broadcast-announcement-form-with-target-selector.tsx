'use client'

// BroadcastAnnouncementFormWithTargetSelector
// Form for director to compose and send broadcast notifications to members
// Supports targeting: all members, by service package (FD/RH/DC/SP), or by province+commune

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, FileText, Users, MapPin, Package } from 'lucide-react'
import { BroadcastTargetPreviewCount } from './broadcast-target-preview-count'

export type BroadcastCategory = 'event' | 'program' | 'promotion'
export type BroadcastTargetType = 'all' | 'by-service' | 'by-location'

export interface BroadcastFormData {
  title: string
  content: string
  category: BroadcastCategory
  targetType: BroadcastTargetType
  services: string[]   // FD, RH, DC, SP
  province: string
  commune: string
}

const CATEGORIES: { value: BroadcastCategory; label: string }[] = [
  { value: 'event', label: 'Sự kiện' },
  { value: 'program', label: 'Chương trình' },
  { value: 'promotion', label: 'Khuyến mãi' },
]

const SERVICE_OPTIONS = [
  { value: 'FD', label: 'FD — Bác sĩ gia đình' },
  { value: 'RH', label: 'RH — Phục hồi chức năng' },
  { value: 'DC', label: 'DC — Chăm sóc ban ngày' },
  { value: 'SP', label: 'SP — Hỗ trợ đặc biệt' },
]

const DEFAULT_FORM: BroadcastFormData = {
  title: '',
  content: '',
  category: 'event',
  targetType: 'all',
  services: [],
  province: '',
  commune: '',
}

interface Props {
  onSent?: (announcementId: string, sentCount: number) => void
}

export function BroadcastAnnouncementFormWithTargetSelector({ onSent }: Props) {
  const [form, setForm] = useState<BroadcastFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<{ sent: number; id: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function setField<K extends keyof BroadcastFormData>(key: K, value: BroadcastFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setLastResult(null)
    setError(null)
  }

  function toggleService(value: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(value)
        ? prev.services.filter((s) => s !== value)
        : [...prev.services, value],
    }))
  }

  async function createAnnouncement(): Promise<string | null> {
    const res = await fetch('/api/director/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        category: form.category,
        priority: 'normal',
        target_type: form.targetType === 'all' ? 'all' : 'group',
        target_roles: [],
        allow_replies: false,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? 'Lỗi tạo thông báo')
    }
    const data = await res.json()
    return data.id ?? null
  }

  async function handleDraft() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createAnnouncement()
      setForm(DEFAULT_FORM)
      setLastResult(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi lưu nháp')
    } finally {
      setSaving(false)
    }
  }

  async function handleSend() {
    if (!form.title.trim() || !form.content.trim()) return
    setSending(true)
    setError(null)
    try {
      const annId = await createAnnouncement()
      if (!annId) throw new Error('Không nhận được ID thông báo')

      const broadcastBody = {
        type: form.targetType,
        services: form.targetType === 'by-service' ? form.services : undefined,
        province: form.targetType === 'by-location' ? form.province : undefined,
        commune: form.targetType === 'by-location' ? form.commune : undefined,
      }

      const res = await fetch(`/api/director/announcements/${annId}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastBody),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Lỗi broadcast')
      }
      const result = await res.json()
      setLastResult({ sent: result.sent, id: annId })
      setForm(DEFAULT_FORM)
      onSent?.(annId, result.sent)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi gửi thông báo')
    } finally {
      setSending(false)
    }
  }

  const canSubmit = form.title.trim().length > 0 && form.content.trim().length > 0
  const isLoading = saving || sending

  return (
    <div className="space-y-6">
      {/* Success message */}
      {lastResult && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-base">
          Đã gửi thông báo đến <strong>{lastResult.sent}</strong> thành viên.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-base">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Compose */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="size-5" /> Soạn thông báo
          </h3>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-base">Loại thông báo</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setField('category', v as BroadcastCategory)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-base">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="bc-title" className="text-base">Tiêu đề</Label>
            <Input
              id="bc-title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Tiêu đề thông báo..."
              className="h-11 text-base"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="bc-content" className="text-base">Nội dung</Label>
            <Textarea
              id="bc-content"
              value={form.content}
              onChange={(e) => setField('content', e.target.value)}
              placeholder="Nhập nội dung thông báo gửi đến thành viên..."
              className="min-h-[140px] text-base"
            />
          </div>
        </div>

        {/* Right: Target + Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="size-5" /> Đối tượng nhận
          </h3>

          {/* Target type */}
          <div className="space-y-2">
            <Label className="text-base">Gửi đến</Label>
            <Select
              value={form.targetType}
              onValueChange={(v) => setField('targetType', v as BroadcastTargetType)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-base">
                  Tất cả thành viên
                </SelectItem>
                <SelectItem value="by-service" className="text-base">
                  Theo gói dịch vụ
                </SelectItem>
                <SelectItem value="by-location" className="text-base">
                  Theo khu vực
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* By service: checkboxes */}
          {form.targetType === 'by-service' && (
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Package className="size-4" /> Chọn gói dịch vụ:
                </p>
                {SERVICE_OPTIONS.map((s) => (
                  <div key={s.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`svc-${s.value}`}
                      checked={form.services.includes(s.value)}
                      onCheckedChange={() => toggleService(s.value)}
                    />
                    <Label htmlFor={`svc-${s.value}`} className="text-base cursor-pointer">
                      {s.label}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* By location */}
          {form.targetType === 'by-location' && (
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-4" /> Lọc theo khu vực:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="bc-province" className="text-base">Tỉnh/Thành phố</Label>
                  <Input
                    id="bc-province"
                    value={form.province}
                    onChange={(e) => setField('province', e.target.value)}
                    placeholder="VD: Hà Nội"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bc-commune" className="text-base">Xã/Phường</Label>
                  <Input
                    id="bc-commune"
                    value={form.commune}
                    onChange={(e) => setField('commune', e.target.value)}
                    placeholder="VD: Sóc Sơn"
                    className="h-11 text-base"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live count preview */}
          <BroadcastTargetPreviewCount
            targetType={form.targetType}
            services={form.services}
            province={form.province}
            commune={form.commune}
          />

          {/* Preview pane */}
          {(form.title || form.content) && (
            <Card className="border-dashed">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Xem trước</p>
                <p className="font-semibold text-base">{form.title || '(chưa có tiêu đề)'}</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-4">
                  {form.content || '(chưa có nội dung)'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleDraft}
          disabled={isLoading || !canSubmit}
          className="min-h-[48px] text-base px-6"
        >
          {saving && <Loader2 className="size-4 animate-spin mr-2" />}
          <FileText className="size-4 mr-2" />
          Lưu nháp
        </Button>
        <Button
          onClick={handleSend}
          disabled={isLoading || !canSubmit}
          className="min-h-[48px] text-base px-6"
        >
          {sending && <Loader2 className="size-4 animate-spin mr-2" />}
          <Send className="size-4 mr-2" />
          Gửi ngay
        </Button>
      </div>
    </div>
  )
}
