import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

/**
 * Cấu hình kiểm thử đơn vị cho AIVIHE Health Core.
 *
 * Phạm vi hiện tại: các hàm thuần trong `src/lib/` — ưu tiên tuyệt đối cho
 * xác thực, phân quyền và tích hợp. Kiểm thử chính sách bảo vệ dòng dữ liệu
 * (RLS) chạy bằng pgTAP ở tầng cơ sở dữ liệu, không thuộc cấu hình này
 * (xem ADR-SC-005 / docs/adr/ADR-005).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Ngưỡng áp cho phần mã đã có test, nâng dần theo từng phase.
      include: ['src/lib/integration/**', 'src/lib/permissions/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
