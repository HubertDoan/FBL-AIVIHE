'use client'

// Visualizer quy trình dịch vụ end-to-end — 4 loại dịch vụ chính
// Mỗi flow: 12 bước từ tiếp thị → đăng ký → sử dụng → gia hạn
// Dành cho Director tab "Quy trình dịch vụ"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Globe, Phone, UserCheck, Crown, UserPlus, LogIn,
  CreditCard, ShieldCheck, Star, RefreshCw,
  Stethoscope, Home, Activity, Hospital,
  CheckCircle2, Clock, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type StepRole = 'member' | 'reception' | 'director' | 'doctor' | 'system'

interface FlowStep {
  id: number
  title: string
  description: string
  role: StepRole
  dbStatus?: string          // trạng thái DB liên quan
  actionLink?: string        // link tới trang xử lý
  icon: React.ComponentType<{ className?: string }>
}

interface ServiceFlow {
  key: string
  label: string
  color: string             // Tailwind color class (teal/emerald/blue/violet)
  bgColor: string
  borderColor: string
  icon: React.ComponentType<{ className?: string }>
  steps: FlowStep[]
}

// ── Role badges ───────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<StepRole, { label: string; className: string }> = {
  member:    { label: 'Khách hàng',   className: 'bg-teal-100 text-teal-800 border-teal-200' },
  reception: { label: 'Hành chính',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  director:  { label: 'Giám đốc',     className: 'bg-purple-100 text-purple-800 border-purple-200' },
  doctor:    { label: 'Bác sĩ',       className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  system:    { label: 'Hệ thống',     className: 'bg-gray-100 text-gray-700 border-gray-200' },
}

// ── Shared steps (bước 1–9 giống nhau cho mọi dịch vụ) ───────────────────────

function buildCommonSteps(serviceLabel: string): FlowStep[] {
  return [
    {
      id: 1,
      title: 'Tiếp cận',
      description: `KH biết tới ${serviceLabel} qua website, Facebook, hoặc giới thiệu từ người thân.`,
      role: 'member',
      icon: Globe,
    },
    {
      id: 2,
      title: 'Đăng ký tư vấn',
      description: 'KH điền form tư vấn trên web hoặc gọi hotline. Tạo consultation_request.',
      role: 'member',
      dbStatus: 'consultation_requests.status = pending',
      actionLink: '/dashboard/reception',
      icon: Phone,
    },
    {
      id: 3,
      title: 'Hành chính xác minh',
      description: 'Hành chính gọi điện xác minh thông tin, bổ sung địa chỉ, nhu cầu, tình trạng sức khỏe sơ bộ.',
      role: 'reception',
      dbStatus: 'consultation_requests.status = info_completed',
      actionLink: '/dashboard/reception',
      icon: Phone,
    },
    {
      id: 4,
      title: 'Trình Giám đốc duyệt',
      description: 'Hành chính trình hồ sơ lên GĐ. GĐ xem xét và phê duyệt tiếp nhận thành viên.',
      role: 'director',
      dbStatus: 'consultation_requests.status = approved',
      actionLink: '/dashboard/director#member-approval',
      icon: Crown,
    },
    {
      id: 5,
      title: 'Tạo tài khoản KH',
      description: 'Hành chính tạo tài khoản, cấp mã TDL, gửi email thông báo username/mật khẩu cho KH.',
      role: 'reception',
      dbStatus: 'citizens.role = member',
      actionLink: '/dashboard/admin',
      icon: UserPlus,
    },
    {
      id: 6,
      title: 'KH đăng nhập & cập nhật',
      description: 'KH đăng nhập lần đầu, cập nhật hồ sơ cá nhân: thông tin y tế, bệnh nền, thuốc đang dùng.',
      role: 'member',
      dbStatus: 'health_profiles, citizens',
      actionLink: '/dashboard/profile',
      icon: LogIn,
    },
    {
      id: 7,
      title: 'Đăng ký gói dịch vụ',
      description: `KH chọn gói ${serviceLabel} và gửi yêu cầu đăng ký dịch vụ.`,
      role: 'member',
      dbStatus: 'service_enrollments.status = pending',
      actionLink: '/dashboard/services',
      icon: Star,
    },
    {
      id: 8,
      title: 'Xác nhận thanh toán',
      description: 'KH chuyển khoản hoặc quét QR SePay. Hành chính xác nhận thanh toán trong hệ thống.',
      role: 'reception',
      dbStatus: 'service_enrollments.status = payment_confirmed',
      actionLink: '/dashboard/reception',
      icon: CreditCard,
    },
    {
      id: 9,
      title: 'Kích hoạt dịch vụ',
      description: 'Hệ thống tự động kích hoạt gói dịch vụ sau khi thanh toán được xác nhận.',
      role: 'system',
      dbStatus: 'service_enrollments.status = active',
      icon: ShieldCheck,
    },
  ]
}

// ── Service-specific steps (bước 10) ─────────────────────────────────────────

const FAMILY_DOCTOR_USAGE_STEPS: FlowStep[] = [
  {
    id: 10,
    title: 'Chọn & kết nối BS gia đình',
    description: 'KH chọn BS gia đình từ danh sách. GĐ phê duyệt phân công. BS có thể bắt đầu khám / tư vấn.',
    role: 'director',
    dbStatus: 'family_doctor_registrations.status = approved',
    actionLink: '/dashboard/director#family-doctor',
    icon: Stethoscope,
  },
  {
    id: 11,
    title: 'Khám & tư vấn định kỳ',
    description: 'BS thực hiện khám, ghi EMR, tư vấn sức khỏe. KH có thể hỏi BS qua tin nhắn bảo mật.',
    role: 'doctor',
    dbStatus: 'health_records, consultations',
    actionLink: '/dashboard/consultation',
    icon: Stethoscope,
  },
]

const DAYCARE_USAGE_STEPS: FlowStep[] = [
  {
    id: 10,
    title: 'Lịch sinh hoạt Daycare',
    description: 'KH được xếp vào lịch sinh hoạt tại trung tâm. Check-in/check-out hàng ngày.',
    role: 'reception',
    dbStatus: 'daycare_schedules, check_in_logs',
    actionLink: '/dashboard/health-record?tab=daycare',
    icon: Home,
  },
  {
    id: 11,
    title: 'Đo chỉ số & ghi chú',
    description: 'Điều dưỡng đo huyết áp, SpO2, đường huyết. Ghi chú hoạt động, ăn uống, tâm trạng.',
    role: 'doctor',
    dbStatus: 'vitals_records, daily_notes',
    actionLink: '/dashboard/vitals',
    icon: Activity,
  },
]

const REHAB_USAGE_STEPS: FlowStep[] = [
  {
    id: 10,
    title: 'Đánh giá & lập kế hoạch PHCN',
    description: 'BS/KTV PHCN đánh giá chức năng ban đầu, lập kế hoạch trị liệu cá nhân hóa.',
    role: 'doctor',
    dbStatus: 'rehab_assessments, rehab_plans',
    actionLink: '/dashboard/health-record?tab=rehab',
    icon: Activity,
  },
  {
    id: 11,
    title: 'Buổi trị liệu & tiến triển',
    description: 'KTV thực hiện các buổi trị liệu, ghi nhận tiến triển theo từng mục tiêu chức năng.',
    role: 'doctor',
    dbStatus: 'rehab_sessions, rehab_progress',
    actionLink: '/dashboard/health-record?tab=rehab',
    icon: Activity,
  },
]

const SPECIALIST_USAGE_STEPS: FlowStep[] = [
  {
    id: 10,
    title: 'Tham vấn & đặt lịch khám',
    description: 'BS gia đình tham vấn, đặt lịch với BS chuyên khoa phù hợp theo tình trạng KH.',
    role: 'doctor',
    dbStatus: 'exam_registrations.status = scheduled',
    actionLink: '/dashboard/visit-prep',
    icon: Hospital,
  },
  {
    id: 11,
    title: 'Khám chuyên khoa & kết quả',
    description: 'KH đi khám, BS ghi kết quả, xét nghiệm, chẩn đoán, đơn thuốc vào hệ thống EMR.',
    role: 'doctor',
    dbStatus: 'exam_records, prescriptions',
    actionLink: '/dashboard/health-record?tab=clinic',
    icon: Hospital,
  },
]

// Bước 12 — chung (đánh giá + gia hạn)
const CLOSING_STEPS: FlowStep[] = [
  {
    id: 12,
    title: 'Đánh giá & phản hồi',
    description: 'KH gửi đánh giá dịch vụ. Hành chính tổng hợp phản hồi gửi lên GĐ.',
    role: 'member',
    dbStatus: 'feedback_submissions',
    actionLink: '/dashboard/feedback',
    icon: Star,
  },
  {
    id: 13,
    title: 'Gia hạn / Nâng cấp gói',
    description: 'Hành chính liên hệ nhắc gia hạn trước 30 ngày. KH chọn gia hạn hoặc nâng cấp gói dịch vụ.',
    role: 'reception',
    dbStatus: 'service_enrollments.renewal_date',
    actionLink: '/dashboard/reception',
    icon: RefreshCw,
  },
]

// ── Build full flows ───────────────────────────────────────────────────────────

function buildFlow(
  key: string,
  label: string,
  color: string,
  bgColor: string,
  borderColor: string,
  FlowIcon: React.ComponentType<{ className?: string }>,
  usageSteps: FlowStep[],
): ServiceFlow {
  return {
    key, label, color, bgColor, borderColor,
    icon: FlowIcon,
    steps: [
      ...buildCommonSteps(label),
      ...usageSteps,
      ...CLOSING_STEPS,
    ],
  }
}

const SERVICE_FLOWS: ServiceFlow[] = [
  buildFlow('family-doctor', 'Bác sĩ gia đình', 'text-teal-700', 'bg-teal-50', 'border-teal-200', Stethoscope, FAMILY_DOCTOR_USAGE_STEPS),
  buildFlow('daycare', 'Daycare', 'text-emerald-700', 'bg-emerald-50', 'border-emerald-200', Home, DAYCARE_USAGE_STEPS),
  buildFlow('rehab', 'Phục hồi chức năng', 'text-blue-700', 'bg-blue-50', 'border-blue-200', Activity, REHAB_USAGE_STEPS),
  buildFlow('specialist', 'Khám chuyên khoa', 'text-violet-700', 'bg-violet-50', 'border-violet-200', Hospital, SPECIALIST_USAGE_STEPS),
]

// ── Step card component ───────────────────────────────────────────────────────

function StepCard({ step, isLast, flowBorderColor }: { step: FlowStep; isLast: boolean; flowBorderColor: string }) {
  const roleConfig = ROLE_CONFIG[step.role]
  const Icon = step.icon

  return (
    <div className="flex gap-3">
      {/* Vertical timeline line */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn(
          'size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0',
          step.role === 'member'    && 'bg-teal-600',
          step.role === 'reception' && 'bg-blue-600',
          step.role === 'director'  && 'bg-purple-600',
          step.role === 'doctor'    && 'bg-emerald-600',
          step.role === 'system'    && 'bg-gray-500',
        )}>
          <Icon className="size-4" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1 min-h-[24px]" />}
      </div>

      {/* Content */}
      <Card className={cn('flex-1 mb-3 border', flowBorderColor, 'shadow-none')}>
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">#{step.id}</span>
              <p className="text-sm font-semibold text-gray-900">{step.title}</p>
            </div>
            <Badge variant="outline" className={cn('text-xs shrink-0', roleConfig.className)}>
              {roleConfig.label}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {step.dbStatus && (
              <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                {step.dbStatus}
              </code>
            )}
            {step.actionLink && (
              <a
                href={step.actionLink}
                className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-0.5 font-medium"
              >
                Xử lý <ChevronRight className="size-3" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function EndToEndServiceFlowVisualizer() {
  const [activeFlow, setActiveFlow] = useState<string>('family-doctor')
  const flow = SERVICE_FLOWS.find(f => f.key === activeFlow) ?? SERVICE_FLOWS[0]
  const FlowIcon = flow.icon

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-teal-600" />
          Quy trình dịch vụ end-to-end
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Toàn bộ hành trình từ khi KH biết tới dịch vụ đến khi gia hạn — bao gồm người phụ trách và trạng thái DB ở mỗi bước.
        </p>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(ROLE_CONFIG) as [StepRole, typeof ROLE_CONFIG[StepRole]][]).map(([, cfg]) => (
          <Badge key={cfg.label} variant="outline" className={cn('text-xs', cfg.className)}>
            {cfg.label}
          </Badge>
        ))}
        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
          <Clock className="size-3" /> Vai trò thực hiện
        </span>
      </div>

      {/* Service selector tabs */}
      <div className="flex flex-wrap gap-2">
        {SERVICE_FLOWS.map((sf) => {
          const SfIcon = sf.icon
          const isActive = sf.key === activeFlow
          return (
            <button
              key={sf.key}
              onClick={() => setActiveFlow(sf.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                isActive
                  ? cn(sf.bgColor, sf.borderColor, sf.color, 'shadow-sm')
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              <SfIcon className="size-4" />
              {sf.label}
            </button>
          )
        })}
      </div>

      {/* Flow title */}
      <div className={cn('flex items-center gap-3 p-4 rounded-lg border', flow.bgColor, flow.borderColor)}>
        <div className={cn('size-10 rounded-full flex items-center justify-center', flow.bgColor, 'border-2', flow.borderColor)}>
          <FlowIcon className={cn('size-5', flow.color)} />
        </div>
        <div>
          <p className={cn('font-bold text-base', flow.color)}>Dịch vụ: {flow.label}</p>
          <p className="text-xs text-muted-foreground">{flow.steps.length} bước — từ tiếp cận đến gia hạn</p>
        </div>
        <div className="ml-auto">
          <Badge className={cn('text-sm px-3', flow.bgColor, flow.color, 'border', flow.borderColor)}>
            {flow.steps.length} bước
          </Badge>
        </div>
      </div>

      {/* Timeline steps */}
      <div className="pl-1">
        {flow.steps.map((step, idx) => (
          <StepCard
            key={`${flow.key}-step-${step.id}`}
            step={step}
            isLast={idx === flow.steps.length - 1}
            flowBorderColor={flow.borderColor}
          />
        ))}
      </div>
    </div>
  )
}
