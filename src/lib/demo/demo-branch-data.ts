// Demo data for multi-branch organization system
// Only used when NEXT_PUBLIC_DEMO_MODE=true

export interface DemoBranch {
  id: string
  name: string
  code: string
  address: string
  phone: string
  email: string
  director_id: string
  director_name: string
  parent_branch_id: string | null
  is_headquarters: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DemoBranchStaff {
  id: string
  branch_id: string
  citizen_id: string
  citizen_name: string
  position: string
  is_primary: boolean
  started_at: string
}

// IDs from demo-accounts.ts
const ADMIN = 'demo-0006-0000-0000-000000000006'
const BS_HAI = 'demo-0005-0000-0000-000000000005'
const TRAM = 'demo-0008-0000-0000-000000000008'
const KHANH = 'demo-0009-0000-0000-000000000009'

const BRANCH_HAPU = 'branch-0001-0000-0000-000000000001'
const BRANCH_DONGANH = 'branch-0002-0000-0000-000000000002'

export const DEMO_BRANCHES: DemoBranch[] = [
  {
    id: BRANCH_HAPU,
    name: 'HaPu Center',
    code: 'HAPU',
    address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
    phone: '024 6666 8888',
    email: 'hapu@fbl.vn',
    director_id: TRAM,
    director_name: 'Trần Thị Ngọc Trâm',
    parent_branch_id: null,
    is_headquarters: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: BRANCH_DONGANH,
    name: 'Chi nhánh Đông Anh',
    code: 'DONGANH',
    address: 'Thị trấn Đông Anh, huyện Đông Anh, Hà Nội',
    phone: '024 6666 9999',
    email: 'donganh@fbl.vn',
    director_id: KHANH,
    director_name: 'Lưu Tuấn Khanh',
    parent_branch_id: BRANCH_HAPU,
    is_headquarters: false,
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
]

export const DEMO_BRANCH_STAFF: DemoBranchStaff[] = [
  {
    id: 'bs-0001',
    branch_id: BRANCH_HAPU,
    citizen_id: ADMIN,
    citizen_name: 'Admin AIVIHE',
    position: 'Quản trị viên',
    is_primary: true,
    started_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bs-0002',
    branch_id: BRANCH_HAPU,
    citizen_id: BS_HAI,
    citizen_name: 'BS. Nguyễn Hải',
    position: 'Bác sĩ',
    is_primary: true,
    started_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'bs-0003',
    branch_id: BRANCH_DONGANH,
    citizen_id: BS_HAI,
    citizen_name: 'BS. Nguyễn Hải',
    position: 'Bác sĩ tư vấn',
    is_primary: false,
    started_at: '2024-06-15T00:00:00Z',
  },
  {
    id: 'bs-0004',
    branch_id: BRANCH_DONGANH,
    citizen_id: KHANH,
    citizen_name: 'Lưu Tuấn Khanh',
    position: 'Giám đốc chi nhánh',
    is_primary: true,
    started_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'bs-0005',
    branch_id: BRANCH_HAPU,
    citizen_id: TRAM,
    citizen_name: 'Trần Thị Ngọc Trâm',
    position: 'Giám đốc',
    is_primary: true,
    started_at: '2024-01-01T00:00:00Z',
  },
]

export function getDemoBranches(): DemoBranch[] {
  return DEMO_BRANCHES
}

export function getDemoBranchById(id: string): DemoBranch | undefined {
  return DEMO_BRANCHES.find((b) => b.id === id)
}

export function getDemoBranchStaff(branchId: string): DemoBranchStaff[] {
  return DEMO_BRANCH_STAFF.filter((s) => s.branch_id === branchId)
}

export function getDemoBranchesForUser(userId: string, role: string): DemoBranch[] {
  if (role === 'director' || role === 'super_admin') {
    return DEMO_BRANCHES
  }
  if (role === 'branch_director') {
    return DEMO_BRANCHES.filter((b) => b.director_id === userId)
  }
  const staffBranchIds = DEMO_BRANCH_STAFF
    .filter((s) => s.citizen_id === userId)
    .map((s) => s.branch_id)
  return DEMO_BRANCHES.filter((b) => staffBranchIds.includes(b.id))
}
