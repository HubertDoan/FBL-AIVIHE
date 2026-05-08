# ADR-003: SleepCare RLS dùng trường `citizens.role` không dùng JWT claim

**Status:** Accepted  
**Date:** 2026-05-08  
**Sprint:** SleepCare Sprint 1 — Task T03  
**Deciders:** SmartBed Wellness Team + AIVIHE Tech Lead  

---

## Context

Supabase RLS policies cần biết role của user để phân quyền đọc/ghi bảng `smartbed_*`. Có hai cách:

1. **JWT claim** — `auth.jwt()->>'role'` từ Supabase Auth token
2. **Database field** — `citizens.role` lookup qua `auth.uid()`

---

## Decision

**Dùng `citizens.role` field (database lookup), nhất quán với toàn bộ hệ thống AIVIHE hiện tại.**

---

## Rationale

**Tại sao không dùng JWT claim:**
- Supabase JWT không tự động include custom claims — cần `custom_access_token_hook` (Edge Function)
- JWT claim bị cache đến khi token refresh (~1 giờ) — nếu role thay đổi, phải chờ hoặc force refresh
- AIVIHE hiện tại 100% dùng `citizens.role` lookup — thêm JWT claim = 2 sources of truth

**Tại sao dùng `citizens.role`:**
- Consistent với tất cả RLS policies hiện có trong codebase
- Role change có hiệu lực ngay lập tức (no cache)
- Demo mode (`isDemoMode()`) bypass RLS hoàn toàn — không cần mock JWT
- Pattern đã được audit trong security checklist Phase 1

---

## RLS Pattern Chuẩn

```sql
-- Template cho smartbed_* tables
CREATE POLICY "citizens_own_data" ON smartbed_sessions
  FOR SELECT
  USING (
    citizen_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM citizens
      WHERE id = auth.uid()
      AND role IN ('doctor', 'admin', 'super_admin', 'director')
    )
  );
```

**Không dùng:**
```sql
-- ❌ KHÔNG dùng pattern này
USING (auth.jwt()->>'role' = 'doctor')
```

---

## Consequences

- **Positive:** Zero new Edge Functions, zero JWT hook setup.
- **Positive:** Role revocation có hiệu lực ngay — quan trọng với dữ liệu nhạy cảm sức khỏe.
- **Positive:** Consistent với toàn bộ 46 migrations hiện có.
- **Negative:** Mỗi RLS check = 1 subquery vào `citizens` table. Mitigate bằng index `citizens(id, role)`.
- **Constraint:** Nếu tương lai migrate sang Supabase Auth custom claims, phải update toàn bộ RLS policies.

---

## Index Required

```sql
-- Đảm bảo subquery RLS không gây slow scan
CREATE INDEX IF NOT EXISTS idx_citizens_id_role ON citizens(id, role);
```

Kiểm tra index này đã có trong migration 00001 hoặc thêm vào migration 00047.

---

## Affected Tables (Sprint 1)

```
smartbed_pods
smartbed_sessions
smartbed_readings   (hypertable — RLS inherited)
smartbed_events
smartbed_consents
```

---

## Related

- `supabase/migrations/00047_sleepcare_doctor_profiles_and_family_members.sql` — T05
- ADR-002: Role mapping cho SleepCare personas
- `docs/security-hardening-phase1-deployment-checklist.md` — RLS audit checklist
