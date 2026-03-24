'use client'

import { useState, useCallback } from 'react'
import type { Citizen, HealthProfile } from '@/types/database'

interface ProfileState {
  citizen: Citizen | null
  healthProfile: HealthProfile | null
  loading: boolean
  error: string | null
}

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    citizen: null,
    healthProfile: null,
    loading: false,
    error: null,
  })

  const fetchProfile = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Không thể tải hồ sơ.')
      }
      const data = await res.json()
      setState({ citizen: data.citizen, healthProfile: data.healthProfile, loading: false, error: null })
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : 'Đã xảy ra lỗi.' }))
    }
  }, [])

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Cập nhật hồ sơ thất bại.')
      }
      const updated = await res.json()
      setState((s) => ({ ...s, citizen: updated, loading: false }))
      return updated
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : 'Đã xảy ra lỗi.' }))
      return null
    }
  }, [])

  const updateHealthProfile = useCallback(async (data: Record<string, unknown>) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch('/api/profile/health', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Cập nhật hồ sơ sức khỏe thất bại.')
      }
      const updated = await res.json()
      setState((s) => ({ ...s, healthProfile: updated, loading: false }))
      return updated
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : 'Đã xảy ra lỗi.' }))
      return null
    }
  }, [])

  return {
    citizen: state.citizen,
    healthProfile: state.healthProfile,
    loading: state.loading,
    error: state.error,
    fetchProfile,
    updateProfile,
    updateHealthProfile,
  }
}
