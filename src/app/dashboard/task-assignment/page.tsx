'use client'

// Task assignment page ("Giao việc")
// Directors: create tasks + view all tasks they assigned
// Staff: view tasks assigned to them + update status

import { useEffect, useState } from 'react'
import { ClipboardCheck, Plus, Loader2, CalendarDays, User, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateTaskDialog } from './create-task-dialog'
import type { Task, TaskStatus } from '@/lib/demo/demo-task-assignment-data'

const CREATOR_ROLES = ['director', 'branch_director', 'super_admin', 'admin', 'manager']

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Đang chờ',
  in_progress: 'Đang làm',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const STATUS_VARIANTS: Record<TaskStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  in_progress: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

type TabFilter = 'all' | TaskStatus

export default function TaskAssignmentPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [userRole, setUserRole] = useState('')
  const [tab, setTab] = useState<TabFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function loadTasks() {
    try {
      const res = await fetch('/api/task-assignment')
      const data = await res.json()
      if (res.ok) setTasks(data.tasks ?? [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/demo/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) { setUserId(data.user.id); setUserRole(data.user.role) }
      })
      .catch(() => {})
    loadTasks()
  }, [])

  async function updateStatus(taskId: string, status: TaskStatus, notes?: string) {
    setUpdating(taskId)
    try {
      const res = await fetch(`/api/task-assignment/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })
      if (res.ok) {
        const updated: Task = await res.json()
        setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t))
      }
    } catch { /* ignore */ }
    setUpdating(null)
  }

  const isCreator = CREATOR_ROLES.includes(userRole)

  const filtered = tasks.filter((t) => tab === 'all' || t.status === tab)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="size-6 text-primary shrink-0" />
          <h1 className="text-2xl font-bold">Giao việc</h1>
        </div>
        {isCreator && (
          <Button
            onClick={() => setShowCreate(true)}
            className="min-h-[48px] text-base gap-2"
          >
            <Plus className="size-5" />
            Tạo công việc
          </Button>
        )}
      </div>

      {/* Status tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="all" className="text-base min-h-[40px]">Tất cả</TabsTrigger>
          <TabsTrigger value="pending" className="text-base min-h-[40px]">Đang chờ</TabsTrigger>
          <TabsTrigger value="in_progress" className="text-base min-h-[40px]">Đang làm</TabsTrigger>
          <TabsTrigger value="completed" className="text-base min-h-[40px]">Hoàn thành</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-base">
            Không có công việc nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const isExpanded = expandedId === task.id
            const isAssignee = task.assignedTo === userId
            const isTaskCreator = task.assignedBy === userId
            return (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="pt-4 space-y-3">
                  {/* Top row: title + status badge */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-semibold leading-snug flex-1">{task.title}</p>
                    <Badge variant={STATUS_VARIANTS[task.status]} className="shrink-0 text-sm">
                      {STATUS_LABELS[task.status]}
                    </Badge>
                  </div>

                  {/* Meta: assigned to / by, deadline */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-4" />
                      {isCreator
                        ? `Giao cho: ${task.assignedToName}`
                        : `Từ: ${task.assignedByName}`}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-4" />
                        Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : task.id)}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                  </button>

                  {/* Expanded: description, notes, action buttons */}
                  {isExpanded && (
                    <div className="space-y-3 border-t pt-3">
                      <p className="text-base text-foreground">{task.description}</p>
                      {task.notes && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-medium mb-1">Ghi chú:</p>
                          <p>{task.notes}</p>
                        </div>
                      )}
                      {/* Staff action buttons */}
                      {isAssignee && task.status !== 'completed' && task.status !== 'cancelled' && (
                        <div className="flex gap-2 flex-wrap">
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-[44px] text-base"
                              disabled={updating === task.id}
                              onClick={() => updateStatus(task.id, 'in_progress')}
                            >
                              {updating === task.id ? <Loader2 className="size-4 animate-spin" /> : 'Bắt đầu làm'}
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              className="min-h-[44px] text-base"
                              disabled={updating === task.id}
                              onClick={() => updateStatus(task.id, 'completed')}
                            >
                              {updating === task.id ? <Loader2 className="size-4 animate-spin" /> : 'Đánh dấu hoàn thành'}
                            </Button>
                          )}
                        </div>
                      )}
                      {/* Director: cancel button */}
                      {isTaskCreator && isCreator && task.status !== 'completed' && task.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="min-h-[44px] text-base"
                          disabled={updating === task.id}
                          onClick={() => updateStatus(task.id, 'cancelled')}
                        >
                          {updating === task.id ? <Loader2 className="size-4 animate-spin" /> : 'Hủy công việc'}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create task dialog */}
      {showCreate && (
        <CreateTaskDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadTasks() }}
        />
      )}
    </div>
  )
}
