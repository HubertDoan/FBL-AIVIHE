'use client'

// Trang hồ sơ nhân viên — chỉ hiển thị thông tin công việc
// KHÔNG có thông tin y tế cá nhân (reserved cho customer profile)
// Staff roles: director, admin, manager, reception, admin_staff, etc.

import { StaffWorkProfilePage } from '@/components/profile/staff-work-profile-page'

export default function StaffProfilePage() {
  return <StaffWorkProfilePage />
}
