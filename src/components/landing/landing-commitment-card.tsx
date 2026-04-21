import React from 'react'

// Healthcare Commitment card: minimalist, status dot accent
const ACCENT_MAP: Record<string, { border: string; icon: string; dot: string }> = {
  amber:   { border: 'hover:border-amber-300',   icon: 'bg-amber-100 text-amber-600',     dot: 'bg-amber-400' },
  teal:    { border: 'hover:border-teal-300',    icon: 'bg-teal-100 text-teal-600',       dot: 'bg-teal-400' },
  emerald: { border: 'hover:border-emerald-300', icon: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-400' },
  rose:    { border: 'hover:border-rose-300',    icon: 'bg-rose-100 text-rose-600',       dot: 'bg-rose-400' },
  blue:    { border: 'hover:border-blue-300',    icon: 'bg-blue-100 text-blue-600',       dot: 'bg-blue-400' },
  green:   { border: 'hover:border-green-300',   icon: 'bg-green-100 text-green-600',     dot: 'bg-green-400' },
}

interface CommitmentCardProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  desc: string
}

export function CommitmentCard({ icon: Icon, color, title, desc }: CommitmentCardProps) {
  const c = ACCENT_MAP[color] || ACCENT_MAP.teal
  return (
    <div className={`relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md ${c.border}`}>
      <span className={`absolute top-3 right-3 size-1.5 rounded-full ${c.dot}`} />
      <div className={`inline-flex items-center justify-center size-9 rounded-lg mb-2.5 ${c.icon}`}>
        <Icon className="size-4.5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}
