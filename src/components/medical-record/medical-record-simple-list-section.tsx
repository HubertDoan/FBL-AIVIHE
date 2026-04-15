/** Reusable list section — dùng cho Section II, III, IV, VI, VII, IX, X, XI */

interface ListItem {
  id: string
  title: string
  subtitle?: string
  detail?: string
  date?: string
  badge?: string
  badgeColor?: string
}

const BADGE_COLORS: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
}

export function MedicalRecordSimpleListSection({ items, emptyMessage }: { items: ListItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 italic py-3">{emptyMessage}</p>
  }

  return (
    <div className="space-y-2 pt-3">
      {items.map(item => (
        <div key={item.id} className="rounded-lg border border-gray-100 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{item.title}</p>
              {item.subtitle && <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>}
              {item.detail && <p className="text-sm text-gray-700 mt-1">{item.detail}</p>}
              {item.date && <p className="text-xs text-gray-400 mt-1">Ngày: {item.date}</p>}
            </div>
            {item.badge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLORS[item.badgeColor || 'gray']}`}>
                {item.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
