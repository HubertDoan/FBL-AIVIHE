# Codebase Summary

> Cập nhật: 13/04/2026

## Metrics

| Metric | Value |
|--------|-------|
| Source files | 271 (.ts/.tsx) |
| API routes | 72 REST endpoints |
| DB migrations | 26 SQL files |
| Components | 20+ feature folders |
| RBAC roles | 12 |
| Permissions | 34 |
| Demo accounts | 10 (all roles) |

## Directory Structure

```
src/
├── app/
│   ├── (auth)/           # login, register, consent
│   ├── admin/            # admin panel
│   ├── api/              # 72+ API routes
│   │   ├── admin/        # members, announcements, stats, users
│   │   ├── ai/           # classify, extract, summary, visit-prep
│   │   ├── auth/         # register, callback, change-password
│   │   ├── branches/     # CRUD + clone
│   │   ├── director/     # announcements, greeting, search
│   │   ├── doctor*/      # profile, referral, schedule
│   │   ├── documents/    # upload
│   │   ├── family*/      # invitations, members, search, doctor
│   │   ├── integration/  # [Sprint 1] reserve-tdl-code, citizens
│   │   ├── membership/   # card, payments, register
│   │   ├── messages/     # conversations, unread
│   │   ├── permissions/  # assign, user
│   │   ├── profile/      # health
│   │   ├── webhooks/     # sepay, daycare-events
│   │   └── ...           # feedback, notifications, records, timeline, treatment
│   └── dashboard/        # 20+ pages (member, doctor, admin, director)
├── components/
│   ├── brand/            # logos (Thong Dong Life + AIVIHE)
│   ├── layout/           # header, sidebar, disclaimer
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # auth, dashboard, doctor, family, membership...
├── lib/
│   ├── ai/               # Claude API integration
│   ├── constants/        # roles, medical-specialties, lab-test-types
│   ├── integration/      # [Sprint 1] webhook verify, TDL code, event processor
│   ├── permissions/      # RBAC matrix (12 roles × 34 permissions)
│   ├── supabase/         # client, middleware, service role
│   ├── validators/       # Zod schemas
│   └── utils/            # cn(), helpers
├── hooks/                # useAuth, useActingAs, usePermissions
├── types/                # database.ts (365 lines)
└── middleware.ts          # auth routing (public/demo/protected)

supabase/
├── migrations/           # 26+ numbered SQL migrations
├── all_migrations_combined.sql
└── seed scripts
```

## Key Patterns

- **3-Layer Data**: source_documents → extracted_records → confirmed_records
- **RBAC**: `src/lib/permissions/` — role matrix checked via `usePermissions()` hook
- **Supabase RLS**: Row-level security on all tables, `auth.uid()` based
- **AI Pipeline**: Upload → Claude Vision OCR → User confirm → Save
- **Integration**: Webhook receiver/sender (HMAC + idempotent) — Sprint 1
- **Zod validation** on all external inputs
- **Audit logging** on all CUD operations

## Integration Code (Sprint 1)

```
src/app/api/integration/
├── reserve-tdl-code/route.ts    # POST — cấp mã TDL mới
└── citizens/[tdlCode]/route.ts  # GET — lookup by TDL code

src/app/api/webhooks/
├── sepay/route.ts               # SePay payment webhook (existing)
└── daycare-events/route.ts      # Daycare webhook receiver (new)

src/lib/integration/
├── webhook-verification.ts      # HMAC SHA256 verify
├── tdl-code-generator.ts        # TDL-{PROVINCE}-{SEQ6}
└── event-processor.ts           # Route events to handlers
```
