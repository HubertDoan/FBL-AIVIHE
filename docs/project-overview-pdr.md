# AIVIHE — Project Overview

## Identity
**AIVIHE** = AI · VI · HE (Artificial Intelligence · Vietnam · Health)
Health Data Backbone cho hệ sinh thái Thong Dong Life.

## Problem
Người cao tuổi tại trung tâm Thong Dong cần hệ thống sức khỏe tích hợp: Daycare theo dõi hàng ngày, Bác sỹ gia đình quản lý lâm sàng, PHCN phục hồi chức năng. Dữ liệu phân tán — không ai thấy bức tranh toàn cảnh.

## Solution
AIVIHE là **nền tảng dữ liệu sức khỏe tổng thể** — Customer Master + Medical EMR + AI Engine. Một khách hàng – một mã TDL – một hồ sơ chung – 11 tabs chuyên môn – dữ liệu liên thông toàn hệ thống.

**AIVIHE KHÔNG phải**: hệ thống Daycare (Daycare riêng), phần mềm bệnh viện, công cụ chẩn đoán.

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
| 10 | Device Integration | Wearable, box y tế, smartbed |

## Hệ sinh thái

```
AIVIHE (repo này)              Thong Dong Daycare (repo riêng)
├── Customer Master ◄──────────── Tạo KH mới, push webhook
├── Medical EMR                   ├── Daily ops (check-in/out)
├── AI Engine (OCR, summary)      ├── Vitals recording
├── 11-tab Customer Profile       ├── Medication tracking
└── Webhook receiver/sender ◄───► └── Incident reporting
    REST API + HMAC SHA256
```

## Stakeholders
- **Project owner**: Thầy Hải (Doãn Ngọc Hải) — Super Admin
- **Target users**: Khách hàng cao tuổi, gia đình, nhân viên Daycare, BSGD, KTV PHCN
- **Partners**: Thong Dong Life, SmartBed, Bảo Minh (tương lai)
- **Pilot**: Trung tâm HaPu (GĐ: Trần Thị Ngọc Trâm)
