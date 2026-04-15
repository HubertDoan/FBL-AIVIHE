# AIVIHE — Project Overview

## Identity

**AIVIHE** = AI · VI · HE = Trợ lý AI sức khỏe cá nhân
- Nhánh công nghệ của **Thong Dong Life**, do **Thong Dong Tech** phát triển
- Thong Dong Life gồm 5 thương hiệu: **Life** (triết lý), **Daycare** (chăm sóc ban ngày), **Home** (không gian sống), **Land** (bất động sản), **Tech** (công nghệ)
- AIVIHE là sản phẩm chính của Thong Dong Tech

**AIVIHE KHÔNG phải**: hồ sơ sức khỏe điện tử (do cơ quan quản lý nhà nước quy định), phần mềm bệnh viện, công cụ chẩn đoán. AI chỉ tổng hợp — không chẩn đoán, không thay thế bác sĩ.

## Problem & Solution

**Vấn đề:** Dữ liệu sức khỏe phân tán ở nhiều nơi (bệnh viện, phòng khám, ứng dụng) — không ai thấy bức tranh toàn cảnh về sức khỏe của người dùng.

**Giải pháp:** AIVIHE tập trung dữ liệu → AI tổng hợp → cho bức tranh sức khỏe toàn diện → **người dùng tự hiểu và tự quyết định**.

Nguyên tắc cốt lõi: Một khách hàng – một mã TDL – một hồ sơ chung – dữ liệu liên thông.

## User Roles & Workflow

| Role | Vị trí | Workflow |
|------|--------|---------|
| super_admin | Quản trị hệ thống | Quản lý toàn bộ, phê duyệt đăng ký |
| director | Giám đốc (Trần Thị Ngọc Trâm) | Phê duyệt, giám sát toàn hệ thống |
| branch_director | GĐ chi nhánh (Lưu Tuấn Khanh) | Quản lý chi nhánh |
| admin | Quản trị viên | Duyệt thành viên, quản lý thông báo |
| reception | Tiếp đón (Nguyễn Thị Mai) | Tiếp nhận KH, khai hồ sơ ban đầu |
| doctor | Bác sĩ gia đình (BS. Nguyễn Hải) | Theo dõi sức khỏe, tư vấn, ra chỉ định |
| exam_doctor | BS khám bệnh (BS. Trần Văn Nam) | Khám lâm sàng, chẩn đoán |
| specialist | BS chuyên khoa (BS. Phạm Văn Đức) | Tư vấn chuyên khoa sâu (khớp, tim mạch...) |
| technician | KTV PHCN (Trần Minh) | Đánh giá, trị liệu phục hồi chức năng |
| nurse | Điều dưỡng (Nguyễn Thị Hương) | Đo chỉ số, nhắc thuốc, ghi chép |
| manager | Quản lý (Vũ Đình Trung) | Giám sát vận hành |
| member | Khách hàng/Thành viên | Xem hồ sơ, cập nhật thông tin, sử dụng dịch vụ |
| citizen | Người đăng ký mới | Chưa được duyệt, chờ phê duyệt |
| guest | Khách vãng lai | Xem trang chủ, đăng ký |
| family_viewer | Người thân | Xem báo cáo, nhận cảnh báo |

## Customer Acquisition — 3 Kênh Tiếp Cận

**Nguyên tắc**: AIVIHE KHÔNG có điểm tiếp xúc vật lý riêng. Khách hàng tiếp cận qua 3 kênh vật lý của hệ sinh thái:

```
Kênh 1: Thong Dong Daycare
  KH đến Daycare sinh hoạt → Lễ tân khai hồ sơ → Mở tài khoản AIVIHE → Liên thông dữ liệu hàng ngày

Kênh 2: Phòng khám Bác sĩ gia đình
  KH đến PK → BS gia đình khám, đánh giá → Mở tài khoản AIVIHE → BS theo dõi liên tục

Kênh 3: Phòng khám Phục hồi chức năng
  KH đến PK PHCN → KTV đánh giá chức năng → Mở tài khoản AIVIHE → Lập kế hoạch trị liệu
```

**Trang chủ aivihe.vn** chỉ nhận **đăng ký tư vấn** (chỉ cần tên + SĐT):

```
Trang chủ → Form đăng ký tư vấn (tên + SĐT + kênh quan tâm)
  → Reception/Hành chính gọi điện bổ sung thông tin
    → Giám đốc công ty duyệt
      → Hướng dẫn khách đến 1 trong 3 kênh vật lý
        → Tạo tài khoản AIVIHE đầy đủ
```

Chi tiết flow: `docs/specs/aivihe-customer-acquisition-channels-and-consultation-flow.md`

## Gói dịch vụ

| Gói | Tên | Phí | Bao gồm |
|-----|-----|-----|---------|
| 0 | Cơ bản | Miễn phí | Lập hồ sơ, cập nhật thông tin, AI tổng hợp báo cáo đánh giá chung |
| 1 | Bác sĩ gia đình | Thuê bao tháng + phí/lần | BS gia đình theo dõi, tư vấn, tự chọn BS, đánh giá sao |
| 2 | PHCN | Thuê bao + phí/buổi | Phục hồi chức năng tại trung tâm hoặc tại nhà |
| 3 | Chuyên khoa sâu | Phí/lần tư vấn | BS chuyên khoa (khớp, tim mạch, nội tiết...), tư vấn, hỗ trợ đi khám BV |

## Hồ sơ AIVIHE — 4 mục chính trong tài khoản khách hàng

Trang `/dashboard/health-record` hiển thị 4 mục hồ sơ cho KH (subset của 11-tab architecture):

| Mục | Nguồn dữ liệu | Ai ghi |
|-----|---------------|--------|
| **Daycare** | Mirror từ Thong Dong Daycare qua webhook `daycare_daily_summary` | Lễ tân, NV chăm sóc, y tá tại trung tâm |
| **Bác sĩ gia đình** | `family_doctor_encounters` (AIVIHE) | BS gia đình sau mỗi lần khám |
| **Phục hồi chức năng** | `rehab_sessions` (AIVIHE) | KTV PHCN sau mỗi buổi |
| **Khám chữa bệnh** | `clinic_visits` (AIVIHE, link `source_documents`) | KH upload + BS chuyên khoa xem |

Mỗi mục có icon + số lượng records, hiển thị theo dạng card timeline.

## 10 Modules

| # | Module | Vai trò |
|---|--------|---------|
| 1 | Customer Master | Mã TDL, hồ sơ hành chính, phân loại KH |
| 2 | Health Summary | Hồ sơ sức khỏe chung, cảnh báo nhanh, summary cho Daycare |
| 3 | Family Doctor EMR | Khám, bệnh sử, chẩn đoán, bệnh mạn tính, kế hoạch theo dõi |
| 4 | Rehab EMR | Đánh giá chức năng, trị liệu, tiến triển PHCN |
| 5 | Vitals Tracking | Time-series chỉ số, biểu đồ, rule cảnh báo ngưỡng |
| 6 | Medication Management | Danh mục thuốc, nhắc thuốc, xác nhận dùng thuốc |
| 7 | Care Plan Engine | Kế hoạch chăm sóc tích hợp liên ngành |
| 8 | Alert Engine | Cảnh báo theo rule, log sự cố, escalation |
| 9 | Family Portal | Báo cáo gia đình, thông báo, lịch hẹn |
| 10 | Device Integration | Wearable, IoT (huyết áp, nhịp tim, SpO2, đường huyết, ECG) |

## Hệ sinh thái

```
Thong Dong Life
├── Daycare (chăm sóc ban ngày) ◄──► AIVIHE (sức khỏe cá nhân)
├── Home (không gian sống)           ├── Customer Master (mã TDL)
├── Land (bất động sản)              ├── Medical EMR (BSGD + PHCN)
└── Tech → AIVIHE (sản phẩm)        ├── AI Engine (OCR, tổng hợp)
                                     └── IoT devices (wearable)

Tích hợp AIVIHE ↔ Daycare: REST API + Webhooks + HMAC SHA256
```

## Stakeholders

- **PGS.TS. Doãn Ngọc Hải** — Chuyên gia y tế, Chủ mô hình, Super Admin
- **TS. Trần Thị Nhị Hà** — Cố vấn cao cấp (nguyên GĐ Sở Y tế Hà Nội)
- **Trần Thị Ngọc Trâm** — Giám đốc Thong Dong Daycare
- **Partners**: Mirabo Global (VR/AR), Sở Y tế, Trạm Y tế xã/phường, Bạch Niên Thiên Đức, Bảo Minh

## Technical Stack

- **Frontend + Backend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui
- **Database + Auth**: Supabase (PostgreSQL + Phone OTP Auth + Storage)
- **AI**: Claude API (Vision OCR + Text summaries)
- **Charts**: Recharts · **Deploy**: Vercel + Supabase Cloud (Seoul)
