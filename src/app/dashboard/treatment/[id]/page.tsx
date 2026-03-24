'use client'

// Treatment detail page — full view of a single treatment episode
// Sections: prescription, health logs, doctor messages, exam results

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, HeartPulse, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { TreatmentMedicationChecklist } from '@/components/treatment/treatment-medication-checklist'
import { TreatmentHealthLogForm } from '@/components/treatment/treatment-health-log-form'
import { TreatmentDoctorMessageThread } from '@/components/treatment/treatment-doctor-message-thread'
import type { TreatmentEpisode, HealthLog, TreatmentMessage } from '@/lib/demo/demo-treatment-data'

function progressPercent(startDate: string, durationDays: number): number {
  const start = new Date(startDate)
  const now = new Date()
  const elapsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(100, Math.round((elapsed / durationDays) * 100))
}

function daysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function HealthLogEntry({ log }: { log: HealthLog }) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="font-medium text-base">{log.date}</span>
        <span className={log.medication_taken ? 'text-green-700' : 'text-amber-700'}>
          {log.medication_taken ? '✓ Đã uống thuốc' : '✗ Chưa uống thuốc'}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
        {log.blood_pressure && <span>HA: {log.blood_pressure} mmHg</span>}
        {log.blood_sugar && <span>ĐH: {log.blood_sugar} mmol/L</span>}
        {log.temperature && <span>Nhiệt độ: {log.temperature}°C</span>}
        {log.weight && <span>Cân: {log.weight} kg</span>}
      </div>
      {log.symptoms && <p>Triệu chứng: {log.symptoms}</p>}
      {log.notes && <p className="text-muted-foreground">{log.notes}</p>}
    </div>
  )
}

export default function TreatmentDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [treatment, setTreatment] = useState<TreatmentEpisode | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTreatment = useCallback(async () => {
    try {
      const res = await fetch(`/api/treatment/${id}`)
      const data = await res.json()
      if (res.ok) setTreatment(data.treatment)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => {
    if (authLoading || !user) return
    fetchTreatment()
  }, [authLoading, user, fetchTreatment])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!treatment) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-destructive">Không tìm thấy đợt điều trị.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Quay lại</Button>
      </div>
    )
  }

  const pct = progressPercent(treatment.start_date, treatment.treatment_duration_days)
  const remaining = daysRemaining(treatment.end_date)

  function handleLogSaved(log: HealthLog) {
    setTreatment((prev) => prev ? { ...prev, health_logs: [...prev.health_logs, log] } : prev)
  }

  function handleMessageSent(msg: TreatmentMessage) {
    setTreatment((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Quay lại">
          <ArrowLeft className="size-5" />
        </Button>
        <HeartPulse className="size-6 text-primary" />
        <h1 className="text-xl font-bold flex-1 min-w-0 line-clamp-1">Chi tiết điều trị</h1>
      </div>

      {/* Summary card */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-base font-semibold">{treatment.diagnosis.split('.')[0]}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User className="size-4" />{treatment.exam_doctor_name}</span>
            <span className="flex items-center gap-1"><Calendar className="size-4" />{treatment.exam_date}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{treatment.start_date} → {treatment.end_date}</span>
              <span>Còn {remaining} ngày</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary rounded-full h-2.5 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-right">{pct}% hoàn thành</p>
          </div>
          {treatment.treatment_notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
              <p className="font-medium mb-1">Hướng dẫn của bác sĩ:</p>
              <p className="whitespace-pre-wrap">{treatment.treatment_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={0}>
        <TabsList className="w-full h-auto flex flex-wrap">
          <TabsTrigger value={0} className="flex-1 py-3 text-sm">Đơn thuốc</TabsTrigger>
          <TabsTrigger value={1} className="flex-1 py-3 text-sm">Nhật ký</TabsTrigger>
          <TabsTrigger value={2} className="flex-1 py-3 text-sm">Tin nhắn BS</TabsTrigger>
          <TabsTrigger value={3} className="flex-1 py-3 text-sm">Kết quả khám</TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="mt-4">
          <TreatmentMedicationChecklist
            treatmentId={treatment.id}
            prescription={treatment.prescription}
          />
        </TabsContent>

        <TabsContent value={1} className="mt-4 space-y-4">
          <TreatmentHealthLogForm treatmentId={treatment.id} onSaved={handleLogSaved} />
          {treatment.health_logs.length > 0 && (
            <div className="space-y-2">
              <p className="text-base font-semibold">Nhật ký đã ghi ({treatment.health_logs.length})</p>
              {[...treatment.health_logs].reverse().map((log) => (
                <HealthLogEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value={2} className="mt-4">
          <TreatmentDoctorMessageThread
            treatmentId={treatment.id}
            messages={treatment.messages}
            currentUserId={user?.citizenId ?? user?.id ?? ''}
            currentUserName={user?.fullName ?? ''}
            hasFollowUp={treatment.status === 'follow_up_needed'}
            onMessageSent={handleMessageSent}
          />
        </TabsContent>

        <TabsContent value={3} className="mt-4 space-y-3">
          <p className="text-base font-semibold">Kết quả khám</p>
          <div className="bg-muted/50 rounded-lg p-4 text-base whitespace-pre-wrap">
            {treatment.treatment_notes || 'Không có dữ liệu kết quả khám.'}
          </div>
          <p className="text-base font-semibold">Chẩn đoán đầy đủ</p>
          <div className="bg-muted/50 rounded-lg p-4 text-base whitespace-pre-wrap">
            {treatment.diagnosis}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
