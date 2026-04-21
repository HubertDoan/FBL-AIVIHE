import React from 'react'

// Healthcare Solution card: teal/emerald gradient icon (health + healing).
// White background, hover lift with teal shadow.
interface SolutionCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}

export function SolutionCard({ icon: Icon, title, desc }: SolutionCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all">
      <div className="inline-flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20 mb-3 group-hover:shadow-teal-500/40 transition-shadow">
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-semibold mb-1.5 text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}
