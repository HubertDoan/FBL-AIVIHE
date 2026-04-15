'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check, CheckCheck, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

/**
 * Trang "Thông báo" trong 7 khu vực của khách hàng
 * Hiển thị tất cả notifications: từ trung tâm, bác sĩ, hệ thống, thanh toán...
 */

interface Notification {
  id: string
  title: string
  content: string
  category: string  // admin / center / doctor / payment / system
  is_read: boolean
  created_at: string
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: 'Quản trị', color: 'bg-slate-100 text-slate-700' },
  center: { label: 'Trung tâm', color: 'bg-teal-100 text-teal-700' },
  director: { label: 'Giám đốc', color: 'bg-purple-100 text-purple-700' },
  doctor: { label: 'Bác sĩ', color: 'bg-blue-100 text-blue-700' },
  payment: { label: 'Thanh toán', color: 'bg-green-100 text-green-700' },
  system: { label: 'Hệ thống', color: 'bg-gray-100 text-gray-700' },
  program: { label: 'Chương trình', color: 'bg-amber-100 text-amber-700' },
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setItems(data.notifications || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) load()
  }, [authLoading, user])

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {
      // fallback: just update UI
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }
  }

  async function markAllRead() {
    const unread = items.filter(n => !n.is_read)
    await Promise.all(unread.map(n => markRead(n.id)))
  }

  const filtered = filter === 'all'
    ? items
    : filter === 'unread'
      ? items.filter(n => !n.is_read)
      : items.filter(n => n.category === filter)

  const unreadCount = items.filter(n => !n.is_read).length

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải...
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-2">
          <ArrowLeft className="size-4" /> Về tổng quan
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="size-6 text-pink-600" />
            Thông báo
            {unreadCount > 0 && (
              <span className="text-sm bg-pink-600 text-white rounded-full px-2.5 py-0.5">{unreadCount}</span>
            )}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="size-4 mr-1" /> Tải lại
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck className="size-4 mr-1" /> Đánh dấu đã đọc tất cả
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { k: 'all', l: `Tất cả (${items.length})` },
          { k: 'unread', l: `Chưa đọc (${unreadCount})` },
          { k: 'center', l: 'Trung tâm' },
          { k: 'doctor', l: 'Bác sĩ' },
          { k: 'payment', l: 'Thanh toán' },
          { k: 'admin', l: 'Quản trị' },
        ].map(f => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              filter === f.k
                ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold'
                : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-gray-500">
            <Bell className="size-12 text-gray-300 mx-auto mb-2" />
            <p>Không có thông báo nào.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const cat = CATEGORY_LABELS[n.category] || { label: n.category, color: 'bg-gray-100 text-gray-700' }
            return (
              <Card
                key={n.id}
                className={`cursor-pointer hover:shadow-sm transition ${
                  !n.is_read ? 'border-pink-200 bg-pink-50/30' : 'opacity-80'
                }`}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    {!n.is_read && <div className="size-2 rounded-full bg-pink-600 mt-2 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`text-base ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); markRead(n.id) }}
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="size-4 text-pink-600" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
