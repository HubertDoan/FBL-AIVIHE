'use client'

import { useState, useCallback } from 'react'
import { toastError, toastSuccess } from '@/lib/utils/toast-helpers'

interface UseAsyncActionOptions {
  /** Vietnamese success message shown via toast */
  successMessage?: string
  /** Vietnamese error message shown via toast (fallback) */
  errorMessage?: string
  /** Show success toast automatically (default: false) */
  showSuccess?: boolean
}

interface UseAsyncActionReturn<T> {
  execute: (...args: unknown[]) => Promise<T | undefined>
  loading: boolean
  error: string | null
}

export function useAsyncAction<T = void>(
  action: (...args: unknown[]) => Promise<T>,
  options: UseAsyncActionOptions = {},
): UseAsyncActionReturn<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | undefined> => {
      setLoading(true)
      setError(null)
      try {
        const result = await action(...args)
        if (options.showSuccess) {
          toastSuccess(options.successMessage)
        }
        return result
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : (options.errorMessage ?? 'Đã xảy ra lỗi. Vui lòng thử lại.')
        setError(message)
        toastError(message)
        return undefined
      } finally {
        setLoading(false)
      }
    },
    [action, options.showSuccess, options.successMessage, options.errorMessage],
  )

  return { execute, loading, error }
}
