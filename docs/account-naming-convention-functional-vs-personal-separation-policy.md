# AIVIHE Account Naming Convention

**Ban hành**: 2026-04-22
**Ban hành bởi**: PGS.TS. Doãn Ngọc Hải
**Hiệu lực**: Bắt buộc với mọi account mới + migrate account cũ theo kế hoạch

## 🎯 Nguyên tắc cốt lõi

> **Tách bạch vai trò công vụ và vai trò cá nhân.** Một người có thể có nhiều account cho các vai trò khác nhau. Account theo chức năng (admin) KHÔNG dùng tên cá nhân.

## 📋 2 tầng naming

### Tầng 1 — Functional Account (tài khoản công vụ)

Dành cho các vai trò quản trị, điều hành, vận hành hệ thống.

| Vai trò | Username | Full name hiển thị |
|---|---|---|
| Super Admin | `superadmin@aivihe.vn` | Super Admin AIVIHE |
| Giám đốc công ty | `director@aivihe.vn` | Giám đốc AIVIHE |
| Giám đốc chi nhánh | `branchdirector@aivihe.vn` | Giám đốc chi nhánh |
| Quản trị viên | `quantri@aivihe.vn` | Quản trị viên AIVIHE |
| Cố vấn | `covan@aivihe.vn` | Cố vấn AIVIHE |
| Hành chính | `hanhchinh@aivihe.vn` | Hành Chính AIVIHE |
| Lễ tân | `reception@aivihe.vn` | Lễ tân AIVIHE |
| Hỗ trợ khách hàng | `hotro@aivihe.vn` | Hỗ Trợ AIVIHE |
| IT / Kỹ thuật | `kythuat@aivihe.vn` | Kỹ Thuật AIVIHE |

**Quy tắc**:
- Username theo tiếng Việt không dấu, viết thường, không có dấu cách
- Không gắn tên người cụ thể vào username
- Khi bàn giao vai trò → đổi người dùng account, không đổi username
- 1 account có thể dùng chung bởi nhiều người cùng vai trò (ví dụ: 2 lễ tân cùng dùng `hanhchinh@`)

### Tầng 2 — Personal Account (tài khoản cá nhân)

Dành cho khách hàng (member) và bác sĩ (doctor — vì BS có brand chuyên môn cá nhân).

| Vai trò | Format username | Ví dụ |
|---|---|---|
| Member (khách hàng) | `{tên}{họ}{đệm}{năm sinh}@aivihe.vn` | `hattn73@aivihe.vn` (Hà Trần Thị Nhị 1973) |
| Doctor (bác sĩ) | `bs{tên đầy đủ không dấu}@aivihe.vn` | `bsvuthithanh@aivihe.vn` |
| Viewer gia đình | `{format member}@aivihe.vn` | `hung73nv@aivihe.vn` |

**Quy tắc**:
- Username đi kèm với người cụ thể → không chuyển cho người khác
- Tên viết thường, không dấu, không khoảng cách
- KH dùng năm sinh để phân biệt nếu trùng tên
- BS giữ tiền tố `bs` + tên đầy đủ (không kèm năm) vì là brand chuyên môn

## 🚫 Cấm

- ❌ Tài khoản admin mang tên người: `hattn@aivihe.vn`, `tramttn@aivihe.vn`, `haidn@aivihe.vn`
- ❌ 1 account kiêm nhiều vai trò (admin + KH cùng 1 login)
- ❌ Đổi username sau khi đã phát hành (tạo account mới, deactivate account cũ)

## ✅ Khuyến nghị đặc biệt

**Người có nhiều vai trò** (ví dụ: Trần Thị Nhị Hà vừa là Cố vấn vừa là KH):
- Tạo 2 account riêng: `covan@aivihe.vn` (công vụ) + `hattn73@aivihe.vn` (cá nhân)
- Khi làm cố vấn → login functional account
- Khi làm KH → login personal account
- Audit log phân biệt rõ hành động theo từng account

## 📊 Trạng thái hiện tại (2026-04-22)

### ✅ Functional accounts đã tạo
| Username | Role | Ghi chú |
|---|---|---|
| `superadmin@aivihe.vn` | super_admin | Mới 22/4 |
| `director@aivihe.vn` | director | Mới 22/4 |
| `branchdirector@aivihe.vn` | branch_director | Chưa tạo |
| `quantri@aivihe.vn` | admin | Mới 22/4 |
| `covan@aivihe.vn` | admin | Mới 22/4 |
| `hanhchinh@aivihe.vn` | reception | Đã có từ trước |

### ⚠️ Personal accounts legacy (chờ migrate)
| Username | Role hiện tại | Đề xuất |
|---|---|---|
| `haidn@aivihe.vn` | super_admin | Chuyển qua `superadmin@aivihe.vn` hoặc biến thành personal `haidn71@aivihe.vn` với role=member |
| `tramttn@aivihe.vn` | admin | Chuyển qua `quantri@aivihe.vn` hoặc `director@aivihe.vn` |
| `ngocnt@aivihe.vn` | director | Chuyển qua `director@aivihe.vn` |
| `hattn@aivihe.vn` | member ✅ | Đã convert 22/4 (trước là admin) |

### ✅ Personal accounts đúng convention
- Tất cả 5 BS (`bsvuthithanh@`, `bsleminhanh@`, ...) — role=doctor
- 4 KH seed (`nguyenthihoa@`, `tranvanminh@`, ...) — role=member

## 🛠️ Quy trình tạo account mới

### Functional account (admin/staff)
1. Super admin mở `/dashboard/admin/users` → Tạo mới
2. Chọn role functional → system suggest username theo bảng Tầng 1
3. Password mặc định: `Aivihe@2026` → bắt buộc đổi sau login đầu
4. Ghi vào audit log: ai tạo, khi nào, cho chức năng gì

### Personal account (member)
1. Lễ tân approve consultation_request
2. System auto-generate username theo format Tầng 2: `{tên}{họ}{đệm}{năm sinh}@aivihe.vn`
3. Password mặc định: `Aivihe@2026` → bắt buộc đổi
4. SMS/email thông báo KH username + password

## 🔄 Kế hoạch migrate accounts cũ

**Không ép buộc đổi username auth** (tránh mất session). Thay vào đó:
1. Tạo functional accounts mới (đã xong 22/4)
2. Thông báo người dùng chuyển sang account mới
3. Sau 2 tuần: deactivate personal-named admin accounts (`haidn@`, `tramttn@`, `ngocnt@`)
4. Nếu cần giữ làm personal: đổi role → member + bổ sung info cá nhân

## 📎 Phụ lục — Lịch sử thay đổi

| Ngày | Thay đổi | Người |
|---|---|---|
| 2026-04-22 | Ban hành convention + tạo 4 functional accounts mới | Claude Code thực hiện theo chỉ đạo PGS.TS. Doãn Ngọc Hải |
| 2026-04-22 | Convert hattn@ (Trần Thị Nhị Hà) từ admin → member | Tách vai trò Cố vấn sang covan@ |
