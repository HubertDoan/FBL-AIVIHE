'use client'

import { MEDICAL_SPECIALTIES } from '@/lib/constants/medical-specialties'
import { cn } from '@/lib/utils'
import {
  Heart, Droplets, Brain, Wind, Bone, Eye,
  Ear, Smile, Baby, Shield, Activity, Stethoscope,
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

interface SpecialtySelectorProps {
  value: string
  onChange: (specialty: string) => void
}

export function SpecialtySelector({ value, onChange }: SpecialtySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {MEDICAL_SPECIALTIES.map((spec) => {
        const Icon = SPECIALTY_ICONS[spec.id] ?? Stethoscope
        const isSelected = value === spec.id
        return (
          <button
            key={spec.id}
            type="button"
            onClick={() => onChange(spec.id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
              'min-h-[80px] text-base',
              isSelected
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/40 hover:bg-muted/50'
            )}
          >
            <Icon className="size-7" />
            <span className="font-medium text-center leading-tight">{spec.name}</span>
          </button>
        )
      })}
    </div>
  )
}
