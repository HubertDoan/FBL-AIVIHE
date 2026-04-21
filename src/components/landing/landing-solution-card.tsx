import React from 'react'

// Tech-modern Solution card: gradient icon background, hover lift effect,
// compact spacing. Light theme (white bg parent section).
interface SolutionCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}

export function SolutionCard({ icon: Icon, title, desc }: SolutionCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all">
      <div className="inline-flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20 mb-3 group-hover:shadow-blue-500/40 transition-shadow">
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-semibold mb-1.5 text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}
