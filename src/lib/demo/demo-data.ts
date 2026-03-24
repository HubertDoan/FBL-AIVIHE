// Mock data for demo mode dashboard and features
// Matches database schema types from src/types/database.ts

import type {
  HealthEvent,
  SourceDocument,
  HealthProfile,
  ChronicDisease,
  LabTest,
  Medication,
  Citizen,
  Family,
  FamilyMember,
  Feedback,
  AuditLog,
  VisitPreparation,
} from '@/types/database'

// ─── User IDs ───────────────────────────────────────────────────────────────
const MINH = 'demo-0001-0000-0000-000000000001'
const LAN = 'demo-0002-0000-0000-000000000002'
const TUAN = 'demo-0003-0000-0000-000000000003'
const DUC = 'demo-0004-0000-0000-000000000004'
const BS_HAI = 'demo-0005-0000-0000-000000000005'
const ADMIN = 'demo-0006-0000-0000-000000000006'

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DemoDashboardStats {
  documentCount: number
  visitCount: number
  pendingCount: number
  familyCount: number
}

const dashboardStatsByUser: Record<string, DemoDashboardStats> = {
  [MINH]: { documentCount: 8, visitCount: 15, pendingCount: 2, familyCount: 3 },
  [LAN]: { documentCount: 4, visitCount: 6, pendingCount: 0, familyCount: 3 },
  [TUAN]: { documentCount: 1, visitCount: 2, pendingCount: 0, familyCount: 3 },
  [DUC]: { documentCount: 5, visitCount: 8, pendingCount: 1, familyCount: 1 },
}

export function getDemoDashboardStats(userId: string): DemoDashboardStats {
  return (
    dashboardStatsByUser[userId] ?? {
      documentCount: 0,
      visitCount: 0,
      pendingCount: 0,
      familyCount: 0,
    }
  )
}

// ─── Citizens ────────────────────────────────────────────────────────────────

const citizens: Record<string, Citizen> = {
  [MINH]: {
    id: MINH,
    full_name: 'Nguyễn Văn Minh',
    username: 'minhnv2024',
    date_of_birth: '1962-05-15',
    gender: 'male',
    national_id: '001062012345',
    phone: '0901000001',
    email: 'minh@demo.aivihe.vn',
    address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
    ethnicity: 'Kinh',
    occupation: 'Hưu trí',
    avatar_url: null,
    has_consented: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  [LAN]: {
    id: LAN,
    full_name: 'Trần Thị Lan',
    username: 'lant2024',
    date_of_birth: '1966-09-20',
    gender: 'female',
    national_id: '001066054321',
    phone: '0901000002',
    email: 'lan@demo.aivihe.vn',
    address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
    ethnicity: 'Kinh',
    occupation: 'Nội trợ',
    avatar_url: null,
    has_consented: true,
    created_at: '2024-01-16T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  [TUAN]: {
    id: TUAN,
    full_name: 'Nguyễn Tuấn',
    username: 'tuann2024',
    date_of_birth: '1989-03-12',
    gender: 'male',
    national_id: '001089067890',
    phone: '0901000003',
    email: 'tuan@demo.aivihe.vn',
    address: 'Quận Cầu Giấy, Hà Nội',
    ethnicity: 'Kinh',
    occupation: 'Kỹ sư phần mềm',
    avatar_url: null,
    has_consented: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  [DUC]: {
    id: DUC,
    full_name: 'Phạm Văn Đức',
    username: 'ducpv2024',
    date_of_birth: '1954-11-08',
    gender: 'male',
    national_id: '001054098765',
    phone: '0901000004',
    email: 'duc@demo.aivihe.vn',
    address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
    ethnicity: 'Kinh',
    occupation: 'Hưu trí',
    avatar_url: null,
    has_consented: true,
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  [BS_HAI]: {
    id: BS_HAI,
    full_name: 'BS. Nguyễn Hải',
    username: 'hain2024',
    date_of_birth: '1975-07-22',
    gender: 'male',
    national_id: '001075011111',
    phone: '0901000005',
    email: 'bshai@demo.aivihe.vn',
    address: 'Trạm Y tế xã Phù Linh, Sóc Sơn, Hà Nội',
    ethnicity: 'Kinh',
    occupation: 'Bác sĩ',
    avatar_url: null,
    has_consented: true,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  [ADMIN]: {
    id: ADMIN,
    full_name: 'Admin AIVIHE',
    username: 'admina2024',
    date_of_birth: '1990-01-01',
    gender: 'male',
    national_id: null,
    phone: '0901000006',
    email: 'admin@demo.aivihe.vn',
    address: null,
    ethnicity: null,
    occupation: 'Quản trị viên',
    avatar_url: null,
    has_consented: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
}

export function getDemoCitizen(userId: string): Citizen | undefined {
  return citizens[userId]
}

export function getAllDemoCitizens(): Citizen[] {
  return Object.values(citizens)
}

// ─── Health Profiles ─────────────────────────────────────────────────────────

const healthProfiles: Record<string, HealthProfile> = {
  [MINH]: {
    id: 'hp-demo-001',
    citizen_id: MINH,
    blood_type: 'O+',
    height_cm: 165,
    weight_kg: 72,
    allergies: ['Penicillin'],
    disabilities: [],
    chronic_conditions: ['Đái tháo đường type 2', 'Tăng huyết áp', 'Rối loạn lipid máu'],
    current_medications: [
      'Metformin 850mg',
      'Amlodipine 5mg',
      'Atorvastatin 10mg',
      'Aspirin 81mg',
      'Omeprazole 20mg',
    ],
    emergency_contact_name: 'Trần Thị Lan',
    emergency_contact_phone: '0901000002',
    emergency_contact_relationship: 'Vợ',
    pregnancy_status: null,
    organ_donation_status: false,
    lifestyle_notes: {
      smoking: 'Bỏ thuốc 5 năm',
      alcohol: 'Ít khi',
      exercise: 'Đi bộ 30 phút/ngày',
    },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  [LAN]: {
    id: 'hp-demo-002',
    citizen_id: LAN,
    blood_type: 'A+',
    height_cm: 155,
    weight_kg: 58,
    allergies: [],
    disabilities: [],
    chronic_conditions: ['Loãng xương'],
    current_medications: ['Calcium-D 500mg'],
    emergency_contact_name: 'Nguyễn Văn Minh',
    emergency_contact_phone: '0901000001',
    emergency_contact_relationship: 'Chồng',
    pregnancy_status: null,
    organ_donation_status: false,
    lifestyle_notes: {
      smoking: 'Không',
      alcohol: 'Không',
      exercise: 'Tập dưỡng sinh buổi sáng',
    },
    created_at: '2024-01-16T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  [DUC]: {
    id: 'hp-demo-004',
    citizen_id: DUC,
    blood_type: 'A+',
    height_cm: 165,
    weight_kg: 78,
    allergies: [],
    disabilities: [],
    chronic_conditions: ['Gút', 'Rối loạn mỡ máu'],
    current_medications: [
      'Allopurinol 300mg',
      'Colchicine 0.5mg',
      'Fenofibrate 160mg',
      'Omeprazole 20mg',
    ],
    emergency_contact_name: 'Phạm Thị Hồng',
    emergency_contact_phone: '0901000010',
    emergency_contact_relationship: 'Vợ',
    pregnancy_status: null,
    organ_donation_status: false,
    lifestyle_notes: { smoking: 'Không', alcohol: 'Hạn chế', exercise: 'Ít' },
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
}

export function getDemoHealthProfile(
  userId: string
): HealthProfile | undefined {
  return healthProfiles[userId]
}

// ─── Source Documents ────────────────────────────────────────────────────────

const sourceDocuments: Record<string, Partial<SourceDocument>[]> = {
  [MINH]: [
    {
      id: 'doc-m-001',
      citizen_id: MINH,
      document_type: 'lab_report',
      document_date: '2025-01-15',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'xet-nghiem-mau-15012025.pdf',
      notes: 'Xét nghiệm máu định kỳ quý 1/2025',
      created_at: '2025-01-15T10:30:00Z',
    },
    {
      id: 'doc-m-002',
      citizen_id: MINH,
      document_type: 'prescription',
      document_date: '2025-01-15',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'don-thuoc-15012025.pdf',
      notes: 'Đơn thuốc 3 tháng - tiểu đường + huyết áp',
      created_at: '2025-01-15T11:00:00Z',
    },
    {
      id: 'doc-m-003',
      citizen_id: MINH,
      document_type: 'imaging',
      document_date: '2024-10-20',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'sieu-am-bung-20102024.pdf',
      notes: 'Siêu âm bụng tổng quát',
      created_at: '2024-10-20T09:00:00Z',
    },
    {
      id: 'doc-m-004',
      citizen_id: MINH,
      document_type: 'lab_report',
      document_date: '2024-10-15',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'xet-nghiem-mau-15102024.pdf',
      notes: 'Xét nghiệm máu định kỳ quý 4/2024',
      created_at: '2024-10-15T10:00:00Z',
    },
    {
      id: 'doc-m-005',
      citizen_id: MINH,
      document_type: 'prescription',
      document_date: '2024-10-15',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'don-thuoc-15102024.pdf',
      notes: 'Đơn thuốc 3 tháng',
      created_at: '2024-10-15T11:00:00Z',
    },
    {
      id: 'doc-m-006',
      citizen_id: MINH,
      document_type: 'imaging',
      document_date: '2024-07-10',
      facility_name: 'Bệnh viện Bạch Mai',
      original_filename: 'xquang-nguc-10072024.pdf',
      notes: 'X-quang ngực thẳng',
      created_at: '2024-07-10T14:00:00Z',
    },
    {
      id: 'doc-m-007',
      citizen_id: MINH,
      document_type: 'lab_report',
      document_date: '2024-07-08',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'xet-nghiem-mau-08072024.pdf',
      notes: 'Xét nghiệm máu định kỳ quý 3/2024',
      created_at: '2024-07-08T10:00:00Z',
    },
    {
      id: 'doc-m-008',
      citizen_id: MINH,
      document_type: 'medical_certificate',
      document_date: '2024-04-05',
      facility_name: 'Trạm Y tế xã Phù Linh',
      original_filename: 'giay-kham-suc-khoe-05042024.pdf',
      notes: 'Giấy khám sức khỏe định kỳ',
      created_at: '2024-04-05T08:00:00Z',
    },
  ],
  [LAN]: [
    {
      id: 'doc-l-001',
      citizen_id: LAN,
      document_type: 'lab_report',
      document_date: '2025-01-10',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'xet-nghiem-loang-xuong-10012025.pdf',
      notes: 'Đo mật độ xương DEXA',
      created_at: '2025-01-10T09:00:00Z',
    },
    {
      id: 'doc-l-002',
      citizen_id: LAN,
      document_type: 'prescription',
      document_date: '2025-01-10',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'don-thuoc-10012025.pdf',
      notes: 'Đơn thuốc bổ sung canxi',
      created_at: '2025-01-10T10:00:00Z',
    },
    {
      id: 'doc-l-003',
      citizen_id: LAN,
      document_type: 'lab_report',
      document_date: '2024-07-15',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'xet-nghiem-mau-15072024.pdf',
      notes: 'Xét nghiệm máu tổng quát',
      created_at: '2024-07-15T10:00:00Z',
    },
    {
      id: 'doc-l-004',
      citizen_id: LAN,
      document_type: 'imaging',
      document_date: '2024-04-20',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'sieu-am-tuyen-giap-20042024.pdf',
      notes: 'Siêu âm tuyến giáp',
      created_at: '2024-04-20T09:00:00Z',
    },
  ],
  [DUC]: [
    {
      id: 'doc-d-001',
      citizen_id: DUC,
      document_type: 'lab_report',
      document_date: '2025-01-08',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'xet-nghiem-acid-uric-08012025.pdf',
      notes: 'Xét nghiệm acid uric + mỡ máu',
      created_at: '2025-01-08T10:00:00Z',
    },
    {
      id: 'doc-d-002',
      citizen_id: DUC,
      document_type: 'prescription',
      document_date: '2025-01-08',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'don-thuoc-08012025.pdf',
      notes: 'Đơn thuốc gút + mỡ máu',
      created_at: '2025-01-08T11:00:00Z',
    },
    {
      id: 'doc-d-003',
      citizen_id: DUC,
      document_type: 'lab_report',
      document_date: '2024-10-05',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'xet-nghiem-mau-05102024.pdf',
      notes: 'Xét nghiệm máu định kỳ',
      created_at: '2024-10-05T10:00:00Z',
    },
    {
      id: 'doc-d-004',
      citizen_id: DUC,
      document_type: 'imaging',
      document_date: '2024-08-12',
      facility_name: 'Bệnh viện Bạch Mai',
      original_filename: 'xquang-khop-12082024.pdf',
      notes: 'X-quang khớp bàn chân',
      created_at: '2024-08-12T14:00:00Z',
    },
    {
      id: 'doc-d-005',
      citizen_id: DUC,
      document_type: 'discharge_summary',
      document_date: '2024-05-20',
      facility_name: 'Bệnh viện Đa khoa Sóc Sơn',
      original_filename: 'giay-ra-vien-20052024.pdf',
      notes: 'Ra viện sau đợt gút cấp',
      created_at: '2024-05-20T16:00:00Z',
    },
  ],
}

export function getDemoDocuments(userId: string): Partial<SourceDocument>[] {
  return sourceDocuments[userId] ?? []
}

// ─── Health Events ───────────────────────────────────────────────────────────

const healthEvents: Record<string, Partial<HealthEvent>[]> = {
  [MINH]: [
    {
      id: 'evt-m-001', citizen_id: MINH, event_type: 'visit',
      occurred_at: '2025-01-15T08:00:00Z',
      title: 'Khám định kỳ quý 1/2025',
      description: 'Khám kiểm tra đường huyết và huyết áp. HbA1c: 6.8%, HA: 130/82. Kiểm soát tốt hơn quý trước.',
    },
    {
      id: 'evt-m-002', citizen_id: MINH, event_type: 'lab_result',
      occurred_at: '2025-01-15T10:30:00Z',
      title: 'Kết quả xét nghiệm máu Q1/2025',
      description: 'HbA1c: 6.8%, Glucose lúc đói: 7.2 mmol/L, Cholesterol: 4.8 mmol/L, Triglyceride: 2.1 mmol/L',
    },
    {
      id: 'evt-m-003', citizen_id: MINH, event_type: 'medication',
      occurred_at: '2025-01-15T11:00:00Z',
      title: 'Cập nhật đơn thuốc Q1/2025',
      description: 'Duy trì Metformin 850mg x2, thêm Omeprazole 20mg để bảo vệ dạ dày',
    },
    {
      id: 'evt-m-004', citizen_id: MINH, event_type: 'vital_sign',
      occurred_at: '2025-01-10T07:00:00Z',
      title: 'Đo huyết áp tại nhà',
      description: 'HA: 128/80 mmHg, Mạch: 76 lần/phút',
    },
    {
      id: 'evt-m-005', citizen_id: MINH, event_type: 'visit',
      occurred_at: '2024-10-15T08:00:00Z',
      title: 'Khám định kỳ quý 4/2024',
      description: 'HbA1c: 7.0%, HA: 135/85. Cần tăng cường kiểm soát.',
    },
    {
      id: 'evt-m-006', citizen_id: MINH, event_type: 'lab_result',
      occurred_at: '2024-10-15T10:00:00Z',
      title: 'Kết quả xét nghiệm máu Q4/2024',
      description: 'HbA1c: 7.0%, Glucose: 8.0 mmol/L, Cholesterol: 5.0 mmol/L, Creatinine: 90 µmol/L',
    },
    {
      id: 'evt-m-007', citizen_id: MINH, event_type: 'imaging',
      occurred_at: '2024-10-20T09:00:00Z',
      title: 'Siêu âm bụng tổng quát',
      description: 'Gan nhiễm mỡ độ I, thận bình thường, tụy bình thường',
    },
    {
      id: 'evt-m-008', citizen_id: MINH, event_type: 'visit',
      occurred_at: '2024-07-08T08:00:00Z',
      title: 'Khám định kỳ quý 3/2024',
      description: 'HbA1c: 7.2%, HA: 138/88. Tăng Atorvastatin lên 10mg.',
    },
    {
      id: 'evt-m-009', citizen_id: MINH, event_type: 'lab_result',
      occurred_at: '2024-07-08T10:00:00Z',
      title: 'Kết quả xét nghiệm máu Q3/2024',
      description: 'HbA1c: 7.2%, Glucose: 8.5 mmol/L, Cholesterol: 5.2 mmol/L, GOT: 28 U/L, GPT: 32 U/L',
    },
    {
      id: 'evt-m-010', citizen_id: MINH, event_type: 'imaging',
      occurred_at: '2024-07-10T14:00:00Z',
      title: 'X-quang ngực thẳng',
      description: 'Tim phổi bình thường, không có tổn thương',
    },
    {
      id: 'evt-m-011', citizen_id: MINH, event_type: 'vital_sign',
      occurred_at: '2024-06-15T07:00:00Z',
      title: 'Đo huyết áp tại nhà',
      description: 'HA: 140/90 mmHg, Mạch: 78 lần/phút',
    },
    {
      id: 'evt-m-012', citizen_id: MINH, event_type: 'visit',
      occurred_at: '2024-04-05T08:00:00Z',
      title: 'Khám sức khỏe định kỳ',
      description: 'Khám tổng quát tại Trạm Y tế. Sức khỏe ổn định.',
    },
    {
      id: 'evt-m-013', citizen_id: MINH, event_type: 'diagnosis',
      occurred_at: '2023-12-10T09:00:00Z',
      title: 'Chẩn đoán rối loạn lipid máu',
      description: 'Phát hiện rối loạn lipid máu, bắt đầu Atorvastatin 5mg',
    },
    {
      id: 'evt-m-014', citizen_id: MINH, event_type: 'lifestyle',
      occurred_at: '2023-09-01T00:00:00Z',
      title: 'Thay đổi lối sống',
      description: 'Bắt đầu đi bộ 30 phút mỗi ngày, giảm tinh bột trong bữa ăn',
    },
    {
      id: 'evt-m-015', citizen_id: MINH, event_type: 'vaccination',
      occurred_at: '2023-10-15T09:00:00Z',
      title: 'Tiêm phòng cúm mùa 2023',
      description: 'Tiêm vaccine cúm mùa tại Trạm Y tế xã Phù Linh',
    },
  ],
  [LAN]: [
    {
      id: 'evt-l-001', citizen_id: LAN, event_type: 'visit',
      occurred_at: '2025-01-10T08:00:00Z',
      title: 'Khám loãng xương định kỳ',
      description: 'Đo mật độ xương DEXA. T-score: -2.3 (loãng xương nhẹ). Duy trì Calcium-D.',
    },
    {
      id: 'evt-l-002', citizen_id: LAN, event_type: 'lab_result',
      occurred_at: '2025-01-10T09:30:00Z',
      title: 'Kết quả đo mật độ xương',
      description: 'T-score cổ xương đùi: -2.3, T-score cột sống: -2.1. Cải thiện so với lần trước.',
    },
    {
      id: 'evt-l-003', citizen_id: LAN, event_type: 'visit',
      occurred_at: '2024-07-15T08:00:00Z',
      title: 'Khám tổng quát',
      description: 'Xét nghiệm máu tổng quát. Kết quả bình thường.',
    },
    {
      id: 'evt-l-004', citizen_id: LAN, event_type: 'lab_result',
      occurred_at: '2024-07-15T10:00:00Z',
      title: 'Kết quả xét nghiệm máu',
      description: 'Glucose: 5.4 mmol/L, Cholesterol: 5.5 mmol/L, Calcium: 2.2 mmol/L',
    },
    {
      id: 'evt-l-005', citizen_id: LAN, event_type: 'imaging',
      occurred_at: '2024-04-20T09:00:00Z',
      title: 'Siêu âm tuyến giáp',
      description: 'Tuyến giáp bình thường, không có nhân',
    },
    {
      id: 'evt-l-006', citizen_id: LAN, event_type: 'vaccination',
      occurred_at: '2023-10-15T09:30:00Z',
      title: 'Tiêm phòng cúm mùa 2023',
      description: 'Tiêm vaccine cúm mùa tại Trạm Y tế xã Phù Linh',
    },
  ],
  [DUC]: [
    {
      id: 'evt-d-001', citizen_id: DUC, event_type: 'visit',
      occurred_at: '2025-01-08T08:00:00Z',
      title: 'Tái khám gút + mỡ máu',
      description: 'Acid uric: 420 µmol/L (giảm). Triglyceride: 2.8 mmol/L. Duy trì thuốc.',
    },
    {
      id: 'evt-d-002', citizen_id: DUC, event_type: 'lab_result',
      occurred_at: '2025-01-08T10:00:00Z',
      title: 'Kết quả xét nghiệm Q1/2025',
      description: 'Acid uric: 420 µmol/L, Triglyceride: 2.8 mmol/L, Cholesterol: 5.5 mmol/L, Creatinine: 95 µmol/L',
    },
    {
      id: 'evt-d-003', citizen_id: DUC, event_type: 'visit',
      occurred_at: '2024-10-05T08:00:00Z',
      title: 'Tái khám gút',
      description: 'Acid uric: 480 µmol/L. Tăng Allopurinol lên 300mg.',
    },
    {
      id: 'evt-d-004', citizen_id: DUC, event_type: 'lab_result',
      occurred_at: '2024-10-05T10:00:00Z',
      title: 'Kết quả xét nghiệm Q4/2024',
      description: 'Acid uric: 480 µmol/L, Triglyceride: 3.2 mmol/L, GOT: 25 U/L, GPT: 30 U/L',
    },
    {
      id: 'evt-d-005', citizen_id: DUC, event_type: 'imaging',
      occurred_at: '2024-08-12T14:00:00Z',
      title: 'X-quang khớp bàn chân',
      description: 'Hẹp khe khớp ngón chân cái, dấu hiệu gút mạn tính',
    },
    {
      id: 'evt-d-006', citizen_id: DUC, event_type: 'visit',
      occurred_at: '2024-05-15T08:00:00Z',
      title: 'Nhập viện - cơn gút cấp',
      description: 'Sưng đau khớp ngón chân cái phải, acid uric: 560 µmol/L. Điều trị nội trú 5 ngày.',
    },
    {
      id: 'evt-d-007', citizen_id: DUC, event_type: 'medication',
      occurred_at: '2024-05-20T10:00:00Z',
      title: 'Ra viện - cập nhật đơn thuốc',
      description: 'Thêm Colchicine 0.5mg khi có đợt gút cấp. Kiêng rượu bia, nội tạng, hải sản.',
    },
    {
      id: 'evt-d-008', citizen_id: DUC, event_type: 'lifestyle',
      occurred_at: '2024-06-01T00:00:00Z',
      title: 'Thay đổi chế độ ăn',
      description: 'Giảm purine: kiêng nội tạng, hải sản, rượu bia. Uống nhiều nước.',
    },
  ],
}

export function getDemoHealthEvents(
  userId: string
): Partial<HealthEvent>[] {
  return healthEvents[userId] ?? []
}

// ─── Lab Tests ───────────────────────────────────────────────────────────────

const labTests: Record<string, Partial<LabTest>[]> = {
  [MINH]: [
    // Q1/2025
    { id: 'lab-m-001', citizen_id: MINH, test_name: 'HbA1c', result_value: '6.8', unit: '%', reference_range: '4.0 - 6.0', is_abnormal: true, test_date: '2025-01-15', created_at: '2025-01-15T10:30:00Z' },
    { id: 'lab-m-002', citizen_id: MINH, test_name: 'Glucose lúc đói', result_value: '7.2', unit: 'mmol/L', reference_range: '3.9 - 6.1', is_abnormal: true, test_date: '2025-01-15', created_at: '2025-01-15T10:30:00Z' },
    { id: 'lab-m-003', citizen_id: MINH, test_name: 'Cholesterol toàn phần', result_value: '4.8', unit: 'mmol/L', reference_range: '< 5.2', is_abnormal: false, test_date: '2025-01-15', created_at: '2025-01-15T10:30:00Z' },
    { id: 'lab-m-004', citizen_id: MINH, test_name: 'Triglyceride', result_value: '2.1', unit: 'mmol/L', reference_range: '< 1.7', is_abnormal: true, test_date: '2025-01-15', created_at: '2025-01-15T10:30:00Z' },
    // Q4/2024
    { id: 'lab-m-005', citizen_id: MINH, test_name: 'HbA1c', result_value: '7.0', unit: '%', reference_range: '4.0 - 6.0', is_abnormal: true, test_date: '2024-10-15', created_at: '2024-10-15T10:00:00Z' },
    { id: 'lab-m-006', citizen_id: MINH, test_name: 'Glucose lúc đói', result_value: '8.0', unit: 'mmol/L', reference_range: '3.9 - 6.1', is_abnormal: true, test_date: '2024-10-15', created_at: '2024-10-15T10:00:00Z' },
    { id: 'lab-m-007', citizen_id: MINH, test_name: 'Creatinine', result_value: '90', unit: 'µmol/L', reference_range: '62 - 106', is_abnormal: false, test_date: '2024-10-15', created_at: '2024-10-15T10:00:00Z' },
    { id: 'lab-m-008', citizen_id: MINH, test_name: 'Cholesterol toàn phần', result_value: '5.0', unit: 'mmol/L', reference_range: '< 5.2', is_abnormal: false, test_date: '2024-10-15', created_at: '2024-10-15T10:00:00Z' },
    // Q3/2024
    { id: 'lab-m-009', citizen_id: MINH, test_name: 'HbA1c', result_value: '7.2', unit: '%', reference_range: '4.0 - 6.0', is_abnormal: true, test_date: '2024-07-08', created_at: '2024-07-08T10:00:00Z' },
    { id: 'lab-m-010', citizen_id: MINH, test_name: 'Glucose lúc đói', result_value: '8.5', unit: 'mmol/L', reference_range: '3.9 - 6.1', is_abnormal: true, test_date: '2024-07-08', created_at: '2024-07-08T10:00:00Z' },
    { id: 'lab-m-011', citizen_id: MINH, test_name: 'GOT (AST)', result_value: '28', unit: 'U/L', reference_range: '< 40', is_abnormal: false, test_date: '2024-07-08', created_at: '2024-07-08T10:00:00Z' },
    { id: 'lab-m-012', citizen_id: MINH, test_name: 'GPT (ALT)', result_value: '32', unit: 'U/L', reference_range: '< 40', is_abnormal: false, test_date: '2024-07-08', created_at: '2024-07-08T10:00:00Z' },
  ],
  [LAN]: [
    { id: 'lab-l-001', citizen_id: LAN, test_name: 'T-score cổ xương đùi', result_value: '-2.3', unit: 'SD', reference_range: '> -1.0', is_abnormal: true, test_date: '2025-01-10', created_at: '2025-01-10T09:30:00Z' },
    { id: 'lab-l-002', citizen_id: LAN, test_name: 'T-score cột sống', result_value: '-2.1', unit: 'SD', reference_range: '> -1.0', is_abnormal: true, test_date: '2025-01-10', created_at: '2025-01-10T09:30:00Z' },
    { id: 'lab-l-003', citizen_id: LAN, test_name: 'Glucose lúc đói', result_value: '5.4', unit: 'mmol/L', reference_range: '3.9 - 6.1', is_abnormal: false, test_date: '2024-07-15', created_at: '2024-07-15T10:00:00Z' },
    { id: 'lab-l-004', citizen_id: LAN, test_name: 'Cholesterol toàn phần', result_value: '5.5', unit: 'mmol/L', reference_range: '< 5.2', is_abnormal: true, test_date: '2024-07-15', created_at: '2024-07-15T10:00:00Z' },
    { id: 'lab-l-005', citizen_id: LAN, test_name: 'Calcium máu', result_value: '2.2', unit: 'mmol/L', reference_range: '2.1 - 2.6', is_abnormal: false, test_date: '2024-07-15', created_at: '2024-07-15T10:00:00Z' },
  ],
  [DUC]: [
    // Q1/2025
    { id: 'lab-d-001', citizen_id: DUC, test_name: 'Acid uric', result_value: '420', unit: 'µmol/L', reference_range: '180 - 420', is_abnormal: false, test_date: '2025-01-08', created_at: '2025-01-08T10:00:00Z' },
    { id: 'lab-d-002', citizen_id: DUC, test_name: 'Triglyceride', result_value: '2.8', unit: 'mmol/L', reference_range: '< 1.7', is_abnormal: true, test_date: '2025-01-08', created_at: '2025-01-08T10:00:00Z' },
    { id: 'lab-d-003', citizen_id: DUC, test_name: 'Cholesterol toàn phần', result_value: '5.5', unit: 'mmol/L', reference_range: '< 5.2', is_abnormal: true, test_date: '2025-01-08', created_at: '2025-01-08T10:00:00Z' },
    { id: 'lab-d-004', citizen_id: DUC, test_name: 'Creatinine', result_value: '95', unit: 'µmol/L', reference_range: '62 - 106', is_abnormal: false, test_date: '2025-01-08', created_at: '2025-01-08T10:00:00Z' },
    // Q4/2024
    { id: 'lab-d-005', citizen_id: DUC, test_name: 'Acid uric', result_value: '480', unit: 'µmol/L', reference_range: '180 - 420', is_abnormal: true, test_date: '2024-10-05', created_at: '2024-10-05T10:00:00Z' },
    { id: 'lab-d-006', citizen_id: DUC, test_name: 'Triglyceride', result_value: '3.2', unit: 'mmol/L', reference_range: '< 1.7', is_abnormal: true, test_date: '2024-10-05', created_at: '2024-10-05T10:00:00Z' },
    { id: 'lab-d-007', citizen_id: DUC, test_name: 'GOT (AST)', result_value: '25', unit: 'U/L', reference_range: '< 40', is_abnormal: false, test_date: '2024-10-05', created_at: '2024-10-05T10:00:00Z' },
    { id: 'lab-d-008', citizen_id: DUC, test_name: 'GPT (ALT)', result_value: '30', unit: 'U/L', reference_range: '< 40', is_abnormal: false, test_date: '2024-10-05', created_at: '2024-10-05T10:00:00Z' },
  ],
}

export function getDemoLabTests(userId: string): Partial<LabTest>[] {
  return labTests[userId] ?? []
}

// ─── Chronic Diseases ────────────────────────────────────────────────────────

const chronicDiseases: Record<string, Partial<ChronicDisease>[]> = {
  [MINH]: [
    {
      id: 'cd-m-001', citizen_id: MINH,
      disease_name: 'Đái tháo đường type 2', icd_code: 'E11',
      diagnosis_date: '2018-03-15', status: 'controlled',
      current_treatment: 'Metformin 850mg x2/ngày',
      monitoring_plan: 'HbA1c mỗi 3 tháng, đường huyết hàng ngày',
      last_review_date: '2025-01-15',
      created_at: '2024-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z',
    },
    {
      id: 'cd-m-002', citizen_id: MINH,
      disease_name: 'Tăng huyết áp', icd_code: 'I10',
      diagnosis_date: '2016-08-20', status: 'controlled',
      current_treatment: 'Amlodipine 5mg x1/ngày',
      monitoring_plan: 'Đo huyết áp hàng ngày, tái khám mỗi 3 tháng',
      last_review_date: '2025-01-15',
      created_at: '2024-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z',
    },
    {
      id: 'cd-m-003', citizen_id: MINH,
      disease_name: 'Rối loạn lipid máu', icd_code: 'E78',
      diagnosis_date: '2023-12-10', status: 'controlled',
      current_treatment: 'Atorvastatin 10mg x1/ngày',
      monitoring_plan: 'Mỡ máu mỗi 6 tháng',
      last_review_date: '2025-01-15',
      created_at: '2024-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z',
    },
  ],
  [LAN]: [
    {
      id: 'cd-l-001', citizen_id: LAN,
      disease_name: 'Loãng xương', icd_code: 'M81',
      diagnosis_date: '2022-06-10', status: 'active',
      current_treatment: 'Calcium-D 500mg x2/ngày',
      monitoring_plan: 'Đo mật độ xương mỗi năm',
      last_review_date: '2025-01-10',
      created_at: '2024-01-16T00:00:00Z', updated_at: '2025-01-10T00:00:00Z',
    },
  ],
  [DUC]: [
    {
      id: 'cd-d-001', citizen_id: DUC,
      disease_name: 'Gút', icd_code: 'M10',
      diagnosis_date: '2019-11-10', status: 'controlled',
      current_treatment: 'Allopurinol 300mg, Colchicine 0.5mg khi cần',
      monitoring_plan: 'Acid uric mỗi 3 tháng',
      last_review_date: '2025-01-08',
      created_at: '2024-02-10T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
      id: 'cd-d-002', citizen_id: DUC,
      disease_name: 'Rối loạn mỡ máu', icd_code: 'E78',
      diagnosis_date: '2020-04-05', status: 'active',
      current_treatment: 'Fenofibrate 160mg x1/ngày',
      monitoring_plan: 'Mỡ máu mỗi 6 tháng',
      last_review_date: '2025-01-08',
      created_at: '2024-02-10T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
  ],
}

export function getDemoChronicDiseases(
  userId: string
): Partial<ChronicDisease>[] {
  return chronicDiseases[userId] ?? []
}

// ─── Medications ─────────────────────────────────────────────────────────────

const medications: Record<string, Partial<Medication>[]> = {
  [MINH]: [
    { id: 'med-m-001', citizen_id: MINH, drug_name: 'Metformin', dosage: '850mg', frequency: '2 lần/ngày', instructions: 'Uống sau ăn', is_active: true, start_date: '2024-06-15', created_at: '2024-06-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
    { id: 'med-m-002', citizen_id: MINH, drug_name: 'Amlodipine', dosage: '5mg', frequency: '1 lần/ngày', instructions: 'Uống buổi sáng', is_active: true, start_date: '2024-01-10', created_at: '2024-01-10T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
    { id: 'med-m-003', citizen_id: MINH, drug_name: 'Atorvastatin', dosage: '10mg', frequency: '1 lần/ngày', instructions: 'Uống buổi tối', is_active: true, start_date: '2024-03-20', created_at: '2024-03-20T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
    { id: 'med-m-004', citizen_id: MINH, drug_name: 'Aspirin', dosage: '81mg', frequency: '1 lần/ngày', instructions: 'Uống sau ăn trưa', is_active: true, start_date: '2024-01-10', created_at: '2024-01-10T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
    { id: 'med-m-005', citizen_id: MINH, drug_name: 'Omeprazole', dosage: '20mg', frequency: '1 lần/ngày', instructions: 'Uống trước ăn sáng 30 phút', is_active: true, start_date: '2025-01-15', created_at: '2025-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
  ],
  [LAN]: [
    { id: 'med-l-001', citizen_id: LAN, drug_name: 'Calcium-D', dosage: '500mg', frequency: '2 lần/ngày', instructions: 'Uống sau ăn', is_active: true, start_date: '2022-06-10', created_at: '2022-06-10T00:00:00Z', updated_at: '2025-01-10T00:00:00Z' },
  ],
  [DUC]: [
    { id: 'med-d-001', citizen_id: DUC, drug_name: 'Allopurinol', dosage: '300mg', frequency: '1 lần/ngày', instructions: 'Uống sau ăn', is_active: true, start_date: '2024-10-05', created_at: '2024-10-05T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
    { id: 'med-d-002', citizen_id: DUC, drug_name: 'Colchicine', dosage: '0.5mg', frequency: 'Khi cần', instructions: 'Uống khi có đợt gút cấp', is_active: true, start_date: '2024-05-20', created_at: '2024-05-20T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
    { id: 'med-d-003', citizen_id: DUC, drug_name: 'Fenofibrate', dosage: '160mg', frequency: '1 lần/ngày', instructions: 'Uống cùng bữa ăn', is_active: true, start_date: '2020-04-05', created_at: '2020-04-05T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
    { id: 'med-d-004', citizen_id: DUC, drug_name: 'Omeprazole', dosage: '20mg', frequency: '1 lần/ngày', instructions: 'Uống trước ăn sáng', is_active: true, start_date: '2024-05-20', created_at: '2024-05-20T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  ],
}

export function getDemoMedications(userId: string): Partial<Medication>[] {
  return medications[userId] ?? []
}

// ─── Trend Data (for timeline/trends) ────────────────────────────────────────

export interface TrendPoint {
  date: string
  value: number
  unit: string
  referenceRange: string | null
}

export function getDemoTrendData(userId: string, testName: string): TrendPoint[] {
  const userLabs = labTests[userId] ?? []
  const lower = testName.toLowerCase()
  return userLabs
    .filter((l) => l.test_name?.toLowerCase().includes(lower))
    .map((l) => ({
      date: l.test_date!,
      value: parseFloat(l.result_value ?? '0'),
      unit: l.unit ?? '',
      referenceRange: l.reference_range ?? null,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// ─── Family ──────────────────────────────────────────────────────────────────

const families: Record<string, Partial<Family>[]> = {
  [MINH]: [
    {
      id: 'fam-demo-001',
      name: 'Gia đình Nguyễn Văn Minh',
      family_doctor_name: 'BS. Nguyễn Hải',
      family_doctor_phone: '0901000005',
      address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
      created_by: MINH,
      created_at: '2024-01-20T00:00:00Z',
    },
  ],
  [LAN]: [
    {
      id: 'fam-demo-001',
      name: 'Gia đình Nguyễn Văn Minh',
      family_doctor_name: 'BS. Nguyễn Hải',
      family_doctor_phone: '0901000005',
      address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
      created_by: MINH,
      created_at: '2024-01-20T00:00:00Z',
    },
  ],
  [TUAN]: [
    {
      id: 'fam-demo-001',
      name: 'Gia đình Nguyễn Văn Minh',
      family_doctor_name: 'BS. Nguyễn Hải',
      family_doctor_phone: '0901000005',
      address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
      created_by: MINH,
      created_at: '2024-01-20T00:00:00Z',
    },
  ],
  [DUC]: [
    {
      id: 'fam-demo-002',
      name: 'Gia đình Phạm Văn Đức',
      family_doctor_name: null,
      family_doctor_phone: null,
      address: 'Thôn Phù Linh, xã Phù Linh, huyện Sóc Sơn, Hà Nội',
      created_by: DUC,
      created_at: '2024-03-01T00:00:00Z',
    },
  ],
}

const familyMemberships: Record<string, { family_id: string; role: string; families: Partial<Family> }[]> = {
  [MINH]: [
    { family_id: 'fam-demo-001', role: 'owner', families: families[MINH]![0]! },
  ],
  [LAN]: [
    { family_id: 'fam-demo-001', role: 'member', families: families[MINH]![0]! },
  ],
  [TUAN]: [
    { family_id: 'fam-demo-001', role: 'manager', families: families[MINH]![0]! },
  ],
  [DUC]: [
    { family_id: 'fam-demo-002', role: 'owner', families: families[DUC]![0]! },
  ],
}

export function getDemoFamilyMemberships(userId: string) {
  return familyMemberships[userId] ?? []
}

const familyMembers: Record<string, Partial<FamilyMember & { citizen: Partial<Citizen> }>[]> = {
  'fam-demo-001': [
    {
      id: 'fm-001', citizen_id: MINH, family_id: 'fam-demo-001', role: 'owner',
      relationship: 'Chủ hộ', permissions: { can_view: true, can_edit: true, can_upload: true },
      joined_at: '2024-01-20T00:00:00Z',
      citizen: { id: MINH, full_name: 'Nguyễn Văn Minh', phone: '0901000001' },
    },
    {
      id: 'fm-002', citizen_id: LAN, family_id: 'fam-demo-001', role: 'member',
      relationship: 'Vợ', permissions: { can_view: true, can_edit: true, can_upload: true },
      joined_at: '2024-01-20T00:00:00Z',
      citizen: { id: LAN, full_name: 'Trần Thị Lan', phone: '0901000002' },
    },
    {
      id: 'fm-003', citizen_id: TUAN, family_id: 'fam-demo-001', role: 'manager',
      relationship: 'Con trai', permissions: { can_view: true, can_edit: true, can_upload: true },
      joined_at: '2024-02-01T00:00:00Z',
      citizen: { id: TUAN, full_name: 'Nguyễn Tuấn', phone: '0901000003' },
    },
  ],
  'fam-demo-002': [
    {
      id: 'fm-004', citizen_id: DUC, family_id: 'fam-demo-002', role: 'owner',
      relationship: 'Chủ hộ', permissions: { can_view: true, can_edit: true, can_upload: true },
      joined_at: '2024-03-01T00:00:00Z',
      citizen: { id: DUC, full_name: 'Phạm Văn Đức', phone: '0901000004' },
    },
  ],
}

export function getDemoFamilyMembers(familyId: string) {
  return familyMembers[familyId] ?? []
}

// ─── Visit Preparations ──────────────────────────────────────────────────────

const visitPreparations: Record<string, Partial<VisitPreparation>[]> = {
  [MINH]: [
    {
      id: 'vp-m-001', citizen_id: MINH, specialty: 'Nội tiết',
      symptoms: ['Khát nước nhiều', 'Tiểu đêm 2-3 lần'],
      symptom_description: 'Gần đây hay khát nước, tiểu đêm nhiều hơn',
      questions_for_doctor: ['HbA1c có cần điều chỉnh thuốc không?', 'Có cần đổi loại thuốc tiểu đường?'],
      ai_summary: '**Tóm tắt chuẩn bị khám Nội tiết**\n\nBệnh nhân nam, 62 tuổi, tiền sử đái tháo đường type 2 từ 2018, hiện đang dùng Metformin 850mg x2/ngày.\n\n**Triệu chứng hiện tại:** Khát nước nhiều, tiểu đêm 2-3 lần - có thể gợi ý kiểm soát đường huyết chưa tối ưu.\n\n**Kết quả gần nhất:**\n- HbA1c: 6.8% (15/01/2025) - cải thiện so với 7.2% (07/2024)\n- Glucose lúc đói: 7.2 mmol/L\n\n**Đề xuất hỏi bác sĩ:**\n1. Đánh giá lại liều Metformin\n2. Xem xét bổ sung GLP-1 nếu cần\n3. Tần suất theo dõi đường huyết tại nhà',
      ai_summary_citations: [],
      status: 'ai_generated',
      created_at: '2025-01-20T08:00:00Z', updated_at: '2025-01-20T08:00:00Z',
    },
    {
      id: 'vp-m-002', citizen_id: MINH, specialty: 'Tim mạch',
      symptoms: ['Đau tức ngực nhẹ khi gắng sức', 'Huyết áp không ổn định'],
      symptom_description: 'Thỉnh thoảng đau tức ngực khi leo cầu thang, huyết áp dao động',
      questions_for_doctor: ['Có cần làm điện tim gắng sức?', 'Huyết áp mục tiêu bao nhiêu?'],
      ai_summary: '**Tóm tắt chuẩn bị khám Tim mạch**\n\nBệnh nhân nam, 62 tuổi, tăng huyết áp từ 2016, đang dùng Amlodipine 5mg.\n\n**Triệu chứng:** Đau tức ngực nhẹ khi gắng sức, huyết áp dao động.\n\n**Huyết áp gần nhất:** 130/82 mmHg (15/01/2025)\n\n**Yếu tố nguy cơ:** Đái tháo đường, rối loạn lipid, tiền sử hút thuốc.\n\n**Đề xuất:** Cân nhắc điện tim gắng sức, đánh giá nguy cơ tim mạch tổng thể.',
      ai_summary_citations: [],
      status: 'ai_generated',
      created_at: '2025-01-22T10:00:00Z', updated_at: '2025-01-22T10:00:00Z',
    },
  ],
}

export function getDemoVisitPreps(userId: string): Partial<VisitPreparation>[] {
  return visitPreparations[userId] ?? []
}

// ─── AI Summary ──────────────────────────────────────────────────────────────

export function getDemoAiSummary(userId: string) {
  if (userId === MINH) {
    return {
      summary: `**Tóm tắt sức khỏe - Nguyễn Văn Minh (62 tuổi)**

**Bệnh lý mạn tính:**
1. Đái tháo đường type 2 (từ 2018): Kiểm soát khá tốt, HbA1c giảm từ 7.2% (07/2024) xuống 6.8% (01/2025)
2. Tăng huyết áp (từ 2016): Huyết áp ổn định 130/82 mmHg với Amlodipine 5mg
3. Rối loạn lipid máu (từ 2023): Cholesterol toàn phần cải thiện 4.8 mmol/L, triglyceride còn cao 2.1 mmol/L

**Xu hướng tích cực:**
- HbA1c giảm liên tục qua 3 quý (7.2% → 7.0% → 6.8%)
- Huyết áp được kiểm soát tốt hơn
- Chức năng thận bình thường (Creatinine 90 µmol/L)
- Chức năng gan bình thường (GOT 28, GPT 32)

**Cần theo dõi:**
- Triglyceride vẫn cao, cần điều chỉnh chế độ ăn
- Duy trì lối sống lành mạnh: đi bộ, giảm tinh bột

**Lịch khám tiếp theo:** Dự kiến tháng 4/2025 (khám định kỳ 3 tháng)`,
      citations: [
        { recordId: 'lab-m-001', value: '6.8', unit: '%', date: '2025-01-15', category: 'HbA1c' },
        { recordId: 'lab-m-004', value: '2.1', unit: 'mmol/L', date: '2025-01-15', category: 'Triglyceride' },
      ],
      disclaimer: 'Thông tin này chỉ mang tính tổng hợp từ dữ liệu bạn cung cấp. AI không chẩn đoán bệnh và không thay thế bác sĩ.',
    }
  }
  return null
}

// ─── Feedback ────────────────────────────────────────────────────────────────

const feedbacks: Record<string, Partial<Feedback>[]> = {
  [MINH]: [
    {
      id: 'fb-001', user_id: MINH, category: 'general',
      title: 'Ứng dụng rất hữu ích', content: 'Tôi thấy ứng dụng giúp theo dõi sức khỏe rất tiện lợi, đặc biệt là phần dòng thời gian.',
      status: 'resolved', admin_response: 'Cảm ơn bác đã góp ý! Chúng tôi sẽ tiếp tục cải thiện.',
      responded_at: '2025-01-18T10:00:00Z',
      created_at: '2025-01-16T08:00:00Z', updated_at: '2025-01-18T10:00:00Z',
    },
  ],
  [DUC]: [
    {
      id: 'fb-002', user_id: DUC, category: 'ui_suggestion',
      title: 'Chữ hơi nhỏ', content: 'Ở trang xem kết quả xét nghiệm, chữ hơi nhỏ, mắt tôi kém nên đọc khó.',
      status: 'reviewing', admin_response: null, responded_at: null,
      created_at: '2025-01-20T14:00:00Z', updated_at: '2025-01-20T14:00:00Z',
    },
  ],
}

export function getDemoFeedbacks(userId: string): Partial<Feedback>[] {
  return feedbacks[userId] ?? []
}

// ─── Admin: Audit Logs ──────────────────────────────────────────────────────

const auditLogs: (Partial<AuditLog> & { user_name: string })[] = [
  {
    id: 'al-001', user_id: MINH, action: 'upload_document', target_table: 'source_documents',
    target_id: 'doc-m-001', details: { filename: 'xet-nghiem-mau-15012025.pdf' },
    created_at: '2025-01-15T10:30:00Z', user_name: 'Nguyễn Văn Minh',
  },
  {
    id: 'al-002', user_id: MINH, action: 'generate_summary', target_table: 'confirmed_records',
    target_id: MINH, details: { recordCount: 12 },
    created_at: '2025-01-15T11:00:00Z', user_name: 'Nguyễn Văn Minh',
  },
  {
    id: 'al-003', user_id: LAN, action: 'upload_document', target_table: 'source_documents',
    target_id: 'doc-l-001', details: { filename: 'xet-nghiem-loang-xuong-10012025.pdf' },
    created_at: '2025-01-10T09:00:00Z', user_name: 'Trần Thị Lan',
  },
  {
    id: 'al-004', user_id: DUC, action: 'upload_document', target_table: 'source_documents',
    target_id: 'doc-d-001', details: { filename: 'xet-nghiem-acid-uric-08012025.pdf' },
    created_at: '2025-01-08T10:00:00Z', user_name: 'Phạm Văn Đức',
  },
  {
    id: 'al-005', user_id: MINH, action: 'create_visit_prep', target_table: 'visit_preparations',
    target_id: 'vp-m-001', details: { specialty: 'Nội tiết', symptomCount: 2 },
    created_at: '2025-01-20T08:00:00Z', user_name: 'Nguyễn Văn Minh',
  },
  {
    id: 'al-006', user_id: TUAN, action: 'view_family_member', target_table: 'family_members',
    target_id: 'fm-001', details: { familyId: 'fam-demo-001' },
    created_at: '2025-01-19T15:00:00Z', user_name: 'Nguyễn Tuấn',
  },
  {
    id: 'al-007', user_id: DUC, action: 'create_feedback', target_table: 'feedbacks',
    target_id: 'fb-002', details: { category: 'ui_suggestion' },
    created_at: '2025-01-20T14:00:00Z', user_name: 'Phạm Văn Đức',
  },
  {
    id: 'al-008', user_id: ADMIN, action: 'respond_feedback', target_table: 'feedbacks',
    target_id: 'fb-001', details: { action: 'resolved' },
    created_at: '2025-01-18T10:00:00Z', user_name: 'Admin AIVIHE',
  },
]

export function getDemoAuditLogs(page = 1, limit = 20) {
  const total = auditLogs.length
  const start = (page - 1) * limit
  const logs = auditLogs.slice(start, start + limit)
  return { logs, total, page, limit }
}

// ─── Admin: Stats ────────────────────────────────────────────────────────────

export function getDemoAdminStats() {
  return {
    total_users: 6,
    total_documents: 17,
    total_visits: 31,
    documents_today: 0,
  }
}

// ─── Admin: Users list ───────────────────────────────────────────────────────

export function getDemoAdminUsers(page = 1, limit = 20, search = '') {
  let list = Object.values(citizens).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    phone: c.phone,
    email: c.email,
    created_at: c.created_at,
    document_count: (sourceDocuments[c.id] ?? []).length,
  }))

  if (search.trim()) {
    const s = search.toLowerCase()
    list = list.filter(
      (u) =>
        u.full_name.toLowerCase().includes(s) ||
        u.phone.includes(s)
    )
  }

  const total = list.length
  const start = (page - 1) * limit
  const users = list.slice(start, start + limit)
  return { users, total, page, limit }
}
