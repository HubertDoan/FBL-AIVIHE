import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

/**
 * Test canh giữ hồi quy cho chính sách bảo vệ dòng dữ liệu (RLS).
 *
 * Bối cảnh: SEC-01 — migration 00023 tạo policy `USING (true)` không giới hạn
 * vai trò trên `user_custom_permissions`, khiến bất kỳ ai (kể cả `anon`) tự
 * cấp quyền cho mình được. Migration 00049 vá lỗi này.
 *
 * Test này KHÔNG cần cơ sở dữ liệu. Nó đọc toàn bộ tệp migration theo thứ tự
 * và mô phỏng trạng thái policy cuối cùng, để chặn việc vô tình tái tạo một
 * policy rỗng nghĩa trên bảng nhạy cảm.
 *
 * Kiểm thử hành vi thật trên cơ sở dữ liệu do bộ pgTAP đảm nhiệm
 * (supabase/tests/), chạy khi có môi trường thử nghiệm.
 */

const MIGRATIONS_DIR = join(__dirname, '../../../supabase/migrations')

/** Bảng mà một policy rỗng nghĩa sẽ gây hậu quả bảo mật trực tiếp. */
const SENSITIVE_TABLES = [
  'user_custom_permissions',
  'citizens',
  'audit_logs',
  'family_members',
]

interface PolicyState {
  name: string
  table: string
  file: string
  body: string
}

/**
 * Đọc migration theo thứ tự tên tệp và dựng lại tập policy còn hiệu lực.
 * Bỏ qua tệp rollback: chúng chỉ chạy khi cần khôi phục thủ công, không
 * thuộc trạng thái tiến về phía trước của lược đồ.
 */
function buildFinalPolicyState(): Map<string, PolicyState> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.includes('-rollback-'))
    .sort()

  const policies = new Map<string, PolicyState>()

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    // Bỏ chú thích dòng để câu lệnh trong ví dụ/tài liệu không bị tính là mã thật.
    const code = sql.replace(/^\s*--.*$/gm, '')

    const dropRe = /DROP\s+POLICY\s+(?:IF\s+EXISTS\s+)?"?([\w]+)"?\s+ON\s+(?:public\.)?"?([\w]+)"?/gi
    for (const m of code.matchAll(dropRe)) {
      policies.delete(`${m[2].toLowerCase()}.${m[1].toLowerCase()}`)
    }

    const createRe =
      /CREATE\s+POLICY\s+"?([\w]+)"?\s+ON\s+(?:public\.)?"?([\w]+)"?([\s\S]*?);/gi
    for (const m of code.matchAll(createRe)) {
      const [, name, table, body] = m
      policies.set(`${table.toLowerCase()}.${name.toLowerCase()}`, {
        name,
        table: table.toLowerCase(),
        file,
        body,
      })
    }
  }

  return policies
}

/** Policy cho phép mọi dòng mà không ràng buộc vai trò nào. */
function isUnrestricted(p: PolicyState): boolean {
  const hasBlanketPredicate =
    /USING\s*\(\s*true\s*\)/i.test(p.body) || /WITH\s+CHECK\s*\(\s*true\s*\)/i.test(p.body)
  const restrictedToRole = /\bTO\s+(authenticated|service_role)\b/i.test(p.body)
  return hasBlanketPredicate && !restrictedToRole
}

describe('Chính sách RLS trên bảng nhạy cảm', () => {
  const finalState = buildFinalPolicyState()

  it('đọc được thư mục migration', () => {
    expect(finalState.size).toBeGreaterThan(0)
  })

  it.each(SENSITIVE_TABLES)(
    'bảng %s không còn policy rỗng nghĩa nào',
    (table) => {
      const offenders = [...finalState.values()]
        .filter((p) => p.table === table)
        .filter(isUnrestricted)
        .map((p) => `${p.name} (${p.file})`)

      expect(
        offenders,
        `Policy cho phép mọi dòng mà không giới hạn vai trò trên "${table}". ` +
          `Xem SEC-01 và migration 00049. Nếu thay đổi này là có chủ đích, ` +
          `hãy cập nhật test kèm giải thích lý do.`
      ).toEqual([])
    }
  )

  it('user_custom_permissions chặn ghi với người không phải quản trị', () => {
    const writePolicies = [...finalState.values()].filter(
      (p) =>
        p.table === 'user_custom_permissions' &&
        /\b(INSERT|UPDATE|DELETE)\b/i.test(p.body)
    )

    expect(writePolicies.length).toBeGreaterThan(0)

    for (const p of writePolicies) {
      expect(
        p.body,
        `Policy ghi "${p.name}" phải yêu cầu is_permission_admin(); ` +
          `nếu không, người dùng thường tự cấp quyền cho mình được.`
      ).toMatch(/is_permission_admin\s*\(\s*\)/i)
    }
  })

  it('user_custom_permissions giới hạn đọc theo chủ sở hữu hoặc quản trị', () => {
    const selectPolicies = [...finalState.values()].filter(
      (p) => p.table === 'user_custom_permissions' && /\bSELECT\b/i.test(p.body)
    )

    expect(selectPolicies.length).toBeGreaterThan(0)

    for (const p of selectPolicies) {
      expect(p.body).toMatch(/user_id\s*=\s*auth\.uid\s*\(\s*\)/i)
      expect(p.body).toMatch(/is_permission_admin\s*\(\s*\)/i)
    }
  })

  it('mọi hàm SECURITY DEFINER còn hiệu lực đều cố định search_path', () => {
    // Như với policy: một hàm có thể được CREATE OR REPLACE ở migration sau.
    // Chỉ định nghĩa CUỐI CÙNG mới là thứ đang chạy trên cơ sở dữ liệu.
    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql') && !f.includes('-rollback-'))
      .sort()

    const finalDefinitions = new Map<string, { file: string; block: string }>()

    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
      const fnRe =
        /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([\w]+)\s*\(([\s\S]*?)\$\$;/gi

      for (const m of sql.matchAll(fnRe)) {
        const [full, name] = m
        finalDefinitions.set(name.toLowerCase(), { file, block: full })
      }
    }

    const unsafe = [...finalDefinitions.entries()]
      .filter(([, d]) => /SECURITY\s+DEFINER/i.test(d.block))
      .filter(([, d]) => !/SET\s+search_path\s*=/i.test(d.block))
      .map(([name, d]) => `${name}() trong ${d.file}`)

    expect(
      unsafe,
      'Hàm SECURITY DEFINER chạy với quyền của người tạo. Không cố định ' +
        'search_path thì tên bảng bên trong hàm có thể bị phân giải sai. ' +
        'Xem SEC-07 và migration 00049.'
    ).toEqual([])
  })
})
