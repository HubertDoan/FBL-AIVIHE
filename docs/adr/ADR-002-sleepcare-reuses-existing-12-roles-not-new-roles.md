# ADR-002: SleepCare tái sử dụng 12 roles hiện có, không tạo roles mới

**Status:** Accepted  
**Date:** 2026-05-08  
**Sprint:** SleepCare Sprint 1 — Task T03  
**Deciders:** SmartBed Wellness Team + AIVIHE Tech Lead  

---

## Context

SleepCare giới thiệu vai trò "kỹ thuật viên SmartBed" — người lắp đặt, bảo trì pod, và xem dữ liệu kỹ thuật. Câu hỏi: tạo role `smartbed_technician` mới hay map vào role hiện có?

**12 roles hiện tại:**
```
super_admin, director, branch_director, admin,
doctor, specialist, nurse, reception,
daycare_coordinator, daycare_staff,
member, viewer
```

---

## Decision

**Không tạo role mới. Map SmartBed technician → `admin` role với permission flags.**

---

## Rationale

**Vấn đề với role mới:**
- Supabase RLS policies hiện có dùng `citizens.role` hardcoded — thêm role mới = update tất cả policies
- Sidebar navigation dùng `role` để show/hide tabs — thêm role = update tất cả layout conditionals
- Demo seed data, test fixtures, permission matrix đều cần cập nhật
- RBAC spec đã được duyệt với 12 roles — thay đổi cần re-approval

**Giải pháp với permission flags:**
- `admin` role + `MODULE_SLEEP_TRACKING` permission = SmartBed access
- Technician nhận permission qua `service_enrollments` (package_type=4) hoặc admin assignment
- `computeExtraPermissionsFromRegistrations` xử lý logic này tại `/api/permissions`
- Không cần touch RLS policies, không cần touch layout conditionals

**Precedent:** Pattern này đã dùng cho PHCN specialist (role=`specialist` + `MODULE_PHCN_*` permissions).

---

## Consequences

- **Positive:** Zero RLS policy changes, zero layout changes, zero seed data changes.
- **Positive:** Granular permission control — admin có thể có `MODULE_SLEEP_TRACKING` nhưng không có `MODULE_SLEEP_ALERTS` (ví dụ).
- **Negative:** Role label "admin" không mô tả đúng ngữ nghĩa của technician. Cần document rõ mapping này.
- **Constraint:** Nếu tương lai cần permissions hoàn toàn khác biệt (technician không được đọc EMR), phải tạo role mới khi đó.

---

## Mapping

| Persona | Role | Required Permissions |
|---|---|---|
| SmartBed technician | `admin` | `MODULE_SLEEP_TRACKING` |
| Bác sĩ theo dõi giấc ngủ | `doctor` | `MODULE_SLEEP_TRACKING`, `MODULE_SLEEP_ALERTS` |
| Khách hàng có SleepCare | `member` | `MODULE_SLEEP_TRACKING`, `MODULE_SLEEP_ALERTS` (via package_type=4) |
| Gia đình xem báo cáo | `viewer` | `MODULE_SLEEP_TRACKING` (read-only) |

---

## Related

- `src/lib/permissions/permission-definitions.ts` — định nghĩa `MODULE_SLEEP_TRACKING`, `MODULE_SLEEP_ALERTS`
- `src/lib/permissions/role-default-permissions.ts` — default permissions per role
- `src/app/api/permissions/route.ts` — `computeExtraPermissionsFromRegistrations`
- ADR-003: RLS dùng `citizens.role` field
