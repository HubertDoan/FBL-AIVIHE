'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface AuditLogRow {
  id: string
  user_id: string
  user_name: string
  action: string
  target_table: string
  target_id: string | null
  details: Record<string, unknown>
  created_at: string
}

interface AuditLogResponse {
  logs: AuditLogRow[]
  total: number
  page: number
  limit: number
}

const ACTION_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
}

function getActionVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  for (const [key, variant] of Object.entries(ACTION_COLORS)) {
    if (action.toLowerCase().includes(key)) return variant
  }
  return 'outline'
}

const ACTION_LABELS: Record<string, string> = {
  create_feedback: 'Tạo góp ý',
  upload_document: 'Tải tài liệu',
  confirm_record: 'Xác nhận bản ghi',
  create_visit: 'Tạo lượt khám',
  update_profile: 'Cập nhật hồ sơ',
  delete_document: 'Xóa tài liệu',
}

export function AuditLogTable() {
  const [data, setData] = useState<AuditLogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)

      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) {
        const json: AuditLogResponse = await res.json()
        setData(json)
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [page, dateFrom, dateTo])

  useEffect(() => { loadLogs() }, [loadLogs])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadLogs()
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
      {/* Date filter */}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Từ ngày</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="min-h-[44px] text-base w-44"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đến ngày</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="min-h-[44px] text-base w-44"
          />
        </div>
        <Button type="submit" variant="secondary" className="min-h-[44px] gap-1">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Filter className="size-4" />}
          Lọc
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.logs ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Không có nhật ký nào
                </TableCell>
              </TableRow>
            ) : (
              (data?.logs ?? []).map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="font-medium">{log.user_name}</TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(log.action)}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.target_table}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                    {log.target_id ?? '—'}
                  </TableCell>
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
            Tổng: {data?.total ?? 0} bản ghi
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
