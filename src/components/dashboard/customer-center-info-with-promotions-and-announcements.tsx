'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Gift, Calendar, ArrowRight, X } from 'lucide-react'
import { toast } from 'sonner'

/**
 * "Thông tin từ trung tâm" — section dashboard hiển thị:
 * - Thông báo (notifications từ admin/director)
 * - Chương trình & khuyến mãi (director_announcements category=event/promotion/program)
 * KH có thể click "Đăng ký tham gia" → request đi vào hàng chờ hành chính
 * (multi-channel: web/FB/TikTok/direct → tất cả về reception → trình GĐ chốt)
 */
interface NotificationItem {
  id: string
  title: string
  content?: string
  category?: string
  is_read?: boolean
  created_at: string
}

interface AnnouncementItem {
  id: string
  title: string
  content?: string
  category?: string  // event | promotion | program
  is_published?: boolean
  created_at: string
}

type Tab = 'notifications' | 'programs'

export function CustomerCenterInfoWithPromotionsAndAnnouncements() {
  const [tab, setTab] = useState<Tab>('notifications')
  const [notifs, setNotifs] = useState<NotificationItem[]>([])
  const [annos, setAnnos] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [selected, setSelected] = useState<AnnouncementItem | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/notifications?limit=5').then((r) => r.ok ? r.json() : { notifications: [] }),
      fetch('/api/director/announcements?limit=5').then((r) => r.ok ? r.json() : { announcements: [] }),
    ])
      .then(([n, a]) => {
        setNotifs(n.notifications ?? [])
        setAnnos(a.announcements ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const programs = annos.filter((a) => ['event', 'promotion', 'program'].includes(a.category || ''))
  const unreadCount = notifs.filter((n) => !n.is_read).length

  async function handleRegisterProgram(item: AnnouncementItem) {
    setRegistering(item.id)
    try {
      const res = await fetch('/api/director/announcements/' + item.id + '/register-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'dashboard' }),
      })
      if (res.ok) {
        toast.success('Đã gửi yêu cầu đăng ký', { description: 'Hành chính sẽ liên hệ bạn trong 24h để xác nhận.' })
        setSelected(null)
      } else {
        toast.error('Không thể đăng ký lúc này', { description: 'Vui lòng thử lại hoặc gọi hotline.' })
      }
    } catch {
      toast.error('Lỗi kết nối, vui lòng thử lại.')
    } finally {
      setRegistering(null)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-4 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-3 border-b border-slate-100">
            <TabButton active={tab === 'notifications'} onClick={() => setTab('notifications')} icon={Bell}>
              Thông báo {unreadCount > 0 && <span className="ml-1 bg-rose-500 text-white text-[10px] px-1.5 rounded-full">{unreadCount}</span>}
            </TabButton>
            <TabButton active={tab === 'programs'} onClick={() => setTab('programs')} icon={Gift}>
              Chương trình & khuyến mãi {programs.length > 0 && <span className="ml-1 text-xs text-slate-500">({programs.length})</span>}
            </TabButton>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 py-3 text-center">Đang tải...</p>
          ) : tab === 'notifications' ? (
            <NotificationsList items={notifs} />
          ) : (
            <ProgramsList items={programs} onClickItem={(item) => setSelected(item)} />
          )}
        </CardContent>
      </Card>

      {/* Modal: program detail + register */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-lg font-bold text-slate-900">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">{selected.content}</p>
            <div className="flex gap-2">
              <button
                disabled={registering === selected.id}
                onClick={() => handleRegisterProgram(selected)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60"
              >
                {registering === selected.id ? 'Đang gửi...' : 'Đăng ký tham gia'}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-sm"
              >
                Đóng
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Yêu cầu sẽ được chuyển đến Hành Chính → liên hệ xác nhận → trình Giám đốc chốt.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function TabButton({ active, onClick, icon: Icon, children }: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${
        active ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon className="size-4" />
      {children}
      {active && <span className="absolute bottom-[-1px] inset-x-0 h-0.5 bg-teal-600 rounded" />}
    </button>
  )
}

function NotificationsList({ items }: { items: NotificationItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500 py-4 text-center">Chưa có thông báo nào.</p>
  }
  return (
    <ul className="space-y-1.5">
      {items.map((n) => (
        <li key={n.id} className={`p-2.5 rounded-lg flex items-start gap-2.5 ${n.is_read ? 'bg-white' : 'bg-blue-50 border border-blue-100'}`}>
          {!n.is_read && <span className="size-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${n.is_read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</p>
            {n.content && <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>}
            <p className="text-[11px] text-slate-400 mt-1">
              {new Date(n.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

const PROG_BADGE: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  event:     { label: 'Sự kiện',    cls: 'bg-emerald-100 text-emerald-700', icon: Calendar },
  promotion: { label: 'Khuyến mãi', cls: 'bg-rose-100 text-rose-700',       icon: Gift },
  program:   { label: 'Chương trình', cls: 'bg-teal-100 text-teal-700',     icon: Calendar },
}

function ProgramsList({ items, onClickItem }: {
  items: AnnouncementItem[]
  onClickItem: (item: AnnouncementItem) => void
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500 py-4 text-center">Hiện chưa có chương trình hay khuyến mãi nào.</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((p) => {
        const meta = PROG_BADGE[p.category || 'program'] || PROG_BADGE.program
        const Icon = meta.icon
        return (
          <li key={p.id}>
            <button
              onClick={() => onClickItem(p)}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition flex items-start gap-3"
            >
              <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${meta.cls}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.cls}`}>{meta.label}</span>
                </div>
                {p.content && <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.content}</p>}
              </div>
              <ArrowRight className="size-4 text-slate-400 shrink-0 self-center" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
