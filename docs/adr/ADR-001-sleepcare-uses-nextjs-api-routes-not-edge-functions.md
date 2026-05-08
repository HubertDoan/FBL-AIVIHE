# ADR-001: SleepCare sử dụng Next.js API Routes thay vì Supabase Edge Functions

**Status:** Accepted  
**Date:** 2026-05-08  
**Sprint:** SleepCare Sprint 1 — Task T03  
**Deciders:** SmartBed Wellness Team + AIVIHE Tech Lead  

---

## Context

SleepCare module cần xử lý dữ liệu SmartBed (sensor readings, AI report generation, consent management) phía server. Có hai lựa chọn:

1. **Next.js API Routes** (`src/app/api/sleepcare/...`) — chạy trên Vercel serverless
2. **Supabase Edge Functions** — chạy trên Deno runtime, gần DB hơn

---

## Decision

**Chọn Next.js API Routes.**

---

## Rationale

| Tiêu chí | Next.js API Routes | Supabase Edge Functions |
|---|---|---|
| Ngôn ngữ | TypeScript (Node.js) | TypeScript (Deno) |
| Shared types | ✅ Import trực tiếp từ `@/lib/` | ❌ Phải copy/publish riêng |
| Claude API call | ✅ `@anthropic-ai/sdk` | ⚠️ Deno npm compat không chắc |
| Session auth | ✅ Dùng `getDemoUser()` / Supabase session | ⚠️ Cần setup riêng |
| Monitoring | ✅ Vercel logs + existing stack | ⚠️ Supabase dashboard riêng |
| Cold start | ~50ms | ~10ms |
| DB latency | +5ms (Seoul → Vercel) | ~1ms |

**Kết luận:** Lợi ích của shared types và unified codebase > 5ms DB latency difference. SleepCare không có latency-critical real-time paths — readings được batch insert từ pod qua webhook, không phải inline query.

---

## Consequences

- **Positive:** Tất cả SleepCare routes (`/api/sleepcare/*`) nằm trong `src/app/api/sleepcare/` — same deployment, same auth, same types.
- **Positive:** Demo mode (`isDemoMode()`) hoạt động transparent — không cần mock Edge Function.
- **Negative:** DB queries đi qua Vercel → Seoul thay vì local to Supabase. Acceptable cho batch/async paths.
- **Constraint:** Nếu tương lai cần real-time streaming từ pod (sub-100ms), cân nhắc lại ADR này.

---

## Affected Files

```
src/app/api/sleepcare/
├── sessions/route.ts        — T07
├── generate-ai-report/route.ts  — T22
├── consents/route.ts        — T30
└── ...
```

---

## Related

- T07-T13: API routes implementation
- ADR-004: AI 3-layer citation (dùng trong `generate-ai-report/route.ts`)
