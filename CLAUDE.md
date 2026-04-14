# CLAUDE.md

This file provides guidance to Claude Code when working with the AIVIHE codebase.

@AGENTS.md

## Project Identity

**AIVIHE** = AI · VI · HE = Artificial Intelligence · Vietnam · Health
Health Data Backbone cho hệ sinh thái Thong Dong Life.

**Vai trò**: Nền tảng dữ liệu sức khỏe tổng thể — Customer Master + Medical EMR + AI Engine.
**Nguyên tắc cốt lõi**: Một khách hàng – một mã TDL – một hồ sơ chung – 11 tabs – dữ liệu liên thông.

## 10 Modules

1. **Customer Master** — mã TDL, hồ sơ hành chính, phân loại khách hàng
2. **Health Summary** — hồ sơ sức khỏe chung, cảnh báo nhanh, summary cho Daycare
3. **Family Doctor EMR** — khám, bệnh sử, chẩn đoán, bệnh mạn tính, kế hoạch theo dõi
4. **Rehab EMR** — đánh giá chức năng, trị liệu, tiến triển PHCN
5. **Vitals Tracking** — time-series chỉ số, biểu đồ, rule cảnh báo ngưỡng
6. **Medication Management** — danh mục thuốc, nhắc thuốc, xác nhận dùng thuốc
7. **Care Plan Engine** — kế hoạch chăm sóc tích hợp liên ngành
8. **Alert Engine** — cảnh báo theo rule, log sự cố, escalation
9. **Family Portal** — báo cáo gia đình, thông báo, lịch hẹn
10. **Device Integration** — wearable, box y tế, smartbed

## Integration with Thong Dong Daycare

- Daycare = repo riêng (`D:\_Project\Thong dong Care\`), kết nối qua REST API + Webhooks
- AIVIHE = master identity + health data; Daycare = daily operations
- TDL Customer Code: `TDL-{location}-{sequence}` (ví dụ: TDL-HN-000001)
- Webhook events: daily_summary, vital_recorded, medication_log, incident_reported
- HMAC SHA256 + idempotency key cho tất cả webhooks
- Spec: `../docs/specs/Thong_Dong_Daycare_AIVIHe_Integrated_System_Spec.md`

## Tech Stack

- **Frontend + Backend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Database + Auth + Storage**: Supabase (PostgreSQL + Phone OTP Auth + Storage)
- **AI**: Claude API (Vision OCR + Text summaries)
- **Charts**: Recharts · **PDF**: @react-pdf/renderer
- **Deploy**: Vercel + Supabase Cloud

## Hard Rules (NON-NEGOTIABLE)

1. AI CANNOT diagnose or prescribe — chỉ tổng hợp, giải thích, gợi ý
2. User MUST confirm before AI-extracted data is saved
3. Every record MUST link to source document (3-layer traceability)
4. Every AI summary MUST cite source
5. Audit log for ALL CUD operations
6. 3 mandatory sentences displayed consistently
7. Vietnamese-first, elder-friendly: font ≥18px, touch ≥48px, high contrast

## 3 Mandatory Sentences

1. "Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình."
2. "AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh."
3. "Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ."

## RBAC — 12 Roles

super_admin, director, branch_director, admin, doctor, specialist (PHCN), nurse, reception, daycare_coordinator, daycare_staff, member, viewer (family)

Field-level permissions per tab — xem bảng phân quyền trong spec.

## Development Rules

- **File Naming**: kebab-case, descriptive names
- **File Size**: Under 200 lines, modularize if larger
- **Validation**: Zod for all inputs, API routes, AI outputs
- **Error Handling**: try-catch, Vietnamese error messages
- **Commits**: Conventional format (feat:, fix:, docs:)
- **No secrets in git**, no mocks/fakes
- **YAGNI · KISS · DRY**

## Documentation

Keep `./docs` updated after every feature:
- project-overview-pdr.md, code-standards.md, codebase-summary.md
- design-guidelines.md, deployment-guide.md, system-architecture.md, development-roadmap.md

## Database 3-Layer Architecture

- **Layer 1**: source_documents (immutable originals)
- **Layer 2**: extracted_records → confirmed_records (AI + user verified)
- **Layer 3**: AI summaries with citations back to Layer 1 & 2
