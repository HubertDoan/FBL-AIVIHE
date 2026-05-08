# ADR-004: SleepCare AI tuân theo AIVIHE 3-layer citation pattern

**Status:** Accepted  
**Date:** 2026-05-08  
**Sprint:** SleepCare Sprint 1 — Task T03  
**Deciders:** SmartBed Wellness Team + AIVIHE Tech Lead  

---

## Context

SleepCare AI tạo báo cáo giấc ngủ buổi sáng từ sensor data. Câu hỏi: AI report có cần trích dẫn nguồn không, hay chỉ cần output tự do?

**Yêu cầu pháp lý (Nghị định 13/2023):** Mọi xử lý dữ liệu sức khỏe cần có audit trail — ai xử lý, dữ liệu gì, thời điểm nào.

---

## Decision

**SleepCare AI bắt buộc theo AIVIHE 3-layer citation pattern, không dùng free-form AI output.**

---

## 3-Layer Architecture

```
Layer 1 (Source)
└── smartbed_readings (raw sensor data, TimescaleDB)
    └── smartbed_events (detected events)
    └── smartbed_sessions (session metadata)

Layer 2 (Processed)
└── AI prompt receives: sessionId + podId + aggregated metrics
    └── No raw PII (CCCD/SĐT) — chỉ citizenAlias + age

Layer 3 (AI Output)
└── Markdown report với citations:
    "Dựa trên 847 điểm dữ liệu từ phiên #SESSION_ID (Pod POD_ID)..."
    "Sự kiện ghi nhận lúc 02:14: Trở mình liên tục"
```

---

## Citation Requirements (BẮT BUỘC trong mọi AI report)

| Element | Format | Source |
|---|---|---|
| Phiên ngủ | `#${sessionId}` | `smartbed_sessions.id` |
| Pod device | `Pod ${podId}` | `smartbed_pods.id` |
| Sự kiện cụ thể | `Sự kiện lúc ${time}: ${description}` | `smartbed_events` |
| Điểm dữ liệu count | `${n} điểm dữ liệu` | `COUNT(smartbed_readings)` |

---

## Safety Lexicon (AIVIHE Legal Requirement)

| ❌ Cấm dùng | ✅ Thay bằng |
|---|---|
| chẩn đoán | nhận định wellness |
| điều trị | tối ưu giấc ngủ |
| bệnh lý | tình trạng sức khỏe |
| chữa khỏi | cải thiện lối sống |
| bệnh nhân | người dùng / khách hàng |

**Enforcement:** System prompt trong `SLEEP_REPORT_SYSTEM_PROMPT` (`src/lib/sleepcare/prompts/sleep-report-ai-prompt-templates-vi.ts`) bao gồm rule này và Claude API temperature=0.3 để giảm hallucination.

---

## 3 Mandatory Disclaimers (CỐ ĐỊNH, không rút gọn)

Mọi AI report phải kết thúc bằng nguyên văn 3 câu:

```
*Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.*

*AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp,
không thay thế bác sĩ và không chẩn đoán bệnh.*

*Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.*
```

---

## Privacy in AI Prompts

- **KHÔNG** truyền: CCCD, số điện thoại, địa chỉ chi tiết, mã BHXH/BHYT
- **Dùng** `citizenAlias` (tên/biệt danh) + `age` để cá nhân hóa lời chào
- `sessionId` và `podId` là technical IDs — không phải PII, được phép dùng trong citation
- Tất cả PII stripping xảy ra tại `buildSleepUserPrompt()` trước khi gọi Claude API

---

## Consequences

- **Positive:** Mọi AI output đều truy xuất được về session/pod cụ thể — đáp ứng audit requirement.
- **Positive:** Consistent với AI citation pattern ở các module khác (OCR, Health Summary).
- **Positive:** Legal safe — không có "chẩn đoán" language trong output.
- **Negative:** Report ngắn hơn free-form AI — citations chiếm ~20% token budget.
- **Constraint:** AI model phải support Vietnamese. Hiện dùng `claude-3-5-sonnet-20241022`.

---

## Affected Files

```
src/lib/sleepcare/prompts/
└── sleep-report-ai-prompt-templates-vi.ts  — SLEEP_REPORT_SYSTEM_PROMPT, buildSleepUserPrompt

src/app/api/sleepcare/
└── generate-ai-report/route.ts             — T22 (gọi Claude API với prompts trên)
```

---

## Related

- ADR-001: API route location (Next.js, not Edge Function)
- `src/lib/sleepcare/prompts/sleep-report-ai-prompt-templates-vi.ts`
- `docs/specs/aivihe-smartbed-unified-platform-lifelong-health-journey-and-multi-key-identity-master-spec.md` — Section 6: AI Pipeline
