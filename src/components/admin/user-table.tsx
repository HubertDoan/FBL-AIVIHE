'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface UserRow {
  id: string
  full_name: string
  phone: string
  email: string | null
  created_at: string
  document_count: number
}

interface UserResponse {
  users: UserRow[]
  total: number
  page: number
  limit: number
}

export function UserTable() {
  const [data, setData] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const json: UserResponse = await res.json()
        setData(json)
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => { loadUsers() }, [loadUsers])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  if (loading && !data) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc SĐT..."
            className="pl-9 min-h-[44px] text-base"
          />
        </div>
        <Button type="submit" variant="secondary" className="min-h-[44px]">
          {loading ? <Loader2 className="size-4 animate-spin" /> : 'Tìm'}
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">STT</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Số tài liệu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.users ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              (data?.users ?? []).map((user, idx) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground">
                    {(page - 1) * limit + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email ?? '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">{user.document_count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Tổng: {data?.total ?? 0} người dùng
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span>
              Trang {page}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
