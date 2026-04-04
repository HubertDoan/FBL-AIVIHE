'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_ACCOUNTS, ACCOUNT_TYPES, type DemoAccount } from '@/lib/demo/demo-accounts'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const roleBadgeColors: Record<string, string> = {
  guest: 'bg-amber-100 text-amber-800',
  citizen: 'bg-blue-100 text-blue-800',
  staff: 'bg-slate-100 text-slate-800',
  accountant: 'bg-emerald-100 text-emerald-800',
  admin_staff: 'bg-orange-100 text-orange-800',
  manager: 'bg-violet-100 text-violet-800',
  technician: 'bg-cyan-100 text-cyan-800',
  tech_assistant: 'bg-sky-100 text-sky-800',
  nurse: 'bg-rose-100 text-rose-800',
  support_staff: 'bg-lime-100 text-lime-800',
  intern: 'bg-gray-100 text-gray-500',
  doctor: 'bg-green-100 text-green-800',
  specialist: 'bg-teal-100 text-teal-800',
  admin: 'bg-purple-100 text-purple-800',
  director: 'bg-purple-100 text-purple-800',
  branch_director: 'bg-indigo-100 text-indigo-800',
  super_admin: 'bg-red-100 text-red-800',
  reception: 'bg-teal-100 text-teal-800',
  exam_doctor: 'bg-cyan-100 text-cyan-800',
}

export function LoginForm() {
  const [accountType, setAccountType] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTestAccounts, setShowTestAccounts] = useState(false)
  const router = useRouter()

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    if (!accountType) {
      setError('Vui lòng chọn loại tài khoản')
      return
    }
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (IS_DEMO) {
        // Demo mode: use demo login API
        const res = await fetch('/api/demo/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Đăng nhập thất bại'); return }
      } else {
        // Production: Supabase email/password auth
        const supabase = createClient()
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) { setError(authError.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : authError.message); return }
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  function selectTestAccount(account: DemoAccount) {
    setEmail(account.email)
    setPassword(account.password)
    // Auto-select matching account type
    const matchType = ACCOUNT_TYPES.find(t => t.value === account.role)
    if (matchType) setAccountType(matchType.value)
    setError('')
  }

  // Get label for selected account type
  const selectedLabel = ACCOUNT_TYPES.find(t => t.value === accountType)?.label

  return (
    <div className="space-y-4">
      {/* Login form */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Account type selector */}
            <div className="space-y-2">
              <Label htmlFor="account-type" className="text-base font-medium">
                Loại tài khoản
              </Label>
              <select
                id="account-type"
                value={accountType}
                onChange={(e) => {
                  setAccountType(e.target.value)
                  setError('')
                }}
                className="w-full h-14 text-lg px-4 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Chọn loại tài khoản --</option>
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-base font-medium">
                Email / Tên đăng nhập
              </Label>
              <Input
                id="login-email"
                type="text"
                placeholder="email@aivihe.vn"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="text-lg h-14"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-base font-medium">
                Mật khẩu
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                className="text-lg h-14"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg"
              disabled={loading || !email || !password || !accountType}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                selectedLabel ? `Đăng nhập (${selectedLabel})` : 'Đăng nhập'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Test accounts - collapsible */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setShowTestAccounts(!showTestAccounts)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-medium text-muted-foreground">
            Tài khoản có sẵn ({DEMO_ACCOUNTS.length} tài khoản)
          </span>
          {showTestAccounts ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        {showTestAccounts && (
          <div className="px-3 pb-3 space-y-1.5">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => selectTestAccount(account)}
                className={`w-full text-left p-2.5 rounded-lg border transition-colors hover:bg-muted/50 ${
                  email === account.email
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {account.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {account.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      roleBadgeColors[account.role] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ACCOUNT_TYPES.find(t => t.value === account.role)?.label || account.role}
                  </span>
                </div>
              </button>
            ))}
            <p className="text-xs text-center text-muted-foreground pt-1">
              Mật khẩu mặc định: <span className="font-mono font-bold">Aivihe@2024</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
