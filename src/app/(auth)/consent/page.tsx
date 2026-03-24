'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ShieldCheck, Brain, Lock } from 'lucide-react'

const MANDATORY_SENTENCES = [
  {
    icon: Brain,
    text: 'Tr\u1EE3 l\u00FD AI s\u1EE9c kh\u1ECFe c\u00E1 nh\u00E2n gi\u00FAp ng\u01B0\u1EDDi d\u00E2n hi\u1EC3u v\u00E0 qu\u1EA3n l\u00FD d\u1EEF li\u1EC7u s\u1EE9c kh\u1ECFe c\u1EE7a m\u00ECnh.',
  },
  {
    icon: ShieldCheck,
    text: 'AI ch\u1EC9 h\u1ED7 tr\u1EE3 t\u1ED5ng h\u1EE3p v\u00E0 gi\u1EA3i th\u00EDch th\u00F4ng tin t\u1EEB d\u1EEF li\u1EC7u ng\u01B0\u1EDDi d\u00F9ng cung c\u1EA5p, kh\u00F4ng thay th\u1EBF b\u00E1c s\u0129 v\u00E0 kh\u00F4ng ch\u1EA9n \u0111o\u00E1n b\u1EC7nh.',
  },
  {
    icon: Lock,
    text: 'D\u1EEF li\u1EC7u s\u1EE9c kh\u1ECFe thu\u1ED9c v\u1EC1 ng\u01B0\u1EDDi d\u00F9ng v\u00E0 ch\u1EC9 \u0111\u01B0\u1EE3c chia s\u1EBB khi c\u00F3 s\u1EF1 cho ph\u00E9p c\u1EE7a ch\u1EE7 h\u1ED3 s\u01A1.',
  },
]

export default function ConsentPage() {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleConsent() {
    if (!agreed) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: updateError } = await supabase
        .from('citizens')
        .update({ has_consented: true, consented_at: new Date().toISOString() })
        .eq('auth_id', user.id)

      if (updateError) {
        setError('Kh\u00F4ng th\u1EC3 l\u01B0u. Vui l\u00F2ng th\u1EED l\u1EA1i.')
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Ch\u00E0o m\u1EEBng \u0111\u1EBFn AIVIHE</h2>
        <p className="text-muted-foreground">
          Vui l\u00F2ng \u0111\u1ECDc v\u00E0 \u0111\u1ED3ng \u00FD v\u1EDBi c\u00E1c \u0111i\u1EC1u kho\u1EA3n tr\u01B0\u1EDBc khi s\u1EED d\u1EE5ng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            AIVIHE l\u00E0 g\u00EC?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            AIVIHE l\u00E0 tr\u1EE3 l\u00FD AI gi\u00FAp b\u1EA1n t\u1ED5ng h\u1EE3p, gi\u1EA3i th\u00EDch, v\u00E0 qu\u1EA3n l\u00FD
            d\u1EEF li\u1EC7u s\u1EE9c kh\u1ECFe c\u1EE7a m\u00ECnh v\u00E0 gia \u0111\u00ECnh. AIVIHE{' '}
            <strong>kh\u00F4ng</strong> ph\u1EA3i b\u00E1c s\u0129 v\u00E0{' '}
            <strong>kh\u00F4ng</strong> ch\u1EA9n \u0111o\u00E1n b\u1EC7nh.
          </p>

          <div className="space-y-4">
            {MANDATORY_SENTENCES.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-accent rounded-lg"
              >
                <item.icon className="size-6 text-primary shrink-0 mt-0.5" />
                <p className="text-base leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 size-5 rounded border-border accent-primary"
            />
            <span className="text-base leading-relaxed">
              T\u00F4i \u0111\u00E3 \u0111\u1ECDc v\u00E0 \u0111\u1ED3ng \u00FD v\u1EDBi c\u00E1c \u0111i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng
            </span>
          </label>

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <Button
            onClick={handleConsent}
            className="w-full h-14 text-lg"
            disabled={!agreed || loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                \u0110ang x\u1EED l\u00FD...
              </>
            ) : (
              'B\u1EAFt \u0111\u1EA7u s\u1EED d\u1EE5ng'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
