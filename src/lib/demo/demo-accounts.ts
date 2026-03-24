// Demo accounts for testing without Supabase
// Only used when NEXT_PUBLIC_DEMO_MODE=true

export type DemoRole = 'citizen' | 'doctor' | 'admin'

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

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-0001-0000-0000-000000000001',
    email: 'minh@demo.aivihe.vn',
    password: 'Demo@2024',
    fullName: 'Nguy\u1EC5n V\u0103n Minh',
    role: 'citizen',
    citizenId: 'demo-citizen-minh',
    phone: '0901000001',
    description: 'B\u1EC7nh nh\u00E2n ch\u00EDnh, nam 62 tu\u1ED5i, ti\u1EC3u \u0111\u01B0\u1EDDng + t\u0103ng huy\u1EBFt \u00E1p',
  },
  {
    id: 'demo-0002-0000-0000-000000000002',
    email: 'lan@demo.aivihe.vn',
    password: 'Demo@2024',
    fullName: 'Tr\u1EA7n Th\u1ECB Lan',
    role: 'citizen',
    citizenId: 'demo-citizen-lan',
    phone: '0901000002',
    description: 'V\u1EE3 \u00F4ng Minh, 58 tu\u1ED5i, qu\u1EA3n l\u00FD s\u1EE9c kh\u1ECFe cho ch\u1ED3ng',
  },
  {
    id: 'demo-0003-0000-0000-000000000003',
    email: 'tuan@demo.aivihe.vn',
    password: 'Demo@2024',
    fullName: 'Nguy\u1EC5n Tu\u1EA5n',
    role: 'citizen',
    citizenId: 'demo-citizen-tuan',
    phone: '0901000003',
    description: 'Con trai, 35 tu\u1ED5i, qu\u1EA3n l\u00FD s\u1EE9c kh\u1ECFe cho b\u1ED1 m\u1EB9',
  },
  {
    id: 'demo-0004-0000-0000-000000000004',
    email: 'duc@demo.aivihe.vn',
    password: 'Demo@2024',
    fullName: 'Ph\u1EA1m V\u0103n \u0110\u1EE9c',
    role: 'citizen',
    citizenId: 'demo-citizen-duc',
    phone: '0901000004',
    description: 'H\u00E0ng x\u00F3m, 70 tu\u1ED5i, b\u1EC7nh g\u00FAt + r\u1ED1i lo\u1EA1n m\u1EE1 m\u00E1u',
  },
  {
    id: 'demo-0005-0000-0000-000000000005',
    email: 'bshai@demo.aivihe.vn',
    password: 'Demo@2024',
    fullName: 'BS. Nguy\u1EC5n H\u1EA3i',
    role: 'doctor',
    citizenId: 'demo-doctor-hai',
    phone: '0901000005',
    description: 'B\u00E1c s\u0129 gia \u0111\u00ECnh',
  },
  {
    id: 'demo-0006-0000-0000-000000000006',
    email: 'admin@demo.aivihe.vn',
    password: 'Demo@2024',
    fullName: 'Admin AIVIHE',
    role: 'admin',
    citizenId: 'demo-admin',
    phone: '0901000006',
    description: 'Qu\u1EA3n tr\u1ECB h\u1EC7 th\u1ED1ng',
  },
]

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
