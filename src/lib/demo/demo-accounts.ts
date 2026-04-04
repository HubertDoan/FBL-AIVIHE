// Demo accounts for testing without Supabase
// Only used when NEXT_PUBLIC_DEMO_MODE=true

export type DemoRole = 'guest' | 'citizen' | 'doctor' | 'specialist' | 'admin' | 'director' | 'branch_director' | 'super_admin' | 'reception' | 'exam_doctor' | 'staff' | 'accountant' | 'admin_staff' | 'manager' | 'technician' | 'tech_assistant' | 'nurse' | 'support_staff' | 'intern'

// Loại tài khoản hiển thị trên form đăng nhập
export const ACCOUNT_TYPES = [
  { value: 'guest', label: 'Khách' },
  { value: 'citizen', label: 'Thành viên' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'accountant', label: 'Kế toán' },
  { value: 'admin_staff', label: 'Hành chính' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'technician', label: 'Kỹ thuật' },
  { value: 'tech_assistant', label: 'Kỹ thuật viên' },
  { value: 'nurse', label: 'Điều dưỡng' },
  { value: 'support_staff', label: 'Nhân viên hỗ trợ' },
  { value: 'intern', label: 'Nhân viên thực tập' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'specialist', label: 'BS Chuyên khoa' },
  { value: 'reception', label: 'Tiếp đón' },
  { value: 'exam_doctor', label: 'BS Khám bệnh' },
  { value: 'branch_director', label: 'Giám đốc chi nhánh' },
  { value: 'director', label: 'Giám đốc công ty' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
] as const

export interface DemoAccount {
  id: string
  email: string
  password: string
  fullName: string
  role: DemoRole
  citizenId: string
  phone: string
  description: string
}

// Initial demo accounts — immutable seed
const SEED_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-0001-0000-0000-000000000001',
    email: 'minhnv2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Nguyễn Văn Minh',
    role: 'citizen',
    citizenId: 'demo-citizen-minh',
    phone: '0901000001',
    description: 'Bệnh nhân chính, nam 62 tuổi, tiểu đường + tăng huyết áp',
  },
  {
    id: 'demo-0002-0000-0000-000000000002',
    email: 'lantt2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Trần Thị Lan',
    role: 'citizen',
    citizenId: 'demo-citizen-lan',
    phone: '0901000002',
    description: 'Vợ ông Minh, 58 tuổi, quản lý sức khỏe cho chồng',
  },
  {
    id: 'demo-0003-0000-0000-000000000003',
    email: 'tuann2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Nguyễn Tuấn',
    role: 'citizen',
    citizenId: 'demo-citizen-tuan',
    phone: '0901000003',
    description: 'Con trai, 35 tuổi, quản lý sức khỏe cho bố mẹ',
  },
  {
    id: 'demo-0004-0000-0000-000000000004',
    email: 'ducpv2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Phạm Văn Đức',
    role: 'citizen',
    citizenId: 'demo-citizen-duc',
    phone: '0901000004',
    description: 'Hàng xóm, 70 tuổi, bệnh gút + rối loạn mỡ máu',
  },
  {
    id: 'demo-0005-0000-0000-000000000005',
    email: 'hain2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'BS. Nguyễn Hải',
    role: 'doctor',
    citizenId: 'demo-doctor-hai',
    phone: '0901000005',
    description: 'Bác sĩ gia đình',
  },
  {
    id: 'demo-0006-0000-0000-000000000006',
    email: 'admina2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Admin AIVIHE',
    role: 'admin',
    citizenId: 'demo-admin',
    phone: '0901000006',
    description: 'Quản trị hệ thống',
  },
  {
    id: 'demo-0007-0000-0000-000000000007',
    email: 'hoalt2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Lê Thị Hoa',
    role: 'guest',
    citizenId: 'demo-guest-hoa',
    phone: '0901000007',
    description: 'Khách mới đăng ký, chưa là thành viên',
  },
  {
    id: 'demo-0008-0000-0000-000000000008',
    email: 'tramttn2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Trần Thị Ngọc Trâm',
    role: 'director',
    citizenId: 'demo-director-tram',
    phone: '0901000008',
    description: 'Giám đốc công ty FBL',
  },
  {
    id: 'demo-0009-0000-0000-000000000009',
    email: 'khanhlt2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Lưu Tuấn Khanh',
    role: 'branch_director',
    citizenId: 'demo-branch-director-khanh',
    phone: '0901000009',
    description: 'Giám đốc chi nhánh Đông Anh',
  },
  {
    id: 'demo-0010-0000-0000-000000000010',
    email: 'haidn2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Doãn Ngọc Hải',
    role: 'super_admin',
    citizenId: 'demo-super-admin-hai',
    phone: '0901000010',
    description: 'Chuyên gia cao cấp, Super Admin toàn quyền',
  },
  {
    id: 'demo-0011-0000-0000-000000000011',
    email: 'maint2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Nguyễn Thị Mai',
    role: 'reception',
    citizenId: 'demo-reception-mai',
    phone: '0901000011',
    description: 'Nhân viên tiếp đón BV Đông Anh',
  },
  {
    id: 'demo-0012-0000-0000-000000000012',
    email: 'namtv2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'BS. Trần Văn Nam',
    role: 'exam_doctor',
    citizenId: 'demo-exam-doctor-nam',
    phone: '0901000012',
    description: 'Bác sĩ khám bệnh - BV Đông Anh',
  },
  {
    id: 'demo-0013-0000-0000-000000000013',
    email: 'ducpv12026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'BS. Phạm Văn Đức',
    role: 'specialist',
    citizenId: 'demo-specialist-duc',
    phone: '0901000013',
    description: 'BS Chuyên khoa Tim mạch - Chuyên gia chuyển tuyến',
  },
  {
    id: 'demo-0014-0000-0000-000000000014',
    email: 'kythuattm2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Trần Minh Kỹ Thuật',
    role: 'technician',
    citizenId: 'demo-technician-minh',
    phone: '0901000014',
    description: 'Nhân viên kỹ thuật',
  },
  {
    id: 'demo-0015-0000-0000-000000000015',
    email: 'phuclv2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Lê Văn Phúc',
    role: 'tech_assistant',
    citizenId: 'demo-tech-assistant-phuc',
    phone: '0901000015',
    description: 'Kỹ thuật viên',
  },
  {
    id: 'demo-0016-0000-0000-000000000016',
    email: 'huongnt2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Nguyễn Thị Hương',
    role: 'nurse',
    citizenId: 'demo-nurse-huong',
    phone: '0901000016',
    description: 'Điều dưỡng',
  },
  {
    id: 'demo-0017-0000-0000-000000000017',
    email: 'ngapt2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Phạm Thị Nga',
    role: 'support_staff',
    citizenId: 'demo-support-staff-nga',
    phone: '0901000017',
    description: 'Nhân viên hỗ trợ',
  },
  {
    id: 'demo-0018-0000-0000-000000000018',
    email: 'anhv2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Hoàng Văn An',
    role: 'intern',
    citizenId: 'demo-intern-an',
    phone: '0901000018',
    description: 'Nhân viên thực tập',
  },
  {
    id: 'demo-0019-0000-0000-000000000019',
    email: 'trungvd2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Vũ Đức Trung',
    role: 'manager',
    citizenId: 'demo-manager-trung',
    phone: '0901000019',
    description: 'Quản lý',
  },
  {
    id: 'demo-0020-0000-0000-000000000020',
    email: 'liendt2026@aivihe.vn',
    password: 'Aivihe@2026',
    fullName: 'Đỗ Thị Liên',
    role: 'admin_staff',
    citizenId: 'demo-admin-staff-lien',
    phone: '0901000020',
    description: 'Nhân viên hành chính',
  },
]

// Global store — survives across API route module boundaries in Next.js
const globalStore = globalThis as unknown as { __AIVIHE_DEMO_ACCOUNTS?: DemoAccount[] }
if (!globalStore.__AIVIHE_DEMO_ACCOUNTS) {
  globalStore.__AIVIHE_DEMO_ACCOUNTS = [...SEED_ACCOUNTS]
}

/** Runtime mutable list — use this everywhere */
export const DEMO_ACCOUNTS = globalStore.__AIVIHE_DEMO_ACCOUNTS

export const DEMO_COOKIE_NAME = 'demo-auth-session'

export function findDemoAccount(
  email: string,
  password: string
): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find(
    (a) => a.email === email && a.password === password
  )
}

export function findDemoAccountById(id: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((a) => a.id === id)
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

/**
 * Kiểm tra username đã tồn tại chưa trong demo accounts
 * Nếu trùng → tự động thêm số thứ tự tăng dần
 * Ví dụ: haidn2026@aivihe.vn trùng → haidn12026@aivihe.vn → haidn22026@aivihe.vn
 */
export function findUniqueDemoUsername(baseUsername: string): string {
  const exists = DEMO_ACCOUNTS.some(
    (a) => a.email === baseUsername
  )
  if (!exists) return baseUsername

  // Tách: prefix + year + @aivihe.vn
  const match = baseUsername.match(/^(.+?)(\d{4})(@aivihe\.vn)$/)
  if (!match) return `${Date.now()}${baseUsername}`

  const [, prefix, year, suffix] = match
  let counter = 1
  while (counter < 1000) {
    const candidate = `${prefix}${counter}${year}${suffix}`
    if (!DEMO_ACCOUNTS.some((a) => a.email === candidate)) {
      return candidate
    }
    counter++
  }
  return `${prefix}${Date.now()}${year}${suffix}`
}

/**
 * Thêm account mới vào runtime DEMO_ACCOUNTS
 */
export function addDemoAccount(account: DemoAccount): void {
  DEMO_ACCOUNTS.push(account)
}
