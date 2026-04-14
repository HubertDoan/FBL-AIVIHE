# Development Roadmap

> Cập nhật: 13/04/2026. Theo kiến trúc Federated Coexistence (AIVIHE ↔ Daycare).

## Đã hoàn thành: MVP Foundation

- [x] Next.js 16 + Supabase + Tailwind + shadcn/ui
- [x] 26 database migrations + RLS policies
- [x] Auth (Phone OTP) + demo mode + 10 accounts
- [x] Landing page + branding Thong Dong Life + AIVIHE
- [x] Dashboard (member/admin/doctor/director/reception)
- [x] Document upload + AI OCR extraction + confirm flow
- [x] Health timeline + trend charts (Recharts)
- [x] Profile (3 tabs) + Family Group + notifications
- [x] Visit preparation (4-step wizard + PDF)
- [x] Admin panel (members, announcements, branches)
- [x] RBAC 12 roles, 34 permissions, multi-branch schema
- [x] Messaging, feedback, membership registration
- [x] Branding migration FBL → Thong Dong Life

## Sprint 1 (12-25/04) — Integration Contract + Production Deploy

- [ ] Migration: `tdl_customer_code` + `location_code` + `customer_sequence` trên citizens
- [ ] Migration: `service_enrollments` table
- [ ] Migration: `integration_events` audit log
- [ ] Migration: `daycare_summary_cache` table
- [ ] API: `POST /api/integration/reserve-tdl-code`
- [ ] API: `GET /api/integration/citizens/{tdlCode}`
- [ ] API: `POST /api/webhooks/daycare-events` (5 event types, HMAC auth)
- [ ] Import 5 Daycare customers (TDL-HN-000001→000005), set sequence=6
- [ ] Deploy production (Vercel + Supabase thật)
- [ ] Tắt demo mode → Supabase Auth production

## Sprint 2 (26/04-09/05) — Cross-system Data Flow

- [ ] Migration: `vital_signs` + `vital_thresholds` tables
- [ ] Migration: `alerts` + `incident_logs` tables
- [ ] Webhook merger: Daycare vitals → AIVIHE timeline
- [ ] Auto-alert on severity='red'
- [ ] Webhook sender: AIVIHE → Daycare (health_summary_updated, alert_raised)

## Sprint 3 (10-23/05) — Medical EMR + BS Gia Đình

- [ ] Family Doctor EMR: encounters, ICD-10, diagnoses
- [ ] Medications prescribed + webhook push to Daycare
- [ ] Rehab module: sessions, assessments, progress
- [ ] Care Plans: BS tạo → tasks auto-assign Daycare
- [ ] Customer profile unified 11-tab UI (role-based)

## Sprint 4 (24/05-06/06) — Family Portal + SSO + Polish

- [ ] Family Portal (timeline cross Daycare + medical, weekly report AI)
- [ ] SSO cross-domain (shared JWT between thongdonglife.vn ↔ AIVIHE)
- [ ] Mobile responsive audit
- [ ] Vietnamese PDF fonts
- [ ] Performance optimization

## Future

- Device Integration (SmartBed, wearable, box y tế)
- Bảo Minh insurance integration
- Voice input (Google Speech)
- VNeID integration
