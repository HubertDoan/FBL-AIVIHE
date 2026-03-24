'use client'

import { MEDICAL_SPECIALTIES } from '@/lib/constants/medical-specialties'
import { cn } from '@/lib/utils'
import {
  Heart, Droplets, Brain, Wind, Bone, Eye,
  Ear, Smile, Baby, Shield, Activity, Stethoscope,
  Check,
} from 'lucide-react'

const SPECIALTY_ICONS: Record<string, React.ElementType> = {
  cardiology: Heart,
  endocrinology: Droplets,
  gastroenterology: Activity,
  neurology: Brain,
  pulmonology: Wind,
  rheumatology: Bone,
  dermatology: Shield,
  ent: Ear,
  ophthalmology: Eye,
  dentistry: Smile,
  nephrology: Droplets,
  obstetrics: Baby,
  pediatrics: Baby,
  oncology: Shield,
  rehabilitation: Activity,
  psychiatry: Brain,
}

// Multi-select specialty selector
interface SpecialtySelectorProps {
  value: string | string[]
  onChange: (specialties: string | string[]) => void
  multiple?: boolean
}

export function SpecialtySelector({ value, onChange, multiple = false }: SpecialtySelectorProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : []

  function toggle(id: string) {
    if (multiple) {
      const next = selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
      onChange(next)
    } else {
      onChange(id)
    }
  }

  return (
    <div className="space-y-3">
      {multiple && selected.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Đã chọn: <span className="font-medium text-foreground">{selected.length}</span> chuyên khoa
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MEDICAL_SPECIALTIES.map((spec) => {
          const Icon = SPECIALTY_ICONS[spec.id] ?? Stethoscope
          const isSelected = selected.includes(spec.id)
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => toggle(spec.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                'min-h-[80px] text-base',
                isSelected
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/40 hover:bg-muted/50'
              )}
            >
              {isSelected && multiple && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="size-3 text-white" />
                </div>
              )}
              <Icon className="size-7" />
              <span className="font-medium text-center leading-tight">{spec.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
