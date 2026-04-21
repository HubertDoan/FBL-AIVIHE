import React from 'react'

// Tech-modern Problem card: dark theme (parent section is bg-slate-900)
// Compact padding, subtle glow icon background, neon accent color
const COLOR_MAP: Record<string, { icon: string; glow: string }> = {
  red:    { icon: 'bg-red-500/10 text-red-400',       glow: 'hover:shadow-red-500/20' },
  amber:  { icon: 'bg-amber-500/10 text-amber-400',   glow: 'hover:shadow-amber-500/20' },
  orange: { icon: 'bg-orange-500/10 text-orange-400', glow: 'hover:shadow-orange-500/20' },
  blue:   { icon: 'bg-blue-500/10 text-blue-400',     glow: 'hover:shadow-blue-500/20' },
}

interface ProblemCardProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  desc: string
}

export function ProblemCard({ icon: Icon, color, title, desc }: ProblemCardProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.red
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 hover:bg-white/[0.06] hover:border-white/20 transition-all hover:shadow-xl ${c.glow}`}>
      <div className={`inline-flex items-center justify-center size-9 rounded-lg mb-3 ${c.icon}`}>
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}
