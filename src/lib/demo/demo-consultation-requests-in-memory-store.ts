// Demo store for patient → doctor consultation requests (4-step wizard)
// Workflow: patient sends question → doctor reviews → answers → patient receives notification

export interface ConsultationRequestToDoctor {
  id: string
  citizen_id: string
  specialty: string                // "Tim mạch" / "Nội tổng quát"...
  target_doctor_id: string | null
  target_doctor_name: string
  question: string
  medical_evidence_tags: string[]  // ["HbA1c", "Metformin", "ĐTĐ"]
  attached_document_ids: string[]
  urgency: 'low' | 'normal' | 'urgent'
  status: 'pending' | 'answered' | 'closed'
  doctor_answer: string | null
  doctor_answered_at: string | null
  follow_up_recommendations: string[]
  created_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __demoConsultationRequestsToDoctor: ConsultationRequestToDoctor[] | undefined
}

const MINH_ID = 'demo-0001-0000-0000-000000000001'

function seedData(): ConsultationRequestToDoctor[] {
  return [
    {
      id: 'cq-1',
      citizen_id: MINH_ID,
      specialty: 'Nội tổng quát',
      target_doctor_id: 'doc-1',
      target_doctor_name: 'BS. Nguyễn Hải',
      question: 'HbA1c của tôi mới đo là 6.8%, tôi đang dùng Metformin 1000mg/ngày. Có cần tăng liều không? Tôi có nên điều chỉnh chế độ ăn như thế nào?',
      medical_evidence_tags: ['HbA1c 6.8%', 'Metformin', 'ĐTĐ type 2'],
      attached_document_ids: [],
      urgency: 'normal',
      status: 'answered',
      doctor_answer: 'Chào anh Minh, HbA1c 6.8% nằm trong mục tiêu điều trị cho bệnh nhân ĐTĐ type 2 nhưng có xu hướng tăng. Tôi đề xuất:\n1. Tăng Metformin lên 1500mg/ngày (chia 2 lần, uống sau ăn)\n2. Chế độ ăn: giảm carb tinh chế (cơm trắng, bánh mì), tăng rau xanh, đạm nạc\n3. Vận động 30 phút/ngày (đi bộ, yoga tại Daycare)\n4. Theo dõi đường huyết đói hàng ngày, ghi chép\n5. Tái khám sau 1 tháng để đánh giá\n\nNếu có tác dụng phụ (đau bụng, tiêu chảy kéo dài) hãy báo ngay.',
      doctor_answered_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      follow_up_recommendations: [
        'Tăng Metformin 1500mg/ngày chia 2 lần',
        'Tái khám sau 1 tháng',
        'Theo dõi đường huyết đói hàng ngày',
      ],
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  ]
}

function getStore(): ConsultationRequestToDoctor[] {
  if (!globalThis.__demoConsultationRequestsToDoctor) {
    globalThis.__demoConsultationRequestsToDoctor = seedData()
  }
  return globalThis.__demoConsultationRequestsToDoctor
}

export function getConsultationRequestsByCitizen(citizenId: string): ConsultationRequestToDoctor[] {
  return getStore().filter(r => r.citizen_id === citizenId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getConsultationRequestsForDoctor(doctorId: string): ConsultationRequestToDoctor[] {
  return getStore().filter(r => r.target_doctor_id === doctorId || !r.target_doctor_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function createConsultationRequestToDoctor(data: {
  citizen_id: string
  specialty: string
  target_doctor_id: string | null
  target_doctor_name: string
  question: string
  medical_evidence_tags: string[]
  attached_document_ids: string[]
  urgency: 'low' | 'normal' | 'urgent'
}): ConsultationRequestToDoctor {
  const req: ConsultationRequestToDoctor = {
    ...data,
    id: `cq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending',
    doctor_answer: null,
    doctor_answered_at: null,
    follow_up_recommendations: [],
    created_at: new Date().toISOString(),
  }
  getStore().unshift(req)
  return req
}

export function answerConsultationRequest(
  id: string,
  answer: string,
  followUp: string[] = []
): ConsultationRequestToDoctor | null {
  const store = getStore()
  const idx = store.findIndex(r => r.id === id)
  if (idx === -1) return null
  store[idx] = {
    ...store[idx],
    status: 'answered',
    doctor_answer: answer,
    doctor_answered_at: new Date().toISOString(),
    follow_up_recommendations: followUp,
  }
  return store[idx]
}
