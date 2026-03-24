'use client'

import { useState } from 'react'
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
import { useAuth } from '@/hooks/use-auth'

export default function TimelinePage() {
  const { user, loading: authLoading } = useAuth()
  const citizenId = user?.citizenId ?? null
  const [filters, setFilters] = useState<TimelineFilters>({
    eventType: 'all',
    specialty: '',
    fromDate: '',
    toDate: '',
  })
  const [selectedTrend, setSelectedTrend] = useState('HbA1c')

  const { events, total, loading, error, loadMore, page, totalPages } = useTimeline(citizenId, filters)

  const indicator = TREND_INDICATORS.find((i) => i.key === selectedTrend)
  const { data: trendData, loading: trendLoading } = useTrendData(
    citizenId,
    selectedTrend
  )

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{`Dòng thời gian sức khỏe`}</h1>
        <p className="text-muted-foreground mt-1">
          {`Theo dõi lịch sử sức khỏe theo thời gian`}
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
            {`Biểu đồ xu hướng`}
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
          {`Các sự kiện`} ({total})
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
                {`Chưa có dữ liệu sức khỏe`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {`Hãy tải tài liệu đầu tiên!`}
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
                  {loading ? `Đang tải...` : `Xem thêm`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
