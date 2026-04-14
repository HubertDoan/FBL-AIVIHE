'use client'

// Registration form for service packages — handles packageType-specific options and submission

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServicePackageDoctorSelector } from './service-package-doctor-selector'
import type { ServicePackage } from '@/lib/data/service-packages-config'

const SPECIALIST_TYPES = [
  { value: 'cardiology', label: 'Tim mạch' },
  { value: 'rheumatology', label: 'Cơ xương khớp' },
  { value: 'endocrinology', label: 'Nội tiết' },
  { value: 'neurology', label: 'Thần kinh' },
  { value: 'pulmonology', label: 'Hô hấp' },
  { value: 'gastroenterology', label: 'Tiêu hóa' },
]

interface Props {
  pkg: ServicePackage
}

export function ServicePackageRegistrationForm({ pkg }: Props) {
  const router = useRouter()
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [phcnLocation, setPhcnLocation] = useState<'center' | 'home'>('center')
  const [specialistType, setSpecialistType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    // Validate required fields per packageType
    if (pkg.packageType >= 1 && !selectedDoctorId) {
      toast.error('Vui lòng chọn bác sĩ trước khi đăng ký.')
      return
    }
    if (pkg.packageType === 3 && !specialistType) {
      toast.error('Vui lòng chọn chuyên khoa.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/service-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_type: pkg.packageType,
          selected_doctor_id: selectedDoctorId || null,
          phcn_location: pkg.packageType === 2 ? phcnLocation : null,
          specialist_type: pkg.packageType === 3 ? specialistType : null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'Đăng ký thất bại. Vui lòng thử lại.')
        return
      }
      toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ xác nhận sớm.')
      router.push('/dashboard')
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Doctor selector — packageType 1, 2, 3 */}
      {pkg.packageType >= 1 && (
        <ServicePackageDoctorSelector
          selectedDoctorId={selectedDoctorId}
          onSelect={setSelectedDoctorId}
        />
      )}

      {/* PHCN location — packageType 2 only */}
      {pkg.packageType === 2 && (
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-gray-800">Hình thức trị liệu</Label>
          <div className="flex gap-3">
            {(['center', 'home'] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setPhcnLocation(loc)}
                className={`rounded-lg border-2 px-5 py-2.5 text-base font-medium transition-all ${
                  phcnLocation === loc
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                {loc === 'center' ? 'Tại trung tâm Thong Dong' : 'Tại nhà'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Specialty selector — packageType 3 only */}
      {pkg.packageType === 3 && (
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-gray-800">Chuyên khoa cần tư vấn</Label>
          <Select value={specialistType} onValueChange={(v) => setSpecialistType(v ?? '')}>
            <SelectTrigger className="text-base h-12 w-full sm:w-72">
              <SelectValue placeholder="Chọn chuyên khoa..." />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIST_TYPES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-base">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        size="lg"
        className="w-full sm:w-auto min-h-[48px] text-lg px-8"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? 'Đang gửi...' : 'Đăng ký dịch vụ'}
      </Button>
    </div>
  )
}
