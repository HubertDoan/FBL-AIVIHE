// Demo doctor professional profile data
// Used for doctor registration + family doctor assignment features

export interface Certificate {
  name: string
  issuer: string
  issued_date: string
  expiry_date: string | null
  document_url: string | null
}

export interface WorkExperience {
  position: string
  facility: string
  from_year: number
  to_year: number | null // null = hiện tại
  description: string
}

export interface DoctorProfile {
  id: string
  citizen_id: string
  // Basic info
  full_name: string
  specialties: string[]
  // Qualifications
  degree: string // Bằng cấp (Bác sĩ CKI, CKII, ThS, TS...)
  university: string // Trường đào tạo
  graduation_year: number
  // Certificates
  certificates: Certificate[]
  // Experience
  work_experience: WorkExperience[]
  // Preferences
  desired_work: string // Mong muốn làm việc
  available_hours: string // Giờ làm việc mong muốn
  max_patients: number // Số BN tối đa quản lý
  current_patients: number // Số BN hiện tại
  // Status
  status: 'pending' | 'approved' | 'suspended'
  registered_at: string
  approved_at: string | null
}

// In-memory store
let _profiles: DoctorProfile[] = [
  {
    id: 'dp-001',
    citizen_id: 'demo-doctor-hai',
    full_name: 'BS. Nguyễn Hải',
    specialties: ['Nội tổng quát', 'Y học gia đình'],
    degree: 'CKI',
    university: 'Đại học Y Hà Nội',
    graduation_year: 2008,
    certificates: [
      {
        name: 'Chứng chỉ Hành nghề khám chữa bệnh',
        issuer: 'Bộ Y tế Việt Nam',
        issued_date: '2010-03-15',
        expiry_date: null,
        document_url: null,
      },
      {
        name: 'Chứng chỉ Y học gia đình',
        issuer: 'Hội Y học gia đình Việt Nam',
        issued_date: '2015-06-20',
        expiry_date: '2025-06-20',
        document_url: null,
      },
      {
        name: 'Chứng chỉ Cấp cứu nâng cao (ACLS)',
        issuer: 'Hội Tim mạch Hoa Kỳ (AHA)',
        issued_date: '2022-01-10',
        expiry_date: '2024-01-10',
        document_url: null,
      },
    ],
    work_experience: [
      {
        position: 'Bác sĩ nội trú',
        facility: 'Bệnh viện Bạch Mai, Hà Nội',
        from_year: 2008,
        to_year: 2013,
        description: 'Điều trị nội khoa tổng quát, tiếp nhận và xử lý ca cấp cứu',
      },
      {
        position: 'Bác sĩ gia đình',
        facility: 'Phòng khám Đa khoa AIVIHE, Hà Nội',
        from_year: 2013,
        to_year: null,
        description: 'Khám và quản lý sức khỏe toàn diện cho bệnh nhân mạn tính, theo dõi dài hạn',
      },
    ],
    desired_work: 'Quản lý sức khỏe dài hạn cho bệnh nhân cao tuổi, bệnh mạn tính. Tư vấn phòng ngừa và nâng cao sức khỏe.',
    available_hours: 'Thứ 2 - Thứ 6: 8:00 - 17:00. Thứ 7: 8:00 - 12:00.',
    max_patients: 10,
    current_patients: 4,
    status: 'approved',
    registered_at: '2024-01-10T08:00:00.000Z',
    approved_at: '2024-01-12T10:00:00.000Z',
  },
]

let _counter = 1

// ── Family doctor assignment store ────────────────────────────────────────────
export interface FamilyDoctorAssignment {
  id: string
  citizen_id: string
  citizen_name: string
  doctor_profile_id: string
  doctor_citizen_id: string
  status: 'pending' | 'accepted' | 'declined'
  requested_at: string
  responded_at: string | null
}

let _assignments: FamilyDoctorAssignment[] = []

// ── Doctor profile CRUD ───────────────────────────────────────────────────────

export function getDoctorProfile(citizenId: string): DoctorProfile | undefined {
  return _profiles.find((p) => p.citizen_id === citizenId)
}

export function getDoctorProfiles(status?: DoctorProfile['status']): DoctorProfile[] {
  if (status) return _profiles.filter((p) => p.status === status)
  return [..._profiles]
}

export function getAvailableDoctors(): DoctorProfile[] {
  return _profiles.filter(
    (p) => p.status === 'approved' && p.current_patients < p.max_patients
  )
}

export function createDoctorProfile(
  data: Omit<DoctorProfile, 'id' | 'status' | 'registered_at' | 'approved_at'>
): DoctorProfile {
  const profile: DoctorProfile = {
    ...data,
    id: `dp-${Date.now()}-${++_counter}`,
    status: 'pending',
    registered_at: new Date().toISOString(),
    approved_at: null,
  }
  _profiles.push(profile)
  return profile
}

export function updateDoctorProfile(
  id: string,
  updates: Partial<DoctorProfile>
): DoctorProfile | null {
  const idx = _profiles.findIndex((p) => p.id === id)
  if (idx === -1) return null
  _profiles[idx] = { ..._profiles[idx], ...updates }
  return _profiles[idx]
}

export function approveDoctorProfile(id: string): DoctorProfile | null {
  return updateDoctorProfile(id, {
    status: 'approved',
    approved_at: new Date().toISOString(),
  })
}

// ── Family doctor assignment ──────────────────────────────────────────────────

export function getAssignment(citizenId: string): FamilyDoctorAssignment | undefined {
  // Return latest non-declined assignment
  return _assignments
    .filter((a) => a.citizen_id === citizenId && a.status !== 'declined')
    .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())[0]
}

export function getPendingAssignmentsForDoctor(
  doctorProfileId: string
): FamilyDoctorAssignment[] {
  return _assignments.filter(
    (a) => a.doctor_profile_id === doctorProfileId && a.status === 'pending'
  )
}

export function createAssignment(
  citizenId: string,
  citizenName: string,
  doctorProfileId: string,
  doctorCitizenId: string
): FamilyDoctorAssignment {
  // Cancel any previous pending assignments
  _assignments = _assignments.map((a) =>
    a.citizen_id === citizenId && a.status === 'pending'
      ? { ...a, status: 'declined' as const }
      : a
  )
  const assignment: FamilyDoctorAssignment = {
    id: `asgn-${Date.now()}-${++_counter}`,
    citizen_id: citizenId,
    citizen_name: citizenName,
    doctor_profile_id: doctorProfileId,
    doctor_citizen_id: doctorCitizenId,
    status: 'pending',
    requested_at: new Date().toISOString(),
    responded_at: null,
  }
  _assignments.push(assignment)
  return assignment
}

export function respondToAssignment(
  assignmentId: string,
  accept: boolean
): FamilyDoctorAssignment | null {
  const idx = _assignments.findIndex((a) => a.id === assignmentId)
  if (idx === -1) return null
  _assignments[idx] = {
    ..._assignments[idx],
    status: accept ? 'accepted' : 'declined',
    responded_at: new Date().toISOString(),
  }
  // Update patient count on doctor profile
  if (accept) {
    const dpIdx = _profiles.findIndex(
      (p) => p.id === _assignments[idx].doctor_profile_id
    )
    if (dpIdx !== -1) {
      _profiles[dpIdx] = {
        ..._profiles[dpIdx],
        current_patients: _profiles[dpIdx].current_patients + 1,
      }
    }
  }
  return _assignments[idx]
}
