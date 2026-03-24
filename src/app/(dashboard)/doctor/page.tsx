'use client'

import { useState, useEffect } from 'react'
import { Stethoscope, User, FileText, Clock, Pill, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Citizen, ChronicDisease, Medication } from '@/types/database'

interface PatientView {
  citizen: Citizen
  chronicDiseases: ChronicDisease[]
  medications: Medication[]
}

export default function DoctorPage() {
  const [isDoctor, setIsDoctor] = useState<boolean | null>(null)
  const [patients, setPatients] = useState<PatientView[]>([])
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if this user has doctor role in any family
      const { data: doctorMemberships } = await supabase
        .from('family_members')
        .select('family_id, citizen_id')
        .eq('role', 'doctor')

      // Check if current user's citizen_id matches
      const { data: myCitizen } = await supabase
        .from('citizens')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!myCitizen) { setIsDoctor(false); setLoading(false); return }

      const myDoctorFamilies = (doctorMemberships ?? []).filter(
        (m: any) => m.citizen_id === myCitizen.id
      )

      if (myDoctorFamilies.length === 0) {
        setIsDoctor(false)
        setLoading(false)
        return
      }

      setIsDoctor(true)

      // Get all family members from families where I'm a doctor
      const familyIds = myDoctorFamilies.map((f: any) => f.family_id)
      const { data: members } = await supabase
        .from('family_members')
        .select('citizen_id')
        .in('family_id', familyIds)
        .neq('citizen_id', myCitizen.id)

      const citizenIds = [...new Set((members ?? []).map((m: any) => m.citizen_id))]

      const patientViews: PatientView[] = []
      for (const cid of citizenIds) {
        const { data: citizen } = await supabase
          .from('citizens').select('*').eq('id', cid).single()
        if (!citizen) continue

        const { data: diseases } = await supabase
          .from('chronic_diseases').select('*').eq('citizen_id', cid)
        const { data: meds } = await supabase
          .from('medications').select('*').eq('citizen_id', cid).eq('is_active', true)

        patientViews.push({
          citizen,
          chronicDiseases: (diseases as ChronicDisease[]) ?? [],
          medications: (meds as Medication[]) ?? [],
        })
      }

      setPatients(patientViews)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (<div className="space-y-4 max-w-4xl"><Skeleton className="h-8 w-48" />
      {[0, 1].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>)
  }
  if (!isDoctor) {
    return (<div className="max-w-4xl"><Card><CardContent className="flex flex-col items-center py-12 text-center">
      <ShieldAlert className="size-12 text-muted-foreground/50 mb-4" />
      <p className="text-lg font-medium text-muted-foreground">Bạn chưa được ủy quyền làm bác sĩ gia đình</p>
      <p className="text-base text-muted-foreground mt-2">Chủ hồ sơ cần thêm bạn với vai trò bác sĩ trong nhóm gia đình</p>
    </CardContent></Card></div>)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Stethoscope className="size-7" />
          Bác sĩ gia đình
        </h1>
        <p className="text-muted-foreground mt-1">
          Danh sách bệnh nhân đã ủy quyền cho bạn
        </p>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có bệnh nhân nào trong danh sách
          </CardContent>
        </Card>
      ) : (
        patients.map((p) => (
          <Card key={p.citizen.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="size-5" />
                {p.citizen.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Ngày sinh:</span> {p.citizen.date_of_birth ?? '—'}</div>
                <div><span className="text-muted-foreground">Giới tính:</span> {p.citizen.gender === 'male' ? 'Nam' : p.citizen.gender === 'female' ? 'Nữ' : '—'}</div>
              </div>

              {p.chronicDiseases.length > 0 && (
                <div>
                  <p className="font-medium text-base flex items-center gap-1 mb-2">
                    <FileText className="size-4" /> Bệnh nền
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.chronicDiseases.map((d) => (
                      <Badge key={d.id} variant="secondary">
                        {d.disease_name} ({d.status})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {p.medications.length > 0 && (
                <div>
                  <p className="font-medium text-base flex items-center gap-1 mb-2">
                    <Pill className="size-4" /> Thuốc đang dùng
                  </p>
                  <ul className="text-sm space-y-1">
                    {p.medications.map((m) => (
                      <li key={m.id}>
                        {m.drug_name} {m.dosage ? `— ${m.dosage}` : ''} {m.frequency ?? ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              <div>
                <p className="font-medium text-base flex items-center gap-1 mb-2">
                  <Clock className="size-4" /> Thêm ghi chú
                </p>
                <Textarea
                  value={noteText[p.citizen.id] ?? ''}
                  onChange={(e) =>
                    setNoteText({ ...noteText, [p.citizen.id]: e.target.value })
                  }
                  placeholder="Ghi chú cho bệnh nhân..."
                  className="text-base min-h-[60px]"
                />
                <Button
                  variant="outline"
                  className="mt-2 min-h-[48px] text-base"
                  disabled={!noteText[p.citizen.id]?.trim()}
                >
                  Lưu ghi chú
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
