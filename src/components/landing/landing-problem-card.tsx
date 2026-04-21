import React from 'react'

// Healthcare-light Problem card: warm pastel backgrounds + colored left-border accent.
// Uses palette inspired by BV Thu Cúc (teal), BV Hồng Ngọc (rose), HUPH (navy).
const COLOR_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-100 text-rose-600',       border: 'border-l-rose-400' },
  amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',     border: 'border-l-amber-400' },
  teal:    { bg: 'bg-teal-50',    icon: 'bg-teal-100 text-teal-600',       border: 'border-l-teal-500' },
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-l-emerald-500' },
}

interface ProblemCardProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  desc: string
}

export function ProblemCard({ icon: Icon, color, title, desc }: ProblemCardProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.rose
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${c.border} ${c.bg} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all`}>
      <div className={`inline-flex items-center justify-center size-9 rounded-lg mb-3 ${c.icon}`}>
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}
