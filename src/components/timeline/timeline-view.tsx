'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { TimelineCard } from './timeline-card'
import type { TimelineEvent } from '@/hooks/use-timeline'

interface TimelineViewProps {
  events: TimelineEvent[]
}

interface MonthGroup {
  label: string
  events: TimelineEvent[]
}

export function TimelineView({ events }: TimelineViewProps) {
  const groups = useMemo<MonthGroup[]>(() => {
    const map = new Map<string, TimelineEvent[]>()

    for (const event of events) {
      const date = parseISO(event.occurred_at)
      const key = format(date, 'yyyy-MM')
      const existing = map.get(key) ?? []
      existing.push(event)
      map.set(key, existing)
    }

    return Array.from(map.entries()).map(([key, items]) => ({
      label: format(parseISO(`${key}-01`), "'Tháng' MM, yyyy", { locale: vi }),
      events: items,
    }))
  }, [events])

  if (events.length === 0) return null

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Month label */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative z-10 size-3 rounded-full bg-primary shrink-0 hidden sm:block ml-[10px]" />
              <h3 className="text-lg font-bold text-foreground">{group.label}</h3>
            </div>

            {/* Events */}
            <div className="space-y-3 sm:pl-10">
              {group.events.map((event) => (
                <div key={event.id} className="relative">
                  {/* Dot on the timeline */}
                  <div className="absolute -left-[26px] top-5 size-2 rounded-full bg-muted-foreground/40 hidden sm:block" />
                  <TimelineCard event={event} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
