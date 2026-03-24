# Codebase Summary

## Structure

```
aivihe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, consent)
│   │   ├── (dashboard)/        # Protected pages (all 13 screens)
│   │   ├── admin/              # Admin panel
│   │   └── api/                # REST API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── layout/             # App shell (sidebar, header, disclaimer)
│   │   ├── auth/               # Phone OTP, consent
│   │   ├── documents/          # Upload, preview, list
│   │   ├── extraction/         # AI extraction review + confirm
│   │   ├── timeline/           # Timeline view, cards, charts
│   │   ├── profile/            # Personal info, health profile
│   │   ├── family/             # Family management
│   │   ├── summary/            # AI health summary
│   │   ├── visit-prep/         # Visit preparation
│   │   └── feedback/           # User feedback
│   ├── lib/
│   │   ├── supabase/           # Client, server, middleware, storage
│   │   ├── ai/                 # Claude API client, prompts, parsers
│   │   ├── validators/         # Zod schemas
│   │   ├── utils/              # Formatting, audit logger
│   │   ├── constants/          # Medical specialties, lab types, roles
│   │   └── pdf/                # PDF templates
│   ├── types/                  # TypeScript interfaces
│   └── hooks/                  # React hooks
├── supabase/migrations/        # 22 SQL migration files
├── docs/                       # Project documentation
└── scripts/                    # Utility scripts
```

## Key Patterns

- **Server Components** for data display (Timeline, Summary)
- **Client Components** for interactive forms (Upload, Extraction, Profile)
- **API Routes** for data mutations and AI calls
- **Supabase RLS** for row-level security on all tables
- **Zod validation** on all external inputs
- **Audit logging** on all CUD operations
