'use client'

// Dialog for directors to create and assign a new task to staff
// Used by task-assignment/page.tsx

import { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface StaffOption {
  id: string
  fullName: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  staff: 'Nhân viên', accountant: 'Kế toán', admin_staff: 'Hành chính',
  manager: 'Quản lý', technician: 'Kỹ thuật', tech_assistant: 'Kỹ thuật viên',
  nurse: 'Điều dưỡng', support_staff: 'NV hỗ trợ', intern: 'Thực tập sinh',
  reception: 'Tiếp đón', exam_doctor: 'BS Khám bệnh', doctor: 'Bác sĩ',
  specialist: 'BS Chuyên khoa', director: 'Giám đốc', branch_director: 'GĐ Chi nhánh',
  admin: 'Admin', super_admin: 'Super Admin',
}

// Staff-eligible roles that can be assigned tasks
const ASSIGNABLE_ROLES = [
  'staff', 'accountant', 'admin_staff', 'manager', 'technician',
  'tech_assistant', 'nurse', 'support_staff', 'intern',
  'reception', 'exam_doctor', 'doctor', 'specialist',
]

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateTaskDialog({ onClose, onCreated }: Props) {
  const [staffList, setStaffList] = useState<StaffOption[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [deadline, setDeadline] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load all accounts and filter to assignable roles
    fetch('/api/demo/accounts')
      .then((r) => r.json())
      .then((data) => {
        const accounts: StaffOption[] = (data.accounts ?? []).filter(
          (a: StaffOption) => ASSIGNABLE_ROLES.includes(a.role)
        )
        setStaffList(accounts)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !assignedTo) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/task-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, assignedTo, deadline: deadline || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Tạo thất bại.'); return }
      onCreated()
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-lg">
        {/* Dialog header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Tạo công việc mới</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-base font-medium mb-2">Tiêu đề công việc *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              className="text-base min-h-[48px]"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2">Mô tả chi tiết *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả yêu cầu, hướng dẫn thực hiện..."
              className="text-base min-h-[100px]"
              required
              maxLength={2000}
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2">Giao cho *</label>
            <Select value={assignedTo} onValueChange={(v) => setAssignedTo(v ?? '')}>
              <SelectTrigger className="w-full min-h-[48px] text-base">
                <SelectValue placeholder="Chọn nhân viên..." />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-base">
                    {s.fullName}
                    <span className="ml-2 text-muted-foreground text-sm">
                      ({ROLE_LABELS[s.role] ?? s.role})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-base font-medium mb-2">Hạn hoàn thành</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="text-base min-h-[48px]"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 min-h-[48px] text-base">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim() || !assignedTo}
              className="flex-1 min-h-[48px] text-base gap-2"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Tạo công việc
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
