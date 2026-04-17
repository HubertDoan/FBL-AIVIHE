import React from 'react'

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-50 border-red-200 text-red-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
  orange: 'bg-orange-50 border-orange-200 text-orange-600',
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
}

interface ProblemCardProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  desc: string
}

export function ProblemCard({ icon: Icon, color, title, desc }: ProblemCardProps) {
  const classes = COLOR_MAP[color] || COLOR_MAP.red
  const [bgBorder] = [classes.split(' ').slice(0, 2).join(' ')]

  return (
    <div className={`rounded-2xl border p-6 ${bgBorder}`}>
      <div className={`inline-flex items-center justify-center size-12 rounded-xl mb-4 ${classes}`}>
        <Icon className="size-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}
