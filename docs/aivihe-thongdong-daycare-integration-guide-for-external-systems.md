# AIVIHE Platform — Hướng dẫn tích hợp cho hệ thống bên ngoài

**Tên dự án:** AIVIHE (AI · Vietnam · Health)
**Mục đích:** Cho phép hệ thống bên ngoài (Thong Dong Daycare, Bảo Minh, BV đối tác, IoT devices) tích hợp với nền tảng AIVIHE
**Phiên bản API:** v1 (MVP)
**Ngày:** 12/04/2026
**Đối tượng đọc:** Kỹ sư phần mềm của đối tác tích hợp

---

## 1. Tổng quan hệ thống

AIVIHE là nền tảng Personal Health Copilot. Hệ thống bên ngoài có thể tích hợp theo 3 mô hình:

| Mô hình | Mô tả | Use case |
|---------|-------|---------|
| **A. REST API** | Gọi trực tiếp HTTP endpoints | Daycare management system, Insurance backoffice |
| **B. Webhook** | AIVIHE push sự kiện ra ngoài | SePay payment, IoT alerts, Bảo Minh notification |
| **C. Data ingest** | Import file/batch vào AIVIHE | BV đối tác gửi kết quả khám, lab results |

### Kiến trúc tích hợp

```
┌──────────────────────┐       REST API       ┌──────────────────────┐
│  Thong Dong Daycare  │ ◄────────────────► │  AIVIHE Platform     │
│  (External System)   │                      │  (Next.js + Supabase)│
└──────────────────────┘       Webhooks       └──────────────────────┘
         ▲                                              ▲
         │                                              │
         │      OAuth / API Key Auth                    │
         │                                              │
┌──────────────────────┐                      ┌──────────────────────┐
│  Bảo Minh Backoffice │                      │  BV PHCN Hà Nội      │
│  (Partner)           │                      │  (Data source)       │
└──────────────────────┘                      └──────────────────────┘
```

---

## 2. Base URL & Authentication

### 2.1 Base URL

| Môi trường | Base URL |
|------------|---------|
| Production | `https://aivihe.vn/api` (sẽ deploy) |
| Staging | `https://staging.aivihe.vn/api` (sẽ deploy) |
| Local dev | `http://localhost:3000/api` |

### 2.2 Authentication methods

**Method 1: Supabase Session (user-facing)**
- User đăng nhập qua SĐT OTP → nhận session cookie
- Header: `Cookie: sb-access-token=<jwt>`
- Dùng cho: frontend-to-backend nội bộ

**Method 2: Service Role Key (server-to-server)**
- Dành cho: partner backend gọi AIVIHE
- Header: `Authorization: Bearer <service_role_jwt>`
- **Chưa implement public API key system** — cần bổ sung layer `api_keys` table

**Method 3: Webhook signature (incoming webhooks)**
- Partner gọi đến AIVIHE → ký HMAC SHA256
- Header: `X-AIVIHE-Signature: sha256=<hex>`
- Verify bằng shared secret trong `.env`

### 2.3 Rate limit (đề xuất)

| Auth type | Rate limit |
|-----------|-----------|
| User session | 60 req/min |
| Service key | 600 req/min |
| Webhook | Không giới hạn |

---

## 3. Data Model Reference

### 3.1 Core resources

```typescript
// Citizen — người dùng cơ bản
interface Citizen {
  id: string;              // UUID
  full_name: string;
  username: string | null; // e.g. "minhnv2026@aivihe.vn"
  phone: string;           // SĐT Việt Nam, format +84
  email: string | null;
  date_of_birth: string | null; // ISO date
  gender: 'male' | 'female' | 'other' | null;
  national_id: string | null;   // CCCD 12 số
  address: string | null;
  ethnicity: string | null;
  occupation: string | null;
  avatar_url: string | null;
  has_consented: boolean;  // MUST be true before AI processes data
  created_at: string;      // ISO timestamp
  updated_at: string;
}

// HealthProfile — hồ sơ sức khỏe cơ bản
interface HealthProfile {
  id: string;
  citizen_id: string;
  blood_type: string | null;       // A+, B-, O+, AB+...
  height_cm: number | null;
  weight_kg: number | null;
  allergies: string[];
  disabilities: string[];
  chronic_conditions: string[];
  current_medications: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  pregnancy_status: string | null;
  organ_donation_status: boolean;
  lifestyle_notes: Record<string, unknown>;
}

// SourceDocument — Layer 1: bản gốc
interface SourceDocument {
  id: string;
  citizen_id: string;
  file_url: string;         // Supabase storage URL
  file_type: string;        // image/jpeg, application/pdf
  file_size_bytes: number | null;
  original_filename: string | null;
  document_type: DocumentType;
  document_date: string | null;
  facility_name: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  is_classified: boolean;
  ai_classification: string | null;
  uploaded_by: string;
  created_at: string;
}

// HealthEvent — Layer 2: sự kiện timeline
interface HealthEvent {
  id: string;
  citizen_id: string;
  event_type: EventType;    // visit | lab_result | medication | ...
  event_date: string;       // ISO timestamp
  title: string;
  description: string | null;
  source_document_id: string | null;  // → Layer 1
  confirmed_record_id: string | null; // → Layer 2 confirmed
  metadata: Record<string, unknown>;
}
```

### 3.2 Enums chính (full list)

```typescript
type FamilyRole = 'owner' | 'manager' | 'member' | 'doctor' | 'staff' | 'viewer';

type DocumentType =
  | 'lab_report' | 'prescription' | 'imaging'
  | 'discharge_summary' | 'vaccination_record'
  | 'medical_certificate' | 'referral' | 'other';

type EventType =
  | 'visit' | 'lab_result' | 'medication' | 'vaccination'
  | 'diagnosis' | 'imaging' | 'vital_sign' | 'lifestyle'
  | 'document_upload' | 'other';

type VisitType = 'checkup' | 'follow_up' | 'emergency' | 'screening' | 'specialist' | 'other';

type ImagingType = 'xray' | 'ct' | 'mri' | 'ultrasound' | 'ecg' | 'endoscopy' | 'other';

type TreatmentType = 'medication' | 'surgery' | 'procedure' | 'rehabilitation' | 'therapy' | 'other';

type DiseaseStatus = 'active' | 'controlled' | 'remission' | 'resolved';

type ExtractionStatus = 'pending' | 'confirmed' | 'rejected';

type PrepStatus = 'draft' | 'ai_generated' | 'doctor_reviewed' | 'completed' | 'used';
```

---

## 4. REST API Endpoints (dành cho Thong Dong Daycare)

### 4.1 Citizens (members)

#### `POST /api/auth/register`
Tạo citizen mới (đăng ký thành viên).

**Request:**
```json
{
  "full_name": "Nguyễn Văn Minh",
  "phone": "0912345678",
  "date_of_birth": "1960-03-15",
  "gender": "male",
  "national_id": "001060012345",
  "address": "Thanh Xuân, Hà Nội",
  "ethnicity": "Kinh",
  "occupation": "Hưu trí"
}
```

**Response 200:**
```json
{
  "success": true,
  "citizen": {
    "id": "uuid",
    "username": "minhnv2026@aivihe.vn",
    "full_name": "Nguyễn Văn Minh",
    "phone": "0912345678"
  },
  "default_password": "123456"
}
```

**Errors:**
- `409` — SĐT đã tồn tại
- `400` — Dữ liệu không hợp lệ (Zod validation)

---

#### `GET /api/profile`
Lấy thông tin profile user hiện tại.

**Headers:** `Authorization: Bearer <token>` hoặc session cookie

**Response 200:**
```json
{
  "citizen": { /* Citizen */ },
  "health_profile": { /* HealthProfile */ },
  "membership": {
    "tier": "silver",
    "status": "active",
    "expires_at": "2026-10-12"
  }
}
```

---

#### `GET /api/profile/health`
Lấy hồ sơ sức khỏe đầy đủ (Layer 2 confirmed records).

**Response 200:**
```json
{
  "vital_signs": [
    { "metric": "blood_pressure", "value": "120/80", "unit": "mmHg", "date": "2026-04-10" }
  ],
  "chronic_diseases": [
    { "name": "Tăng huyết áp", "status": "controlled", "since": "2020-01" }
  ],
  "medications": [ ... ],
  "allergies": [ ... ]
}
```

---

### 4.2 Documents (ingest dữ liệu từ BV đối tác)

#### `POST /api/documents/upload`
Upload tài liệu y tế (gửi kết quả khám từ BV về AIVIHE).

**Request:** `multipart/form-data`
```
file: <binary>
citizen_id: uuid
document_type: lab_report | prescription | imaging | ...
document_date: 2026-04-10
facility_name: "BV Phục hồi chức năng Hà Nội"
```

**Response 200:**
```json
{
  "source_document": {
    "id": "uuid",
    "file_url": "https://.../lab_20260410.pdf",
    "is_classified": false
  },
  "next_step": "Call POST /api/ai/extract to extract fields"
}
```

---

#### `POST /api/ai/classify`
AI phân loại tài liệu.

**Request:**
```json
{ "source_document_id": "uuid" }
```

**Response 200:**
```json
{
  "classification": "lab_report",
  "confidence": 0.92,
  "suggested_type": "lab_report"
}
```

---

#### `POST /api/ai/extract`
AI Vision OCR trích xuất các trường từ document.

**Request:**
```json
{ "source_document_id": "uuid" }
```

**Response 200:**
```json
{
  "extracted_records": [
    {
      "id": "uuid",
      "field_name": "Glucose",
      "field_value": "6.2",
      "unit": "mmol/L",
      "reference_range": "3.9-5.6",
      "confidence_score": 0.95,
      "status": "pending"
    }
  ],
  "next_step": "User must confirm before saving to confirmed_records"
}
```

**IMPORTANT:** Extracted records ở trạng thái `pending` — phải gọi `POST /api/records/confirm` với user consent để chuyển sang `confirmed_records`.

---

#### `POST /api/records/confirm`
Người dùng xác nhận extracted records.

**Request:**
```json
{
  "extracted_record_ids": ["uuid1", "uuid2"],
  "confirmations": [
    { "id": "uuid1", "confirmed_value": "6.2", "confirmed_unit": "mmol/L" },
    { "id": "uuid2", "confirmed_value": "7.0", "confirmed_unit": "mmol/L" }
  ]
}
```

---

### 4.3 Timeline & Summary

#### `GET /api/timeline?citizen_id=<uuid>&from=<date>&to=<date>`
Lấy timeline sức khỏe.

**Response 200:**
```json
{
  "events": [
    {
      "id": "uuid",
      "event_type": "visit",
      "event_date": "2026-04-10T09:00:00Z",
      "title": "Khám định kỳ tại HaPu Center",
      "source_document_id": "uuid"
    }
  ],
  "total": 42
}
```

---

#### `GET /api/timeline/trends?citizen_id=<uuid>&metric=blood_pressure&period=6months`
Lấy xu hướng chỉ số sức khỏe.

**Response 200:**
```json
{
  "metric": "blood_pressure",
  "data_points": [
    { "date": "2026-01-01", "systolic": 125, "diastolic": 82 },
    { "date": "2026-02-01", "systolic": 120, "diastolic": 80 }
  ],
  "trend": "improving"
}
```

---

#### `POST /api/ai/summary`
Tạo tóm tắt sức khỏe AI với citation.

**Request:**
```json
{ "citizen_id": "uuid", "period": "3months" }
```

**Response 200:**
```json
{
  "summary": "Chỉ số huyết áp ổn định...",
  "citations": [
    { "record_id": "uuid", "type": "confirmed_record", "date": "2026-03-15" }
  ],
  "disclaimer": "AI chỉ hỗ trợ tổng hợp, không thay thế bác sĩ và không chẩn đoán bệnh."
}
```

---

### 4.4 Visit Preparation (service cốt lõi cho daycare)

#### `POST /api/ai/visit-prep`
AI tạo chuẩn bị đi khám 4 bước.

**Request:**
```json
{
  "citizen_id": "uuid",
  "visit_reason": "Khám định kỳ huyết áp",
  "target_facility": "BV Bạch Mai"
}
```

**Response 200:**
```json
{
  "prep_id": "uuid",
  "status": "ai_generated",
  "steps": {
    "step_1_symptoms": "...",
    "step_2_history": "...",
    "step_3_questions": ["..."],
    "step_4_documents": ["..."]
  }
}
```

---

#### `GET /api/visit-prep/<prep_id>/pdf`
Export PDF chuẩn bị đi khám.

**Response:** `application/pdf` binary stream

---

### 4.5 Family (cho persona "con cái theo dõi cha mẹ")

#### `POST /api/family`
Tạo family group.

#### `POST /api/family/invitations`
Mời thành viên vào family.

#### `GET /api/family/members/<memberId>/health`
Xem sức khỏe thành viên (nếu có quyền).

#### `GET /api/family/search?phone=<phone>`
Tìm user để mời.

---

### 4.6 Multi-branch (HaPu + các chi nhánh)

#### `GET /api/branches`
List tất cả chi nhánh.

#### `POST /api/branches`
Tạo chi nhánh mới.

**Request:**
```json
{
  "name": "HaPu Center",
  "address": "Thanh Xuân, Hà Nội",
  "director_id": "uuid",
  "capacity": 100,
  "operating_hours": "08:00-17:00"
}
```

#### `POST /api/branches/clone`
Clone chi nhánh hiện có để tạo chi nhánh mới.

#### `GET /api/branches/<id>/staff`
List nhân viên chi nhánh.

---

### 4.7 Messages & Notifications

#### `GET /api/messages`
Danh sách conversations.

#### `POST /api/messages/<conversationId>`
Gửi tin nhắn.

#### `GET /api/notifications`
Lấy notifications chưa đọc.

---

## 5. Webhook Integration

### 5.1 Incoming webhooks (partner → AIVIHE)

#### `POST /api/webhooks/sepay`
SePay payment webhook (đã implement).

**Request body:** Theo spec SePay VietQR.

**Verify signature:**
```javascript
const hmac = crypto.createHmac('sha256', process.env.SEPAY_WEBHOOK_SECRET);
hmac.update(rawBody);
const expected = `sha256=${hmac.digest('hex')}`;
if (req.headers['x-sepay-signature'] !== expected) return res.status(401);
```

---

### 5.2 Outgoing webhooks (AIVIHE → partner)

**Trạng thái:** Chưa implement — cần phát triển thêm bảng `webhook_subscriptions`.

**Đề xuất events:**

| Event | Khi nào fire | Payload |
|-------|--------------|--------|
| `citizen.created` | User mới đăng ký | `{citizen, timestamp}` |
| `member.approved` | Admin duyệt TV | `{citizen_id, branch_id}` |
| `payment.received` | SePay confirm | `{citizen_id, amount, tier}` |
| `document.uploaded` | Upload file | `{document_id, citizen_id, type}` |
| `health_event.confirmed` | Confirm record | `{event_id, citizen_id, event_type}` |
| `visit_prep.generated` | AI tạo xong | `{prep_id, citizen_id}` |
| `daycare.checkin` | Check-in daycare (TBD) | `{citizen_id, branch_id, date}` |
| `daycare.checkout` | Check-out daycare (TBD) | `{citizen_id, branch_id, date, vitals}` |

---

## 6. Tích hợp riêng cho Thong Dong Daycare

### 6.1 Schema bổ sung cần thiết

Những bảng sau **chưa có** trong AIVIHE hiện tại — cần bổ sung khi tích hợp Thong Dong Daycare:

```sql
-- Gói dịch vụ daycare
CREATE TABLE daycare_packages (
  id uuid PRIMARY KEY,
  code varchar(50) UNIQUE,         -- 'starter', 'active', 'recovery'
  name varchar(200),                -- 'Khởi động An tâm'
  price numeric(12,0),
  days_included int,
  duration_days int,
  benefits jsonb,
  insurance_partner varchar(100),   -- 'bao_minh' | null
  created_at timestamptz
);

-- Đăng ký gói của member
CREATE TABLE daycare_enrollments (
  id uuid PRIMARY KEY,
  citizen_id uuid REFERENCES citizens(id),
  package_id uuid REFERENCES daycare_packages(id),
  branch_id uuid REFERENCES branches(id),
  start_date date,
  expires_at date,
  days_used int DEFAULT 0,
  days_remaining int,
  status varchar(20),               -- 'active' | 'expired' | 'paused'
  partner_reference varchar(100),   -- mã KH Bảo Minh
  created_at timestamptz
);

-- Check-in/check-out hàng ngày
CREATE TABLE daycare_attendance (
  id uuid PRIMARY KEY,
  enrollment_id uuid REFERENCES daycare_enrollments(id),
  citizen_id uuid REFERENCES citizens(id),
  branch_id uuid REFERENCES branches(id),
  checkin_at timestamptz,
  checkout_at timestamptz,
  activities jsonb,                 -- {exercise, nutrition, rehab, consultation}
  vital_snapshot jsonb,             -- {bp, hr, spo2, glucose}
  notes text,
  recorded_by uuid REFERENCES citizens(id)
);

-- Thiết bị IoT đo chỉ số
CREATE TABLE device_readings (
  id uuid PRIMARY KEY,
  citizen_id uuid REFERENCES citizens(id),
  device_id varchar(100),
  device_type varchar(50),           -- 'bp_monitor' | 'glucose_meter' | 'scale'
  metric varchar(50),
  value numeric,
  unit varchar(20),
  recorded_at timestamptz,
  session_id uuid REFERENCES daycare_attendance(id)
);
```

### 6.2 API endpoints mới cần build

```
POST   /api/daycare/packages                  → List packages
POST   /api/daycare/enroll                    → Enroll citizen vào gói
GET    /api/daycare/enrollments/<citizen_id>  → Trạng thái gói hiện tại
POST   /api/daycare/checkin                   → Check-in hàng ngày
POST   /api/daycare/checkout                  → Check-out + vitals snapshot
POST   /api/daycare/devices/readings          → Ingest IoT data
GET    /api/daycare/attendance/<enrollment>   → Lịch sử attendance
GET    /api/daycare/stats/<branch_id>         → Thống kê chi nhánh
```

### 6.3 Luồng tích hợp Bảo Minh × Thong Dong Daycare

```
1. KH Bảo Minh xem offer          → Bảo Minh gửi email/SMS có link
2. KH click link                   → Landing page AIVIHE?ref=baominh&package=starter
3. KH xác nhận thông tin          → POST /api/auth/register (+partner_reference)
4. KH chọn gói                    → POST /api/daycare/enroll
5. Bảo Minh thanh toán            → Webhook /api/webhooks/baominh-payment
6. AIVIHE kích hoạt gói           → Fire webhook citizen.approved → Bảo Minh CRM
7. KH đến HaPu hàng ngày         → POST /api/daycare/checkin
8. Trung tâm đo vitals            → POST /api/daycare/devices/readings
9. End of day                     → POST /api/daycare/checkout (vitals snapshot)
10. AI analysis                   → POST /api/ai/summary → push Bảo Minh weekly report
```

---

## 7. Data flow examples

### 7.1 Daycare daily attendance flow

```
Morning 8:00
  └→ Staff scan QR member card
      └→ POST /api/daycare/checkin {enrollment_id, timestamp}
          └→ Response: {session_id, remaining_days}

Morning 9:00
  └→ Y tá đo huyết áp
      └→ POST /api/daycare/devices/readings {device: "bp", value: "120/80", session_id}
          └→ Stored to device_readings table

Afternoon 14:00
  └→ Bác sĩ tư vấn
      └→ POST /api/daycare/attendance/<session_id>/notes {consultation: "..."}

Evening 17:00
  └→ Check-out
      └→ POST /api/daycare/checkout {session_id, vital_snapshot}
          └→ Trigger AI summary for the day
          └→ Fire webhook daycare.checkout to Bảo Minh (if partner)
```

### 7.2 Document ingest from partner hospital

```
BV PHCN Hà Nội upload kết quả PHCN
  └→ POST /api/documents/upload {citizen_id, file, type: "other", facility: "BV PHCN"}
      └→ Response: {source_document_id}
          └→ POST /api/ai/classify {source_document_id}
              └→ POST /api/ai/extract {source_document_id}
                  └→ Response: {extracted_records[], status: "pending"}
                      └→ Notify member qua app → member review & confirm
                          └→ POST /api/records/confirm
```

---

## 8. Security & Compliance

### 8.1 Data protection

| Nguyên tắc | Thực hiện |
|-----------|-----------|
| User consent | Field `citizens.has_consented` MUST be true |
| Data ownership | Dữ liệu thuộc về user, chỉ chia sẻ khi có permission |
| PII protection | CCCD, BHYT mã hóa at rest trong Supabase |
| Audit logging | Mọi CUD ghi vào `audit_logs` table |
| RLS (Row-Level Security) | Supabase policies per-table |
| 3 câu disclaimer | Hiển thị trên mọi màn hình có AI |

### 8.2 Partner API guidelines

1. **MUST** verify webhook signature trước khi xử lý
2. **MUST** rate-limit call đến AIVIHE
3. **MUST** handle 429 (rate limit) với exponential backoff
4. **MUST NOT** cache citizen sensitive data > 24h
5. **MUST** log mọi API call với `X-Request-Id` header
6. **SHOULD** use idempotency key cho POST requests: header `Idempotency-Key: <uuid>`

### 8.3 Compliance

- Nghị định 13/2023/NĐ-CP (Bảo vệ dữ liệu cá nhân)
- Luật KCB 2023 (chuẩn hồ sơ y tế)
- NQ 72-NQ/TW (sổ sức khỏe điện tử theo vòng đời)

---

## 9. Error handling

### 9.1 Response format

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Số điện thoại không hợp lệ",
    "details": { "field": "phone", "reason": "invalid_format" }
  }
}
```

### 9.2 HTTP status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (missing/invalid auth) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable entity |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 503 | Service unavailable (Supabase/Claude down) |

### 9.3 Error codes

```
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
DUPLICATE_RESOURCE
AI_SERVICE_UNAVAILABLE
SUPABASE_ERROR
CONSENT_REQUIRED
RATE_LIMIT_EXCEEDED
INVALID_WEBHOOK_SIGNATURE
```

---

## 10. Testing & Sandbox

### 10.1 Demo accounts

Có sẵn 10 demo accounts trong hệ thống:

| Email | Role | Password |
|-------|------|---------|
| `minh@demo.aivihe.vn` | Member (bệnh nhân) | `Demo@2024` |
| `lan@demo.aivihe.vn` | Member (vợ) | `Demo@2024` |
| `bshai@demo.aivihe.vn` | Doctor | `Demo@2024` |
| `admin@demo.aivihe.vn` | Admin | `Demo@2024` |
| `tram@demo.aivihe.vn` | Director (công ty) | `Demo@2024` |
| `khanh@demo.aivihe.vn` | Branch director | `Demo@2024` |
| `hai@demo.aivihe.vn` | Super admin | `Demo@2024` |

### 10.2 Sandbox environment (TBD)

Sẽ deploy `https://sandbox.aivihe.vn/api` với:
- Reset data hàng ngày
- Test API keys
- Mock SePay webhook
- Mock Bảo Minh partner API

---

## 11. Roadmap tích hợp

| Giai đoạn | Công việc | Thời gian |
|-----------|-----------|-----------|
| **P0** | API key auth layer + sandbox | 2 tuần |
| **P1** | Daycare schema (packages, enrollments, attendance) | 2 tuần |
| **P2** | Device readings ingest API | 1 tuần |
| **P3** | Outgoing webhook system | 1 tuần |
| **P4** | Bảo Minh partner integration flow | 2 tuần |
| **P5** | BV PHCN Hà Nội data ingest | 1 tuần |
| **P6** | Sandbox environment setup | 1 tuần |
| **Total** | | **~10 tuần** |

---

## 12. Contact & Support

| Mục đích | Liên hệ |
|---------|---------|
| Technical integration | `dev@aivihe.vn` (TBD) |
| API access request | `partner@aivihe.vn` (TBD) |
| Bug report | GitHub: `HubertDoan/FBL-AIVIHE` |
| Project lead | PGS.TS. Doãn Ngọc Hải |

---

## 13. Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-04-12 | Initial integration guide |

---

## 14. Câu hỏi chưa giải quyết

1. **API key auth system** — chưa implement, cần bổ sung bảng `api_keys` với scopes + rate limiting
2. **Outgoing webhook subscriptions** — chưa có, cần bổ sung bảng `webhook_subscriptions` + delivery queue
3. **Daycare schema** — packages/enrollments/attendance/device_readings chưa có, cần migration
4. **Sandbox environment** — chưa deploy, cần setup CI/CD riêng
5. **Bảo Minh API spec** — partner chưa cung cấp spec kỹ thuật
6. **BV PHCN Hà Nội data format** — chưa xác định (HL7 FHIR? CDA? Custom?)
7. **Standard sổ sức khỏe điện tử quốc gia** — chuẩn dữ liệu theo NQ 72 chưa rõ ràng
8. **OAuth2 flow cho partner** — mô hình B2B (client_credentials) hay B2C (authorization_code)?
9. **Idempotency** — chưa enforce ở tất cả POST endpoints
10. **Data retention policy** — chưa định nghĩa thời gian lưu audit_logs, extracted_records pending

---

**Kết thúc tài liệu tích hợp**
