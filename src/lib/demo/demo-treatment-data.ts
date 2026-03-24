// In-memory treatment episode store for demo mode
// Tracks ongoing treatments from completed exam registrations

import type { MedicationReminder } from './demo-exam-registration-data'
import type { ExamRegistration } from './demo-exam-registration-data'

export interface HealthLog {
  id: string
  date: string
  blood_pressure: string | null   // e.g. "130/85"
  blood_sugar: string | null      // e.g. "6.8"
  temperature: string | null      // e.g. "36.5"
  weight: string | null
  symptoms: string
  medication_taken: boolean
  notes: string
}

export interface TreatmentMessage {
  id: string
  from_id: string
  from_name: string
  from_role: 'citizen' | 'doctor' | 'exam_doctor'
  content: string
  created_at: string
}

export interface TreatmentEpisode {
  id: string
  citizen_id: string
  exam_registration_id: string
  diagnosis: string
  specialties: string[]
  exam_doctor_name: string
  exam_date: string
  prescription: MedicationReminder[]
  treatment_notes: string
  treatment_duration_days: number
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'follow_up_needed'
  health_logs: HealthLog[]
  messages: TreatmentMessage[]
}

const MINH_ID = 'demo-0001-0000-0000-000000000001'
const BS_HAI_ID = 'demo-0005-0000-0000-000000000005'
const EXAM_DOCTOR_NAM_ID = 'demo-0012-0000-0000-000000000012'

let _counter = 0
function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++_counter}`
}

// Seed data
const _store: TreatmentEpisode[] = [
  // Minh's active treatment — diabetes + hypertension (from exam-reg-demo-0001)
  {
    id: 'treatment-demo-0001',
    citizen_id: MINH_ID,
    exam_registration_id: 'exam-reg-demo-0001',
    diagnosis: 'Tiểu đường type 2 kiểm soát chưa tốt. Tăng huyết áp độ 1. Rối loạn lipid máu hỗn hợp.',
    specialties: ['cardiology', 'endocrinology'],
    exam_doctor_name: 'BS. Trần Văn Nam',
    exam_date: '2026-03-25',
    prescription: [
      { drug_name: 'Metformin 1000mg', dosage: '1 viên', frequency: '2 lần/ngày (sáng + tối)', duration: '30 ngày', notes: 'Uống sau bữa ăn để giảm tác dụng phụ tiêu hóa' },
      { drug_name: 'Gliclazide MR 60mg', dosage: '1 viên', frequency: '1 lần/ngày (sáng)', duration: '30 ngày', notes: 'Uống trong bữa ăn sáng, theo dõi đường huyết' },
      { drug_name: 'Rosuvastatin 20mg', dosage: '1 viên', frequency: '1 lần/ngày (tối)', duration: '30 ngày', notes: 'Tránh uống cùng nước bưởi' },
      { drug_name: 'Amlodipine 5mg', dosage: '1 viên', frequency: '1 lần/ngày', duration: '30 ngày', notes: null },
      { drug_name: 'Aspirin 100mg', dosage: '1 viên', frequency: '1 lần/ngày (sáng)', duration: '30 ngày', notes: 'Uống sau bữa sáng' },
    ],
    treatment_notes: 'Bệnh nhân cần kiểm soát chế độ ăn: giảm tinh bột, tránh đồ ngọt, tăng rau xanh. Tập thể dục nhẹ 30 phút/ngày. Theo dõi đường huyết buổi sáng trước ăn và ghi lại. Tái khám sau 4 tuần hoặc khi có triệu chứng bất thường.',
    treatment_duration_days: 30,
    start_date: '2026-03-25',
    end_date: '2026-04-24',
    status: 'active',
    health_logs: [
      {
        id: 'log-demo-0001',
        date: '2026-03-23',
        blood_pressure: '138/88',
        blood_sugar: '8.2',
        temperature: '36.5',
        weight: '72.5',
        symptoms: 'Cảm thấy mệt nhẹ buổi sáng',
        medication_taken: true,
        notes: 'Ăn sáng sớm hơn thường lệ',
      },
      {
        id: 'log-demo-0002',
        date: '2026-03-24',
        blood_pressure: '135/85',
        blood_sugar: '7.8',
        temperature: '36.4',
        weight: '72.3',
        symptoms: 'Bình thường, không có triệu chứng đặc biệt',
        medication_taken: true,
        notes: '',
      },
      {
        id: 'log-demo-0003',
        date: '2026-03-25',
        blood_pressure: '132/84',
        blood_sugar: '7.5',
        temperature: null,
        weight: null,
        symptoms: '',
        medication_taken: true,
        notes: 'Đường huyết có cải thiện so với tuần trước',
      },
    ],
    messages: [
      {
        id: 'msg-demo-0001',
        from_id: MINH_ID,
        from_name: 'Nguyễn Văn Minh',
        from_role: 'citizen',
        content: 'Thưa BS, tôi có thể ăn cháo yến mạch buổi sáng được không? Và tôi có nên tập đi bộ trước hay sau bữa sáng?',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-demo-0002',
        from_id: BS_HAI_ID,
        from_name: 'BS. Nguyễn Hải',
        from_role: 'doctor',
        content: 'Chào anh Minh! Cháo yến mạch rất tốt cho người tiểu đường vì chỉ số đường huyết thấp. Nên tập đi bộ sau bữa sáng khoảng 30 phút để giúp kiểm soát đường huyết sau ăn hiệu quả hơn. Anh tiếp tục theo dõi đường huyết mỗi sáng nhé!',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  // Minh's completed treatment — gout flare (3 months ago)
  {
    id: 'treatment-demo-0002',
    citizen_id: MINH_ID,
    exam_registration_id: 'exam-reg-demo-gout-old',
    diagnosis: 'Cơn gút cấp khớp ngón chân cái trái. Axit uric máu tăng cao 520 μmol/L.',
    specialties: ['rheumatology'],
    exam_doctor_name: 'BS. Lê Thị Hoa',
    exam_date: '2025-12-10',
    prescription: [
      { drug_name: 'Colchicine 0.6mg', dosage: '1 viên', frequency: '2 lần/ngày', duration: '7 ngày', notes: 'Uống trong 7 ngày đầu cơn cấp' },
      { drug_name: 'Allopurinol 300mg', dosage: '1 viên', frequency: '1 lần/ngày', duration: '14 ngày', notes: 'Bắt đầu sau khi cơn cấp đã qua (sau 7 ngày)' },
      { drug_name: 'Naproxen 500mg', dosage: '1 viên', frequency: '2 lần/ngày (sáng + tối)', duration: '5 ngày', notes: 'Uống sau ăn, không uống khi đói' },
    ],
    treatment_notes: 'Kiêng hoàn toàn hải sản, nội tạng động vật, bia rượu trong thời gian điều trị. Uống nhiều nước (2-3 lít/ngày). Nghỉ ngơi, tránh đứng lâu. Chườm lạnh vùng khớp sưng 20 phút/lần.',
    treatment_duration_days: 14,
    start_date: '2025-12-10',
    end_date: '2025-12-24',
    status: 'completed',
    health_logs: [],
    messages: [],
  },
]

export function getTreatments(citizenId: string): TreatmentEpisode[] {
  return _store.filter((t) => t.citizen_id === citizenId)
}

export function getTreatmentById(id: string): TreatmentEpisode | undefined {
  return _store.find((t) => t.id === id)
}

export function addHealthLog(treatmentId: string, log: Omit<HealthLog, 'id'>): HealthLog | null {
  const treatment = _store.find((t) => t.id === treatmentId)
  if (!treatment) return null
  const newLog: HealthLog = { ...log, id: makeId('log') }
  treatment.health_logs.push(newLog)
  return newLog
}

export function addMessage(treatmentId: string, msg: Omit<TreatmentMessage, 'id' | 'created_at'>): TreatmentMessage | null {
  const treatment = _store.find((t) => t.id === treatmentId)
  if (!treatment) return null
  const newMsg: TreatmentMessage = { ...msg, id: makeId('msg'), created_at: new Date().toISOString() }
  treatment.messages.push(newMsg)
  return newMsg
}

export function updateTreatmentStatus(treatmentId: string, status: TreatmentEpisode['status']): TreatmentEpisode | null {
  const treatment = _store.find((t) => t.id === treatmentId)
  if (!treatment) return null
  treatment.status = status
  return treatment
}

export function createTreatmentFromExam(exam: ExamRegistration): TreatmentEpisode | null {
  if (!exam.diagnosis || !exam.medication_reminders || !exam.exam_date) return null
  const durationDays = 30
  const startDate = exam.exam_date
  const endDate = new Date(new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  const episode: TreatmentEpisode = {
    id: makeId('treatment'),
    citizen_id: exam.citizen_id,
    exam_registration_id: exam.id,
    diagnosis: exam.diagnosis,
    specialties: exam.specialties,
    exam_doctor_name: exam.exam_doctor_name ?? 'BS. Chuyên khoa',
    exam_date: exam.exam_date,
    prescription: exam.medication_reminders,
    treatment_notes: exam.exam_results ?? '',
    treatment_duration_days: durationDays,
    start_date: startDate,
    end_date: endDate,
    status: 'active',
    health_logs: [],
    messages: [],
  }
  _store.push(episode)
  return episode
}
