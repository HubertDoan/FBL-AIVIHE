'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

const EDUCATION_OPTIONS = [
  'Tiểu học',
  'THCS',
  'THPT',
  'Trung cấp',
  'Cao đẳng',
  'Đại học',
  'Sau đại học',
  'Khác',
]

const ETHNICITY_OPTIONS = [
  'Kinh', 'Tày', 'Thái', 'Mường', 'Hoa', 'Khmer', 'Nùng',
  'Hmông', 'Dao', 'Gia Rai', 'Ê Đê', 'Ba Na', 'Xơ Đăng',
  'Sán Chay', 'Cơ Ho', 'Chăm', 'Sán Dìu', 'Hrê', 'Raglay',
  'Mnông', 'Thổ', 'Xtiêng', 'Khơ Mú', 'Bru - Vân Kiều',
  'Cơ Tu', 'Giáy', 'Tà Ôi', 'Mạ', 'Co', 'Chơ Ro',
  'Xinh Mun', 'Hà Nhì', 'Chu Ru', 'Lào', 'La Chí',
  'Kháng', 'Phù Lá', 'La Hủ', 'La Ha', 'Pà Thẻn',
  'Lự', 'Ngái', 'Chứt', 'Lô Lô', 'Mảng', 'Cơ Lao',
  'Bố Y', 'Cống', 'Si La', 'Pu Péo', 'Brâu', 'Ơ Đu', 'Rơ Măm',
  'Khác',
]

const PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang',
  'Bắc Kạn', 'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định',
  'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Cần Thơ',
  'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai',
  'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội',
  'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình',
  'Hồ Chí Minh', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang',
  'Kon Tum', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Lâm Đồng',
  'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận',
  'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi',
  'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh',
  'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế',
  'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
  'Vĩnh Phúc', 'Yên Bái',
]

/** Shared styling for native select elements */
const selectClass =
  'w-full min-h-[48px] rounded-lg border border-input bg-transparent px-3 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/50'

/** Calculate age from a date string (YYYY-MM-DD) */
function calcAge(dob: string): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

export default function RegisterMemberPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [occupation, setOccupation] = useState('')
  const [education, setEducation] = useState('')
  const [province, setProvince] = useState('')
  const [commune, setCommune] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [bhytNumber, setBhytNumber] = useState('')
  const [email, setEmail] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [emergencyRelation, setEmergencyRelation] = useState('')
  const [memberType, setMemberType] = useState('member')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill full name from user data
  const displayName = fullName || user?.fullName || ''

  // Auto-calculate age
  const age = useMemo(() => calcAge(dateOfBirth), [dateOfBirth])

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

    if (!gender || !dateOfBirth || !province || !commune || !agreed) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc và đồng ý điều khoản.')
      return
    }

    if (idNumber && !/^\d{12}$/.test(idNumber)) {
      setError('Số CCCD/CMND phải có đúng 12 chữ số.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/membership/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: user?.citizenId,
          fullName: displayName,
          gender,
          dateOfBirth,
          idNumber: idNumber || null,
          ethnicity: ethnicity || null,
          occupation: occupation || null,
          education: education || null,
          province,
          commune,
          streetAddress: streetAddress || null,
          bhytNumber: bhytNumber || null,
          email: email || null,
          emergencyName: emergencyName || null,
          emergencyPhone: emergencyPhone || null,
          emergencyRelation: emergencyRelation || null,
          role: memberType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
        return
      }

      router.push('/dashboard/membership')
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
          <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Họ và tên */}
            <div className="space-y-2">
              <Label className="text-lg">Họ và tên</Label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <Label className="text-lg">Giới tính *</Label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Chọn giới tính --</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Ngày sinh + Tuổi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-lg">Ngày sinh *</Label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-lg">Tuổi</Label>
                <Input
                  type="text"
                  readOnly
                  value={age !== null ? `${age} tuổi` : ''}
                  placeholder="Tự động tính"
                  className="min-h-[48px] text-base bg-muted/50 cursor-default"
                />
              </div>
            </div>

            {/* Số CCCD/CMND */}
            <div className="space-y-2">
              <Label className="text-lg">Số CCCD/CMND</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={idNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  setIdNumber(v)
                }}
                placeholder="Nhập 12 chữ số"
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Dân tộc */}
            <div className="space-y-2">
              <Label className="text-lg">Dân tộc</Label>
              <select
                value={ethnicity}
                onChange={(e) => setEthnicity(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Chọn dân tộc --</option>
                {ETHNICITY_OPTIONS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            {/* Công việc / Nghề nghiệp */}
            <div className="space-y-2">
              <Label className="text-lg">Công việc / Nghề nghiệp</Label>
              <Input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Nhập nghề nghiệp"
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Trình độ học vấn */}
            <div className="space-y-2">
              <Label className="text-lg">Trình độ học vấn</Label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Chọn trình độ --</option>
                {EDUCATION_OPTIONS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            {/* Địa chỉ */}
            <fieldset className="space-y-4 rounded-lg border border-input p-4">
              <legend className="text-lg font-semibold px-2">Địa chỉ</legend>

              <div className="space-y-2">
                <Label className="text-lg">Tỉnh / Thành phố *</Label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-lg">Xã / Phường *</Label>
                <Input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="Nhập tên xã hoặc phường"
                  className="min-h-[48px] text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-lg">Số nhà / Đường</Label>
                <Input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Nhập số nhà, tên đường"
                  className="min-h-[48px] text-base"
                />
              </div>
            </fieldset>

            {/* Số thẻ BHYT */}
            <div className="space-y-2">
              <Label className="text-lg">Số thẻ BHYT</Label>
              <Input
                placeholder="Ví dụ: HS4010012345678"
                value={bhytNumber}
                onChange={(e) => setBhytNumber(e.target.value.toUpperCase().slice(0, 15))}
                className="min-h-[48px] text-lg"
              />
              <p className="text-sm text-muted-foreground">Mã thẻ bảo hiểm y tế (nếu có)</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-lg">Email</Label>
              <Input
                type="email"
                placeholder="Ví dụ: email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[48px] text-lg"
                autoComplete="email"
              />
            </div>

            {/* Người thân / Đại diện */}
            <fieldset className="border border-border rounded-lg p-4 space-y-4">
              <legend className="text-lg font-semibold px-2">Người thân / Đại diện</legend>

              <div className="space-y-2">
                <Label className="text-base">Họ tên người thân</Label>
                <Input
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="min-h-[48px] text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Số điện thoại người thân</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Ví dụ: 0912345678"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="min-h-[48px] text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Quan hệ</Label>
                <select
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Chọn quan hệ --</option>
                  <option value="spouse">Vợ/Chồng</option>
                  <option value="parent">Cha/Mẹ</option>
                  <option value="child">Con</option>
                  <option value="sibling">Anh/Chị/Em</option>
                  <option value="grandparent">Ông/Bà</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </fieldset>

            {/* Loại thành viên */}
            <div className="space-y-2">
              <Label className="text-lg">Loại thành viên *</Label>
              <select
                value={memberType}
                onChange={(e) => setMemberType(e.target.value)}
                className={selectClass}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Agreement checkbox */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 size-6 accent-purple-600 shrink-0 cursor-pointer"
              />
              <label
                className="text-base leading-relaxed cursor-pointer select-none"
                onClick={() => setAgreed(!agreed)}
              >
                Tôi đồng ý với điều khoản sử dụng AIVIHE.
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
