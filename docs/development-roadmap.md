# Development Roadmap — AIVIHE

**Cập nhật:** 24/04/2026 | **Chu Kỳ:** 6 tháng (Q2-Q4 2026)

---

## Overview

AIVIHE đang ở giai đoạn **MVP Foundation → Production Ready**. Roadmap dưới đây chia thành 4 sprint chính, mỗi sprint 2 tuần.

**Mục tiêu cuối năm:**
- Q2: Tích hợp Daycare, sẵn sàng production
- Q3: EMR BS gia đình, Alert Engine đầy đủ
- Q4: Family Portal, Device Integration, Scale 500+ users

---

## Phase 1: MVP Foundation (✅ Hoàn Thành — đến 21/04/2026)

### Features Completed (25 commits)

#### Landing & Branding
✅ Landing page redesign (PGS.TS. Doãn Ngọc Hải expert review)
- Banner: "Nền tảng quản lý sức khỏe cá nhân"
- Pain points highlighted
- Hero section: AIVIHE LEFT + MediExpress RIGHT (đối tác chiến lược)
- 2 CTA buttons (KH tư vấn + BS đăng ký)
- IoT sensors visualization (12 cảm biến)
- Service journey diagram
- 4 core values + 5 benefits groups (tabs)
- Ecosystem section + brand loyalty messaging

#### Authentication & Access
✅ Phone OTP auth (Supabase)
✅ Demo mode (bypass OTP, seed users)
✅ RBAC 12 roles, 34 permissions
✅ Multi-branch system
✅ Consent page + legal disclaimers

#### Core Dashboards
✅ Customer dashboard (health-first UX)
- Health status + activities
- Service packages display
- Organization info
- Quick links to main sections

✅ Director dashboard (9 tabs)
- KPI placeholders (to be filled with real data)
- Customer approvals
- Doctor applications
- Service registration overview
- E2E service flow visualizer

✅ Admin dashboard (8 tabs)
- Member management + password reset
- Announcements CRUD
- Branch management
- Audit logs viewer (placeholder)
- System stats
- Doctor approvals

✅ Manager dashboard (4 tabs)
- KPI monitoring
- Stats overview
- Announcements

✅ Reception dashboard (specialized)
- Pending consultation requests
- Contacted status
- Approved applicants
- Doctor applications
- Handoff to Daycare
- Handoff to PHCN
- Member list

#### Health Records & AI
✅ Health record 11-section UI (4 main sections for customers)
- Daycare summary (from Daycare via future webhook)
- Family Doctor encounters
- Rehab sessions
- Clinic visits

✅ AI-powered document OCR pipeline (full end-to-end — 24/04/2026)
- Multi-file upload (image/PDF) → Claude Vision real OCR extraction
- 4-field structured test table: NAME::VALUE::UNIT::REFERENCE_RANGE
- Auto-detect abnormal values from reference range comparison
- User review dialog with editable fields (diagnosis, medications, tests, follow_up)
- 3-layer save: source_documents → extracted_records → health_visits + lab_tests
- Health record tabs populated from source_documents.ai_classification (resilient source)
- "Xem tài liệu gốc" signed URL button in each clinic visit card
- Migration 00040: RLS policies for health_visits + lab_tests tables

✅ Document management
- Upload health documents (PDF, images)
- AI classification via Claude Vision (production-grade)
- Documents list with signed-URL "Xem" button (fixed broken href)
- Personal document bookmarking
- Sidebar: "TÀI LIỆU" section (health + personal)

✅ Treatment page redesign
- Redesigned "Đang Điều Trị" (In Treatment)
- Upload supplementary documents
- AI verify + user confirm

#### Supporting Features
✅ Visit preparation (4-step wizard)
- Input preparation questions
- AI suggests prep info
- PDF export for doctor visit

✅ Doctor application flow
- Public form → Reception → Director → Account creation

✅ Family doctor registration
- 5 doctors seeded
- Customers select family doctor
- Director approval workflow

✅ Notifications & messaging
- System notifications
- Messaging between users
- Unread count tracking

✅ Audit logging
- Every CUD operation logged
- User ID, action, table, timestamp tracked
- Admin can view audit logs

#### Staff UI Separation
✅ Management account UI (separate from customer)
- No personal health records shown
- Staff profile page instead
- Daycare staff, doctor, nurse roles

### Database State
- 40 migrations (00001 → 00040)
- 26+ tables; RLS on all
- Migration 00040 pending apply to production (RLS for health_visits + lab_tests)
- Seed data: 13 demo accounts + 5 doctors + 6 PDF samples + 2 vitals records

### Deployment
✅ Staging environment live at aivihe.vn
✅ Vercel auto-deploy from `main` branch
✅ Supabase Cloud (Seoul region)

---

## Sprint 1: Integration Contract & Production Deploy (12-25 April)

**Goal:** Finalize Daycare API contract, deploy to production, turn off demo mode.

### Database Migrations
- [ ] Migration 00038: Add `tdl_customer_code`, `location_code`, `customer_sequence` to `citizens`
- [ ] Migration 00039: Create `service_enrollments` table (TDL code per service line)
- [ ] Migration 00040: Create `integration_events` table (webhook audit log, idempotent)
- [ ] Migration 00041: Create `daycare_summary_cache` table (mirror Daycare daily summary)

### API Endpoints
- [ ] POST `/api/integration/reserve-tdl-code` — Reserve new TDL codes
  - Input: `{ location_code: "HN", quantity: 5 }`
  - Output: `{ codes: ["TDL-HN-000001", ...], sequence: 6 }`
  - Auth: Apikey + HMAC
  
- [ ] GET `/api/integration/citizens/{tdlCode}` — Lookup by TDL code
  - Output: citizen basic info + service status
  - Auth: Apikey
  
- [ ] POST `/api/webhooks/daycare-events` — Webhook receiver
  - Events: `customer_created`, `vital_recorded`, `daycare_daily_summary`, `incident_reported`, `medication_log`
  - Auth: HMAC SHA256 verification
  - Idempotency: `X-Daycare-Request-Id` header

### Data Import
- [ ] Import 5 Daycare sample customers
  - Assign TDL-HN-000001 through TDL-HN-000005
  - Set sequence counter to 6 (next request starts from 6)

### Deployment
- [ ] Create production Supabase project
- [ ] Migrate production database
- [ ] Configure production environment variables
- [ ] Turn off demo mode (enforce real auth)
- [ ] Deploy to production via Vercel
- [ ] Setup monitoring (error tracking, uptime)

### Testing
- [ ] E2E test TDL code reservation
- [ ] E2E test webhook receiver + idempotency
- [ ] E2E test Daycare integration flow
- [ ] Production smoke tests

### Documentation
- [ ] Finalize integration API spec
- [ ] Daycare team onboarding guide
- [ ] Production deployment runbook

**Owner:** Dev + DevOps
**Blocker:** Daycare API design finalization (sync call with Daycare team)

---

## Sprint 2: Cross-System Data Flow (26 April - 9 May)

**Goal:** Real-time data sync between Daycare ↔ AIVIHE, automatic alerts.

### Database Migrations
- [ ] Migration 00042: Create `vital_signs` table (time-series)
- [ ] Migration 00043: Create `vital_thresholds` table (per-user alert rules)
- [ ] Migration 00044: Create `alerts` table
- [ ] Migration 00045: Create `incident_logs` table

### Features
- [ ] Webhook receiver: Daycare vitals → AIVIHE timeline
  - Parse vital_recorded event
  - Insert into vital_signs (time-series indexed)
  - Display in customer health timeline
  
- [ ] Alert engine: Auto-alert on severity='red'
  - Check vital against thresholds
  - Create alert record if out of range
  - Notify customer + family members
  
- [ ] Webhook sender: AIVIHE → Daycare (reverse direction)
  - Event: `health_summary_updated` — Daily summary sent to Daycare staff
  - Event: `alert_raised` — Urgent alerts push to Daycare dashboard

### Testing
- [ ] Test vital recording via webhook
- [ ] Test alert generation on threshold breach
- [ ] Test bidirectional webhook flow

### Documentation
- [ ] Webhook event catalog
- [ ] Alert configuration guide

**Owner:** Backend dev
**Blocker:** Daycare webhook sender API (need their spec)

---

## Sprint 3: Medical EMR & BS Gia Đình (10-23 May)

**Goal:** Complete Family Doctor module, enable patient-doctor interaction.

### Features
- [ ] Family Doctor EMR page
  - Doctor encounters (khám, tư vấn, follow-up)
  - ICD-10 diagnosis codes
  - Chronic condition tracking
  - Doctor notes + attachments
  
- [ ] Medications prescribed
  - Doctor kê đơn
  - Medication list (name, dosage, frequency, duration)
  - Webhook push to Daycare: `medication_reminders` event
  - Daycare staff gets medication schedule
  
- [ ] Rehab module (basic)
  - Rehab sessions (date, exercises, progress)
  - Session assessments
  - Progress tracking
  
- [ ] Care Plans (basic)
  - Doctor creates care plan
  - Auto-assign tasks to Daycare
  - Webhook: `care_plan_updated` event

### Database Migrations
- [ ] Migration 00046-00048: EMR tables (encounters, diagnoses, medications)
- [ ] Migration 00049-00050: Rehab tables (sessions, assessments)
- [ ] Migration 00051: Care plans table

### UI
- [ ] Doctor profile: display family doctor info + schedule
- [ ] Doctor encounter form (clinical UI, not for customers)
- [ ] Medication list display (for customer)
- [ ] Care plan dashboard (for manager/director)

### Testing
- [ ] Doctor can create encounter + diagnosis
- [ ] Medication webhook sent correctly
- [ ] Care plan tasks auto-assign to Daycare

**Owner:** Full-stack dev (doctor + frontend)
**Dependencies:** Daycare webhook sender API

---

## Sprint 4: Family Portal & Polish (24 May - 6 June)

**Goal:** Enable family members to monitor elderly, cross-platform SSO, production hardening.

### Features
- [ ] Family Portal (role: family_viewer)
  - Timeline: merge Daycare activities + medical events
  - Weekly health report (AI-generated narrative)
  - Alert notifications (critical only)
  - Read-only access (no edit)
  
- [ ] SSO across domains
  - Share JWT between thongdonglife.vn (Daycare) ↔ aivihe.vn
  - Seamless login for shared users
  - Single logout
  
- [ ] Mobile responsive optimization
  - Test on iOS/Android
  - Touch target ≥48px
  - Font size ≥18px
  - Fix responsive gaps
  
- [ ] Vietnamese PDF fonts
  - Update @react-pdf/renderer with correct font rendering
  - Test PDF export on all records
  
- [ ] Performance optimization
  - Code splitting review
  - Lighthouse audit >90
  - Database query optimization (N+1 audit)

### Database Migrations
- [ ] (none expected, schema stable)

### Infrastructure
- [ ] Setup Sentry for error tracking
- [ ] Setup New Relic for performance monitoring
- [ ] Configure CI/CD for automated testing
- [ ] Setup database backup alerts

### Testing
- [ ] E2E family portal flow
- [ ] Mobile UI tests
- [ ] Performance benchmarks
- [ ] Security audit (OWASP top 10)

### Documentation
- [ ] Update all README + architecture docs
- [ ] Deployment guide for ops team
- [ ] Troubleshooting runbook

**Owner:** Full-stack + QA + DevOps
**Estimated effort:** High

---

## Phase 2: Scale & Optimization (Q3 2026)

### Q3 Planned Features
⏳ Device Integration (wearable, IoT real data)
⏳ Alert Engine (rule-based escalation)
⏳ Bảo Minh insurance integration
⏳ Voice input (Google Speech API)
⏳ Advanced reporting (export to Excel, scheduled email reports)

### Quality Improvements
⏳ Unit test coverage ≥80%
⏳ Load testing (1000 concurrent users)
⏳ Security penetration test
⏳ GDPR/privacy audit

---

## Phase 3: Long-term (Q4 2026 +)

### Advanced Features
⏳ VNeID integration (digital ID authentication)
⏳ Prescription sharing with pharmacy
⏳ Telemedicine video calls (Agora or Twilio)
⏳ AI care plan recommendations
⏳ Multi-language support (English fallback)

### Platform Expansion
⏳ Mobile app (React Native or Flutter)
⏳ Third-party integrations (hospital systems, lab, imaging)
⏳ Analytics dashboard for healthcare providers
⏳ Research data export (anonymized, GDPR-compliant)

---

## Progress Tracking

### Completed (✅)
- Phase 1: MVP Foundation (25 commits)

### In Progress (🚧)
- Sprint 1: Integration Contract (ETA: 25 April)

### Upcoming (⏳)
- Sprint 2: Data Flow (ETA: 9 May)
- Sprint 3: Medical EMR (ETA: 23 May)
- Sprint 4: Family Portal (ETA: 6 June)

---

## Key Metrics & Milestones

| Milestone | Target Date | KPI |
|-----------|-------------|-----|
| **Sprint 1 Complete** | 25 Apr | Production deploy, demo mode off |
| **Sprint 2 Complete** | 9 May | Daycare webhook bi-directional |
| **Sprint 3 Complete** | 23 May | 50 customers with family doctor |
| **Sprint 4 Complete** | 6 Jun | Family portal live, mobile responsive |
| **Q2 Checkpoint** | 30 Jun | 100 customers, 95% uptime, 0 critical bugs |
| **Q3 Checkpoint** | 30 Sep | 300+ customers, advanced features live |
| **Q4 Checkpoint** | 31 Dec | 500+ customers, mobile app beta, production hardened |

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Daycare API delays** | High | Block Sprint 1 | Weekly sync calls, early spec review |
| **Database scaling issues** | Medium | Performance degrade | Plan read replicas in Sprint 2 |
| **iOS/Android responsive gaps** | Medium | User frustration | Early mobile testing, dedicated QA |
| **AI accuracy (<95%)** | Medium | User distrust | Improve prompts, add validation rules |
| **Integration webhook failures** | Low | Data loss | Retry logic, DLQ queue, alerts |

---

## Team & Resource Requirements

### Current (Q2)
- 1-2 Full-stack devs
- 1 DevOps/infrastructure
- 1 Product manager (part-time)

### Required (Q3)
- +1 Mobile dev (iOS/Android)
- +1 UI/UX designer
- +1 QA automation
- +1 Product manager (full-time)

### Estimated Cost
- Payroll: ~200M VND/month
- Infrastructure: ~50M VND/month
- Services (Claude API, Supabase): ~20M VND/month

**Total:** ~270M VND/month in Q2, scaling to 400M+ in Q3-Q4

---

## Success Criteria

### Q2 2026 (Production Ready)
- [ ] Zero critical bugs in production
- [ ] 99% API uptime
- [ ] <500ms p95 response time
- [ ] Daycare integration fully tested
- [ ] 50 customer beta users
- [ ] All documentation complete

### Q3 2026 (Scale Phase)
- [ ] 300+ active customers
- [ ] Family Portal launch
- [ ] Device integration MVP
- [ ] >95% AI extraction accuracy
- [ ] >80% test coverage

### Q4 2026 (Mature Platform)
- [ ] 500+ customers
- [ ] Mobile app beta available
- [ ] Insurance integration live
- [ ] <100ms p95 response time (with caching)
- [ ] Zero security incidents

---

## Notes

- **Priorities:** Production stability > new features
- **Quality:** Always maintain test coverage + code review
- **Communication:** Weekly sprint updates to stakeholders
- **Flexibility:** Adjust roadmap based on user feedback + market needs

---

*Detailed sprints: See individual sprint planning docs in `plans/` directory.*
