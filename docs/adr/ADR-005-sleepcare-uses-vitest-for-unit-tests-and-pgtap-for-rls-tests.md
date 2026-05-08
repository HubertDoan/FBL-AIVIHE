# ADR-005: SleepCare dùng Vitest cho unit tests và pgTAP cho RLS tests

**Status:** Accepted  
**Date:** 2026-05-08  
**Sprint:** SleepCare Sprint 1 — Task T03  
**Deciders:** SmartBed Wellness Team + AIVIHE Tech Lead  

---

## Context

SleepCare cần test strategy cho hai loại logic:

1. **Business logic** — permission checks, prompt building, data aggregation (TypeScript)
2. **RLS policies** — row-level security trên `smartbed_*` tables (PostgreSQL)

---

## Decision

**Vitest cho TypeScript unit tests. pgTAP cho PostgreSQL RLS tests.**

---

## Rationale

### Vitest (TypeScript)

| Tiêu chí | Vitest | Jest |
|---|---|---|
| ESM native | ✅ | ⚠️ Cần transform |
| TypeScript | ✅ Zero config | ⚠️ Cần ts-jest |
| Next.js 16 compat | ✅ | ⚠️ Cần setup |
| Speed | Nhanh hơn ~3x | Chậm hơn |
| Existing usage | ✅ Đã dùng trong AIVIHE | — |

**Kết luận:** AIVIHE đã dùng Vitest — SleepCare không tạo thêm test toolchain.

### pgTAP (PostgreSQL RLS)

| Tiêu chí | pgTAP | Supabase CLI test | Manual SQL |
|---|---|---|---|
| TAP output | ✅ | ✅ | ❌ |
| CI integration | ✅ | ✅ | ❌ |
| RLS isolation | ✅ `SET ROLE` | ✅ | ⚠️ |
| Local Supabase | ✅ | ✅ | ⚠️ |

**Kết luận:** pgTAP chạy qua `supabase test db` — tích hợp sẵn với Supabase CLI workflow.

---

## Test Coverage Requirements

### Unit Tests (Vitest) — `src/lib/sleepcare/__tests__/`

```
permission-sleepcare-module-flags.test.ts
  ✓ citizen với package_type=4 → có MODULE_SLEEP_TRACKING
  ✓ citizen không có package_type=4 → không có MODULE_SLEEP_TRACKING
  ✓ doctor role → có MODULE_SLEEP_TRACKING by default
  ✓ admin role → có MODULE_SLEEP_ALERTS by default

sleep-report-prompt-builder.test.ts
  ✓ buildSleepUserPrompt() inject sessionId vào output
  ✓ buildSleepUserPrompt() inject podId vào output
  ✓ buildSleepUserPrompt() KHÔNG chứa CCCD pattern
  ✓ buildSleepUserPrompt() KHÔNG chứa số điện thoại pattern
  ✓ events array rỗng → hiển thị "Không có sự kiện bất thường"

sleep-session-data-validation.test.ts
  ✓ Zod schema validate đúng SleepSessionData
  ✓ Reject nếu thiếu sessionId
  ✓ Reject nếu deepSleepRatio > 100
  ✓ Reject nếu avgSpO2 < 0 hoặc > 100
```

### RLS Tests (pgTAP) — `supabase/tests/sleepcare-rls-policy.sql`

```sql
-- 5 scenarios bắt buộc (từ SmartBed team checklist):

-- Scenario 1: citizen chỉ đọc được session của mình
SELECT ok(
  (SELECT COUNT(*) FROM smartbed_sessions WHERE citizen_id != auth.uid()) = 0,
  'citizen cannot read other citizens sessions'
);

-- Scenario 2: doctor đọc được session của patient được assign
-- Scenario 3: admin đọc được tất cả sessions
-- Scenario 4: viewer (family) chỉ đọc được nếu có consent
-- Scenario 5: unauthenticated user không đọc được gì
```

---

## File Structure

```
src/lib/sleepcare/
└── __tests__/
    ├── permission-sleepcare-module-flags.test.ts      — T31
    ├── sleep-report-prompt-builder.test.ts            — T31
    └── sleep-session-data-validation.test.ts          — T31

supabase/tests/
└── sleepcare-rls-policy.sql                          — T32
```

---

## Run Commands

```bash
# Unit tests
pnpm vitest run src/lib/sleepcare

# RLS tests (requires local Supabase running)
supabase test db

# All tests
pnpm test
```

---

## CI Integration

Thêm vào GitHub Actions workflow:

```yaml
- name: Run SleepCare unit tests
  run: pnpm vitest run src/lib/sleepcare --reporter=verbose

- name: Run SleepCare RLS tests
  run: supabase test db --db-url ${{ secrets.SUPABASE_DB_URL }}
```

---

## Consequences

- **Positive:** Không thêm test framework mới — Vitest đã có trong `package.json`.
- **Positive:** pgTAP output là TAP format — parse được bởi hầu hết CI systems.
- **Positive:** RLS tests chạy được trên local Supabase (không cần production DB).
- **Negative:** pgTAP cần `supabase start` chạy trước — thêm ~30s CI startup time.
- **Constraint:** Privacy tests (CCCD pattern check) cần regex update nếu format CCCD thay đổi.

---

## Related

- T31-T32: SleepCare test implementation tasks
- ADR-003: RLS policy patterns (tested bởi pgTAP)
- ADR-004: AI prompt privacy (tested bởi `sleep-report-prompt-builder.test.ts`)
