'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'

/**
 * Forgot password page — Supabase Auth reset password flow.
 * Gửi email chứa magic link để user đặt lại mật khẩu.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Vui lòng nhập email'); return }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (err) { setError(err.message); return }
      setSent(true)
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="size-12 text-green-500 mx-auto" />
          <h2 className="text-2xl font-semibold">Kiểm tra email</h2>
          <p className="text-muted-foreground">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <span className="font-semibold">{email}</span>.
            Mở email và click vào link để tiếp tục.
          </p>
        </div>
        <Link href="/login" className="block text-center text-primary hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Quên mật khẩu</h2>
        <p className="text-muted-foreground">
          Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="email@aivihe.vn"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="text-lg h-14"
              />
            </div>

            {error && <p className="text-destructive text-sm font-medium" role="alert">{error}</p>}

            <Button type="submit" className="w-full h-14 text-lg" disabled={loading || !email}>
              {loading ? (
                <><Loader2 className="size-5 animate-spin mr-2" />Đang gửi...</>
              ) : 'Gửi link đặt lại mật khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center">
        <Link href="/login" className="text-primary hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  )
}
