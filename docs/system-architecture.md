# System Architecture — AIVIHE

**Cập nhật:** 21/04/2026 | **Design Pattern:** Federated Coexistence (AIVIHE ↔ Daycare)

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      AIVIHE (Master)                           │
│  Customer Master + Health Data + AI Intelligence               │
│  Next.js 16 + Supabase PostgreSQL + Claude API                │
└──────────┬────────────────┬──────────────────┬─────────────────┘
           │                │                  │
   REST API            Webhooks           UI Portal
   (Apikey)         (HMAC SHA256)      (Browser)
           │                │                  │
    ┌──────▼──┐     ┌──────▼──┐      ┌───────▼────────┐
    │ Daycare │     │ BSGD    │      │ Family Member  │
    │ (App)   │     │ (Portal)│      │ (Portal)       │
    └─────────┘     └─────────┘      └────────────────┘
    (Prisma+Neon)   (AIVIHE Tab)     (Read-only)
```

---

## Technology Stack

| Layer | Component | Technology | Version |
|-------|-----------|-----------|---------|
| **Frontend** | SPA | Next.js App Router + React | 16.2.1 |
| **Styling** | CSS | Tailwind CSS + shadcn/ui | 4.x |
| **Backend** | API Routes | Next.js API Routes + TypeScript | 16.2.1 |
| **Database** | RDBMS | PostgreSQL (Supabase) | 14+ |
| **Authentication** | Auth | Supabase Phone OTP + JWT | 2.100+ |
| **Storage** | Files | Supabase Storage (S3-compatible) | — |
| **AI** | LLM | Anthropic Claude API | 3.5 Sonnet |
| **Charts** | Visualization | Recharts | 3.8+ |
| **PDF** | Export | @react-pdf/renderer | 4.3+ |
| **Validation** | Schema | Zod | 4.3+ |
| **Deploy** | Hosting | Vercel (Frontend) + Supabase Cloud (Backend) | — |

---

## System Components

### 1. Frontend (Next.js 16 App Router)

**Structure:**
```
src/app/
├── (auth)/                    # Public auth pages (login, register)
├── (dashboard)/               # Protected dashboard pages (role-based)
│   ├── (member)/             # Customer dashboard
│   ├── (doctor)/             # Doctor dashboard
│   ├── (admin)/              # Admin panel
│   └── (director)/           # Director KPI + approvals
├── admin/                     # Super admin panel
└── api/                       # 72+ REST API endpoints
```

**Key Features:**
- Server Components by default (performance)
- Client Components only when needed (`'use client'`)
- Route groups for organizing by role
- Middleware for auth checking
- Loading states + error boundaries

### 2. Backend (API Routes)

**Endpoint Categories:**

| Category | Endpoints | Purpose |
|----------|-----------|---------|
| Auth | 5 | Login, register, callback, password reset |
| Profile | 8 | User data, health info, family members |
| Health Records | 12 | Vitals, lab, imaging, diagnoses, treatments |
| AI | 4 | Extract, classify, summarize, visit-prep |
| Documents | 6 | Upload, retrieve, verify |
| Admin | 15 | Members, users, audit-logs, stats |
| Director | 8 | Approvals, announcements, KPI |
| Integration | 6 | TDL codes, citizens lookup, webhooks |
| Messaging | 8 | Messages, conversations, notifications |
| Other | 4 | Branches, permissions, feedback |

**Pattern:**
```typescript
// 1. Validate input
const body = InputSchema.parse(await req.json());

// 2. Check authentication
const user = await getUser(req);
if (!user) return unauthorized();

// 3. Check authorization
if (!hasPermission(user.role, 'action')) return forbidden();

// 4. Process logic
const result = await database.insert(body);

// 5. Audit log
await auditLog(user.id, 'create', 'table', result.id);

// 6. Return response
return NextResponse.json(result);
```

### 3. Database (PostgreSQL via Supabase)

**Connection:**
- Supabase client in browser: uses RLS policies
- Supabase service role in API routes: for audit logs
- All queries use prepared statements (Supabase enforces)

**Row-Level Security (RLS):**
```sql
-- Users can read own health data
CREATE POLICY "users_read_own"
  ON health_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can read all
CREATE POLICY "admin_read_all"
  ON health_records
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM citizens
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
```

### 4. Storage (Supabase Storage)

**Buckets:**
- `health-documents` — Health records (PDF, images)
- `personal-documents` — Personal files (ID, passport, etc.)
- `vitals-images` — Measurement device photos for OCR

**Access:**
- Authenticated users upload to their own folder
- RLS enforced: users can only access own files
- Public URLs generated with signed expiry

### 5. Authentication (Supabase Phone OTP)

**Flow:**
```
1. User enters phone number
   ↓
2. Supabase sends OTP via SMS
   ↓
3. User enters OTP
   ↓
4. Supabase creates/updates user in auth.users
   ↓
5. JWT issued automatically
   ↓
6. Middleware checks JWT + role
   ↓
7. Route user to appropriate dashboard
```

**Demo Mode:**
- Bypass OTP in development
- Seed users with known credentials
- Useful for testing multiple roles

### 6. AI Engine (Claude API)

**Use Cases:**

| Use Case | Endpoint | Process |
|----------|----------|---------|
| **Vitals OCR** | `/api/ai/extract` | Image → Claude Vision → JSON vitals |
| **Document Classify** | `/api/ai/classify` | Document type detection |
| **Health Summary** | `/api/ai/summary` | Generate narrative summary from records |
| **Visit Prep** | `/api/ai/visit-prep` | Generate doctor prep questions |

**Pipeline:**
```
1. User uploads image/document
   ↓
2. Frontend calls /api/ai/{action}
   ↓
3. Backend reads file from Storage
   ↓
4. Claude Vision processes image (base64)
   ↓
5. Zod validates JSON output
   ↓
6. Save to extracted_records layer
   ↓
7. Frontend shows user for review
   ↓
8. User clicks "Confirm"
   ↓
9. Save to confirmed_records layer
```

**Prompt Management:**
- Prompts are in `src/lib/ai/prompts.ts`
- Vietnamese instruction sets
- No diagnosis/prescription (safety-critical)

### 7. Integration Layer (Daycare ↔ AIVIHE)

**Architecture:**
```
Thong Dong Daycare          AIVIHE
(Prisma + Neon)      ◄──► (Next.js + Supabase)
     │                           │
     └─ REST API ────────────────┘
        + Webhooks (HMAC)
        + Apikey
```

**API Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/integration/reserve-tdl-code` | Get new TDL codes |
| GET | `/api/integration/citizens/{tdlCode}` | Lookup citizen |
| POST | `/api/webhooks/daycare-events` | Receive events from Daycare |

**Webhook Verification:**
```typescript
// Incoming webhook from Daycare
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string) {
  const hash = crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

// In route handler
const signature = req.headers.get('x-signature');
const isValid = verifySignature(body, signature, process.env.DAYCARE_WEBHOOK_SECRET);
if (!isValid) return new Response('Unauthorized', { status: 401 });
```

**Event Types:**
- `customer_created` — New customer from Daycare
- `vital_recorded` — Health measurement
- `daycare_daily_summary` — Daily summary
- `incident_reported` — Emergency/incident
- `medication_log` — Medication given

**Idempotency:**
- Header: `X-Daycare-Request-Id`
- Store in `integration_events` table
- Webhook receiver checks before processing
- Prevents duplicate data on retry

---

## Data Architecture — 3 Layers

### Layer 1: Source Documents (Immutable)

**Purpose:** Store original files uploaded by users

**Columns:**
```typescript
{
  id: UUID;
  user_id: UUID;
  file_type: 'image' | 'pdf' | 'document';
  file_url: string; // Supabase Storage path
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: UUID;
  created_at: timestamp;
  // Mandatory audit columns
  owner_system: 'daycare' | 'aivihe' | 'rehab' | 'device';
  source: 'daycare_staff' | 'family_doctor' | 'user_upload' | 'wearable';
  scope: 'general_care' | 'clinical' | 'rehab' | 'administrative';
}
```

**Immutability:** No UPDATE/DELETE allowed. Append-only log.

### Layer 2: Extracted Records (AI Output)

**Purpose:** Store AI-generated data before user confirmation

**Columns:**
```typescript
{
  id: UUID;
  source_document_id: UUID; // FK
  data: JSON; // { systolic: 120, diastolic: 80, pulse: 72, ... }
  confidence: float; // 0.0-1.0
  status: 'pending' | 'reviewed' | 'rejected';
  created_at: timestamp;
  reviewed_at: timestamp;
  reviewed_by: UUID;
  // Same audit columns as Layer 1
}
```

**Purpose:** Temporary holding area for AI output. User reviews & confirms or rejects.

### Layer 3: Confirmed Records (Ground Truth)

**Purpose:** Final, user-confirmed health data

**Columns:**
```typescript
{
  id: UUID;
  extracted_record_id: UUID; // FK (if from AI)
  data: JSON; // Same or modified by user
  confirmed_by: UUID;
  confirmed_at: timestamp;
  notes: text; // User additions/corrections
  // Same audit columns
}
```

**Truth:** This layer is canonical. Displayed in dashboards, used for alerts, exported in reports.

### Data Flow Example: Vitals OCR

```
User uploads image of blood pressure machine
  │
  └─→ source_documents (raw image)
       ├─ id: doc-123
       ├─ file_url: 's3://health-documents/user-1/vitals-20260421.jpg'
       ├─ uploaded_by: user-1
       └─ owner_system: 'aivihe'
         │
         └─→ Claude Vision processes image
              │
              └─→ extracted_records (AI output)
                   ├─ id: extract-456
                   ├─ source_document_id: doc-123
                   ├─ data: { systolic: 140, diastolic: 90, pulse: 72 }
                   ├─ confidence: 0.95
                   └─ status: 'pending'
                     │
                     └─→ User sees "Confirm" dialog
                          │
                          ├─ User modifies data (if needed)
                          │
                          └─→ confirmed_records (ground truth)
                              ├─ id: confirm-789
                              ├─ extracted_record_id: extract-456
                              ├─ data: { systolic: 140, diastolic: 90, pulse: 72 }
                              ├─ confirmed_by: user-1
                              └─ confirmed_at: 2026-04-21T10:30:00Z
```

---

## Database Schema

### Customer Master
```
citizens
├── id (PK)
├── user_id (FK auth.users)
├── name, phone, email
├── date_of_birth, gender
├── address, city, district
├── tdl_code (unique) "TDL-HN-000001"
├── health_profile_id (FK)
└── status: 'active', 'archived'

health_profiles
├── id (PK)
├── user_id (FK)
├── blood_type
├── allergies (JSONB)
├── chronic_conditions (JSONB)
└── insurance_info
```

### Health Records (3-Layer)
```
source_documents
├── id (PK)
├── user_id (FK)
├── file_url, file_type, mime_type
├── owner_system, source, scope
└── created_at

extracted_records
├── id (PK)
├── source_document_id (FK)
├── data (JSON)
├── confidence
├── status
└── created_at

confirmed_records
├── id (PK)
├── extracted_record_id (FK)
├── data (JSON)
├── confirmed_by, confirmed_at
└── notes
```

### Family & Relationships
```
families
├── id (PK)
├── owner_id (FK citizens) — who created the family
└── name

family_members
├── id (PK)
├── family_id (FK)
├── user_id (FK) — member of this family
└── relationship: 'child', 'spouse', 'sibling', 'other'

family_permissions
├── id (PK)
├── family_member_id (FK)
├── permission: 'read_health', 'read_all', 'manage_family'
└── granted_by
```

### Vital Signs & Alerts
```
vital_signs
├── id (PK)
├── user_id (FK)
├── vital_type: 'blood_pressure', 'heart_rate', 'spo2', 'temperature', 'glucose'
├── value (JSON) { systolic: 140, diastolic: 90 }
├── unit: 'mmHg', 'bpm', '%', 'C', 'mg/dL'
├── measured_at
└── source: 'manual', 'device', 'clinic', 'wearable'

vital_thresholds
├── id (PK)
├── user_id (FK)
├── vital_type
├── lower_limit, upper_limit
├── severity: 'warning', 'critical'
└── updated_by

alerts
├── id (PK)
├── user_id (FK)
├── vital_id (FK)
├── severity: 'info', 'warning', 'critical'
├── message
├── created_at
└── acknowledged_at
```

### Audit & Integration
```
audit_logs
├── id (PK)
├── user_id (FK)
├── action: 'create', 'update', 'delete', 'read'
├── table_name
├── record_id
├── changes (JSONB)
├── created_at
└── ip_address

integration_events
├── id (PK)
├── request_id (unique) — X-Daycare-Request-Id
├── event_type
├── payload (JSONB)
├── status: 'processed', 'failed', 'retried'
├── received_at
└── processed_at
```

---

## Security Model

### Authentication
- **Method:** Supabase Phone OTP + JWT
- **Session:** JWT stored in secure cookie (httpOnly)
- **Expiry:** 24 hours (refresh token for longer)
- **Demo:** Bypass OTP in development only

### Authorization (RBAC)
- **Matrix:** 12 roles × 34 permissions
- **Check:** Every API endpoint validates permission
- **Enforcement:** Middleware + usePermissions hook
- **Audit:** Every action logged with user_id

### Data Privacy (RLS)
- **Policy:** Every table has RLS enabled
- **Base Rule:** `auth.uid() = user_id` (users access own data)
- **Exception:** Admin/director access via special policies
- **Family Access:** `is_family_manager_of(auth.uid(), record_user_id)`

### Data Protection
- **Encryption:** TLS for all network traffic
- **Hashing:** Passwords via Supabase (bcrypt)
- **Storage:** Supabase Storage uses S3 encryption
- **Audit Trail:** Immutable audit_logs table

### Integration Security
- **API Key:** Apikey header (rotate quarterly)
- **Webhook Signature:** HMAC SHA256 (verify before processing)
- **Idempotency:** `X-Daycare-Request-Id` prevents duplicates
- **Logging:** All integration events logged in `integration_events`

---

## Deployment Architecture

### Development
```
Local machine
├── npm run dev
├── Supabase local (optional)
└── Demo data seeded
```

### Staging (auto-deploy from `main` branch)
```
GitHub (main) → Vercel (staging)
├── URL: aivihe.vn
├── Supabase: staging project (Seoul)
├── Environment: .env.staging
└── Auto-rebuild on push
```

### Production
```
GitHub (release tag) → Vercel (production)
├── URL: aivihe.vn (same domain, routing via Vercel)
├── Supabase: production project (Seoul)
├── Environment: .env.production
├── Database: Daily backup (Supabase managed)
└── Monitoring: Sentry, New Relic (Phase 2)
```

### Database Backup
- **Supabase Managed:** Daily backups, 30-day retention
- **Manual:** Export via Supabase dashboard
- **Recovery:** Point-in-time restore available

---

## Performance Optimization

### Frontend
- **Code Splitting:** Next.js App Router (automatic per route)
- **Image Optimization:** Next.js Image component
- **CSS-in-JS:** Tailwind (static analysis, no runtime)
- **Caching:** SWR for dashboard data (Phase 2)

### Backend
- **Query Optimization:** Index on frequently filtered columns
- **Connection Pooling:** Supabase handles via PgBouncer
- **CDN:** Vercel edge caching for static assets
- **API Response:** <500ms p95 (target)

### Database
- **Indexes:**
  ```sql
  CREATE INDEX idx_citizens_user_id ON citizens(user_id);
  CREATE INDEX idx_health_records_user_id ON health_records(user_id);
  CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
  ```
- **Partitioning:** audit_logs by date range (future)
- **Monitoring:** Supabase dashboard (query performance)

---

## Monitoring & Observability

**Current Status:** ⏳ Phase 2

**Plan:**
- **Logs:** Structured logging → Sentry
- **Metrics:** API response time, error rate, user activity
- **Uptime:** Uptimerobot or similar
- **Dashboards:** Grafana (TBD)

---

## Disaster Recovery

| Scenario | RTO | Recovery |
|----------|-----|----------|
| **Database failure** | <4 hours | Restore from daily backup |
| **App server down** | <5 min | Vercel auto-redeploy |
| **Storage bucket corrupted** | <24 hours | Restore from backup |
| **Compromised API key** | <15 min | Rotate key, investigate audit logs |
| **DDoS attack** | Variable | Vercel DDoS protection + Cloudflare (if added) |

---

## Scalability

### Current Capacity
- **Concurrent Users:** ~500 (estimated, based on Supabase tier)
- **Database:** PostgreSQL standard (can scale to 4GB)
- **Storage:** 100GB (expandable)

### Scaling Path
1. **Phase 1 (now):** Supabase Standard tier
2. **Phase 2 (1k users):** Supabase Pro tier (+ read replicas)
3. **Phase 3 (5k+ users):** Custom Postgres + sharding
4. **Caching Layer:** Redis for sessions + hot data (if needed)

---

## Compliance & Standards

- **Data Privacy:** Nghị định 13/2023 (Personal data protection)
- **Encryption:** TLS 1.2+ for transport, AES-256 for storage
- **Audit Trail:** Immutable logs with tamper detection
- **Consent:** User consent before AI processing
- **GDPR-ready:** Can export/delete user data on request

---

*Chi tiết cấu hình xem: `codebase-summary.md`, `code-standards.md`*
