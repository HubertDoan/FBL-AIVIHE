'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_ACCOUNTS, type DemoAccount } from '@/lib/demo/demo-accounts'
import { Loader2 } from 'lucide-react'

const roleLabels: Record<string, string> = {
  guest: 'Khách',
  citizen: 'Người dân',
  doctor: 'Bác sĩ',
  admin: 'Quản trị',
}

const roleBadgeColors: Record<string, string> = {
  guest: 'bg-amber-100 text-amber-800',
  citizen: 'bg-blue-100 text-blue-800',
  doctor: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800',
}

export function DemoLoginSection() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  function selectAccount(account: DemoAccount) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="space-y-4">
      {/* Quick select demo accounts */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium text-center">
            Chọn nhanh tài khoản demo
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => selectAccount(account)}
              className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                email === account.email
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-base truncate">
                    {account.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {account.description}
                  </p>
                </div>
                <span
                  className={`ml-2 shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                    roleBadgeColors[account.role]
                  }`}
                >
                  {roleLabels[account.role]}
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Email/password form */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium text-center">
            Hoặc nhập thông tin đăng nhập
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-email" className="text-base font-medium">
                Email
              </Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="email@demo.aivihe.vn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="text-lg h-14"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-password" className="text-base font-medium">
                Mật khẩu
              </Label>
              <Input
                id="demo-password"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="text-lg h-14"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
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
                'Đăng nhập Demo'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info banner */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <p className="text-sm text-amber-800 text-center">
          Chế độ demo &mdash; dữ liệu mẫu, không kết nối Supabase.
          Mật khẩu chung: <span className="font-mono font-bold">Demo@2024</span>
        </p>
      </div>
    </div>
  )
}
