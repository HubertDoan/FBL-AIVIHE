// In-memory task assignment store for demo mode
// Directors create tasks → assign to staff → staff updates progress

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string       // userId
  assignedToName: string
  assignedBy: string       // userId
  assignedByName: string
  deadline?: string        // ISO date
  status: TaskStatus
  notes?: string           // staff can add notes
  createdAt: string
  updatedAt: string
}

// ── Demo account IDs (from demo-accounts.ts) ─────────────────────────────────
const TRAM_ID = 'demo-0008-0000-0000-000000000008'   // director
const KHANH_ID = 'demo-0009-0000-0000-000000000009'  // branch_director
const HAI_ID = 'demo-0010-0000-0000-000000000010'    // super_admin
const MAI_ID = 'demo-0011-0000-0000-000000000011'    // reception (staff)
const NAM_ID = 'demo-0012-0000-0000-000000000012'    // exam_doctor (staff)

// ── ID counter ────────────────────────────────────────────────────────────────
let _taskCounter = 10
function makeTaskId(): string { return `task-${Date.now()}-${++_taskCounter}` }

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ── Seed tasks ────────────────────────────────────────────────────────────────
const _tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Cập nhật danh sách thành viên tháng 4',
    description: 'Kiểm tra và cập nhật danh sách thành viên mới đăng ký trong tháng 4. Báo cáo số lượng và gửi lên giám đốc trước ngày 5/4.',
    assignedTo: MAI_ID,
    assignedToName: 'Nguyễn Thị Mai',
    assignedBy: TRAM_ID,
    assignedByName: 'Trần Thị Ngọc Trâm',
    deadline: daysFromNow(3),
    status: 'in_progress',
    notes: 'Đang tổng hợp, dự kiến xong trước ngày 4/4.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: 'task-2',
    title: 'Chuẩn bị hồ sơ kiểm định cơ sở',
    description: 'Thu thập và sắp xếp hồ sơ kiểm định cho đợt kiểm tra định kỳ tháng 4. Bao gồm: giấy phép hoạt động, hồ sơ nhân sự, kết quả kiểm tra ATVSLĐ.',
    assignedTo: NAM_ID,
    assignedToName: 'BS. Trần Văn Nam',
    assignedBy: KHANH_ID,
    assignedByName: 'Lưu Tuấn Khanh',
    deadline: daysFromNow(7),
    status: 'pending',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'task-3',
    title: 'Tổng hợp báo cáo khám sức khỏe Q1/2026',
    description: 'Tổng hợp số liệu khám sức khỏe quý 1/2026: số lượt khám, phân loại bệnh, độ tuổi trung bình, tỷ lệ phát hiện bệnh mới.',
    assignedTo: MAI_ID,
    assignedToName: 'Nguyễn Thị Mai',
    assignedBy: HAI_ID,
    assignedByName: 'Doãn Ngọc Hải',
    deadline: daysFromNow(10),
    status: 'pending',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'task-4',
    title: 'Liên hệ đối tác bảo hiểm Bảo Việt',
    description: 'Liên hệ Bảo Việt để gia hạn hợp đồng bảo hiểm y tế tập thể năm 2026. Ghi lại kết quả đàm phán và gửi báo cáo.',
    assignedTo: NAM_ID,
    assignedToName: 'BS. Trần Văn Nam',
    assignedBy: TRAM_ID,
    assignedByName: 'Trần Thị Ngọc Trâm',
    status: 'completed',
    notes: 'Đã liên hệ và xác nhận gia hạn hợp đồng. Hợp đồng mới có hiệu lực từ 01/05/2026.',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
  },
]

// ── CRUD helpers ──────────────────────────────────────────────────────────────

/** Lấy danh sách task theo vai trò:
 * - director/branch_director/super_admin/admin/manager: xem tất cả task mình tạo
 * - staff và các role khác: chỉ xem task được giao cho mình
 */
export function getTasks(userId: string, role: string): Task[] {
  const managerRoles = ['director', 'branch_director', 'super_admin', 'admin', 'manager']
  if (managerRoles.includes(role)) {
    return _tasks
      .filter((t) => t.assignedBy === userId || t.assignedTo === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return _tasks
    .filter((t) => t.assignedTo === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/** Tạo task mới */
export function createTask(data: {
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  assignedBy: string
  assignedByName: string
  deadline?: string
}): Task {
  const now = new Date().toISOString()
  const task: Task = {
    id: makeTaskId(),
    ...data,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  _tasks.push(task)
  return task
}

/** Cập nhật trạng thái task và ghi chú */
export function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  notes?: string
): Task | null {
  const task = _tasks.find((t) => t.id === taskId)
  if (!task) return null
  task.status = status
  if (notes !== undefined) task.notes = notes
  task.updatedAt = new Date().toISOString()
  return task
}

/** Lấy task theo ID */
export function getTaskById(id: string): Task | undefined {
  return _tasks.find((t) => t.id === id)
}
