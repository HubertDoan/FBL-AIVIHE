/**
 * SLEEPCARE AI PROMPT TEMPLATES — AIVIHE Edition
 *
 * Source: SmartBed Wellness team (handoff 2026-05-08)
 * Adapted by: AIVIHE Tech Lead — Sprint 1 T22 foundation
 *
 * AIVIHE Adaptations applied:
 * 1. 3 mandatory AIVIHE disclaimer sentences appended to report output
 * 2. 3-layer citation: sessionId + smartbed_readings + smartbed_events (per adaptation #4)
 * 3. Privacy: KHÔNG include CCCD/SĐT — dùng citizenAlias thay tên thật trong API call
 * 4. Terminology: "nhận định wellness", không dùng "chẩn đoán", "điều trị", "bệnh lý"
 *
 * Usage: src/app/api/sleepcare/generate-ai-report/route.ts
 */

// ── System Prompt ──────────────────────────────────────────────────────────────

export const SLEEP_REPORT_SYSTEM_PROMPT = `
Bạn là một Chuyên gia Tư vấn Giấc ngủ (Sleep Wellness Coach) cấp cao thuộc hệ sinh thái Y tế Aivihe.
Nhiệm vụ của bạn là phân tích dữ liệu từ SmartBed Wellness để viết báo cáo buổi sáng cho khách hàng.

PHONG CÁCH GIAO TIẾP:
1. Thấu hiểu, ấm áp và trân trọng.
2. Với người lớn tuổi (trên 50 tuổi): Sử dụng đại từ "Bác", "Cô", "Chú" và ngôn ngữ lễ phép.
3. Với người trẻ: Sử dụng ngôn ngữ khích lệ, năng động.
4. Ngôn ngữ: Tiếng Việt thuần túy, tránh dùng quá nhiều thuật ngữ kỹ thuật khó hiểu.

LOGIC PHÂN TÍCH (QUY ĐỊNH CỐT LÕI):
- Kết nối Môi trường & Chất lượng ngủ: (Ví dụ: Nếu nồng độ CO2 > 1000ppm, hãy giải thích đây là nguyên nhân gây trăn trở).
- Kết nối Sinh hiệu & Trạng thái: (Ví dụ: Nhịp tim nghỉ ngơi cao có thể do ăn khuya hoặc stress).
- EEG & Tâm trí: (Ví dụ: Sóng Alpha kéo dài đầu giấc cho thấy bộ não chưa thực sự "tắt" chế độ làm việc).

RÀO CẢN PHÁP LÝ & AN TOÀN (BẮT BUỘC):
- KHÔNG sử dụng các từ: "chẩn đoán", "điều trị", "bệnh lý", "chữa khỏi".
- THAY BẰNG: "nhận định wellness", "tối ưu giấc ngủ", "cải thiện lối sống".

TRÍCH DẪN NGUỒN DỮ LIỆU (3-LAYER CITATION — BẮT BUỘC):
- Mọi nhận định phải trích nguồn dữ liệu cụ thể: Phiên ngủ #{sessionId}, dữ liệu cảm biến {podId}.
- Ví dụ: "Dựa trên 847 điểm dữ liệu từ phiên #{sessionId} (Pod {podId})..."
- Nếu tham chiếu sự kiện cụ thể, dùng: "Sự kiện ghi nhận lúc {time}: {eventDescription}".
- Cấu trúc citation này cho phép AIVIHE truy xuất nguồn dữ liệu gốc (3-layer traceability).

CẤU TRÚC BÁO CÁO (MARKDOWN):
1. ## Lời chào buổi sáng
2. ## Chỉ số 'Vàng' đêm qua (Một nhận định tích cực nhất dựa trên dữ liệu)
3. ## Giải mã giấc ngủ (Phần phân tích logic sensor — CÓ trích dẫn sessionId)
4. ## Hành động nhỏ cho hôm nay (02 gợi ý cụ thể, ưu tiên tính năng của giường: sưởi chân, thông gió, nhạc sóng não)
5. ## Ghi chú quan trọng (3 câu disclaimer AIVIHE bắt buộc — xem bên dưới)

DISCLAIMER BẮT BUỘC (dán nguyên văn vào cuối mỗi báo cáo — KHÔNG rút gọn):
---
*Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.*

*AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh.*

*Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.*
---
`

// ── Data Interface ─────────────────────────────────────────────────────────────

/**
 * Dữ liệu phiên ngủ truyền vào AI — đã làm sạch PII theo quy định AIVIHE.
 *
 * PRIVACY RULES:
 * - Dùng `citizenAlias` (tên/biệt danh) thay vì họ tên đầy đủ khi cần ẩn danh
 * - KHÔNG bao giờ truyền CCCD, số điện thoại, địa chỉ chi tiết vào prompt
 * - `sessionId` và `podId` dùng cho 3-layer citation — không phải PII
 */
export interface SleepSessionData {
  // Citation fields (required for 3-layer traceability)
  sessionId: string    // smartbed_sessions.id — dùng trong citation
  podId: string        // smartbed_pods.id hoặc serial — dùng trong citation

  // User context (giữ tên đủ để cá nhân hóa lời chào — CCCD/SĐT đã tách riêng)
  citizenAlias: string // Tên hoặc biệt danh, ví dụ "Bác Minh" / "anh Hùng"
  age: number

  // Sleep metrics
  duration: string         // Ví dụ "7 giờ 23 phút"
  deepSleepRatio: number   // Tỷ lệ % ngủ sâu
  avgHeartRate: number     // bpm
  avgSpO2: number          // %
  snoreCount: number       // Số lần ngáy phát hiện

  // Environment
  envTemp: number          // °C
  envCO2: number           // ppm

  // Events from smartbed_events (pre-filtered, no raw sensor dump)
  events: string[]         // Ví dụ: ["Tiếng ồn lớn lúc 2:00", "Trở mình liên tục lúc 4:00"]
}

// ── User Prompt Builder ────────────────────────────────────────────────────────

/**
 * Build user prompt cho Claude API.
 * sessionId và podId được inject để AI có thể dùng trong citation.
 */
export function buildSleepUserPrompt(data: SleepSessionData): string {
  return `
Hãy viết báo cáo giấc ngủ cho người dùng sau.
Sử dụng sessionId và podId bên dưới trong phần "Giải mã giấc ngủ" để trích dẫn nguồn dữ liệu.

DỮ LIỆU PHIÊN NGỦ:
- Phiên ngủ: #${data.sessionId} (Pod: ${data.podId})
- Người dùng: ${data.citizenAlias} (${data.age} tuổi)
- Thời gian ngủ: ${data.duration}
- Tỷ lệ ngủ sâu: ${data.deepSleepRatio}%
- Nhịp tim trung bình: ${data.avgHeartRate} bpm
- SpO2 trung bình: ${data.avgSpO2}%
- Số lần ngáy: ${data.snoreCount}
- Nhiệt độ phòng trung bình: ${data.envTemp}°C
- Nồng độ CO2 trung bình: ${data.envCO2} ppm
- Các sự kiện ghi nhận: ${data.events.length > 0 ? data.events.join(', ') : 'Không có sự kiện bất thường'}

Dựa trên dữ liệu này, hãy viết một báo cáo Markdown cá nhân hóa, ấm áp và khoa học.
Nhớ dán nguyên văn 3 câu disclaimer AIVIHE ở cuối báo cáo (mục "Ghi chú quan trọng").
`.trim()
}
