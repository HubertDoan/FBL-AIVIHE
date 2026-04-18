'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

/**
 * Login form cho AIVIHE production:
 * - Email + password (Supabase Auth)
 * - Hỗ trợ demo mode (cookie-based) khi NEXT_PUBLIC_DEMO_MODE=true
 * - Không hiển thị danh sách demo accounts ở production
 * - Link "Quên mật khẩu" + "Đăng ký mới"
 */
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (IS_DEMO) {
        // Demo mode: cookie-based login
        const res = await fetch('/api/demo/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Đăng nhập thất bại')
          return
        }
      } else {
        // Production: Supabase Auth email/password
        const supabase = createClient()
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) {
          setError(authError.message === 'Invalid login credentials'
            ? 'Email hoặc mật khẩu không đúng'
            : authError.message)
          return
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-base font-medium">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="email@aivihe.vn"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="text-lg h-14"
              />
            </div>

            {/* Password + show/hide */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-base font-medium">
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="text-lg h-14 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Guidance for first-time users */}
      <p className="text-center text-sm text-muted-foreground">
        Khách hàng mới nhận tài khoản từ hành chính. Mật khẩu mặc định:{' '}
        <span className="font-mono font-semibold">Aivihe@2026</span>
      </p>
    </div>
  )
}
