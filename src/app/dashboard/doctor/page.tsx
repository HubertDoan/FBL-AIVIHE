'use client'

import { useState, useEffect } from 'react'
import { Stethoscope, User, FileText, Clock, Pill, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import type { Citizen, ChronicDisease, Medication } from '@/types/database'

interface PatientView {
  citizen: Citizen
  chronicDiseases: ChronicDisease[]
  medications: Medication[]
}

export default function DoctorPage() {
  const { user, loading: authLoading } = useAuth()
  const [isDoctor, setIsDoctor] = useState<boolean | null>(null)
  const [patients, setPatients] = useState<PatientView[]>([])
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState<Record<string, string>>({})

  useEffect(() => {
    if (authLoading || !user) return

    async function load() {
      try {
        const res = await fetch('/api/doctor')
        if (!res.ok) {
          setIsDoctor(false)
          setLoading(false)
          return
        }
        const data = await res.json()
        if (data.isDoctor === false) {
          setIsDoctor(false)
        } else {
          setIsDoctor(true)
          setPatients(data.patients ?? [])
        }
      } catch {
        setIsDoctor(false)
      }
      setLoading(false)
    }
    load()
  }, [authLoading, user])

  if (authLoading || loading) {
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
