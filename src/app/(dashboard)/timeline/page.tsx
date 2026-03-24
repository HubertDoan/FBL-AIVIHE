'use client'

import { useState, useEffect } from 'react'
import { FileUp, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TimelineFiltersBar } from '@/components/timeline/timeline-filters'
import { TimelineView } from '@/components/timeline/timeline-view'
import { TrendSelector, TREND_INDICATORS } from '@/components/timeline/trend-selector'
import { TrendChart } from '@/components/timeline/trend-chart'
import { useTimeline, type TimelineFilters } from '@/hooks/use-timeline'
import { useTrendData } from '@/hooks/use-trend-data'
import { createClient } from '@/lib/supabase/client'

export default function TimelinePage() {
  const [citizenId, setCitizenId] = useState<string | null>(null)
  const [filters, setFilters] = useState<TimelineFilters>({
    eventType: 'all',
    specialty: '',
    fromDate: '',
    toDate: '',
  })
  const [selectedTrend, setSelectedTrend] = useState('HbA1c')

  useEffect(() => {
    async function loadCitizen() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('citizens')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (data) setCitizenId(data.id)
    }
    loadCitizen()
  }, [])

  const { events, total, loading, error, loadMore, page, totalPages } = useTimeline(citizenId, filters)

  const indicator = TREND_INDICATORS.find((i) => i.key === selectedTrend)
  const { data: trendData, loading: trendLoading } = useTrendData(
    citizenId,
    selectedTrend
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{`D\u00F2ng th\u1EDDi gian s\u1EE9c kh\u1ECFe`}</h1>
        <p className="text-muted-foreground mt-1">
          {`Theo d\u00F5i l\u1ECBch s\u1EED s\u1EE9c kh\u1ECFe theo th\u1EDDi gian`}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <TimelineFiltersBar filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {/* Trend Charts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="size-5" />
            {`Bi\u1EC3u \u0111\u1ED3 xu h\u01B0\u1EDBng`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrendSelector selected={selectedTrend} onSelect={setSelectedTrend} />
          {trendLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <TrendChart
              data={trendData}
              title={indicator?.label ?? selectedTrend}
              unit={indicator?.unit ?? ''}
              referenceRange={indicator?.referenceRange ?? null}
            />
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {`C\u00E1c s\u1EF1 ki\u1EC7n`} ({total})
        </h2>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading && events.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : events.length === 0 && !loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileUp className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {`Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u s\u1EE9c kh\u1ECFe`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {`H\u00E3y t\u1EA3i t\u00E0i li\u1EC7u \u0111\u1EA7u ti\u00EAn!`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <TimelineView events={events} />

            {page < totalPages && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="min-w-[160px]"
                >
                  {loading ? `\u0110ang t\u1EA3i...` : `Xem th\u00EAm`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
