'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

function previewUsername(fullName: string): string {
  const parts = removeDiacritics(fullName).trim().split(/\s+/)
  if (parts.length < 2) return ''
  const year = new Date().getFullYear()
  const ten = parts[parts.length - 1]
  const ho = parts[0]
  const dem = parts.length > 2 ? parts.slice(1, -1).map(w => w[0]).join('') : ''
  return `${ten}${ho[0]}${dem}`.toLowerCase() + `${year}`
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    username: string
    phone: string
    fullName: string
  } | null>(null)

  const usernamePreview = useMemo(() => previewUsername(fullName), [fullName])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (fullName.trim().split(/\s+/).length < 2) {
      setError('Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ)')
      return
    }
    if (phone.length !== 10 || !phone.startsWith('0')) {
      setError('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Đã xảy ra lỗi.')
        return
      }
      setResult({ username: data.username, phone: data.phone, fullName: data.fullName })
    } catch {
      setError('Không thể kết nối đến máy chủ.')
    } finally {
      setIsLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Đăng ký thành công!</h2>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-3">
              <p className="text-lg font-medium text-green-800">
                Thông tin tài khoản của bạn:
              </p>
              <div className="space-y-2 text-base">
                <p>
                  <span className="text-muted-foreground">Họ tên: </span>
                  <span className="font-medium">{result.fullName}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Tên đăng nhập: </span>
                  <span className="font-bold text-xl">{result.username}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Mật khẩu: </span>
                  <span className="font-bold text-xl text-orange-600">123456</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Số điện thoại: </span>
                  <span className="font-medium">{result.phone}</span>
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
              <p className="text-sm text-orange-800 text-center font-medium">
                Hãy ghi nhớ tên đăng nhập và đổi mật khẩu ngay sau khi đăng nhập!
              </p>
            </div>
            <Link href="/login" className="block w-full">
              <Button className="w-full min-h-[48px] text-lg">
                Đăng nhập ngay
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Tạo tài khoản</h2>
        <p className="text-muted-foreground">
          Nhập họ tên và số điện thoại để tạo tài khoản AIVIHE
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <p className="text-sm text-muted-foreground text-center">
            Tài khoản được tạo ngay lập tức
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-base">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Ví dụ: Nguyễn Văn Minh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="min-h-[48px] text-lg"
                autoComplete="name"
              />
              {usernamePreview && (
                <p className="text-sm text-muted-foreground">
                  Tên đăng nhập sẽ là:{' '}
                  <span className="font-semibold text-primary">{usernamePreview}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="Ví dụ: 0901234567"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhone(val)
                }}
                required
                className="min-h-[48px] text-lg"
                autoComplete="tel"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Mật khẩu mặc định: <strong>123456</strong> — hãy đổi sau khi đăng nhập
            </p>

            {error && (
              <p className="text-sm text-destructive text-center rounded-md bg-destructive/10 p-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full min-h-[48px] text-lg font-semibold"
              disabled={isLoading || phone.length < 10 || fullName.trim().split(/\s+/).length < 2}
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-base">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
