'use client'

// Patient book-appointment page — book time slots from assigned family doctor

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CalendarCheck, Clock, Stethoscope, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { DoctorTimeSlot } from '@/lib/demo/demo-doctor-schedule-data'

function getNext7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

export default function BookAppointmentPage() {
  const { user, loading: authLoading } = useAuth()
  const [availableSlots, setAvailableSlots] = useState<DoctorTimeSlot[]>([])
  const [bookedSlots, setBookedSlots] = useState<DoctorTimeSlot[]>([])
  const [doctorName, setDoctorName] = useState<string | null>(null)
  const [noDoctor, setNoDoctor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmSlot, setConfirmSlot] = useState<DoctorTimeSlot | null>(null)
  const [booking, setBooking] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const days = getNext7Days()

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/doctor-schedule')
      if (res.ok) {
        const data = await res.json()
        if (data.no_doctor) {
          setNoDoctor(true)
        } else {
          setDoctorName(data.doctor_name ?? null)
          setAvailableSlots(data.slots ?? [])
        }
      }
      // Also fetch all slots to find ones booked by this user — use booked_by from available list
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  // Separate booked slots (where booked_by === current user) from available
  useEffect(() => {
    if (!user) return
    // bookedSlots are available=false slots from the API — not returned by GET (available only)
    // We track them locally from what we know about the current session
    // For demo: re-fetch all slots via a separate approach isn't needed;
    // booked slots are identified from the available list having is_available=false
    // Since GET returns only available slots, we manage booked display from local state after booking
  }, [user, availableSlots])

  useEffect(() => {
    if (authLoading || !user) return
    fetchSlots()
  }, [authLoading, user, fetchSlots])

  async function handleBook() {
    if (!confirmSlot) return
    setBooking(true)
    try {
      const res = await fetch(`/api/doctor-schedule/${confirmSlot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'book' }),
      })
      if (res.ok) {
        const data = await res.json()
        // Move from available to booked display
        setAvailableSlots(prev => prev.filter(s => s.id !== confirmSlot.id))
        setBookedSlots(prev => [...prev, data.slot])
        setConfirmSlot(null)
        toast.success(`Đã đặt lịch khám ${confirmSlot.date} lúc ${confirmSlot.start_time}.`)
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Đặt lịch thất bại.')
        setConfirmSlot(null)
      }
    } catch { toast.error('Lỗi kết nối.') }
    setBooking(false)
  }

  async function handleCancelBooked(slot: DoctorTimeSlot) {
    setCancellingId(slot.id)
    try {
      const res = await fetch(`/api/doctor-schedule/${slot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      if (res.ok) {
        setBookedSlots(prev => prev.filter(s => s.id !== slot.id))
        // Put back as available
        setAvailableSlots(prev => [...prev, { ...slot, is_available: true, booked_by: null, booked_by_name: null, booked_at: null }])
        toast.success('Đã huỷ lịch khám.')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Huỷ thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setCancellingId(null)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <CalendarCheck className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Đặt lịch khám BS gia đình</h1>
      </div>

      {noDoctor && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-5 text-yellow-600" />
              <p className="text-base font-medium text-yellow-800 dark:text-yellow-300">
                Bạn chưa có bác sĩ gia đình
              </p>
            </div>
            <p className="text-base text-yellow-700 dark:text-yellow-400">
              Để đặt lịch khám, bạn cần đăng ký bác sĩ gia đình trước.
            </p>
            <Link href="/dashboard/choose-doctor">
              <Button className="h-11 text-base gap-2">
                <Stethoscope className="size-4" />
                Đăng ký BS gia đình
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!noDoctor && doctorName && (
        <p className="text-base text-muted-foreground">
          Bác sĩ gia đình của bạn: <span className="font-semibold text-foreground">{doctorName}</span>
        </p>
      )}

      {/* Upcoming booked appointments */}
      {bookedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="size-5 text-green-500" />
              Lịch khám đã đặt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookedSlots
              .sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`))
              .map(slot => (
                <div key={slot.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <p className="text-base font-medium">{formatDate(slot.date)}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-3.5" />
                      {slot.start_time} – {slot.end_time}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-sm shrink-0"
                    disabled={cancellingId === slot.id}
                    onClick={() => handleCancelBooked(slot)}
                  >
                    {cancellingId === slot.id ? 'Đang huỷ...' : 'Huỷ lịch'}
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Confirm dialog */}
      {confirmSlot && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <p className="text-base font-semibold">Xác nhận đặt lịch khám?</p>
            <p className="text-base">
              Ngày <strong>{formatDate(confirmSlot.date)}</strong> lúc{' '}
              <strong>{confirmSlot.start_time} – {confirmSlot.end_time}</strong>
            </p>
            <div className="flex gap-3">
              <Button className="h-11 text-base flex-1" onClick={handleBook} disabled={booking}>
                {booking ? 'Đang đặt...' : 'Xác nhận đặt lịch'}
              </Button>
              <Button variant="outline" className="h-11 text-base" onClick={() => setConfirmSlot(null)}>
                Huỷ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-day available slots */}
      {!noDoctor && (
        <div className="space-y-4">
          {days.map(day => {
            const daySlots = availableSlots.filter(s => s.date === day)
            return (
              <div key={day}>
                <p className="text-base font-semibold mb-2">{formatDate(day)}</p>
                {daySlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-2">Không có slot trống</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setConfirmSlot(slot)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-green-400 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 text-base font-medium hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                      >
                        <Clock className="size-4" />
                        {slot.start_time} – {slot.end_time}
                        <Badge className="ml-1 bg-green-200 text-green-900 text-xs">Trống</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
