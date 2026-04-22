# AIVIHE — Project Overview & PDR

**Cập nhật:** 21/04/2026 | **Phiên bản:** 1.2

---

## Identity & Core Purpose

**AIVIHE** = **AI · VI · HE** = Artificial Intelligence · Vietnam · Health

**AIVIHE là nền tảng quản lý thông tin sức khỏe cá nhân** trong hệ sinh thái **Thong Dong Life** — một hệ thống chăm sóc sức khỏe toàn diện cho người cao tuổi.

**3 câu cốt lõi (bắt buộc hiển thị):**
1. *"Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình."*
2. *"AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh."*
3. *"Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ."*

**3 hard rules (NON-NEGOTIABLE):**
1. **AI KHÔNG chẩn đoán hay kê đơn** — chỉ tổng hợp, giải thích, gợi ý dữ liệu có sẵn
2. **User PHẢI xác nhận trước khi AI-extracted data được lưu** — không auto-save
3. **Mọi record phải link nguồn** (3-layer traceability: source → extracted → confirmed)

---

## 10 Modules

| # | Module | Vai Trò | Trạng Thái |
|---|--------|---------|-----------|
| 1 | **Customer Master** | Mã TDL, hồ sơ hành chính, phân loại KH | ✅ Done |
| 2 | **Health Summary** | Tổng hợp thông tin sức khỏe chung, cảnh báo, summary Daycare | ✅ Done |
| 3 | **Family Doctor EMR** | Khám, bệnh sử, chẩn đoán, bệnh mạn tính | 🚧 In Progress |
| 4 | **Rehab EMR** | Đánh giá chức năng, trị liệu PHCN | ⏳ Planned |
| 5 | **Vitals Tracking** | Time-series chỉ số, biểu đồ, rule cảnh báo | 🚧 In Progress |
| 6 | **Medication Management** | Danh mục thuốc, nhắc thuốc, xác nhận | ⏳ Planned |
| 7 | **Care Plan Engine** | Kế hoạch chăm sóc liên ngành | ⏳ Planned |
| 8 | **Alert Engine** | Cảnh báo rule-based, escalation, log | ⏳ Planned |
| 9 | **Family Portal** | Báo cáo gia đình, thông báo, lịch hẹn | ⏳ Planned |
| 10 | **Device Integration** | Wearable, IoT (huyết áp, nhịp tim, SpO₂, glucose) | ⏳ Planned |

---

## RBAC — 12 Roles & Permissions

### Roles
| Role | Scope | Quyền Hạn |
|------|-------|---------|
| **super_admin** | Toàn hệ thống | Quản lý tất cả, phê duyệt đăng ký, config system |
| **director** | GĐ công ty | Phê duyệt, giám sát toàn hệ, dashboard KPI |
| **branch_director** | GĐ chi nhánh | Quản lý chi nhánh, staff, khách hàng |
| **admin** | Quản lý hành chính | Duyệt thành viên, quản lý announcements, thống kê |
| **doctor** | Bác sĩ gia đình | Khám, tư vấn, kê đơn, theo dõi KH |
| **specialist** | Bác sĩ chuyên khoa | Tư vấn chuyên sâu, ghi chép khám |
| **nurse** | Điều dưỡng | Đo chỉ số, ghi chép, nhắc thuốc |
| **reception** | Lễ tân | Tiếp nhận KH, khai hồ sơ ban đầu |
| **manager** | Quản lý vận hành | Giám sát KPI, dashboard stats |
| **member** | Khách hàng/Thành viên | Xem hồ sơ, cập nhật, sử dụng dịch vụ |
| **citizen** | Công dân (chưa duyệt) | Đăng ký, chờ phê duyệt |
| **family_viewer** | Người thân | Xem báo cáo, nhận cảnh báo (read-only) |

### Field-Level Permissions
- **Daycare staff:** R/W only `scope='general_care'`
- **Family doctor:** R/W only `scope='clinical'`
- **Rehab tech:** R/W only `scope='rehab'`
- **Member:** R/W own data + family data with permission
- **Family viewer:** R only shared reports

**Xem chi tiết:** `src/lib/permissions/role-permission-matrix.ts` (34 permissions)

---

## Customer Acquisition — 3 Channels

**Nguyên tắc:** AIVIHE không có điểm tiếp xúc vật lý riêng. Khách hàng tiếp cận qua 3 kênh của hệ sinh thái:

```
┌─────────────────────────────────────────────────────────────┐
│ Landing Page (aivihe.vn)                                    │
│ → Form Đăng Ký Tư Vấn (tên + SĐT)                          │
└──────────┬──────────────────────────────────────────────────┘
           │
     ┌─────┴─────┬─────────────────┬──────────────────────┐
     ▼           ▼                 ▼                      ▼
  Daycare    BSGD Gia Đình    PHCN Phục Hồi       (Tương lai)
  (Kênh 1)    (Kênh 2)         (Kênh 3)            Bệnh Viện
     │           │                 │
     └───────────┴─────────────────┴──────► AIVIHE Account
                                           + Mã TDL
```

| Kênh | Workflow | Khách Hàng |
|-----|----------|-----------|
| **Kênh 1: Daycare** | KH đến Daycare → Lễ tân khai hồ sơ → Mở AIVIHE → Liên thông hàng ngày | Người cao tuổi chăm sóc ban ngày |
| **Kênh 2: BSGD** | KH đến PK → BS khám, đánh giá → Mở AIVIHE → BS theo dõi liên tục | Khách hàng ngoài Daycare |
| **Kênh 3: PHCN** | KH đến PK PHCN → KTV đánh giá → Mở AIVIHE → Lập kế hoạch trị liệu | Khách hàng cần phục hồi chức năng |

---

## Service Packages

| Gói | Tên | Giá | Bao Gồm | Người Cung Cấp |
|-----|-----|-----|---------|-----------------|
| **0** | Cơ Bản | Miễn phí | Lập hồ sơ, cập nhật, AI tóm tắt | Hệ thống |
| **1** | Bác Sĩ Gia Đình | 300k/tháng (6 tháng) | BS gia đình theo dõi, tư vấn, chỉ định | Thong Dong |
| **2** | Phục Hồi Chức Năng | 500k-1M/gói | Trị liệu tại trung tâm hoặc nhà | Thong Dong |
| **3** | Chuyên Khoa Sâu | 300k-500k/lần | BS chuyên khoa, tư vấn, hỗ trợ khám BV | Liên kết BV |

---

## Integration with Thong Dong Daycare

### Architecture
```
Thong Dong Daycare          AIVIHE (Master)
(Prisma + Neon)       ◄──► (Next.js + Supabase)
   │                           │
   └─ REST API ────────────────┘
        + Webhooks (HMAC SHA256)
        + Apikey auth
```

### Integration API Endpoints
| Method | Path | Mô Tả |
|--------|------|-------|
| POST | `/api/integration/reserve-tdl-code` | Cấp mã TDL mới (Daycare call) |
| GET | `/api/integration/citizens/{tdlCode}` | Lookup khách hàng by mã TDL |
| POST | `/api/webhooks/daycare-events` | Webhook receiver (5 event types) |

### Webhook Events
**Daycare → AIVIHE (5 events):**
- `customer_created` — KH mới từ Daycare
- `vital_recorded` — Chỉ số được ghi tại Daycare
- `daycare_daily_summary` — Tóm tắt hoạt động hàng ngày
- `incident_reported` — Sự cố được báo cáo
- `medication_log` — Nhật ký dùng thuốc

**AIVIHE → Daycare (planned):**
- `health_summary_updated` — Cập nhật tóm tắt sức khỏe
- `doctor_instructions` — Chỉ dẫn từ BS
- `medication_reminders` — Nhắc nhở dùng thuốc
- `care_plan_updated` — Kế hoạch chăm sóc mới
- `vital_alert` — Cảnh báo chỉ số

**Security:**
- API Key auth: `Authorization: Apikey <key>`
- HMAC SHA256 signature verification
- Idempotency: `X-Daycare-Request-Id` header
- TLS required for all calls
- Log audit: `integration_events` table

---

## Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend + Backend** | Next.js App Router + TypeScript | 16.2.1 |
| **UI Framework** | Tailwind CSS 4 + shadcn/ui | 4.x + latest |
| **Database + Auth** | Supabase (PostgreSQL + Phone OTP + RLS) | 2.100+ |
| **AI** | Anthropic Claude API (Vision OCR + Text) | SDK 0.80+ |
| **Charts** | Recharts | 3.8+ |
| **PDF Export** | @react-pdf/renderer | 4.3+ |
| **Validation** | Zod | 4.3+ |
| **Deploy** | Vercel (Frontend) + Supabase Cloud (Backend) | — |
| **Region** | Seoul (Supabase) | — |

---

## Data Model & 3-Layer Architecture

### Customer Code System
```
TDL-{LOCATION}-{SEQUENCE}
  ↓
  TDL-HN-000001 (Khách hàng chính)
  TDL-HN-000002 (Khách hàng 2)
  ...
```

**Rule:** Một khách hàng = 1 mã TDL = nguồn thông tin sức khỏe thống nhất theo thời gian

### 3-Layer Data Architecture
```
Layer 1: source_documents (immutable)
         ↓ upload ảnh, file PDF
         ↓ Claude Vision OCR

Layer 2: extracted_records (AI output)
         ↓ User review & confirm
         ↓ or User edit + save

Layer 3: confirmed_records (ground truth)
         ↓ AI summary + citation
         ↓ Dashboard display
```

### Mandatory Columns (4 cột trên mọi health record)
| Column | Values | Purpose |
|--------|--------|---------|
| `owner_system` | daycare / aivihe / rehab / device | Ai sở hữu |
| `source` | daycare_staff / family_doctor / rehab_tech / wearable / family_input | Ai nhập |
| `scope` | general_care / clinical / rehab / administrative | Phạm vi |
| `created_by` | user_id | Audit trail |

### Per-Service Status (mỗi khách hàng)
| Column | Enum Values | Ý Nghĩa |
|--------|------------|--------|
| `daycare_status` | trial / active / paused / inactive | Trạng thái tại Daycare |
| `aivihe_status` | not_created / created / active / archived | Trạng thái AIVIHE |
| `fd_status` | not_enrolled / enrolled / under_followup / discharged | BS gia đình |
| `rh_status` | not_enrolled / under_assessment / in_treatment / completed | PHCN |

---

## Database Tables (26+ migrations)

### Core Tables
- `citizens` — Khách hàng gốc, link auth.users
- `health_profiles` — Máu, dị ứng, bệnh mạn
- `families` + `family_members` — Quản lý gia đình
- `branches` + `branch_staff` — Chi nhánh

### 3-Layer Health Data
- `source_documents` — Ảnh, PDF upload gốc
- `extracted_records` — Output từ Claude Vision
- `confirmed_records` — User đã xác nhận

### Health Records
- `health_visits`, `clinical_exams`, `diagnoses`
- `lab_tests`, `imaging`, `treatments`
- `medications`, `vaccinations`
- `vital_signs`, `vital_thresholds`

### System Tables
- `announcements`, `messages`, `audit_logs`
- `feedbacks`, `visit_preparations`
- `integration_events` — Webhook audit log
- `service_enrollments` — Mã TDL per service

---

## Security Model

### Row Level Security (RLS)
- Mọi bảng đều có RLS enabled
- User truy cập dữ liệu của mình qua `auth.uid()`
- Family manager truy cập qua `is_family_manager_of()`
- Audit logs: insert-only, user chỉ đọc của mình

### Data Privacy
- Health data = dữ liệu cá nhân nhạy cảm (Nghị định 13/2023)
- User kiểm soát tất cả sharing
- Consent required trước khi AI xử lý
- Audit trail cho mọi access

### Integration Security
- Apikey + HMAC SHA256 signature
- TLS required for all webhooks
- PHI không expose ngoài summary level
- Mọi integration event log vào `integration_events`

---

## UI/UX Standards

**Nguyên tắc cho người cao tuổi:**
- Font base ≥ 18px
- Touch target ≥ 48px
- High contrast (WCAG AA+)
- Simple navigation, no jargon
- Vietnamese text, no English for elderly
- Progress indicators + loading state

**Branding:**
- Logo FBL (top) + AIVIHE (bottom) trên tất cả trang
- Palette: teal/emerald/rose (inspired by BV Thu Cúc, Hồng Ngọc)
- Every screen has "Trở về trang chủ" button (auth pages)
- Logout → Home page (/)

---

## Current Implementation Status

### Completed Features (25+ commits)
✅ Landing page redesign (PGS.TS. Doãn Ngọc Hải expert review)
✅ Doctor application flow (public → reception → director)
✅ Family doctor registration (5 doctors seeded, customer select, director approval)
✅ Role-specific dashboards (Director 9 tabs, Admin 8, Manager 4)
✅ Reception dashboard (pending, contacted, approved, doctor-apps)
✅ Staff UI separation (no personal health records, staff profile only)
✅ E2E service flow visualizer (Director tab)
✅ Vitals OCR (Claude Vision → extract → save with image)
✅ Medical record 11 sections (self-input for 5 basic)
✅ Document sidebar (upload + bookmark)
✅ Treatment page (upload + AI verify)
✅ Customer dashboard health-first (health status + activities + packages + info)
✅ 3-layer DB architecture (source → extracted → confirmed)
✅ Phone OTP Auth + demo mode
✅ RBAC 12 roles, 34 permissions
✅ Visit preparation 4-step wizard + PDF

### In Progress (Sprint 1-2)
🚧 Daycare integration API + Webhooks
🚧 Vitals real-time tracking + thresholds
🚧 Auto-alerts on severity

### Planned (Sprint 3-4)
⏳ EMR BS gia đình (encounters, medications, care plans)
⏳ PHCN module (assessments, sessions, progress)
⏳ Alert Engine (rule-based, escalation)
⏳ Family Portal + Mobile responsive
⏳ Device Integration (wearable, IoT)
⏳ Production hardening + monitoring

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Customer Growth** | 500+ by end 2026 | Monthly active users |
| **System Uptime** | 99.5% | Monitoring (post-Sprint 4) |
| **API Response** | <500ms p95 | New Relic (TBD) |
| **Data Accuracy** | >95% (AI extract) | User correction rate |
| **User Satisfaction** | 4.0/5.0 | In-app survey |
| **Feature Adoption** | >70% (paid packages) | % customers w/ service |

---

## Dependencies & Blockers

| Item | Status | Owner | ETA |
|------|--------|-------|-----|
| Daycare API readiness | 🟡 In Design | Daycare team | 20/04 |
| MediExpress device setup | 🟡 In Design | MediExpress | 30/05 |
| BV partnership contract | 🔴 Pending | Legal | TBD |
| Bảo Minh insurance API | 🔴 Pending | Insurance team | Q3 2026 |

---

## Next Steps

1. **Sprint 1 (end Apr):** Finalize Daycare API, deploy production
2. **Sprint 2 (May):** Vitals tracking + alerts
3. **Sprint 3 (May-Jun):** EMR BS + Care plans
4. **Sprint 4 (Jun-Jul):** Family Portal + SSO + Polish
5. **Post-Sprint:** Monitor, optimize, gather feedback

---

*Tài liệu kỹ thuật chi tiết xem: `system-architecture.md`, `codebase-summary.md`, `code-standards.md`*
