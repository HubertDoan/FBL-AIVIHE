# System Architecture

## Overview

```
NGƯỜI DÂN / GIA ĐÌNH
        ↓
TÀI KHOẢN SỨC KHỎE CÁ NHÂN (Phone OTP Auth)
        ↓
KHO DỮ LIỆU SỨC KHỎE 3 LỚP
  Layer 1: Source Documents (immutable)
  Layer 2: Structured Data (AI + user confirmed)
  Layer 3: Insights (AI summaries with citations)
        ↓
AI AGENT TRỢ LÝ (Claude API)
  - OCR extraction
  - Document classification
  - Health summary
  - Visit preparation
        ↓
GIA ĐÌNH / BÁC SĨ GIA ĐÌNH
  - Role-based access
  - Update on behalf
  - Advisory notes
        ↓
GÓI HỒ SƠ ĐI KHÁM (PDF export)
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14+ App Router | SSR + Client components |
| UI | Tailwind CSS + shadcn/ui | Elder-friendly design |
| Backend | Next.js API Routes | REST API endpoints |
| Database | Supabase (PostgreSQL) | Data with RLS |
| Auth | Supabase Auth (Phone OTP) | Vietnamese phone numbers |
| Storage | Supabase Storage | Immutable document storage |
| AI | Claude API (Anthropic) | Vision OCR + Text generation |
| Charts | Recharts | Health trend visualization |
| PDF | @react-pdf/renderer | Visit preparation export |
| Deploy | Vercel + Supabase Cloud | Singapore region |

## Database Schema

### Core Tables
- `citizens` — central, links to auth.users
- `health_profiles` — blood type, allergies, emergency info
- `families` + `family_members` — group management with roles

### Document Pipeline (3-Layer)
- `source_documents` — Layer 1, immutable files
- `extracted_records` — AI extraction with confidence scores
- `confirmed_records` — Layer 2, user-verified data

### Medical Data
- `health_events` — timeline backbone
- `health_visits` → `clinical_exams`, `diagnoses`
- `lab_tests`, `imaging`, `treatments`, `medications`
- `vaccinations`, `chronic_diseases`

### Features
- `visit_preparations` — specialty-based visit prep with AI summary
- `audit_logs` — every operation logged
- `feedbacks` — user feedback system

## Security Model

### Row Level Security (RLS)
- Every table has RLS enabled
- Users access own data via `auth.uid()`
- Family managers access via `is_family_manager_of()` function
- Audit logs: insert-only, users read own only

### Data Privacy
- Health data = sensitive personal data (Nghị định 13/2023)
- User controls all sharing
- Consent required on first use
- Audit trail for every access

## API Structure

```
/api/auth/callback          — Supabase auth callback
/api/documents/upload       — File upload to storage
/api/ai/extract             — Claude Vision OCR
/api/ai/classify            — Document type classification
/api/ai/summary             — Health summary generation
/api/ai/visit-prep          — Visit preparation AI
/api/records/confirm        — User confirms extracted data
/api/timeline               — Health events with filters
/api/family                 — Family group management
/api/visit-prep             — Visit preparations CRUD
/api/feedback               — User feedback
/api/admin/*                — Admin endpoints
```
