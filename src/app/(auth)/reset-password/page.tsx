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

/**
 * Reset password page — user đến đây sau khi click link trong email forgot-password.
 * Supabase tự động set session khi user mở link, user chỉ cần nhập password mới.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự'); return }
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp'); return }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) { setError(err.message); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Đặt lại mật khẩu</h2>
        <p className="text-muted-foreground">Nhập mật khẩu mới cho tài khoản</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="text-lg h-14 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? 'Ẩn' : 'Hiện'}
                >
                  {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Ít nhất 8 ký tự</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-base font-medium">Xác nhận mật khẩu</Label>
              <Input
                id="confirm"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError('') }}
                className="text-lg h-14"
              />
            </div>

            {error && <p className="text-destructive text-sm font-medium" role="alert">{error}</p>}

            <Button type="submit" className="w-full h-14 text-lg" disabled={loading || !password || !confirm}>
              {loading ? <><Loader2 className="size-5 animate-spin mr-2" />Đang cập nhật...</> : 'Đặt lại mật khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center">
        <Link href="/login" className="text-primary hover:underline">← Quay lại đăng nhập</Link>
      </p>
    </div>
  )
}
