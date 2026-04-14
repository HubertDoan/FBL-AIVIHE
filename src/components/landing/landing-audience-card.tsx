import React from 'react'
import { CheckCircle } from 'lucide-react'

interface AudienceCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
}

export function AudienceCard({ icon: Icon, title, items }: AudienceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Icon className="size-5" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-600">
            <CheckCircle className="size-4 text-teal-500 shrink-0 mt-1" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
