'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HealthEvent, SourceDocument } from '@/types/database'

export interface TimelineEvent extends HealthEvent {
  source_documents: Pick<
    SourceDocument,
    'id' | 'original_filename' | 'document_type' | 'facility_name'
  > | null
}

export interface TimelineFilters {
  eventType?: string
  specialty?: string
  fromDate?: string
  toDate?: string
}

interface TimelineResponse {
  events: TimelineEvent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useTimeline(citizenId: string | null, filters: TimelineFilters) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(
    async (pageNum: number, append = false) => {
      if (!citizenId) return
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ citizenId, page: String(pageNum), limit: '20' })
        if (filters.eventType && filters.eventType !== 'all') params.set('eventType', filters.eventType)
        if (filters.specialty) params.set('specialty', filters.specialty)
        if (filters.fromDate) params.set('fromDate', filters.fromDate)
        if (filters.toDate) params.set('toDate', filters.toDate)

        const res = await fetch(`/api/timeline?${params}`)
        if (!res.ok) throw new Error('Không thể tải dữ liệu.')

        const data: TimelineResponse = await res.json()
        setEvents((prev) => (append ? [...prev, ...data.events] : data.events))
        setTotal(data.total)
        setPage(data.page)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.')
      } finally {
        setLoading(false)
      }
    },
    [citizenId, filters]
  )

  useEffect(() => {
    setEvents([])
    setPage(1)
    fetchEvents(1)
  }, [fetchEvents])

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchEvents(page + 1, true)
    }
  }, [page, totalPages, loading, fetchEvents])

  return { events, total, page, totalPages, loading, error, loadMore, refetch: () => fetchEvents(1) }
}
