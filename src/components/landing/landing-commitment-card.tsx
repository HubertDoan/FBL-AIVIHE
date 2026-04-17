import React from 'react'

const BG_MAP: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200',
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  teal: 'bg-teal-50 border-teal-200',
}

const ICON_MAP: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  teal: 'bg-teal-100 text-teal-600',
}

interface CommitmentCardProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  desc: string
}

export function CommitmentCard({ icon: Icon, color, title, desc }: CommitmentCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${BG_MAP[color] || BG_MAP.blue}`}>
      <div className={`inline-flex items-center justify-center size-10 rounded-xl mb-3 ${ICON_MAP[color] || ICON_MAP.blue}`}>
        <Icon className="size-5" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
