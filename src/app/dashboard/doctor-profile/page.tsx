'use client'

// Doctor professional profile page — approved doctors view/edit their professional info

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CertificateListEditor } from '@/components/doctor/certificate-list-editor'
import { WorkExperienceListEditor } from '@/components/doctor/work-experience-list-editor'
import { toast } from 'sonner'
import { Award, Pencil, X, Users } from 'lucide-react'
import type { DoctorProfile, Certificate, WorkExperience } from '@/lib/demo/demo-doctor-profile-data'

const DEGREE_OPTIONS = ['BS', 'CKI', 'CKII', 'ThS', 'TS']

export default function DoctorProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit state mirrors profile fields
  const [degree, setDegree] = useState('')
  const [university, setUniversity] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [desiredWork, setDesiredWork] = useState('')
  const [availableHours, setAvailableHours] = useState('')
  const [maxPatients, setMaxPatients] = useState('')

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/doctor-profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) setProfile(data.profile as DoctorProfile)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading || !user) return
    fetchProfile()
  }, [authLoading, user, fetchProfile])

  function startEdit() {
    if (!profile) return
    setDegree(profile.degree)
    setUniversity(profile.university)
    setGraduationYear(String(profile.graduation_year))
    setSpecialties(profile.specialties.join(', '))
    setCertificates(profile.certificates)
    setExperiences(profile.work_experience)
    setDesiredWork(profile.desired_work)
    setAvailableHours(profile.available_hours)
    setMaxPatients(String(profile.max_patients))
    setEditing(true)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch('/api/doctor-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          degree, university,
          graduation_year: parseInt(graduationYear),
          specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
          certificates, work_experience: experiences,
          desired_work: desiredWork, available_hours: availableHours,
          max_patients: parseInt(maxPatients) || 10,
        }),
      })
      if (res.ok) {
        await fetchProfile()
        setEditing(false)
        toast.success('Đã lưu hồ sơ chuyên môn.')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Lưu thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setSaving(false)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12 space-y-3">
        <Award className="size-12 text-muted-foreground mx-auto" />
        <p className="text-lg text-muted-foreground">Chưa có hồ sơ chuyên môn. Vui lòng đăng ký trước.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Hồ sơ chuyên môn</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={profile.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800'}>
            {profile.status === 'approved' ? 'Đã duyệt' : profile.status === 'pending' ? 'Chờ duyệt' : 'Tạm dừng'}
          </Badge>
          <Button variant={editing ? 'destructive' : 'outline'} className="h-11 text-base" onClick={editing ? () => setEditing(false) : startEdit}>
            {editing ? <><X className="size-4 mr-1" />Hủy</> : <><Pencil className="size-4 mr-1" />Chỉnh sửa</>}
          </Button>
        </div>
      </div>

      {/* Patient count summary */}
      <Card>
        <CardContent className="pt-4 flex items-center gap-3">
          <Users className="size-5 text-primary" />
          <span className="text-base">Bệnh nhân đang quản lý:</span>
          <span className="font-bold text-lg">{profile.current_patients} / {profile.max_patients}</span>
        </CardContent>
      </Card>

      {/* Bằng cấp */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Bằng cấp & Đào tạo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-base">Bằng cấp</Label>
                <select className="flex h-12 w-full rounded-md border border-input bg-background px-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={degree} onChange={e => setDegree(e.target.value)}>
                  {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-base">Năm tốt nghiệp</Label>
                <Input type="number" className="h-12 text-base" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-base">Trường đào tạo</Label>
                <Input className="h-12 text-base" value={university} onChange={e => setUniversity(e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-base">Chuyên khoa (ngăn cách bằng dấu phẩy)</Label>
                <Input className="h-12 text-base" value={specialties} onChange={e => setSpecialties(e.target.value)} />
              </div>
            </div>
          ) : (
            <dl className="grid gap-2 sm:grid-cols-2 text-base">
              <div><dt className="text-muted-foreground">Bằng cấp</dt><dd className="font-medium">{profile.degree}</dd></div>
              <div><dt className="text-muted-foreground">Năm tốt nghiệp</dt><dd className="font-medium">{profile.graduation_year}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted-foreground">Trường đào tạo</dt><dd className="font-medium">{profile.university}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted-foreground">Chuyên khoa</dt><dd className="font-medium">{profile.specialties.join(', ') || '—'}</dd></div>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Chứng chỉ */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Chứng chỉ hành nghề</CardTitle></CardHeader>
        <CardContent>
          {editing ? (
            <CertificateListEditor certificates={certificates} onChange={setCertificates} />
          ) : (
            <ul className="space-y-3">
              {profile.certificates.map((c, i) => (
                <li key={i} className="border rounded-lg p-3 text-base space-y-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-muted-foreground">{c.issuer} · Cấp: {c.issued_date}{c.expiry_date ? ` · HH: ${c.expiry_date}` : ''}</p>
                </li>
              ))}
              {profile.certificates.length === 0 && <p className="text-muted-foreground">Chưa có chứng chỉ.</p>}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Kinh nghiệm */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Kinh nghiệm công tác</CardTitle></CardHeader>
        <CardContent>
          {editing ? (
            <WorkExperienceListEditor experiences={experiences} onChange={setExperiences} />
          ) : (
            <ul className="space-y-3">
              {profile.work_experience.map((w, i) => (
                <li key={i} className="border rounded-lg p-3 text-base space-y-1">
                  <p className="font-medium">{w.position} — {w.facility}</p>
                  <p className="text-muted-foreground">{w.from_year} – {w.to_year ?? 'Hiện tại'}</p>
                  {w.description && <p className="text-sm">{w.description}</p>}
                </li>
              ))}
              {profile.work_experience.length === 0 && <p className="text-muted-foreground">Chưa có kinh nghiệm.</p>}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Mong muốn */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Mong muốn làm việc</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-1"><Label className="text-base">Giờ làm việc</Label><Input className="h-12 text-base" value={availableHours} onChange={e => setAvailableHours(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-base">Số BN tối đa</Label><Input type="number" className="h-12 text-base" value={maxPatients} onChange={e => setMaxPatients(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-base">Mong muốn & định hướng</Label><Textarea className="text-base" value={desiredWork} onChange={e => setDesiredWork(e.target.value)} /></div>
            </>
          ) : (
            <dl className="space-y-2 text-base">
              <div><dt className="text-muted-foreground">Giờ làm việc</dt><dd className="font-medium">{profile.available_hours || '—'}</dd></div>
              <div><dt className="text-muted-foreground">Mong muốn</dt><dd>{profile.desired_work || '—'}</dd></div>
            </dl>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Button className="w-full h-14 text-lg" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </Button>
      )}
    </div>
  )
}
