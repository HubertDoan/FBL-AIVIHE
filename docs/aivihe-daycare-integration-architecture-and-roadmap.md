# Kiến trúc tích hợp AIVIHe ↔ Thong Dong Daycare

> Tài liệu này là blueprint triển khai spec `ClaudeCode_Tich_hop_Daycare_AIVIHe_BSGD.md`.
> Quy tắc vàng: **Một khách hàng – một mã gốc – một hồ sơ chung – nhiều phân hệ dịch vụ – nhiều tab chuyên môn.**

---

## 1. Kiến trúc target — chỉ đạo mới 2026-04-11 (override spec §5.1)

> **Chỉ đạo thầy/giám đốc:** "Dữ liệu khách hàng lưu tại AIVIHe. Daycare / BSGĐ / PHCN đều là editor, bổ sung thông tin theo phân quyền."

### 1.1 Single source of truth (target Phase 2)
**AIVIHe = customer master + clinical master** (merged). Daycare, BSGĐ, PHCN đều là 3 editor với scope riêng, đọc view chung nhưng chỉ ghi field trong quyền của mình.

```
              ┌──────────────────────────────────────┐
              │         AIVIHe (master)              │
              │  Customer + Health + Clinical + PHCN │
              └───────┬─────────────┬────────────────┘
                      │             │
        read-through  │             │ webhook / API push
          + append    │             │
                      ▼             ▼
         ┌───────────────┐   ┌────────────────┐
         │ Daycare app   │   │ BSGĐ / PHCN    │
         │ (thongdong)   │   │ (AIVIHe UI)    │
         └───────────────┘   └────────────────┘
```

### 1.2 Nguyên tắc đã chốt (tự quyết định per thầy)
- AIVIHe giữ customer record duy nhất, dùng `customer_code = TDL-{PROVINCE}-{SEQ6}` làm shared key
- Daycare, BSGĐ, PHCN **đều có write access** nhưng **field-level permission cứng**
- Daycare chỉ write được scope `general_care` + `administrative` (hành chính, daily ops)
- BSGĐ write được scope `clinical` (khám, chẩn đoán, thuốc, bệnh mạn tính)
- PHCN write được scope `rehab` (đánh giá, bài tập, ROM, strength, sessions)
- Tất cả write phải gắn `source` + `owner_system` + `created_by` (spec §7)
- Last-write-wins theo field, KHÔNG ghi đè field thuộc scope người khác (AIVIHe reject nếu vượt scope)

### 1.3 Pragmatic constraint
**Daycare đã live Phase 1 với customer master local trong Neon.** Không đủ thời gian migrate trước 25/04 → phải phân 2 giai đoạn (xem §10 roadmap mới).

---

## 2. Quy tắc mã khách hàng (spec §2)

### 2.1 Mã gốc
```
TDL-{PROVINCE}-{SEQ6}     →  TDL-HN-000123
```
- `TDL` = Thong Dong Life
- `PROVINCE` = mã tỉnh/thành (vd `HN` = Hà Nội) — **không phải** mã cơ sở
- `SEQ6` = sequence_number 6 chữ số, cấp theo tỉnh

### 2.2 Mã hồ sơ dịch vụ
```
TDL-{PROVINCE}-{SERVICE}-{SEQ6}
```
| Service | Nghĩa | Ví dụ |
|---|---|---|
| `DC` | Daycare | `TDL-HN-DC-000123` |
| `FD` | Family Doctor | `TDL-HN-FD-000123` |
| `RH` | Rehab / PHCN | `TDL-HN-RH-000123` |
| `H`  | Thong Dong Home | `TDL-HN-H-000123` |
| `L`  | Thong Dong Land | `TDL-HN-L-000123` |

### 2.3 ⚠ Nguyên tắc SEQ6 chung cho mọi service line
Cùng một khách hàng phải dùng **cùng SEQ6** ở tất cả các line:
```
TDL-HN-000123       ← customer
TDL-HN-DC-000123    ← Daycare
TDL-HN-FD-000123    ← Family Doctor
TDL-HN-RH-000123    ← PHCN
```
**Code hiện tại:** `src/lib/service-profile-code-generator.ts` → `generateServiceProfileCode(serviceType, customerSequenceNumber, locationCode)` — pure function, nhận `customer.sequence_number` từ caller (đã fix 2026-04-11).

---

## 3. Phân tách dữ liệu chống lẫn (spec §7)

Mỗi bản ghi dữ liệu sức khỏe phải gắn 4 thuộc tính kiểm soát:

| Cột | Giá trị | Mục đích |
|---|---|---|
| `owner_system` | `daycare` / `aivihe` / `rehab` / `device` | Ai sở hữu dòng dữ liệu |
| `source` | `daycare_staff` / `family_doctor` / `rehab_technician` / `wearable` / `family_input` | Ai nhập/gửi |
| `scope` | `general_care` / `clinical` / `rehab` / `administrative` | Phạm vi chia sẻ |
| `created_by` | user_id | Audit trail |

**Phân quyền field-level:** mỗi tab + mỗi field có permission matrix (ai xem / ai sửa / ai duyệt / ai chỉ đọc).

---

## 4. Trạng thái per-service (spec §8)

**KHÔNG dùng một cột `status` chung.** Mỗi line có cột trạng thái riêng:

| Cột | Enum |
|---|---|
| `daycare_status` | `trial` / `active` / `paused` / `inactive` |
| `aivihe_status` | `not_created` / `created` / `active` / `archived` |
| `fd_status` | `not_enrolled` / `enrolled` / `under_followup` / `discharged` |
| `rh_status` | `not_enrolled` / `under_assessment` / `in_treatment` / `completed` |

Ví dụ hợp lệ: customer `active` ở Daycare nhưng `not_enrolled` ở FD và PHCN.

---

## 5. Data model tối thiểu (spec §9)

10 bảng bắt buộc, chia theo lớp:

**Customer & Service Layer (Daycare master):**
1. `customers` — hồ sơ gốc
2. `daycare_profiles` / `daycare_attendance` / `daycare_daily_logs` / `daycare_incidents`
3. `service_profiles` — mã `TDL-HN-{SERVICE}-{SEQ6}`, trạng thái per line
4. `audit_logs`

**Health & Clinical Layer (AIVIHe master; Daycare cache read-only):**
5. `health_summaries` + `health_alert_flags` — shared scope
6. `family_doctor_profiles` + `doctor_encounters` + `chronic_conditions` + `prescriptions` + `followup_instructions`
7. `rehab_profiles` + `rehab_assessments` + `rehab_sessions` + `rehab_progress_notes`
8. `vital_signs` + `device_measurements`
9. `care_plans` + `care_plan_tasks`
10. `alerts` + `incident_logs` + `medical_documents`

**Trạng thái code hiện tại (2026-04-11):**
- ✅ `customers`, `service_profiles`, `audit_logs`, `daycare_*` tương ứng đã có
- ✅ `health_summaries` có mức cơ bản (13 trường), Daycare nhập tạm thời
- ❌ Chưa có: `doctor_encounters`, `chronic_conditions`, `prescriptions`, `rehab_*`, `vital_signs`, `care_plans`, `medical_documents`, `alerts`
- ❌ `health_summaries` thiếu cột `owner_system` / `source` / `scope`
- ❌ `customers` chỉ có 1 cột `status`, chưa tách theo spec §8

---

## 6. Cấu trúc tab hồ sơ khách hàng (spec §4)

```
Khách hàng
└── Hồ sơ chung
    ├── Tab 1. Thông tin chung            (Daycare)
    ├── Tab 2. Daycare                    (Daycare)
    ├── Tab 3. Hồ sơ sức khỏe chung       (Shared — BSGĐ ghi, Daycare đọc hạn chế)
    ├── Tab 4. Bác sỹ gia đình            (AIVIHe)
    ├── Tab 5. PHCN                       (AIVIHe / Rehab)
    ├── Tab 6. Chỉ số theo dõi            (mixed: Daycare + AIVIHe + wearable)
    ├── Tab 7. Thuốc & nhắc thuốc         (AIVIHe)
    ├── Tab 8. Kế hoạch chăm sóc          (AIVIHe)
    ├── Tab 9. Cảnh báo & sự cố           (mixed)
    └── Tab 10. Tài liệu y tế             (AIVIHe)
```

**Header + Snapshot cố định (spec §12):** mã gốc, họ tên, tuổi, `daycare_status`/`fd_status`/`rh_status`, bệnh nền, dị ứng, thuốc, chỉ số gần nhất, cảnh báo đỏ/vàng/xanh — hiển thị ở mọi tab.

---

## 7. API tích hợp (spec §10)

**Daycare → AIVIHe (push):**
```http
POST /api/integration/customers                              # tạo mới, gửi master
POST /api/integration/customers/{customer_id}/health-summary # đồng bộ summary
POST /api/integration/customers/{customer_id}/vitals         # chỉ số hằng ngày
POST /api/integration/customers/{customer_id}/alerts         # ghi nhận bất thường
POST /api/integration/customers/{customer_id}/daycare-log    # daily log
```

**AIVIHe → Daycare (pull / webhook):**
```http
GET  /api/integration/customers/{customer_id}/care-summary
GET  /api/integration/customers/{customer_id}/doctor-instructions
GET  /api/integration/customers/{customer_id}/medication-reminders
GET  /api/integration/customers/{customer_id}/active-alerts
```

**Xác thực:** HMAC + API key riêng, TLS bắt buộc, mọi truy cập PHI phải log.

**Điều cấm (spec §6.3):** không push ghi chú khám chi tiết, bệnh sử đầy đủ, đơn thuốc toàn văn, tài liệu nhạy cảm về Daycare. Daycare **chỉ** nhận summary/instruction/warning/medication reminder/follow-up action.

---

## 8. Luồng khách mới (spec §11)

```
Step 1. Khách đăng ký tại Daycare (hoặc Lead → convert)
Step 2. Daycare sinh:
          - customer.id (UUID)
          - customer.sequence_number (auto-increment theo province)
          - customer.customer_code = TDL-HN-000123
          - service_profiles[DC] với service_code = TDL-HN-DC-000123
          - health_summaries (skeleton, owner_system = daycare_pre_aivihe)
Step 3. System push sang AIVIHe → aivihe_status = created
Step 4. Nếu khách đăng ký BSGĐ:
          - mở service_profiles[FD] với code = TDL-HN-FD-000123 (cùng SEQ6!)
          - fd_status = enrolled
          - KHÔNG tạo customer mới
Step 5. Nếu khách đăng ký PHCN:
          - mở service_profiles[RH] với code = TDL-HN-RH-000123 (cùng SEQ6!)
          - rh_status = under_assessment
          - KHÔNG tạo customer mới
```

---

## 9. Permission matrix field-level (chốt 2026-04-11)

### 9.1 View high-level (per tab)
| Role | Tab 1-2 (admin + daycare) | Tab 3 (health summary) | Tab 4 (FD) | Tab 5 (PHCN) | Tab 6 (vitals) | Tab 7 (meds) | Tab 8 (care plan) | Tab 9 (alerts) | Tab 10 (docs) |
|---|---|---|---|---|---|---|---|---|---|
| `care_staff` / `nurse` | R/W | **R + W hạn chế** | R | R | R/W (đo tại Daycare) | R | R | R/W | R hạn chế |
| `manager` / `director` / `admin` | R/W | R | R | R | R | R | R | R | R |
| `family_doctor` | R | **R/W đầy đủ** | **R/W** | R | R/W | R/W | R/W | R/W | R/W |
| `rehab_therapist` | R | R | R | **R/W** | R | R | R/W (rehab part) | R/W | R (rehab docs) |
| `family_viewer` | R | R (scope=general_care) | — | — | R (snapshot) | R (reminders) | R | R (open only) | — |

### 9.2 Field-level trong Tab 3 "Hồ sơ sức khỏe chung"
| Field | Daycare (care_staff/nurse) | BSGĐ | PHCN |
|---|---|---|---|
| `blood_type`, `height_cm`, `weight_kg` | R/W (đo tại Daycare) | R/W | R |
| `allergies` | **R-only** | R/W | R |
| `chronic_diseases` | **R-only** | R/W | R |
| `current_medications` | **R-only** | R/W | R |
| `medical_history`, `surgery_history` | **R-only** | R/W | R |
| `mobility_level` | **R/W** | R/W | R/W (rehab scope) |
| `cognitive_level` | R/W | R/W | R |
| `vision_status`, `hearing_status` | R/W | R/W | R |
| `dietary_restrictions` | **R/W** | R/W | R |
| `special_needs` | **R/W** | R/W | R/W |
| `doctor_name`, `doctor_phone` | R | R/W | R |
| `insurance_info` | R/W (Daycare nhập hộ) | R | R |

### 9.3 Enforcement
- **UI level:** các field read-only disable input, show lock icon + tooltip "Chỉ BSGĐ cập nhật được"
- **API level (Phase 2):** endpoint `PATCH` reject payload có field ngoài scope, trả 403 kèm danh sách field vi phạm
- **Audit:** mọi update ghi `audit_logs` với `user_id + role + scope + field + old + new`

---

## 10. Roadmap 4 Sprints (thống nhất 2026-04-12, override roadmap cũ)

> **Quyết định kiến trúc:** Federated Coexistence — 2 hệ riêng biệt, sync webhook bidirectional.
> **AIVIHe** = Customer Master + Medical EMR. **Daycare** = Operational system.
> Sequence TDL code do AIVIHe own (start=6 vì Daycare đã có 5 records).
> Ref: `plans/reports/plan-260412-0959-software-execution-plan-two-projects-real-data-parallel-agents.md`

### Daycare Phase 1 — DONE (commits `11a4352` → `a3ae61a` → `0977ba1`)

| # | Việc | Status |
|---|---|---|
| 1 | Stub `/api/integration/customers/[code]` + daycare-context + aivihe-webhook | ✅ |
| 2 | Service code SEQ6 chung (`generateServiceProfileCode` dùng `customer.sequence_number`) | ✅ |
| 3 | Migration: `owner_system`+`source`+`scope`+`last_synced_at` vào health_summaries | ✅ |
| 4 | Migration: `aivihe_patient_id` + `last_synced_at` vào customers | ✅ |
| 5 | Bảng `integration_events` lưu webhook (thay console.log), `merge_status` tracking | ✅ |
| 6 | API `/api/health-profiles` enforce field-level scope (403 + `violating_fields`) | ✅ |
| 7 | UI Tab 3 lock clinical inputs cho care_staff/nurse/receptionist/rehab_therapist | ✅ |
| 8 | `GET /api/integration/aivihe-events` admin list pending events | ✅ |
| 9 | PHCN bỏ khỏi CLINICAL_WRITE_ROLES (scope PHCN riêng, không ghi HealthSummary) | ✅ |

### Sprint 1 (12-25/4) — AIVIHE Production Deploy + Integration Contract

**AIVIHE side:**
- Deploy production (Vercel + Supabase thật)
- Tắt demo mode → Supabase Auth production
- Migration: `tdl_customer_code` + `integration_events` + `service_enrollments` trên `citizens`
- `POST /api/webhooks/daycare-events` (receiver, 5 event types, Apikey auth)
- `POST /api/integration/reserve-tdl-code` (Daycare gọi khi tạo KH mới)
- `GET /api/integration/citizens/:tdlCode` (expose customer data)
- Import 5 Daycare customers (TDL-HN-000001→000005), set sequence=6

**Daycare side:** Chỉ fix bugs nếu có. KHÔNG refactor.

**Prompt cho AIVIHe Claude:** `plans/reports/prompt-260412-1007-aivihe-sprint1-webhook-receiver-and-production-deploy.md`

### Sprint 2 (26/4-9/5) — Cross-system Data Flow

**AIVIHE side:**
- `vital_signs` table + webhook merger (Daycare vitals → AIVIHe timeline)
- `alerts` + `incident_logs` tables + auto-alert on severity='red'
- Webhook sender AIVIHe→Daycare (health_summary_updated, alert_raised)

**Daycare side:**
- Update aivihe-webhook: merge `health_summary` into UI display
- Display alerts badge on customer profile header
- Tab 3 show source badge "Nguồn: AIVIHe" khi data từ webhook

### Sprint 3 (10-23/5) — Medical EMR + BS Gia Đình

**AIVIHE side:**
- Family Doctor EMR (encounters, ICD-10, diagnoses)
- Medications prescribed + webhook push to Daycare
- Rehab module (sessions, assessments)
- Customer profile unified tabs UI (11 tabs, role-based)

**Daycare side:**
- Receive medication_reminders → display on daily care log
- Nurse confirm medication taken → log back to AIVIHe
- Display doctor_instructions badge

### Sprint 4 (24/5-6/6) — Family Portal + SSO + Polish

**AIVIHE side:**
- Family Portal (timeline cross Daycare + medical, weekly report AI)
- Care Plans (BS tạo → tasks auto-assign Daycare)
- SSO cross-domain (shared JWT between thongdonglife.vn ↔ AIVIHe)

**Daycare side:**
- Polish, responsive mobile, Vietnamese PDF fonts
- Admin dashboard thống kê tổng hợp
- Performance optimization

---

## 11. Webhook Contract (thống nhất 2026-04-12)

### Daycare → AIVIHe (5 event types)

Endpoint: `POST {AIVIHE_URL}/api/webhooks/daycare-events`
Auth: `Authorization: Apikey <DAYCARE_INTEGRATION_API_KEY>`

| Event type | Trigger | Payload key fields |
|---|---|---|
| `customer_created` | Lễ tân tạo KH mới | full_name, dob, gender, phone, address, province_code, primary_contact, enrolled_services |
| `vital_recorded` | Y tá đo chỉ số | metric, value_numeric, value_text, unit, measured_at, source, recorded_by |
| `daycare_daily_summary` | Staff check-out cuối ngày | date, checkin_at, checkout_at, activities, meal, nap, mood_rating, staff_notes |
| `incident_reported` | Ghi nhận sự cố | occurred_at, incident_type, location, description, severity, immediate_action |
| `medication_log` | Y tá log thuốc đã cho | medication_name, scheduled_time, taken_at, status, administered_by |

### AIVIHe → Daycare (6 event types)

Endpoint: `POST {DAYCARE_URL}/api/integration/aivihe-webhook`
Auth: `Authorization: Apikey <AIVIHE_INTEGRATION_API_KEY>`

| Event type | Trigger | Payload key fields |
|---|---|---|
| `health_summary` | BS update hồ sơ SK | fields changed, scope=clinical |
| `care_summary` | BS tạo/update care plan summary | goals, tasks, review_date |
| `doctor_instructions` | BS ra chỉ định cho Daycare | instruction_text, priority, valid_until |
| `medication_reminders` | BS kê đơn mới | medication_name, dosage, frequency, reminder_times |
| `active_alerts` | Alert engine trigger | alert_type, severity, description, actions_required |
| `vital_alert` | Chỉ số vượt ngưỡng | metric, value, threshold, severity |

### Shared contract

```json
{
  "type": "<event_type>",
  "customer_code": "TDL-HN-000123",
  "updated_by": "username_or_role",
  "updated_at": "2026-04-12T10:30:00+07:00",
  "payload": { ... }
}
```

Response: `202 Accepted` với `{ ok: true, accepted_type, customer_code, merge_status }`

---

## 12. Rủi ro & Mitigation

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Webhook downtime (1 bên offline) | Trung | `integration_events` table cả 2 bên, retry queue Phase 2 |
| Customer sequence conflict | Cao | ✅ AIVIHe owns sequence (start=6), Daycare gọi reserve-tdl-code |
| BSGĐ nhập vào Daycare trước khi AIVIHe live | Trung | `owner_system=daycare_pre_aivihe`, merge khi sync |
| Lộ PHI qua webhook | Rất cao | Apikey + TLS + audit log mọi event |
| SEQ6 lệch giữa service lines | ✅ Resolved | Fix generator 2026-04-11, audit script confirmed 5/5 OK |
| Daycare giữ clinical data quá chi tiết | ✅ Resolved | Field-level scope lock UI+API, 403 on violating fields |

---

## 13. Acceptance criteria (32 use cases)

### Daycare (12 use cases)

| # | Use case | Status |
|---|---|---|
| D1 | Khách đăng ký trải nghiệm qua website | ⚠️ Form có, cần verify flow |
| D2 | Lễ tân tạo hồ sơ KH mới (TDL code) | ✅ |
| D3 | Staff check-in KH hàng ngày | ✅ |
| D4 | Staff ghi activities/ăn/nghỉ/mood | ✅ |
| D5 | Staff check-out cuối ngày + vitals | ✅ |
| D6 | Y tá đo chỉ số sức khỏe | ✅ |
| D7 | Quản lý gói dịch vụ + đăng ký gói | ✅ |
| D8 | Thanh toán SePay QR → webhook xác nhận | ✅ |
| D9 | Admin xem danh sách hôm nay, history | ✅ |
| D10 | Ghi nhận sự cố (incident) | ✅ |
| D11 | Push data sang AIVIHe (webhook sender) | ⚠️ Stub → Sprint 1 real |
| D12 | Nhận data từ AIVIHe (webhook receiver) | ⚠️ Stub → Sprint 2 merge |

### AIVIHe (15 use cases)

| # | Use case | Status |
|---|---|---|
| A1 | Đăng ký SĐT + username | ✅ (demo) |
| A2 | Đăng nhập Supabase Auth production | ⚠️ Sprint 1 |
| A3-A11 | Profile, upload, OCR, timeline, family, member | ✅ (demo) |
| A12 | Nhận webhook từ Daycare | ❌ Sprint 1 |
| A13 | Push webhook sang Daycare | ❌ Sprint 2 |
| A14 | Deploy production | ❌ Sprint 1 |
| A15 | Tắt demo mode | ❌ Sprint 1 |

### Cross-system (5 use cases)

| # | Use case | Status |
|---|---|---|
| X1 | KH mới Daycare → AIVIHe citizen | ❌ Sprint 1-2 |
| X2 | Vitals Daycare → AIVIHe timeline | ❌ Sprint 2 |
| X3 | BS kê đơn → Daycare nhắc thuốc | ❌ Sprint 3 |
| X4 | Sự cố Daycare → AIVIHe alert | ❌ Sprint 2 |
| X5 | Gia đình xem timeline thống nhất | ❌ Sprint 4 |

**Tiến độ: 10/32 done, 2/32 partial, 20/32 pending.**

---

## 14. Câu hỏi đã giải quyết + còn mở

### Đã giải quyết (2026-04-12)

| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | AIVIHe do ai build? | Thầy Hải code qua Claude Code, cùng thư mục máy này |
| 2 | Single platform vs Federated? | **Federated** — 2 hệ riêng, sync webhook |
| 3 | Ai own sequence TDL code? | **AIVIHe** (start=6) |
| 4 | PHCN tách hay module con? | Module con AIVIHe |
| 5 | Stub endpoints? | ✅ Done cả 4 routes |
| 6 | Field-level scope Daycare? | ✅ Enforced UI + API |

### Còn mở

1. **Domain AIVIHe production:** `aivihe.thongdonglife.vn` hay domain riêng?
2. **SSO provider:** Cùng JWT secret hay OAuth flow?
3. **Bảo Minh integration:** Gói linked vào `service_enrollments` hay entity riêng?
4. **Device vendor list:** Phase 4 cần biết vendor (Omron? Xiaomi?)
5. **Offline mode:** Staff check-in khi mất mạng?
