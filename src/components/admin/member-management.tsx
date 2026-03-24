'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2, UserPlus, Pencil, KeyRound, Pause, Play, Trash2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MemberEditDialog, type MemberFormData } from './member-edit-dialog'
import { PasswordResetDialog } from './password-reset-dialog'
import { toast } from 'sonner'

interface Member {
  id: string
  full_name: string
  username: string | null
  phone: string
  email: string | null
  role: string
  status: string
  created_at: string
}

interface MembersResponse {
  members: Member[]
  total: number
  page: number
  limit: number
}

const ROLE_LABELS: Record<string, string> = {
  guest: 'Khách',
  member: 'Thành viên',
  doctor: 'Bác sĩ',
  staff: 'Nhân viên',
  admin: 'Quản trị',
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">Hoạt động</Badge>
  if (status === 'suspended') return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-sm">Tạm dừng</Badge>
  if (status === 'pending') return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">Chờ duyệt</Badge>
  return <Badge variant="secondary" className="text-sm">{status}</Badge>
}

export function MemberManagement() {
  const [data, setData] = useState<MembersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 20

  // Dialogs state
  const [editOpen, setEditOpen] = useState(false)
  const [editMember, setEditMember] = useState<MemberFormData | null>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState<Member | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(limit),
        role: roleFilter, status: statusFilter,
      })
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/members?${params}`)
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { loadMembers() }, [loadMembers])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadMembers()
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function openAdd() {
    setEditMember(null)
    setEditOpen(true)
  }

  function openEdit(m: Member) {
    setEditMember({
      id: m.id, full_name: m.full_name, phone: m.phone,
      email: m.email ?? '', role: m.role, status: m.status,
    })
    setEditOpen(true)
  }

  async function handleSaveMember(form: MemberFormData) {
    const isNew = !form.id
    const url = isNew ? '/api/admin/members' : `/api/admin/members/${form.id}`
    const method = isNew ? 'POST' : 'PUT'
    const body = isNew
      ? { full_name: form.full_name, phone: form.phone, email: form.email || null, role: form.role, password: form.password }
      : { full_name: form.full_name, phone: form.phone, email: form.email || null, role: form.role, status: form.status }

    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) {
      toast.success(isNew ? 'Đã thêm thành viên mới.' : 'Đã cập nhật thông tin.')
      loadMembers()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Lỗi lưu thông tin.')
      throw new Error(err.error)
    }
  }

  async function handleStatusChange(m: Member, action: 'suspend' | 'activate' | 'approve') {
    try {
      const res = await fetch(`/api/admin/members/${m.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const result = await res.json()
        toast.success(result.message)
        loadMembers()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Lỗi thay đổi trạng thái.')
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ.')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/members/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Đã xóa thành viên.')
        loadMembers()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Lỗi xóa thành viên.')
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ.')
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────

  if (loading && !data) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters + Add button */}
      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, username..."
              className="pl-9 min-h-[48px] text-base"
            />
          </div>
          <Button type="submit" variant="secondary" className="min-h-[48px] text-base">
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Tìm'}
          </Button>
        </form>

        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v ?? 'all'); setPage(1) }}>
          <SelectTrigger className="min-h-[48px] text-base w-[140px]">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="guest">Khách</SelectItem>
            <SelectItem value="member">Thành viên</SelectItem>
            <SelectItem value="doctor">Bác sĩ</SelectItem>
            <SelectItem value="staff">Nhân viên</SelectItem>
            <SelectItem value="admin">Quản trị</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v ?? 'all'); setPage(1) }}>
          <SelectTrigger className="min-h-[48px] text-base w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả TT</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="suspended">Tạm dừng</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={openAdd} className="min-h-[48px] text-base gap-2">
          <UserPlus className="size-5" />
          Thêm thành viên
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-base">STT</TableHead>
              <TableHead className="text-base">Họ tên</TableHead>
              <TableHead className="text-base">Username</TableHead>
              <TableHead className="text-base">SĐT</TableHead>
              <TableHead className="text-base">Loại</TableHead>
              <TableHead className="text-base">Trạng thái</TableHead>
              <TableHead className="text-base">Ngày ĐK</TableHead>
              <TableHead className="text-base text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.members ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-base">
                  Không tìm thấy thành viên nào
                </TableCell>
              </TableRow>
            ) : (
              (data?.members ?? []).map((m, idx) => (
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground text-base">
                    {(page - 1) * limit + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-base">{m.full_name}</TableCell>
                  <TableCell className="text-base text-muted-foreground">{m.username ?? '—'}</TableCell>
                  <TableCell className="text-base">{m.phone}</TableCell>
                  <TableCell className="text-base">{ROLE_LABELS[m.role] ?? m.role}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell className="text-base">
                    {new Date(m.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {m.status === 'pending' && (
                        <Button size="sm" variant="default" className="gap-1 text-sm bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusChange(m, 'approve')}>
                          <CheckCircle className="size-3.5" /> Duyệt
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-1 text-sm"
                        onClick={() => openEdit(m)}>
                        <Pencil className="size-3.5" /> Sửa
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-sm"
                        onClick={() => { setPasswordTarget(m); setPasswordOpen(true) }}>
                        <KeyRound className="size-3.5" /> Đổi MK
                      </Button>
                      {m.status === 'active' ? (
                        <Button size="sm" variant="outline" className="gap-1 text-sm text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                          onClick={() => handleStatusChange(m, 'suspend')}>
                          <Pause className="size-3.5" /> Tạm dừng
                        </Button>
                      ) : m.status === 'suspended' ? (
                        <Button size="sm" variant="outline" className="gap-1 text-sm text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => handleStatusChange(m, 'activate')}>
                          <Play className="size-3.5" /> Kích hoạt
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" className="gap-1 text-sm text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { setDeleteTarget(m); setDeleteOpen(true) }}>
                        <Trash2 className="size-3.5" /> Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-base">
          <span className="text-muted-foreground">Tổng: {data?.total ?? 0} thành viên</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span>Trang {page}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <MemberEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={editMember}
        onSave={handleSaveMember}
      />

      {passwordTarget && (
        <PasswordResetDialog
          open={passwordOpen}
          onOpenChange={setPasswordOpen}
          memberId={passwordTarget.id}
          memberName={passwordTarget.full_name}
          username={passwordTarget.username}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa thành viên "${deleteTarget?.full_name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
