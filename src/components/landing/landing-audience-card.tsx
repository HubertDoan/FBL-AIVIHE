import React from 'react'
import { Check } from 'lucide-react'

// Tech-modern Audience card: gradient accent border on hover, compact list
interface AudienceCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
}

export function AudienceCard({ icon: Icon, title, items }: AudienceCardProps) {
  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-100">
        <div className="size-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-sm">
          <Icon className="size-4.5" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="size-3.5 text-indigo-500 shrink-0 mt-0.5" strokeWidth={3} />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
