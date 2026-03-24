'use client'

// Reusable work experience list editor for doctor registration and profile pages

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { WorkExperience } from '@/lib/demo/demo-doctor-profile-data'

interface Props {
  experiences: WorkExperience[]
  onChange: (exps: WorkExperience[]) => void
}

function emptyExp(): WorkExperience {
  return { position: '', facility: '', from_year: new Date().getFullYear(), to_year: null, description: '' }
}

export function WorkExperienceListEditor({ experiences, onChange }: Props) {
  function update(idx: number, field: keyof WorkExperience, value: string | number | null) {
    const next = experiences.map((e, i) =>
      i === idx ? { ...e, [field]: value } : e
    )
    onChange(next)
  }

  function add() {
    onChange([...experiences, emptyExp()])
  }

  function remove(idx: number) {
    onChange(experiences.filter((_, i) => i !== idx))
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-4">
      {experiences.map((exp, idx) => (
        <div key={idx} className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="font-medium text-base">Kinh nghiệm {idx + 1}</span>
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
            <div className="space-y-1">
              <Label className="text-base">Chức vụ *</Label>
              <Input
                className="h-12 text-base"
                value={exp.position}
                onChange={(e) => update(idx, 'position', e.target.value)}
                placeholder="VD: Bác sĩ nội trú"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Cơ sở y tế *</Label>
              <Input
                className="h-12 text-base"
                value={exp.facility}
                onChange={(e) => update(idx, 'facility', e.target.value)}
                placeholder="VD: Bệnh viện Bạch Mai"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Năm bắt đầu *</Label>
              <Input
                type="number"
                className="h-12 text-base"
                min={1980}
                max={currentYear}
                value={exp.from_year}
                onChange={(e) => update(idx, 'from_year', parseInt(e.target.value) || currentYear)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Năm kết thúc (để trống = hiện tại)</Label>
              <Input
                type="number"
                className="h-12 text-base"
                min={1980}
                max={currentYear}
                value={exp.to_year ?? ''}
                placeholder="Hiện tại"
                onChange={(e) => {
                  const v = e.target.value
                  update(idx, 'to_year', v ? parseInt(v) : null)
                }}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-base">Mô tả công việc</Label>
              <Input
                className="h-12 text-base"
                value={exp.description}
                onChange={(e) => update(idx, 'description', e.target.value)}
                placeholder="Mô tả ngắn về công việc"
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
        Thêm kinh nghiệm
      </Button>
    </div>
  )
}
