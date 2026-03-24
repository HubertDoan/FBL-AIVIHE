'use client'

import { useState, useCallback } from 'react'

interface DashboardStats {
  documentCount: number
  visitCount: number
  pendingCount: number
  familyCount: number
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    documentCount: 0,
    visitCount: 0,
    pendingCount: 0,
    familyCount: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Không thể tải thống kê.')
      }
      const data: DashboardStats = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, loading, error, fetchStats }
}
