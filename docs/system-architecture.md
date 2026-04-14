# System Architecture

> Cập nhật: 13/04/2026. Federated Coexistence — AIVIHE ↔ Thong Dong Daycare.

## Overview

```
                    ┌─────────────────────────────────────┐
                    │       AIVIHE (master)                │
                    │  Customer Master + Medical EMR + AI  │
                    │  Next.js 16 + Supabase PostgreSQL    │
                    └──────┬──────────────┬───────────────┘
                           │              │
             REST API      │              │  Webhooks (HMAC)
             + Apikey      │              │
                           ▼              ▼
              ┌────────────────┐   ┌──────────────────┐
              │ Daycare app    │   │ BSGĐ / PHCN      │
              │ (thongdong)    │   │ (AIVIHE UI)      │
              │ Prisma + Neon  │   │ role-based tabs   │
              └────────────────┘   └──────────────────┘
```

**Nguyên tắc**: Một khách hàng – một mã TDL – một hồ sơ chung – 11 tabs – dữ liệu liên thông.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend + Backend | Next.js App Router + TypeScript | 16.2.1 |
| UI | Tailwind CSS + shadcn/ui | 4.x |
| Database + Auth | Supabase (PostgreSQL + Phone OTP + RLS) | 2.100 |
| AI | Claude API (Vision OCR + Text generation) | SDK 0.80 |
| Charts | Recharts | 3.8 |
| PDF | @react-pdf/renderer | 4.3 |
| Validation | Zod | 4.3 |
| Deploy | Vercel + Supabase Cloud | — |

## Customer Code System

```
TDL-{PROVINCE}-{SEQ6}          → TDL-HN-000123 (customer)
TDL-{PROVINCE}-{SERVICE}-{SEQ6} → TDL-HN-DC-000123 (Daycare)
                                   TDL-HN-FD-000123 (Family Doctor)
                                   TDL-HN-RH-000123 (Rehab)
```

Cùng SEQ6 cho tất cả service lines của 1 khách hàng. AIVIHE owns sequence (start=6).

## Data Ownership (4 cột bắt buộc trên mọi health record)

| Column | Values | Purpose |
|--------|--------|---------|
| `owner_system` | daycare / aivihe / rehab / device | Ai sở hữu |
| `source` | daycare_staff / family_doctor / rehab_technician / wearable / family_input | Ai nhập |
| `scope` | general_care / clinical / rehab / administrative | Phạm vi |
| `created_by` | user_id | Audit trail |

## Per-Service Status

| Column | Enum values |
|--------|-------------|
| `daycare_status` | trial / active / paused / inactive |
| `aivihe_status` | not_created / created / active / archived |
| `fd_status` | not_enrolled / enrolled / under_followup / discharged |
| `rh_status` | not_enrolled / under_assessment / in_treatment / completed |

## Database Schema

### Existing Tables (26 migrations)
- `citizens` — hồ sơ gốc, links to auth.users
- `health_profiles` — blood type, allergies, chronic conditions
- `families` + `family_members` — group management, roles
- `source_documents` → `extracted_records` → `confirmed_records` (3-layer)
- `health_events`, `health_visits`, `clinical_exams`, `diagnoses`
- `lab_tests`, `imaging`, `treatments`, `medications`, `vaccinations`
- `branches` + `branch_staff`, `announcements`, `messages`
- `audit_logs`, `feedbacks`, `visit_preparations`

### New Tables (Sprint 1-3)
- `service_enrollments` — mã TDL per service line
- `integration_events` — webhook audit log (idempotent)
- `daycare_summary_cache` — mirror Daycare daily summary
- `vital_signs` + `vital_thresholds` — time-series + alert rules
- `alerts` + `incident_logs` — cảnh báo + sự cố
- `medications_prescribed` + `medication_items` — đơn thuốc BSGD
- `family_doctor_encounters` + `chronic_conditions_tracking`
- `rehab_profiles` + `rehab_sessions` + `rehab_assessments`
- `care_plans` + `care_plan_tasks`

## Integration API

### AIVIHE exposes (for Daycare)
```
POST /api/integration/reserve-tdl-code       → Cấp mã TDL mới
GET  /api/integration/citizens/{tdlCode}     → Lookup by TDL code
POST /api/integration/citizens/import        → Bulk import (Phase 3)
GET  /api/integration/health-summary/{tdlCode} → Health summary
POST /api/webhooks/daycare-events            → Webhook receiver
```

### Webhook: Daycare → AIVIHE (5 events)
customer_created, vital_recorded, daycare_daily_summary, incident_reported, medication_log

### Webhook: AIVIHE → Daycare (6 events)
health_summary, care_summary, doctor_instructions, medication_reminders, active_alerts, vital_alert

**Auth**: `Authorization: Apikey <key>` + HMAC SHA256 + TLS
**Idempotency**: `X-Daycare-Request-Id` header, stored in `integration_events`

## RBAC — 12 Roles

| Role | Scope |
|------|-------|
| super_admin | Toàn hệ thống |
| director | GĐ công ty |
| branch_director | GĐ chi nhánh |
| admin | Quản lý thành viên |
| doctor | Bác sĩ gia đình (R/W clinical) |
| specialist_doctor | Bác sĩ chuyên khoa |
| reception | Lễ tân |
| staff | Nhân viên Daycare (R/W general_care) |
| member | Thành viên |
| citizen | Công dân (chưa TV) |
| guest | Khách |
| family_viewer | Người thân (read-only) |

Field-level permissions per tab — Daycare chỉ write scope `general_care`, BSGD write `clinical`, PHCN write `rehab`.

## Security Model

### Row Level Security (RLS)
- Every table has RLS enabled
- Users access own data via `auth.uid()`
- Family managers access via `is_family_manager_of()`
- Audit logs: insert-only, users read own only

### Data Privacy
- Health data = sensitive personal data (Nghị định 13/2023)
- User controls all sharing
- Consent required before AI processes data
- Audit trail for every access

### Integration Security
- Apikey + HMAC SHA256 signature verification
- TLS required for all webhook calls
- PHI never exposed in webhook payloads beyond summary level
- All integration events logged to `integration_events` table
