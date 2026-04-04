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
    text: 'Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.',
  },
  {
    icon: ShieldCheck,
    text: 'AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh.',
  },
  {
    icon: Lock,
    text: 'Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.',
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
        .eq('id', user.id)

      if (updateError) {
        setError('Không thể lưu. Vui lòng thử lại.')
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Chào mừng đến AIVIHE</h2>
        <p className="text-muted-foreground">
          Vui lòng đọc và đồng ý với các điều khoản trước khi sử dụng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            AIVIHE là gì?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            AIVIHE là trợ lý AI giúp bạn tổng hợp, giải thích, và quản lý
            dữ liệu sức khỏe của mình và gia đình. AIVIHE{' '}
            <strong>không</strong> phải bác sĩ và{' '}
            <strong>không</strong> chẩn đoán bệnh.
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
              Tôi đã đọc và đồng ý với các điều khoản sử dụng
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
                Đang xử lý...
              </>
            ) : (
              'Bắt đầu sử dụng'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
