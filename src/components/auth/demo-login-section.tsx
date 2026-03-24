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
  citizen: 'Ng\u01B0\u1EDDi d\u00E2n',
  doctor: 'B\u00E1c s\u0129',
  admin: 'Qu\u1EA3n tr\u1ECB',
}

const roleBadgeColors: Record<string, string> = {
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
      setError('Vui l\u00F2ng nh\u1EADp email v\u00E0 m\u1EADt kh\u1EA9u')
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
        setError(data.error || '\u0110\u0103ng nh\u1EADp th\u1EA5t b\u1EA1i')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('\u0110\u00E3 x\u1EA3y ra l\u1ED7i. Vui l\u00F2ng th\u1EED l\u1EA1i.')
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
            Ch\u1ECDn nhanh t\u00E0i kho\u1EA3n demo
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
            Ho\u1EB7c nh\u1EADp th\u00F4ng tin \u0111\u0103ng nh\u1EADp
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
                M\u1EADt kh\u1EA9u
              </Label>
              <Input
                id="demo-password"
                type="password"
                placeholder="M\u1EADt kh\u1EA9u"
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
                  \u0110ang \u0111\u0103ng nh\u1EADp...
                </>
              ) : (
                '\u0110\u0103ng nh\u1EADp Demo'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info banner */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <p className="text-sm text-amber-800 text-center">
          Ch\u1EBF \u0111\u1ED9 demo &mdash; d\u1EEF li\u1EC7u m\u1EABu, kh\u00F4ng k\u1EBFt n\u1ED1i Supabase.
          M\u1EADt kh\u1EA9u chung: <span className="font-mono font-bold">Demo@2024</span>
        </p>
      </div>
    </div>
  )
}
