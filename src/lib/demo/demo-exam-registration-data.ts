// In-memory exam registration store for demo mode
// Tracks full workflow: patient → family doctor → reception → exam doctor → payment → results

export type ExamRegistrationStatus =
  | 'submitted'
  | 'doctor_reviewed'
  | 'sent_to_hospital'
  | 'reception_accepted'
  | 'assigned_to_doctor'
  | 'doctor_responded'
  | 'exam_completed'
  | 'payment_pending'
  | 'payment_done'
  | 'results_returned'
  | 'completed'

export interface MedicationReminder {
  drug_name: string      // Tên thuốc
  dosage: string         // Liều dùng (ví dụ: 500mg)
  frequency: string      // Tần suất (ví dụ: 2 lần/ngày)
  duration: string       // Thời gian dùng (ví dụ: 7 ngày)
  notes: string | null   // Ghi chú (uống sau ăn, tránh rượu...)
}

export interface ExamRegistration {
  id: string
  citizen_id: string
  citizen_name: string
  citizen_phone: string
  // Clinical info from patient
  specialties: string[]
  symptoms: string[]
  symptom_description: string
  current_medications: string
  medical_history: string
  questions_for_doctor: string
  // Workflow status
  status: ExamRegistrationStatus
  // Family doctor response
  family_doctor_id: string | null
  family_doctor_name: string | null
  family_doctor_response: string | null
  family_doctor_recommended_specialties: string[] | null
  // Hospital reception
  reception_id: string | null
  reception_accepted_at: string | null
  // Examining doctor
  exam_doctor_id: string | null
  exam_doctor_name: string | null
  exam_plan: string | null
  estimated_time: string | null
  exam_date: string | null
  // Post-exam results (filled by exam doctor after examination)
  exam_results: string | null          // Kết quả khám
  diagnosis: string | null             // Chẩn đoán / Kết luận
  prescription: string | null          // Đơn thuốc (mỗi dòng = 1 thuốc)
  medication_reminders: MedicationReminder[] | null  // Lịch nhắc uống thuốc
  // Payment info (managed by reception)
  payment_amount: number | null        // Số tiền thanh toán (VND)
  payment_status: 'pending' | 'paid' | null
  payment_date: string | null
  // Timestamps
  created_at: string
  updated_at: string
}

// Demo account IDs
const MINH_ID = 'demo-0001-0000-0000-000000000001'
const DUC_ID = 'demo-0004-0000-0000-000000000004'
const BS_HAI_ID = 'demo-0005-0000-0000-000000000005'
const RECEPTION_MAI_ID = 'demo-0011-0000-0000-000000000011'
const EXAM_DOCTOR_NAM_ID = 'demo-0012-0000-0000-000000000012'

let _idCounter = 0
function makeId(): string {
  return `exam-reg-${Date.now()}-${++_idCounter}`
}

// Seeded demo registrations
const _store: ExamRegistration[] = [
  // Minh's registration — full workflow completed (status: completed with all results)
  {
    id: 'exam-reg-demo-0001',
    citizen_id: MINH_ID,
    citizen_name: 'Nguyễn Văn Minh',
    citizen_phone: '0901000001',
    specialties: ['cardiology', 'endocrinology'],
    symptoms: ['Đau ngực khi leo cầu thang', 'Khó thở buổi sáng', 'Đường huyết không ổn định'],
    symptom_description: 'Đau ngực xuất hiện khi gắng sức, khoảng 5-10 phút, tự hết khi nghỉ. Đường huyết sáng thường 8-9 mmol/L dù đã uống thuốc đều.',
    current_medications: 'Metformin 500mg x2/ngày, Amlodipine 5mg x1/ngày, Aspirin 100mg x1/ngày',
    medical_history: 'Tiểu đường type 2 (8 năm), tăng huyết áp (5 năm), không hút thuốc',
    questions_for_doctor: 'Tôi có cần làm thêm xét nghiệm gì không? Thuốc hiện tại có phù hợp không?',
    status: 'completed',
    family_doctor_id: BS_HAI_ID,
    family_doctor_name: 'BS. Nguyễn Hải',
    family_doctor_response: 'Bệnh nhân cần được khám chuyên khoa tim mạch và nội tiết. Các triệu chứng đau ngực khi gắng sức cần được đánh giá kỹ. Đường huyết chưa đạt mục tiêu cần điều chỉnh phác đồ.',
    family_doctor_recommended_specialties: ['cardiology', 'endocrinology'],
    reception_id: RECEPTION_MAI_ID,
    reception_accepted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    exam_doctor_id: EXAM_DOCTOR_NAM_ID,
    exam_doctor_name: 'BS. Trần Văn Nam',
    exam_plan: 'Sẽ khám lâm sàng tim mạch, đo điện tâm đồ, siêu âm tim, xét nghiệm HbA1c và lipid máu. Đánh giá lại phác đồ điều trị đái tháo đường và tăng huyết áp.',
    estimated_time: '9:00 - 10:30, Thứ Hai 25/03/2026',
    exam_date: '2026-03-25',
    exam_results: 'Điện tâm đồ: nhịp xoang đều, 72 lần/phút, không có dấu hiệu thiếu máu cơ tim. Siêu âm tim: chức năng tâm thu bình thường, EF 62%. HbA1c: 8.2% (chưa đạt mục tiêu <7%). Lipid máu: LDL 3.4 mmol/L (cao), HDL 1.1 mmol/L, Triglyceride 2.1 mmol/L.',
    diagnosis: 'Tiểu đường type 2 kiểm soát chưa tốt. Tăng huyết áp độ 1 đã kiểm soát. Rối loạn lipid máu hỗn hợp. Đau ngực khi gắng sức: cần theo dõi thêm, không có bằng chứng thiếu máu cơ tim cấp.',
    prescription: 'Metformin 1000mg | 1 viên | 2 lần/ngày | 30 ngày | Uống sau bữa ăn\nGliclazide MR 60mg | 1 viên | 1 lần/ngày (sáng) | 30 ngày | Uống trong bữa ăn sáng\nRosuvastatin 20mg | 1 viên | 1 lần/ngày (tối) | 30 ngày | Uống buổi tối\nAmlodipine 5mg | 1 viên | 1 lần/ngày | 30 ngày | Tiếp tục liều cũ',
    medication_reminders: [
      { drug_name: 'Metformin 1000mg', dosage: '1 viên', frequency: '2 lần/ngày (sáng + tối)', duration: '30 ngày', notes: 'Uống sau bữa ăn để giảm tác dụng phụ tiêu hóa' },
      { drug_name: 'Gliclazide MR 60mg', dosage: '1 viên', frequency: '1 lần/ngày (sáng)', duration: '30 ngày', notes: 'Uống trong bữa ăn sáng, theo dõi đường huyết' },
      { drug_name: 'Rosuvastatin 20mg', dosage: '1 viên', frequency: '1 lần/ngày (tối)', duration: '30 ngày', notes: 'Tránh uống cùng nước bưởi' },
      { drug_name: 'Amlodipine 5mg', dosage: '1 viên', frequency: '1 lần/ngày', duration: '30 ngày', notes: null },
    ],
    payment_amount: 850000,
    payment_status: 'paid',
    payment_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Duc's registration — just submitted, pending family doctor
  {
    id: 'exam-reg-demo-0002',
    citizen_id: DUC_ID,
    citizen_name: 'Phạm Văn Đức',
    citizen_phone: '0901000004',
    specialties: ['rheumatology'],
    symptoms: ['Đau khớp ngón chân cái', 'Sưng đỏ vào ban đêm', 'Đau dữ dội khi chạm vào'],
    symptom_description: 'Cơn đau gút cấp tái phát, khớp ngón chân cái sưng đỏ, nóng. Cơn đau thường xuất hiện ban đêm sau bữa ăn có hải sản.',
    current_medications: 'Colchicine 0.6mg khi có cơn cấp, Allopurinol 300mg x1/ngày',
    medical_history: 'Bệnh gút (6 năm), rối loạn mỡ máu, không uống rượu',
    questions_for_doctor: 'Thuốc Allopurinol có cần tăng liều không? Tôi có thể ăn hải sản được không?',
    status: 'submitted',
    family_doctor_id: null,
    family_doctor_name: null,
    family_doctor_response: null,
    family_doctor_recommended_specialties: null,
    reception_id: null,
    reception_accepted_at: null,
    exam_doctor_id: null,
    exam_doctor_name: null,
    exam_plan: null,
    estimated_time: null,
    exam_date: null,
    exam_results: null,
    diagnosis: null,
    prescription: null,
    medication_reminders: null,
    payment_amount: null,
    payment_status: null,
    payment_date: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Get registrations based on user role
export function getRegistrations(userId: string, role: string): ExamRegistration[] {
  if (role === 'citizen') {
    return _store.filter((r) => r.citizen_id === userId)
  }
  if (role === 'doctor') {
    // Family doctor sees submitted + their reviewed ones
    return _store.filter(
      (r) => r.status === 'submitted' || r.family_doctor_id === userId
    )
  }
  if (role === 'reception') {
    // Reception sees sent_to_hospital and all post-exam statuses they manage
    return _store.filter((r) =>
      r.status === 'sent_to_hospital' ||
      r.reception_id === userId ||
      ['exam_completed', 'payment_pending', 'payment_done', 'results_returned', 'completed'].includes(r.status)
    )
  }
  if (role === 'exam_doctor') {
    return _store.filter((r) => r.exam_doctor_id === userId || r.status === 'assigned_to_doctor')
  }
  return []
}

export function getRegistrationById(id: string): ExamRegistration | undefined {
  return _store.find((r) => r.id === id)
}

export function createRegistration(
  data: Omit<ExamRegistration, 'id' | 'status' | 'family_doctor_id' | 'family_doctor_name' |
    'family_doctor_response' | 'family_doctor_recommended_specialties' | 'reception_id' |
    'reception_accepted_at' | 'exam_doctor_id' | 'exam_doctor_name' | 'exam_plan' |
    'estimated_time' | 'exam_date' | 'exam_results' | 'diagnosis' | 'prescription' |
    'medication_reminders' | 'payment_amount' | 'payment_status' | 'payment_date' |
    'created_at' | 'updated_at'>
): ExamRegistration {
  const now = new Date().toISOString()
  const reg: ExamRegistration = {
    ...data,
    id: makeId(),
    status: 'submitted',
    family_doctor_id: null,
    family_doctor_name: null,
    family_doctor_response: null,
    family_doctor_recommended_specialties: null,
    reception_id: null,
    reception_accepted_at: null,
    exam_doctor_id: null,
    exam_doctor_name: null,
    exam_plan: null,
    estimated_time: null,
    exam_date: null,
    exam_results: null,
    diagnosis: null,
    prescription: null,
    medication_reminders: null,
    payment_amount: null,
    payment_status: null,
    payment_date: null,
    created_at: now,
    updated_at: now,
  }
  _store.push(reg)
  return reg
}

export function updateRegistration(
  id: string,
  updates: Partial<Omit<ExamRegistration, 'id' | 'created_at'>>
): ExamRegistration | null {
  const reg = _store.find((r) => r.id === id)
  if (!reg) return null
  Object.assign(reg, updates, { updated_at: new Date().toISOString() })
  return reg
}
