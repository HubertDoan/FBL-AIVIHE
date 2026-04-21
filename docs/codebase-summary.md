# Codebase Summary — AIVIHE

**Cập nhật:** 21/04/2026 | **Framework:** Next.js 16 App Router | **Language:** TypeScript

---

## Metrics

| Metric | Value |
|--------|-------|
| **Source files** | 409 (.ts/.tsx) |
| **API routes** | 72+ REST endpoints |
| **DB migrations** | 26 SQL files |
| **Component modules** | 20+ feature folders |
| **RBAC roles** | 12 |
| **Permissions** | 34 |
| **Database tables** | 26+ |
| **Demo accounts** | 10 (all roles) |

---

## Directory Structure

```
aivihe/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Login, register, consent, forgot-password
│   │   ├── admin/                     # Admin panel (members, announcements, branches)
│   │   ├── api/                       # 72+ API routes (all REST endpoints)
│   │   │   ├── admin/                 # Members, stats, users, audit-logs
│   │   │   ├── ai/                    # Claude: classify, extract, summary, visit-prep
│   │   │   ├── auth/                  # Register, callback, change-password
│   │   │   ├── branches/              # CRUD + clone
│   │   │   ├── director/              # Announcements, greeting, search
│   │   │   ├── doctor/                # Profile, referral, schedule (planning)
│   │   │   ├── documents/             # Upload, retrieve
│   │   │   ├── family/                # Invitations, members, search, doctor
│   │   │   ├── integration/           # [Sprint 1] reserve-tdl-code, citizens lookup
│   │   │   ├── membership/            # Card, payments, register
│   │   │   ├── messages/              # Conversations, unread
│   │   │   ├── notifications/         # Send, get
│   │   │   ├── permissions/           # Assign, user roles
│   │   │   ├── profile/               # Health overview
│   │   │   ├── records/               # Health records, lab, imaging
│   │   │   ├── timeline/              # Feed, health events
│   │   │   ├── treatment/             # AI verify, upload
│   │   │   ├── visit-prep/            # Wizard, PDF export
│   │   │   ├── webhooks/              # SePay, daycare-events (Sprint 1)
│   │   │   └── ...
│   │   └── dashboard/                 # 20+ pages (role-based: member, doctor, admin, director)
│   │       ├── (member)/              # Customer dashboard, health-record, etc.
│   │       ├── (doctor)/              # Doctor dashboard (TBD)
│   │       ├── (admin)/               # Admin panel
│   │       └── (director)/            # Director KPI, approvals, etc.
│   │
│   ├── components/
│   │   ├── brand/                     # Logos (FBL, AIVIHE, Thong Dong Life)
│   │   ├── layout/                    # Header, sidebar, nav, footer, disclaimer
│   │   ├── ui/                        # shadcn/ui (button, card, dialog, etc.)
│   │   ├── auth/                      # Login, register, consent components
│   │   ├── dashboard/                 # Dashboard cards, health status, stats
│   │   ├── doctor/                    # Doctor-related UI components
│   │   ├── family/                    # Family invitation, member cards
│   │   ├── health-record/             # Record sections, tabs, forms
│   │   ├── forms/                     # Reusable forms (profile, health, etc.)
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── ai/                        # Claude API integration, prompts
│   │   ├── constants/                 # Roles, specialties, lab-test-types, medical-conditions
│   │   ├── integration/               # [Sprint 1] webhook verify, TDL code, event processor
│   │   ├── permissions/               # RBAC matrix (12 roles × 34 permissions)
│   │   ├── supabase/                  # Client, middleware, service-role client
│   │   ├── validators/                # Zod schemas (input validation)
│   │   ├── utils/                     # cn(), helpers, formatters
│   │   └── types/                     # Database types (generated from Supabase)
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts                 # Auth state + user info
│   │   ├── useActingAs.ts             # Impersonation (admin)
│   │   ├── usePermissions.ts           # Check permissions
│   │   └── ...
│   │
│   ├── types/
│   │   └── database.ts                # Auto-generated types from Supabase (365 lines)
│   │
│   └── middleware.ts                  # Auth routing, public/demo/protected pages
│
├── supabase/
│   ├── migrations/                    # 26+ numbered SQL migrations (00001-00037)
│   ├── seed.sql                       # Seed data (demo accounts, test data)
│   └── all_migrations_combined.sql    # Combined for reference
│
├── public/
│   ├── fbl-logo.jpg                   # FBL branding logo
│   ├── AIVIHE.jpg                     # AIVIHE logo
│   └── ...
│
├── .env.example                       # Example env vars
├── tsconfig.json                      # TypeScript config (strict mode enabled)
├── next.config.js                     # Next.js config
├── tailwind.config.ts                 # Tailwind CSS 4 config
├── package.json                       # Dependencies
└── .eslintrc.json                     # ESLint config
```

---

## Key Modules & Patterns

### 1. Authentication Flow
**File:** `src/app/(auth)/`, `src/lib/supabase/middleware.ts`

```
Phone Number Input
  ↓
Supabase Phone OTP Send
  ↓
User Enters OTP
  ↓
Supabase Auth Create/Update User
  ↓
Middleware: Check role → Route to dashboard
```

**Demo Mode:** Seeded users bypass OTP in development.

### 2. RBAC (Role-Based Access Control)
**File:** `src/lib/permissions/role-permission-matrix.ts`, `hooks/usePermissions.ts`

```
auth.user.role
  ↓
usePermissions() hook
  ↓
Check permission in matrix (12 roles × 34 permissions)
  ↓
Render/Hide components or deny API access
```

**Enforcement:** API routes check permission via middleware.

### 3. AI Pipeline
**File:** `src/lib/ai/`, `src/app/api/ai/`

```
User uploads document (image/PDF)
  ↓
Frontend: Read file → call /api/ai/extract
  ↓
Backend: POST to Claude Vision API
  ↓
Claude extracts JSON (vital_signs, medications, etc.)
  ↓
Frontend: Show extracted data + "Confirm" button
  ↓
User reviews & clicks "Save"
  ↓
Backend: Insert into confirmed_records table + audit log
```

**Validation:** Zod schema validates Claude output before use.

### 4. 3-Layer Data Architecture
**Files:** Supabase migrations, `src/lib/supabase/`

```
Layer 1: source_documents (immutable)
  ├── file_type: 'image', 'pdf'
  ├── file_url: 's3://storage/...'
  ├── uploaded_by: user_id
  └── created_at: timestamp

        ↓ Claude Vision OCR

Layer 2: extracted_records (AI output)
  ├── source_id: FK → source_documents
  ├── data: JSON (extracted fields)
  ├── confidence: float (0-1)
  └── status: 'pending', 'reviewed'

        ↓ User confirms

Layer 3: confirmed_records (ground truth)
  ├── extracted_id: FK → extracted_records
  ├── data: JSON (user-confirmed)
  ├── confirmed_by: user_id
  └── confirmed_at: timestamp
```

### 5. Supabase Integration
**File:** `src/lib/supabase/`

**Client (browser):**
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, anonKey);
// RLS enforced automatically
await supabase.from('citizens').select('*');
```

**Server (API routes):**
```typescript
const { data, error } = await supabase
  .from('citizens')
  .select('*')
  .eq('user_id', userId);
// Service role bypasses RLS (audit log insert only)
```

**RLS Policy Example:**
```sql
-- Users can read own health data
CREATE POLICY "Users can read own health data"
  ON health_records
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 6. API Route Pattern
**File:** `src/app/api/[route]/route.ts`

```typescript
export async function POST(req: Request) {
  try {
    // 1. Validate request
    const body = InputSchema.parse(await req.json());
    
    // 2. Check permission
    const { role } = await getUser(req);
    if (!hasPermission(role, 'action_name')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // 3. Process logic
    const result = await supabase.from('table').insert(body);
    
    // 4. Audit log
    await auditLog(userId, 'create', 'table', result.id);
    
    // 5. Return response
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
```

---

## File Naming Convention

### Components (kebab-case, descriptive)
- `health-timeline-filter.tsx` — Filter component for health timeline
- `doctor-profile-form.tsx` — Form to create/edit doctor profile
- `vital-sign-card.tsx` — Reusable vital signs card
- `treatment-upload-section.tsx` — Section for uploading treatment docs

### API Routes (feature-based)
- `src/app/api/profile/health/route.ts`
- `src/app/api/documents/upload/route.ts`
- `src/app/api/dashboard/health-overview/route.ts`

### Constants
- `src/lib/constants/roles.ts` — Role enum + display names
- `src/lib/constants/medical-specialties.ts` — Specialty list
- `src/lib/constants/lab-test-types.ts` — Lab test reference

### Validators
- `src/lib/validators/health-record-schema.ts`
- `src/lib/validators/document-upload-schema.ts`

---

## Data Flow: UI → API → Database

### Example: Upload Vitals via OCR

1. **User uploads image** (Frontend: `src/app/dashboard/(member)/health-record/page.tsx`)
   ```typescript
   const file = await input.files[0];
   const formData = new FormData();
   formData.append('file', file);
   
   const response = await fetch('/api/ai/extract', {
     method: 'POST',
     body: formData,
   });
   ```

2. **Extract via Claude Vision** (`src/app/api/ai/extract/route.ts`)
   ```typescript
   const buffer = await file.arrayBuffer();
   const base64 = Buffer.from(buffer).toString('base64');
   
   const message = await anthropic.messages.create({
     model: 'claude-3-5-sonnet-20241022',
     max_tokens: 1024,
     messages: [{
       role: 'user',
       content: [{
         type: 'image',
         source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
       }, {
         type: 'text',
         text: 'Extract vital signs from this image...',
       }],
     }],
   });
   ```

3. **Validate output** (Zod schema)
   ```typescript
   const schema = z.object({
     systolic: z.number(),
     diastolic: z.number(),
     pulse: z.number(),
   });
   const extracted = schema.parse(JSON.parse(message.content[0].text));
   ```

4. **Save to database** (3-layer)
   ```typescript
   // Layer 1: source_documents
   const { data: sourceDoc } = await supabase
     .from('source_documents')
     .insert({ file_url, file_type: 'image', uploaded_by });
   
   // Layer 2: extracted_records
   const { data: extracted } = await supabase
     .from('extracted_records')
     .insert({ source_id: sourceDoc.id, data: extracted });
   
   // Return to frontend for user review
   return NextResponse.json(extracted);
   ```

5. **User confirms** (Frontend calls `/api/vitals/confirm`)
   ```typescript
   const { data: confirmed } = await supabase
     .from('confirmed_records')
     .insert({
       extracted_id: extractedId,
       data: userReviewedData,
       confirmed_by: userId,
     });
   ```

---

## Integration Code (Sprint 1)

### Daycare TDL Code Reservation
**File:** `src/app/api/integration/reserve-tdl-code/route.ts`

```typescript
POST /api/integration/reserve-tdl-code
{
  "location_code": "HN",
  "quantity": 5
}

Response:
{
  "codes": ["TDL-HN-000001", "TDL-HN-000002", ...],
  "sequence": 6
}
```

### Webhook Verification
**File:** `src/lib/integration/webhook-verification.ts`

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
```

### Event Processor
**File:** `src/lib/integration/event-processor.ts`

```typescript
export async function processWebhookEvent(event: DaycareEvent) {
  switch (event.type) {
    case 'customer_created':
      return handleCustomerCreated(event);
    case 'vital_recorded':
      return handleVitalRecorded(event);
    // ...
  }
}
```

---

## Testing Strategy

**Current Status:** ⏳ TODO (Phase 2)

### Plan
1. **Unit Tests** — Validators, helpers, permission matrix
   ```bash
   npm run test -- --coverage
   ```

2. **API Integration Tests** — Supabase mocking via `vitest`
   ```typescript
   test('POST /api/profile/update should update user', async () => {
     // Mock supabase
     // Call API
     // Assert response
   });
   ```

3. **E2E Tests** — Playwright
   ```bash
   npx playwright test
   ```

4. **Coverage Goal:** ≥80% for business logic

---

## Performance Considerations

| Aspect | Status | Notes |
|--------|--------|-------|
| **Image optimization** | ✅ Done | Next.js Image component (auto-resizing) |
| **Code splitting** | ✅ Done | Next.js App Router (dynamic imports) |
| **Database queries** | 🟡 Review | Some N+1 queries possible, needs optimization |
| **Caching** | 🟡 Planned | SWR for dashboard fetches (Phase 2) |
| **Monitoring** | ⏳ TODO | New Relic or Sentry (post-production) |

---

## Hot Spots & Technical Debt

| Issue | Priority | Action |
|-------|----------|--------|
| **Doctor dashboard not optimized** | High | Simplify UI, reduce API calls (Sprint 3) |
| **AI prompt hardcoding** | Medium | Move to config files (Phase 2) |
| **Audit log scaling** | Low | Implement log archival (post-launch) |
| **Mobile responsive gaps** | Medium | Test on iOS/Android (Sprint 4) |
| **Vietnamese fonts on PDF** | High | Update @react-pdf/renderer (Sprint 4) |

---

## Dependencies

### Core
- `next` 16.2.1 — Framework
- `react` 19 — UI library
- `typescript` 5.x — Type safety
- `tailwindcss` 4.x — Styling
- `shadcn-ui` — Component library
- `zod` 4.3 — Validation

### Database & Auth
- `@supabase/supabase-js` 2.100+ — Supabase client
- `@supabase/auth-helpers-nextjs` — Auth middleware

### AI
- `@anthropic-ai/sdk` 0.80+ — Claude API

### Charts & Export
- `recharts` 3.8+ — Charts
- `@react-pdf/renderer` 4.3+ — PDF export

### Validation
- `zod` 4.3+ — Schema validation

---

## Development Workflow

### Local Setup
```bash
# 1. Clone repo
git clone https://github.com/HubertDoan/FBL-AIVIHE.git
cd aivihe

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Fill: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY

# 4. Run migrations (optional, Supabase does auto)
npx supabase migration up

# 5. Start dev server
npm run dev
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes, test, commit
git add .
git commit -m "feat: add feature description"

# Push & create PR
git push origin feat/your-feature
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build, deps, etc.

---

## Deployment

### Staging (auto-deploy from `main`)
```bash
# GitHub → Vercel
# URL: https://aivihe.vn
# Supabase: staging project (Seoul)
```

### Production
```bash
# Trigger: Create release tag `v1.0.0`
# Deploy: Vercel production
# Database: Supabase production
# Monitoring: TODO (Phase 2)
```

---

## Common Tasks

### Add New Page
1. Create `src/app/dashboard/(group)/new-page/page.tsx`
2. Add route in navigation sidebar
3. Check RBAC permissions
4. Test with demo users

### Add New API Endpoint
1. Create `src/app/api/feature/action/route.ts`
2. Validate input with Zod
3. Check permission in middleware
4. Add audit log
5. Test with `curl` or Postman

### Add New Permission
1. Add to `src/lib/permissions/role-permission-matrix.ts`
2. Update role enum
3. Test permission checks

### Update Database Schema
1. Create SQL migration in `supabase/migrations/`
2. Run locally: `npx supabase migration up`
3. Deploy to staging/production

---

## Useful Links

- **GitHub:** https://github.com/HubertDoan/FBL-AIVIHE
- **Live:** https://aivihe.vn
- **Supabase:** https://supabase.com/dashboard
- **Anthropic Claude API:** https://console.anthropic.com

---

*Tài liệu chi tiết: `project-overview-pdr.md`, `system-architecture.md`, `code-standards.md`*
