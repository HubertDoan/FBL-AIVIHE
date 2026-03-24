'use client'

// Doctor schedule management page — view and manage appointment time slots

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CalendarDays, Plus, X, User, Clock } from 'lucide-react'
import type { DoctorTimeSlot } from '@/lib/demo/demo-doctor-schedule-data'

// Get next 7 days as date strings
function getNext7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export default function DoctorSchedulePage() {
  const { user, loading: authLoading } = useAuth()
  const [slots, setSlots] = useState<DoctorTimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addDate, setAddDate] = useState('')
  const [addStart, setAddStart] = useState('09:00')
  const [addEnd, setAddEnd] = useState('09:30')
  const [addNotes, setAddNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const days = getNext7Days()

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/doctor-schedule')
      if (res.ok) {
        const data = await res.json()
        setSlots(data.slots ?? [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading || !user) return
    if (user.role !== 'doctor') return
    fetchSlots()
  }, [authLoading, user, fetchSlots])

  async function handleAddSlot() {
    if (!addDate || !addStart || !addEnd) {
      toast.error('Vui lòng chọn ngày và giờ.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/doctor-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: addDate, start_time: addStart, end_time: addEnd, notes: addNotes || null }),
      })
      if (res.ok) {
        await fetchSlots()
        setShowAddForm(false)
        setAddDate('')
        setAddStart('09:00')
        setAddEnd('09:30')
        setAddNotes('')
        toast.success('Đã thêm slot khám.')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Thêm slot thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setSaving(false)
  }

  async function handleDelete(slotId: string) {
    setDeletingId(slotId)
    try {
      const res = await fetch(`/api/doctor-schedule/${slotId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchSlots()
        toast.success('Đã xoá slot.')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Xoá thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setDeletingId(null)
  }

  async function handleCancel(slotId: string) {
    try {
      const res = await fetch(`/api/doctor-schedule/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      if (res.ok) {
        await fetchSlots()
        toast.success('Đã huỷ lịch đặt.')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Huỷ thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user?.role !== 'doctor') {
    return (
      <div className="text-center py-12 text-lg text-muted-foreground">
        Trang này chỉ dành cho bác sĩ.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Lịch khám bệnh nhân</h1>
        </div>
        <Button className="h-11 text-base gap-2" onClick={() => setShowAddForm(true)}>
          <Plus className="size-4" />
          Thêm slot
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-lg">Thêm slot khám mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-base font-medium">Ngày khám</label>
                <input
                  type="date"
                  value={addDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setAddDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-base"
                />
              </div>
              <div className="space-y-1">
                <label className="text-base font-medium">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={addStart}
                  onChange={e => setAddStart(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-base"
                />
              </div>
              <div className="space-y-1">
                <label className="text-base font-medium">Giờ kết thúc</label>
                <input
                  type="time"
                  value={addEnd}
                  onChange={e => setAddEnd(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-base"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-base font-medium">Ghi chú (tuỳ chọn)</label>
              <input
                type="text"
                value={addNotes}
                onChange={e => setAddNotes(e.target.value)}
                placeholder="Ghi chú thêm..."
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-base"
              />
            </div>
            <div className="flex gap-3">
              <Button className="h-11 text-base flex-1" onClick={handleAddSlot} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu slot'}
              </Button>
              <Button variant="outline" className="h-11 text-base" onClick={() => setShowAddForm(false)}>
                Huỷ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-day calendar view */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {days.map(day => {
          const daySlots = slots.filter(s => s.date === day)
          return (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{formatDate(day)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có slot</p>
                ) : (
                  daySlots.map(slot => (
                    <div key={slot.id} className="rounded-lg border p-2 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="size-3.5 shrink-0" />
                          {slot.start_time} – {slot.end_time}
                        </div>
                        <Badge className={slot.is_available
                          ? 'bg-green-100 text-green-800 text-xs'
                          : 'bg-blue-100 text-blue-800 text-xs'}>
                          {slot.is_available ? 'Trống' : 'Đã đặt'}
                        </Badge>
                      </div>
                      {!slot.is_available && slot.booked_by_name && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="size-3.5 shrink-0" />
                          {slot.booked_by_name}
                        </div>
                      )}
                      {slot.notes && (
                        <p className="text-xs text-muted-foreground">{slot.notes}</p>
                      )}
                      <div className="flex gap-1 pt-1">
                        {!slot.is_available && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex-1"
                            onClick={() => handleCancel(slot.id)}
                          >
                            Huỷ đặt
                          </Button>
                        )}
                        {slot.is_available && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={deletingId === slot.id}
                            onClick={() => handleDelete(slot.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
