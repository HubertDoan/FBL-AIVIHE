'use client'

// Component cho giám đốc chỉnh sửa lời chào hiển thị trên trang khách hàng mới

import { useState, useEffect } from 'react'
import { Save, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface GreetingData {
  directorName: string
  centerName: string
  greeting: string
  signature: string
}

export function DirectorGreetingEditor() {
  const [data, setData] = useState<GreetingData>({
    directorName: '',
    centerName: '',
    greeting: '',
    signature: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetch('/api/director/greeting')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/director/greeting', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Đã lưu lời chào thành công!')
      } else {
        toast.error('Không thể lưu. Vui lòng thử lại.')
      }
    } catch {
      toast.error('Lỗi kết nối.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chỉnh sửa lời chào</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-base mb-1 block">Tên giám đốc</Label>
              <Input
                value={data.directorName}
                onChange={e => setData(d => ({ ...d, directorName: e.target.value }))}
                className="text-base"
              />
            </div>
            <div>
              <Label className="text-base mb-1 block">Tên trung tâm</Label>
              <Input
                value={data.centerName}
                onChange={e => setData(d => ({ ...d, centerName: e.target.value }))}
                className="text-base"
              />
            </div>
          </div>

          <div>
            <Label className="text-base mb-1 block">Nội dung lời chào</Label>
            <Textarea
              value={data.greeting}
              onChange={e => setData(d => ({ ...d, greeting: e.target.value }))}
              className="text-base min-h-[120px]"
              rows={4}
            />
          </div>

          <div>
            <Label className="text-base mb-1 block">Chữ ký</Label>
            <Input
              value={data.signature}
              onChange={e => setData(d => ({ ...d, signature: e.target.value }))}
              className="text-base"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="min-h-[48px] text-base">
              {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
              Lưu lời chào
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(v => !v)} className="min-h-[48px] text-base">
              <Eye className="size-4 mr-2" />
              {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-5 space-y-3">
            <p className="text-base text-blue-900">
              Xin chào <strong>Khách hàng</strong>,
            </p>
            <p className="text-base text-blue-800 leading-relaxed">
              Tôi là <strong>{data.directorName}</strong> — Giám đốc Trung tâm {data.centerName}.
              Chào mừng bạn đến với nền tảng <strong>AIVIHE</strong>.
            </p>
            <p className="text-sm text-blue-700 leading-relaxed">{data.greeting}</p>
            <p className="text-sm text-blue-600 italic">— {data.signature}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
