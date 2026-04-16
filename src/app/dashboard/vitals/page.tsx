'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import type { VitalSignsRecord, MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Chỉ số sức khỏe — port từ SSK-VNeID v10
 * Layout: 8 metric cards (2 rows × 4) + history table + Thêm đo button
 * Module VI — VitalSigns · QĐ 1332/QĐ-BYT
 */

const METRIC_DEFS = [
  { key: 'height', label: 'Chiều cao', icon: '📏', unit: 'cm', color: '#8b5cf6', refRange: '', getter: (v: VitalSignsRecord) => String(v.height_cm) },
  { key: 'weight', label: 'Cân nặng', icon: '⚖️', unit: 'kg', color: '#8b5cf6', refRange: '', getter: (v: VitalSignsRecord) => String(v.weight_kg) },
  { key: 'bmi', label: 'BMI', icon: '📐', unit: '', color: '#0891b2', refRange: 'BT: 18.5–24.9', getter: (v: VitalSignsRecord) => v.bmi.toFixed(1) },
  { key: 'bp_sys', label: 'HA tâm thu', icon: '🩺', unit: 'mmHg', color: '#dc2626', refRange: 'BT: <120', getter: (v: VitalSignsRecord) => String(v.blood_pressure_systolic) },
  { key: 'bp_dia', label: 'HA tâm trương', icon: '🩺', unit: 'mmHg', color: '#dc2626', refRange: 'BT: <80', getter: (v: VitalSignsRecord) => String(v.blood_pressure_diastolic) },
  { key: 'pulse', label: 'Nhịp tim', icon: '❤️', unit: 'lần/ph', color: '#e11d48', refRange: 'BT: 60–100', getter: (v: VitalSignsRecord) => String(v.pulse) },
  { key: 'spo2', label: 'SpO₂', icon: '🫁', unit: '%', color: '#0284c7', refRange: 'BT: >95', getter: (v: VitalSignsRecord) => v.spo2 !== null ? String(v.spo2) : '—' },
  { key: 'temp', label: 'Nhiệt độ', icon: '🌡️', unit: '°C', color: '#f59e0b', refRange: 'BT: 36–37.5', getter: (v: VitalSignsRecord) => v.temperature.toFixed(1) },
]

export default function VitalsPage() {
  const { user, loading: authLoading } = useAuth()
  const [vitals, setVitals] = useState<VitalSignsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'table' | 'chart'>('table')

  useEffect(() => {
    if (authLoading || !user) return
    fetch('/api/medical-record')
      .then(r => r.ok ? r.json() : null)
      .then((d: MedicalRecord11Sections | null) => setVitals(d?.vital_signs || []))
      .finally(() => setLoading(false))
  }, [authLoading, user])

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500"><Loader2 className="size-5 animate-spin mr-2" /> Đang tải...</div>
  }

  const latest = vitals[0]

  return (
    <div className="space-y-5 max-w-5xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">📊 Chỉ số sức khỏe</h1>
          <p className="text-xs text-gray-500">Module VI — VitalSigns · QĐ 1332/QĐ-BYT · {vitals.length} lần đo</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={view === 'table' ? 'default' : 'outline'} onClick={() => setView('table')} className={view === 'table' ? 'bg-red-600 hover:bg-red-700' : ''}>
            📋 Bảng
          </Button>
          <Button size="sm" variant={view === 'chart' ? 'default' : 'outline'} onClick={() => setView('chart')} className={view === 'chart' ? 'bg-red-600 hover:bg-red-700' : ''}>
            📈 Biểu đồ
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 gap-1">
            <Plus className="size-4" /> Thêm đo
          </Button>
        </div>
      </div>

      {/* 8 metric cards — latest values */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {METRIC_DEFS.map(m => {
            const val = m.getter(latest)
            return (
              <div
                key={m.key}
                className="bg-white rounded-xl border border-gray-200 p-3"
                style={{ borderTop: `3px solid ${m.color}` }}
              >
                <p className="text-xs text-gray-500 flex items-center gap-1">{m.icon} {m.label}</p>
                <p className="text-2xl font-extrabold mt-1" style={{ color: m.color }}>
                  {val} <span className="text-xs font-normal text-gray-400">{m.unit}</span>
                </p>
                {m.refRange && <p className="text-[10px] text-gray-400">{m.refRange}</p>}
                <p className="text-[10px] text-gray-400">{new Date(latest.measured_at).toLocaleDateString('vi-VN')}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* History table */}
      {view === 'table' && (
        <Card>
          <CardContent className="pt-4 pb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500 uppercase">
                  <th className="text-left py-2 px-2 font-semibold">Ngày</th>
                  <th className="text-right py-2 px-1 font-semibold">📏 cm</th>
                  <th className="text-right py-2 px-1 font-semibold">⚖️ kg</th>
                  <th className="text-right py-2 px-1 font-semibold">BMI</th>
                  <th className="text-right py-2 px-1 font-semibold">🩺 HA</th>
                  <th className="text-right py-2 px-1 font-semibold">❤️ /ph</th>
                  <th className="text-right py-2 px-1 font-semibold">🫁 SpO₂</th>
                  <th className="text-right py-2 px-1 font-semibold">🌡️ °C</th>
                  <th className="text-left py-2 px-2 font-semibold">Nơi đo</th>
                  <th className="py-2 px-1"></th>
                </tr>
              </thead>
              <tbody>
                {vitals.map(v => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-2 font-semibold text-gray-900">{new Date(v.measured_at).toLocaleDateString('vi-VN')}</td>
                    <td className="py-2.5 px-1 text-right text-blue-600 font-medium">{v.height_cm}</td>
                    <td className="py-2.5 px-1 text-right text-purple-600 font-medium">{v.weight_kg}</td>
                    <td className="py-2.5 px-1 text-right font-medium">{v.bmi.toFixed(1)}</td>
                    <td className={`py-2.5 px-1 text-right font-medium ${v.blood_pressure_systolic >= 140 ? 'text-red-600' : 'text-gray-900'}`}>
                      {v.blood_pressure_systolic}/{v.blood_pressure_diastolic}
                    </td>
                    <td className="py-2.5 px-1 text-right text-pink-600 font-medium">{v.pulse}</td>
                    <td className={`py-2.5 px-1 text-right font-medium ${(v.spo2 ?? 100) < 95 ? 'text-red-600' : 'text-cyan-600'}`}>
                      {v.spo2 !== null ? `${v.spo2}%` : '—'}
                    </td>
                    <td className="py-2.5 px-1 text-right text-amber-600 font-medium">{v.temperature}</td>
                    <td className="py-2.5 px-2 text-gray-600 text-xs">{v.source}{v.notes ? ` · ${v.notes}` : ''}</td>
                    <td className="py-2.5 px-1 flex gap-1">
                      <button className="p-1 hover:bg-amber-50 rounded" title="Sửa"><Pencil className="size-4 text-amber-600" /></button>
                      <button className="p-1 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="size-4 text-gray-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vitals.length === 0 && (
              <p className="text-center text-gray-400 py-6">Chưa có dữ liệu đo.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chart view placeholder */}
      {view === 'chart' && (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-gray-500">
            📈 Biểu đồ xu hướng — xem tại <Link href="/dashboard/timeline" className="text-teal-600 underline">Dòng thời gian</Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
