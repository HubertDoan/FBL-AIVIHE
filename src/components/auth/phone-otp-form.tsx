'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { phoneSchema, otpSchema } from '@/lib/validators/auth-schemas'
import { Loader2 } from 'lucide-react'

type Step = 'phone' | 'otp'

export function PhoneOtpForm() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const formatPhoneDisplay = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }, [])

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    setError('')
  }

  async function handleSendOtp() {
    const result = phoneSchema.safeParse(phone)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const formattedPhone = `+84${phone.slice(1)}`
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (authError) {
        setError('Không thể gửi mã xác thực. Vui lòng thử lại.')
        return
      }

      setStep('otp')
      setCountdown(60)
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    const result = otpSchema.safeParse(otp)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const formattedPhone = `+84${phone.slice(1)}`
      const { error: authError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      })

      if (authError) {
        setError('Mã xác thực không đúng. Vui lòng thử lại.')
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

  async function handleResendOtp() {
    if (countdown > 0) return
    await handleSendOtp()
  }

  if (step === 'phone') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendOtp()
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium">
            Số điện thoại
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="0xxx xxx xxx"
            value={formatPhoneDisplay(phone)}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="text-lg h-14"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-lg"
          disabled={loading || phone.length < 10}
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin mr-2" />
              Đang gửi...
            </>
          ) : (
            'Gửi mã xác thực'
          )}
        </Button>
      </form>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleVerifyOtp()
      }}
      className="space-y-4"
    >
      <p className="text-center text-muted-foreground">
        Mã xác thực đã gửi đến{' '}
        <span className="font-semibold text-foreground">
          {formatPhoneDisplay(phone)}
        </span>
      </p>

      <div className="space-y-2">
        <Label htmlFor="otp" className="text-base font-medium">
          Mã xác thực (6 chữ số)
        </Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            setError('')
          }}
          className="text-2xl text-center tracking-[0.5em] h-14"
          autoFocus
        />
      </div>

      {error && (
        <p className="text-destructive text-sm font-medium">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full h-14 text-lg"
        disabled={loading || otp.length < 6}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin mr-2" />
            Đang xác nhận...
          </>
        ) : (
          'Xác nhận'
        )}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setStep('phone')
            setOtp('')
            setError('')
          }}
          className="text-primary hover:underline min-h-0"
          style={{ minHeight: 'auto' }}
        >
          Đổi số điện thoại
        </button>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={countdown > 0}
          className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline min-h-0"
          style={{ minHeight: 'auto' }}
        >
          {countdown > 0
            ? `Gửi lại (${countdown}s)`
            : 'Gửi lại mã'}
        </button>
      </div>
    </form>
  )
}
