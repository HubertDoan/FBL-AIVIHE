import React from 'react'

interface SolutionCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}

export function SolutionCard({ icon: Icon, title, desc }: SolutionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:border-teal-200 transition-all group">
      <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-teal-50 text-teal-600 mb-4 group-hover:bg-teal-100 transition-colors">
        <Icon className="size-7" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}
