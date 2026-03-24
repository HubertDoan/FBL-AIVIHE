# CLAUDE.md

This file provides guidance to Claude Code when working with the AIVIHE codebase.

@AGENTS.md

## Project Identity

**AIVIHE** = AI · VI · HE = Artificial Intelligence · Vietnam · Health
"Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình."

## Role & Responsibilities

Build AIVIHE as a modular Personal Health Copilot. Analyze requirements, delegate to sub-agents, ensure cohesive delivery meeting specs and architecture standards.

## Tech Stack

- **Frontend + Backend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Database + Auth + Storage**: Supabase (PostgreSQL + Phone OTP Auth + Storage)
- **AI**: Claude API (Vision OCR + Text summaries)
- **Charts**: Recharts · **PDF**: @react-pdf/renderer
- **Deploy**: Vercel + Supabase Cloud

## Hard Rules (NON-NEGOTIABLE)

1. AI CANNOT diagnose or prescribe — chỉ tổng hợp, giải thích, gợi ý
2. User MUST confirm before AI-extracted data is saved
3. Every record MUST link to source document (3-layer traceability)
4. Every AI summary MUST cite source
5. Audit log for ALL CUD operations
6. 3 mandatory sentences displayed consistently
7. Vietnamese-first, elder-friendly: font ≥18px, touch ≥48px, high contrast

## 3 Mandatory Sentences

1. "Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình."
2. "AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh."
3. "Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ."

## Development Rules

- **File Naming**: kebab-case, descriptive names
- **File Size**: Under 200 lines, modularize if larger
- **Validation**: Zod for all inputs, API routes, AI outputs
- **Error Handling**: try-catch, Vietnamese error messages
- **Commits**: Conventional format (feat:, fix:, docs:)
- **No secrets in git**, no mocks/fakes
- **YAGNI · KISS · DRY**

## Documentation

Keep `./docs` updated after every feature:
- project-overview-pdr.md, code-standards.md, codebase-summary.md
- design-guidelines.md, deployment-guide.md, system-architecture.md, development-roadmap.md

## Database 3-Layer Architecture

- **Layer 1**: source_documents (immutable originals)
- **Layer 2**: extracted_records → confirmed_records (AI + user verified)
- **Layer 3**: AI summaries with citations back to Layer 1 & 2
