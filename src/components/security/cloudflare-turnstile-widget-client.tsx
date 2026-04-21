'use client'

/**
 * Cloudflare Turnstile widget — client component.
 *
 * Load script global (lazy), render invisible widget, expose token qua onVerify callback.
 * Fail-silent: nếu NEXT_PUBLIC_TURNSTILE_SITE_KEY chưa set → không render, form vẫn submit được.
 *
 * Usage:
 *   <TurnstileWidget onVerify={(token) => setToken(token)} />
 *   // Khi submit, gửi token lên API route
 */

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'flexible' | 'compact' | 'invisible'
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'

let scriptLoadPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise<void>((resolve) => {
    window.onTurnstileLoad = () => resolve()
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    document.head.appendChild(s)
  })
  return scriptLoadPromise
}

type Props = {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  theme = 'light',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) return // Chưa config — skip render
    if (!containerRef.current) return

    let cancelled = false
    loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size: 'flexible',
        callback: onVerify,
        'expired-callback': onExpire,
        'error-callback': onError,
      })
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget có thể đã bị DOM remove trước — ignore
        }
      }
    }
    // Chỉ re-init khi siteKey hoặc theme đổi — callbacks dùng ref-like closure ổn định
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, theme])

  // Không có site key → không render gì (dev/pilot bypass)
  if (!siteKey) return null

  return <div ref={containerRef} className="my-3" />
}
