# AIVIHE — Health Data Backbone

**AI · VI · HE** = Artificial Intelligence · Vietnam · Health

Nền tảng dữ liệu sức khỏe cho hệ sinh thái Thong Dong Life. Quản lý hồ sơ khách hàng thống nhất, EMR bác sỹ gia đình, PHCN, chỉ số sức khỏe, và AI trợ lý.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Backend | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui |
| Database + Auth | Supabase (PostgreSQL + Phone OTP + RLS) |
| AI | Claude API (Vision OCR + Text) |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| Deploy | Vercel + Supabase Cloud |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in Supabase URL, keys, Claude API key

# 3. Run dev server
npm run dev          # http://localhost:3000

# 4. Build for production
npm run build
```

**Prerequisites**: Node.js 20+, Supabase project

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Login, register, consent
│   ├── api/          # REST API routes (72+ endpoints)
│   ├── dashboard/    # User dashboard + modules
│   └── admin/        # Admin panel
├── components/       # React components by feature
├── lib/              # Utilities, constants, validators
│   ├── permissions/  # RBAC (12 roles, 34 permissions)
│   └── supabase/     # DB client & auth
├── hooks/            # React hooks
└── types/            # TypeScript types
supabase/
├── migrations/       # SQL migrations (26+)
└── seed scripts
docs/                 # Technical documentation
```

## Integration

AIVIHE tích hợp với **Thong Dong Daycare** (repo riêng) qua:
- REST API: `/api/integration/*` (TDL code, citizens, health summary)
- Webhooks: `/api/webhooks/daycare-events` (HMAC SHA256 + idempotent)
- TDL Customer Code: `TDL-{location}-{sequence}` — mã thống nhất toàn hệ thống

## Documentation

- Business specs: `../docs/specs/`
- Technical docs: `./docs/`
- Implementation plans: `../plans/`
