# Code Standards

## Principles
- **YAGNI**: Don't build what's not needed now
- **KISS**: Simplest solution that works
- **DRY**: Extract shared logic, but don't over-abstract

## File Conventions
- **Naming**: kebab-case, descriptive (e.g. `health-timeline-filter.tsx`)
- **Max size**: 200 lines per code file. Split if larger.
- **Components**: One component per file, named export
- **Types**: Separate `types/` directory, not inline

## TypeScript
- Strict mode enabled
- Interfaces over types for objects
- Zod schemas for all external input validation
- No `any` — use `unknown` + type narrowing

## React / Next.js
- Server Components by default, Client only when needed (`'use client'`)
- App Router with route groups: `(auth)`, `(dashboard)`
- API routes in `src/app/api/` with proper error responses
- Loading states with Vietnamese text for elderly users

## Styling
- Tailwind CSS utility classes
- shadcn/ui for base components
- Elder-friendly: base font 18px, touch target ≥48px, high contrast
- No icon-only buttons — always include Vietnamese text labels

## Error Handling
- try-catch in all API routes and server actions
- User-facing errors in Vietnamese
- Log errors to console (Phase 1), structured logging later
- Never expose internal errors to client

## Database
- All queries via Supabase client (RLS enforced)
- Audit log every CUD operation
- Use service role only for audit_logs insert and seed data

## AI Integration
- All AI output validated with Zod before use
- Confidence scores on every extracted field
- Mandatory disclaimer on every AI-generated content
- Never diagnose, prescribe, or create unsourced claims

## Git
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- No secrets, no .env files committed
- Keep commits focused on single changes
