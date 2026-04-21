'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft, Loader2, Plus, Bookmark, BookmarkCheck, X,
  FileText, Link as LinkIcon, BookOpen, Video, NotebookPen, Trash2, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Trang "Tài liệu cá nhân" — KH tự lưu bài viết SK / link tham khảo / sách hay / ghi chú
 * CRUD đơn giản với personal_documents table.
 */

interface PersonalDoc {
  id: string
  title: string
  content: string | null
  url: string | null
  file_url: string | null
  document_type: string
  tags: string[]
  source: string | null
  is_favorite: boolean
  created_at: string
}

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  article: { label: 'Bài viết', icon: FileText,    color: 'bg-teal-100 text-teal-700' },
  link:    { label: 'Link',     icon: LinkIcon,    color: 'bg-blue-100 text-blue-700' },
  note:    { label: 'Ghi chú',  icon: NotebookPen, color: 'bg-amber-100 text-amber-700' },
  book:    { label: 'Sách',     icon: BookOpen,    color: 'bg-purple-100 text-purple-700' },
  video:   { label: 'Video',    icon: Video,       color: 'bg-rose-100 text-rose-700' },
  other:   { label: 'Khác',     icon: FileText,    color: 'bg-slate-100 text-slate-700' },
}

export default function PersonalDocumentsPage() {
  const [docs, setDocs] = useState<PersonalDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'all' | 'favorite'>('all')

  async function fetchDocs() {
    setLoading(true)
    try {
      const res = await fetch('/api/personal-documents')
      const data = await res.json()
      setDocs(data.documents ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [])

  const filtered = filter === 'favorite' ? docs.filter((d) => d.is_favorite) : docs

  async function toggleFavorite(doc: PersonalDoc) {
    try {
      const res = await fetch(`/api/personal-documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !doc.is_favorite }),
      })
      if (res.ok) fetchDocs()
    } catch {
      toast.error('Không cập nhật được')
    }
  }

  async function deleteDoc(id: string) {
    if (!confirm('Xóa tài liệu này?')) return
    try {
      const res = await fetch(`/api/personal-documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Đã xóa')
        fetchDocs()
      }
    } catch {
      toast.error('Không xóa được')
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Bookmark className="size-6 text-teal-600" /> Tài liệu cá nhân
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bookmark bài viết / link / sách / ghi chú về sức khỏe ({docs.length} mục)
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-teal-600 hover:bg-teal-700 gap-1.5">
          <Plus className="size-4" /> Thêm tài liệu
        </Button>
      </div>

      {/* Filter */}
      {docs.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              filter === 'all' ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
            }`}
          >Tất cả ({docs.length})</button>
          <button
            onClick={() => setFilter('favorite')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              filter === 'favorite' ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
            }`}
          >⭐ Yêu thích ({docs.filter((d) => d.is_favorite).length})</button>
        </div>
      )}

      {/* List */}
      <Card>
        <CardContent className="pt-4 pb-4">
          {loading ? (
            <div className="text-center py-6">
              <Loader2 className="size-5 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <Bookmark className="size-12 mx-auto text-teal-200 mb-3" />
              <p className="text-sm text-slate-600 mb-3">
                Chưa có tài liệu cá nhân nào. Bookmark bài viết hay về sức khỏe để xem lại sau.
              </p>
              <Button onClick={() => setShowAdd(true)} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="size-4 mr-1" /> Thêm tài liệu đầu tiên
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((d) => {
                const meta = TYPE_META[d.document_type] || TYPE_META.article
                const Icon = meta.icon
                return (
                  <li key={d.id} className="py-3 flex items-start gap-3">
                    <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                        <button
                          onClick={() => toggleFavorite(d)}
                          className="text-amber-500 hover:text-amber-600 shrink-0"
                          title={d.is_favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                        >
                          {d.is_favorite ? <BookmarkCheck className="size-4 fill-amber-500" /> : <Bookmark className="size-4" />}
                        </button>
                      </div>
                      {d.content && <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{d.content}</p>}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded ${meta.color}`}>{meta.label}</span>
                        {d.source && <span>· {d.source}</span>}
                        <span>· {new Date(d.created_at).toLocaleDateString('vi-VN')}</span>
                        {d.tags.length > 0 && d.tags.map((t) => (
                          <span key={t} className="bg-slate-100 px-1.5 py-0.5 rounded">#{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        {(d.url || d.file_url) && (
                          <a href={d.url || d.file_url || '#'} target="_blank" rel="noopener noreferrer"
                             className="text-xs text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                            Mở <ExternalLink className="size-3" />
                          </a>
                        )}
                        <button onClick={() => deleteDoc(d.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 inline-flex items-center gap-1">
                          <Trash2 className="size-3" /> Xóa
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {showAdd && <AddDocumentDialog onClose={() => setShowAdd(false)} onSaved={() => { fetchDocs(); setShowAdd(false) }} />}
    </div>
  )
}

function AddDocumentDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', url: '', content: '', document_type: 'article', source: '', tags: '' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 2) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }
    setSaving(true)
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const res = await fetch('/api/personal-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags }),
      })
      if (res.ok) {
        toast.success('Đã lưu tài liệu')
        onSaved()
      } else {
        const e = await res.json()
        toast.error(e.error || 'Không lưu được')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">Thêm tài liệu cá nhân</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm">Tiêu đề *</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Bài viết về dinh dưỡng tim mạch"
              className="h-11"
            />
          </div>
          <div>
            <Label className="text-sm">Loại</Label>
            <select
              value={form.document_type}
              onChange={(e) => setForm({ ...form, document_type: e.target.value })}
              className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm"
            >
              {Object.entries(TYPE_META).map(([key, m]) => (
                <option key={key} value={key}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm">URL (tùy chọn)</Label>
            <Input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="h-11"
            />
          </div>
          <div>
            <Label className="text-sm">Tóm tắt / Ghi chú</Label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tóm tắt nội dung hoặc ghi chú riêng..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
            />
          </div>
          <div>
            <Label className="text-sm">Nguồn (tùy chọn)</Label>
            <Input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="vd: vinmec.com, BV Bạch Mai"
              className="h-11"
            />
          </div>
          <div>
            <Label className="text-sm">Tags (cách nhau bởi dấu phẩy)</Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="vd: tim mạch, dinh dưỡng"
              className="h-11"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700">
              {saving ? <><Loader2 className="size-4 animate-spin mr-1.5" />Đang lưu</> : 'Lưu tài liệu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
