'use client'

import { useState, useEffect } from 'react'

export interface TrendPoint {
  date: string
  value: number
  unit: string
  referenceRange: string | null
}

interface TrendResponse {
  data: TrendPoint[]
  testName: string
}

export function useTrendData(citizenId: string | null, testName: string, months = 12) {
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!citizenId || !testName) {
      setData([])
      return
    }

    let cancelled = false

    async function fetchTrend() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          citizenId: citizenId ?? '',
          testName,
          months: String(months),
        })

        const res = await fetch(`/api/timeline/trends?${params}`)
        if (!res.ok) throw new Error('Không thể tải dữ liệu xu hướng.')

        const result: TrendResponse = await res.json()
        if (!cancelled) setData(result.data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTrend()
    return () => { cancelled = true }
  }, [citizenId, testName, months])

  return { data, loading, error }
}
