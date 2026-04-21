'use client'

// BroadcastTargetPreviewCount
// Shows estimated recipient count for a broadcast based on selected target filter
// Fetches count from /api/director/broadcast-target-count with debounce

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import type { BroadcastTargetType } from './broadcast-announcement-form-with-target-selector'

interface Props {
  targetType: BroadcastTargetType
  services?: string[]
  province?: string
  commune?: string
}

export function BroadcastTargetPreviewCount({ targetType, services, province, commune }: Props) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Skip if by-service but no services selected yet
    if (targetType === 'by-service' && (!services || services.length === 0)) {
      setCount(0)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ type: targetType })
        if (targetType === 'by-service' && services?.length) {
          services.forEach((s) => params.append('services', s))
        }
        if (targetType === 'by-location') {
          if (province) params.set('province', province)
          if (commune) params.set('commune', commune)
        }
        const res = await fetch(`/api/director/broadcast-target-count?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setCount(data.count ?? 0)
        }
      } catch {
        // keep stale count on error
      } finally {
        setLoading(false)
      }
    }, 400) // debounce 400ms

    return () => clearTimeout(timer)
  }, [targetType, services, province, commune])

  if (count === null && !loading) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-base">
      <Users className="size-4 shrink-0" />
      {loading ? (
        <span className="text-sm">Đang tính...</span>
      ) : (
        <span>
          Khoảng <strong>~{count?.toLocaleString('vi-VN')}</strong> thành viên sẽ nhận thông báo này
        </span>
      )}
    </div>
  )
}
