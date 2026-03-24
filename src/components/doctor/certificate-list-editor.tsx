'use client'

// Reusable certificate list editor for doctor registration and profile pages

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { Certificate } from '@/lib/demo/demo-doctor-profile-data'

interface Props {
  certificates: Certificate[]
  onChange: (certs: Certificate[]) => void
}

function emptyCert(): Certificate {
  return { name: '', issuer: '', issued_date: '', expiry_date: null, document_url: null }
}

export function CertificateListEditor({ certificates, onChange }: Props) {
  function update(idx: number, field: keyof Certificate, value: string) {
    const next = certificates.map((c, i) =>
      i === idx ? { ...c, [field]: value || null } : c
    )
    onChange(next)
  }

  function add() {
    onChange([...certificates, emptyCert()])
  }

  function remove(idx: number) {
    onChange(certificates.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert, idx) => (
        <div key={idx} className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="font-medium text-base">Chứng chỉ {idx + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive h-9 w-9 p-0"
              onClick={() => remove(idx)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-base">Tên chứng chỉ *</Label>
              <Input
                className="h-12 text-base"
                value={cert.name}
                onChange={(e) => update(idx, 'name', e.target.value)}
                placeholder="VD: Chứng chỉ hành nghề khám chữa bệnh"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Cơ quan cấp *</Label>
              <Input
                className="h-12 text-base"
                value={cert.issuer}
                onChange={(e) => update(idx, 'issuer', e.target.value)}
                placeholder="VD: Bộ Y tế"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Ngày cấp *</Label>
              <Input
                type="date"
                className="h-12 text-base"
                value={cert.issued_date}
                onChange={(e) => update(idx, 'issued_date', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Ngày hết hạn (nếu có)</Label>
              <Input
                type="date"
                className="h-12 text-base"
                value={cert.expiry_date ?? ''}
                onChange={(e) => update(idx, 'expiry_date', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="h-12 text-base w-full gap-2"
        onClick={add}
      >
        <Plus className="size-4" />
        Thêm chứng chỉ
      </Button>
    </div>
  )
}
