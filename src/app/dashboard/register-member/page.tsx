'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import {
  Crown,
  FileText,
  Brain,
  TrendingUp,
  Stethoscope,
  Users,
  CheckCircle,
} from 'lucide-react'

const BENEFITS = [
  { icon: FileText, text: 'Quản lý hồ sơ sức khỏe trọn đời' },
  { icon: Brain, text: 'AI trích xuất dữ liệu y tế' },
  { icon: TrendingUp, text: 'Theo dõi xu hướng sức khỏe' },
  { icon: Stethoscope, text: 'Chuẩn bị đi khám bệnh' },
  { icon: Users, text: 'Chia sẻ hồ sơ gia đình' },
]

const ROLE_OPTIONS = [
  { value: 'member', label: 'Thành viên' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'director', label: 'Giám đốc' },
  { value: 'secretary', label: 'Văn thư' },
  { value: 'admin_staff', label: 'Hành chính' },
  { value: 'accountant', label: 'Kế toán' },
]

export default function RegisterMemberPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [memberType, setMemberType] = useState('member')
  const [address, setAddress] = useState('')
  const [occupation, setOccupation] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!gender || !dateOfBirth || !address || !agreed) {
      setError('Vui lòng điền đầy đủ thông tin và đồng ý điều khoản.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/membership/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: user?.citizenId,
          gender,
          dateOfBirth,
          role: memberType,
          address,
          occupation,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Không thể kết nối. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Crown className="size-7 text-purple-600" />
        Đăng ký Thành viên AIVIHE
      </h1>

      {/* Benefits card */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="text-xl text-purple-700 dark:text-purple-400">
            Quyền lợi Thành viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-lg">
                <CheckCircle className="size-5 text-green-600 shrink-0" />
                <b.icon className="size-5 text-purple-600 shrink-0" />
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Registration form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-base">Giới tính *</Label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full min-h-[48px] rounded-lg border border-input bg-transparent px-3 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Date of birth */}
            <div className="space-y-2">
              <Label className="text-base">Ngày sinh *</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Member type */}
            <div className="space-y-2">
              <Label className="text-base">Loại thành viên *</Label>
              <select
                value={memberType}
                onChange={(e) => setMemberType(e.target.value)}
                className="w-full min-h-[48px] rounded-lg border border-input bg-transparent px-3 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-base">Địa chỉ *</Label>
              <Input
                type="text"
                placeholder="Nhập địa chỉ của bạn"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label className="text-base">Nghề nghiệp</Label>
              <Input
                type="text"
                placeholder="Nhập nghề nghiệp (không bắt buộc)"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Agreement */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-1 size-6"
              />
              <label className="text-base leading-relaxed cursor-pointer" onClick={() => setAgreed(!agreed)}>
                Tôi đồng ý với điều khoản sử dụng dịch vụ AIVIHE.
                Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.
              </label>
            </div>

            {error && (
              <p className="text-destructive text-base font-medium">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting || !agreed}
              className="w-full min-h-[56px] text-lg font-semibold bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? (
                <>
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Crown className="size-5 mr-2" />
                  Đăng ký thành viên
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
