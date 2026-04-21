'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Stethoscope, Loader2 } from 'lucide-react'

/**
 * Form đăng ký BS gia đình từ trang chủ aivihe.vn (public, không cần auth)
 * BS điền thông tin cơ bản → hành chính liên hệ → bổ sung → GĐ duyệt → tạo acc
 */

const DOCTOR_TYPES = [
  { value: 'general', label: 'BS Đa khoa' },
  { value: 'oriental', label: 'BS Đông y' },
  { value: 'family_medicine', label: 'Y học Gia đình' },
  { value: 'specialist', label: 'BS Chuyên khoa' },
] as const

const EMPLOYMENT_TYPES = [
  { value: 'fulltime', label: 'Toàn thời gian' },
  { value: 'parttime', label: 'Bán thời gian' },
] as const

export function LandingDoctorApplicationForm() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [doctorType, setDoctorType] = useState<string>('')
  const [mainQualification, setMainQualification] = useState('')
  const [additionalCerts, setAdditionalCerts] = useState('')
  const [employmentType, setEmploymentType] = useState<string>('')
  const [agreed, setAgreed] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (fullName.trim().length < 2) { setError('Vui lòng nhập họ và tên'); return }
    if (!/^0\d{9}$/.test(phone)) { setError('Số điện thoại phải 10 chữ số, bắt đầu bằng 0'); return }
    if (licenseNumber.trim().length < 4) { setError('Vui lòng nhập số chứng chỉ hành nghề'); return }
    if (!doctorType) { setError('Vui lòng chọn loại bác sĩ'); return }
    if (!employmentType) { setError('Vui lòng chọn hình thức công việc'); return }
    if (!agreed) { setError('Vui lòng đồng ý để hành chính liên hệ'); return }

    const additionalCertsArr = additionalCerts
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    setIsLoading(true)
    try {
      const res = await fetch('/api/doctor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          license_number: licenseNumber.trim(),
          doctor_type: doctorType,
          specialties: [],
          main_qualification: mainQualification.trim() || undefined,
          additional_certifications: additionalCertsArr,
          employment_type: employmentType,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Không thể gửi. Vui lòng thử lại.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Không thể kết nối. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 max-w-2xl mx-auto">
        <CardContent className="pt-6 pb-6 text-center">
          <div className="inline-flex size-16 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center mb-4">
            <CheckCircle className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900 mb-2">Cảm ơn bạn!</h3>
          <p className="text-emerald-800 leading-relaxed">
            Hành chính Thong Dong sẽ liên hệ số <strong>{phone}</strong> trong vòng 24h
            để trao đổi về việc tham gia mạng lưới Bác sĩ gia đình.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-teal-100">
      <CardContent className="pt-6 pb-6">
        <div className="text-center mb-5">
          <div className="inline-flex size-12 rounded-full bg-teal-100 text-teal-600 items-center justify-center mb-2">
            <Stethoscope className="size-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Đăng ký BS gia đình</h3>
          <p className="text-sm text-gray-500 mt-1">
            Điền thông tin — hành chính sẽ liên hệ bạn trong 24h
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên + SĐT */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="da_name" className="text-base">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="da_name"
                placeholder="BS. Nguyễn Văn A"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="da_phone" className="text-base">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="da_phone"
                type="tel"
                inputMode="numeric"
                placeholder="0901234567"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                className="min-h-[48px] text-base"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="da_email" className="text-base">Email (tùy chọn)</Label>
            <Input
              id="da_email"
              type="email"
              placeholder="bsgia dinh@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="min-h-[48px] text-base"
            />
          </div>

          {/* Số chứng chỉ hành nghề */}
          <div className="space-y-1.5">
            <Label htmlFor="da_license" className="text-base">
              Số chứng chỉ hành nghề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="da_license"
              placeholder="VD: 009999/HNO-GPHN"
              value={licenseNumber}
              onChange={e => setLicenseNumber(e.target.value)}
              required
              className="min-h-[48px] text-base"
            />
          </div>

          {/* Loại BS */}
          <div className="space-y-1.5">
            <Label className="text-base">
              Loại bác sĩ <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {DOCTOR_TYPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDoctorType(opt.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm text-left transition ${
                    doctorType === opt.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                      : 'border-gray-200 bg-white hover:border-teal-300 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bằng chính */}
          <div className="space-y-1.5">
            <Label htmlFor="da_qual" className="text-base">Bằng chính</Label>
            <Input
              id="da_qual"
              placeholder="VD: Bác sĩ chuyên khoa I, Tiến sĩ Y khoa..."
              value={mainQualification}
              onChange={e => setMainQualification(e.target.value)}
              className="min-h-[48px] text-base"
            />
          </div>

          {/* Chứng chỉ thêm */}
          <div className="space-y-1.5">
            <Label htmlFor="da_certs" className="text-base">
              Chứng chỉ thêm <span className="text-gray-400 text-sm font-normal">(mỗi dòng 1 chứng chỉ)</span>
            </Label>
            <Textarea
              id="da_certs"
              placeholder="VD: Chứng chỉ Lão khoa&#10;Chứng chỉ Tim mạch cơ bản"
              value={additionalCerts}
              onChange={e => setAdditionalCerts(e.target.value)}
              rows={3}
              className="text-base resize-none"
            />
          </div>

          {/* Hình thức công việc */}
          <div className="space-y-1.5">
            <Label className="text-base">
              Hình thức công việc <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-3">
              {EMPLOYMENT_TYPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmploymentType(opt.value)}
                  className={`flex-1 px-3 py-2.5 rounded-lg border text-sm text-center transition ${
                    employmentType === opt.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                      : 'border-gray-200 bg-white hover:border-teal-300 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Đồng ý */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 size-4 accent-teal-600"
              required
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              Tôi đồng ý để Thong Dong Life liên hệ tư vấn và xác minh thông tin.
              Dữ liệu được bảo mật, chỉ dùng cho mục đích tuyển dụng mạng lưới bác sĩ. <span className="text-destructive">*</span>
            </span>
          </label>

          {error && (
            <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md p-2.5">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full min-h-[52px] text-base font-semibold bg-teal-600 hover:bg-teal-700"
            disabled={isLoading || !agreed}
          >
            {isLoading ? (
              <><Loader2 className="size-4 animate-spin mr-2" /> Đang gửi...</>
            ) : (
              'Gửi đăng ký'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
