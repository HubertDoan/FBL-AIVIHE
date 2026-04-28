/**
 * Validate & normalize rows from GPHN (Giấy phép hành nghề) Excel/CSV import
 * Supports both official Vietnamese GPHN headers and normalized column names.
 *
 * Official GPHN columns (from Sở Y tế):
 *   STT | Họ và tên | Ngày sinh | Địa chỉ | Văn bằng CM |
 *   Hình thức cấp | Phạm vi chuyên môn | Số GPHN | Ngày cấp GPHN
 *
 * Extra AIVIHE columns (admin fills):
 *   Số điện thoại* | Email | Cơ quan công tác |
 *   Loại hợp đồng (toan_thoi_gian/ban_thoi_gian) |
 *   Chăm sóc tại nhà (co/khong)
 */

// ─── Raw row (flexible keys from Excel/CSV) ──────────────────────────────────
export type DoctorImportRawRow = Record<string, string | number | null | undefined>

// ─── Validated, typed row ────────────────────────────────────────────────────
export interface DoctorImportValidatedRow {
  // citizens
  full_name: string
  date_of_birth: string | null   // ISO YYYY-MM-DD
  phone: string                  // normalized +84xxxxxxxxx
  email: string | null
  address: string | null

  // doctor_profiles
  qualification: string          // Văn bằng CM
  specialty: string              // Phạm vi chuyên môn
  license_number: string | null  // Số GPHN
  license_issued_date: string | null
  workplace: string | null
  employment_type: 'full_time' | 'part_time'
  home_care: boolean

  errors: string[]
}

// ─── Column alias map (Vietnamese GPHN header → normalized key) ───────────────
const ALIASES: Record<string, string> = {
  // official GPHN headers
  'họ và tên':            'ho_ten',
  'họ tên':               'ho_ten',
  'ho va ten':            'ho_ten',
  'ngày sinh':            'ngay_sinh',
  'ngay sinh':            'ngay_sinh',
  'địa chỉ':              'dia_chi',
  'dia chi':              'dia_chi',
  'văn bằng cm':          'van_bang',
  'văn bằng':             'van_bang',
  'van bang cm':          'van_bang',
  'van bang':             'van_bang',
  'hình thức cấp':        'hinh_thuc_cap',
  'hinh thuc cap':        'hinh_thuc_cap',
  'phạm vi chuyên môn':   'pham_vi_chuyen_mon',
  'pham vi chuyen mon':   'pham_vi_chuyen_mon',
  'chuyên khoa':          'pham_vi_chuyen_mon',
  'chuyen khoa':          'pham_vi_chuyen_mon',
  'số gphn':              'so_gphn',
  'so gphn':              'so_gphn',
  'số chứng chỉ hành nghề': 'so_gphn',
  'so chung chi hanh nghe': 'so_gphn',
  'ngày cấp gphn':        'ngay_cap_gphn',
  'ngay cap gphn':        'ngay_cap_gphn',
  'ngày cấp':             'ngay_cap_gphn',
  'ngay cap':             'ngay_cap_gphn',
  // AIVIHE-added columns
  'số điện thoại':        'so_dien_thoai',
  'so dien thoai':        'so_dien_thoai',
  'điện thoại':           'so_dien_thoai',
  'email':                'email',
  'cơ quan công tác':     'co_quan_cong_tac',
  'co quan cong tac':     'co_quan_cong_tac',
  'nơi công tác':         'co_quan_cong_tac',
  'loại hợp đồng':        'loai_hop_dong',
  'loai hop dong':        'loai_hop_dong',
  'hợp đồng':             'loai_hop_dong',
  'chăm sóc tại nhà':     'cham_soc_tai_nha',
  'cham soc tai nha':     'cham_soc_tai_nha',
  'tại nhà':              'cham_soc_tai_nha',
  'tai nha':              'cham_soc_tai_nha',
}

/** Normalize header key: lowercase + trim + collapse whitespace */
function normKey(raw: string): string {
  return String(raw).trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Resolve a raw row to normalized keys */
export function normalizeRowKeys(rawRow: DoctorImportRawRow): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(rawRow)) {
    const nk = normKey(k)
    const resolved = ALIASES[nk] ?? nk.replace(/\s+/g, '_')
    out[resolved] = String(v ?? '').trim()
  }
  return out
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** DD/MM/YYYY → YYYY-MM-DD, null if unparseable */
function parseViDate(s: string): string | null {
  if (!s?.trim()) return null
  const parts = s.trim().split('/')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  if (!y || y.length !== 4) return null
  const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  return isNaN(Date.parse(iso)) ? null : iso
}

/** 0xxxxxxxxx or 84xxxxxxxxx → +84xxxxxxxxx */
function normalizePhone(raw: string): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.startsWith('84') && digits.length === 11) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+84${digits.slice(1)}`
  return null
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateAndNormalizeRow(rawRow: DoctorImportRawRow): DoctorImportValidatedRow {
  const row = normalizeRowKeys(rawRow)
  const errors: string[] = []

  // full_name (required)
  const full_name = row['ho_ten'] ?? ''
  if (!full_name) errors.push('Thiếu họ và tên')

  // phone (required — needed to create login account)
  const phoneRaw = row['so_dien_thoai'] ?? ''
  const phone = normalizePhone(phoneRaw)
  if (!phone) errors.push(phoneRaw ? `SĐT không hợp lệ: "${phoneRaw}"` : 'Thiếu số điện thoại')

  // specialty / qualification (required)
  const specialty    = row['pham_vi_chuyen_mon'] ?? ''
  const qualification = row['van_bang'] ?? ''
  if (!specialty)    errors.push('Thiếu phạm vi chuyên môn')
  if (!qualification) errors.push('Thiếu văn bằng CM')

  // optional dates
  const dobRaw       = row['ngay_sinh'] ?? ''
  const licDateRaw   = row['ngay_cap_gphn'] ?? ''
  const date_of_birth      = parseViDate(dobRaw)
  const license_issued_date = parseViDate(licDateRaw)
  if (dobRaw && !date_of_birth)
    errors.push(`Ngày sinh không đúng DD/MM/YYYY: "${dobRaw}"`)
  if (licDateRaw && !license_issued_date)
    errors.push(`Ngày cấp GPHN không đúng DD/MM/YYYY: "${licDateRaw}"`)

  // employment_type
  const loai = (row['loai_hop_dong'] ?? '').toLowerCase()
  const employment_type: 'full_time' | 'part_time' =
    loai === 'ban_thoi_gian' || loai === 'bán thời gian' || loai === 'part_time'
      ? 'part_time'
      : 'full_time'

  // home_care
  const hcRaw = (row['cham_soc_tai_nha'] ?? '').toLowerCase()
  const home_care = hcRaw === 'co' || hcRaw === 'có' || hcRaw === 'true' || hcRaw === '1'

  return {
    full_name,
    date_of_birth,
    phone:                phone ?? phoneRaw,
    email:                row['email'] || null,
    address:              row['dia_chi'] || null,
    qualification,
    specialty,
    license_number:       row['so_gphn'] || null,
    license_issued_date,
    workplace:            row['co_quan_cong_tac'] || null,
    employment_type,
    home_care,
    errors,
  }
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

/** Parse plain CSV text → array of raw row objects */
export function parseCsvText(text: string): DoctorImportRawRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (vals[i] ?? '').trim() })
    return row
  })
}

/** Template column info for UI display */
export const TEMPLATE_COLUMNS = [
  { key: 'ho_ten',             label: 'Họ và tên',             required: true,  note: 'Chữ hoa/thường đều được' },
  { key: 'ngay_sinh',          label: 'Ngày sinh',              required: false, note: 'DD/MM/YYYY' },
  { key: 'so_dien_thoai',      label: 'Số điện thoại',          required: true,  note: '10 chữ số, VD: 0912345678' },
  { key: 'email',              label: 'Email',                  required: false, note: '' },
  { key: 'van_bang',           label: 'Văn bằng CM',            required: true,  note: 'VD: Bác sỹ, Điều dưỡng' },
  { key: 'pham_vi_chuyen_mon', label: 'Phạm vi chuyên môn',    required: true,  note: 'VD: Chuyên khoa Nội, Y học cổ truyền' },
  { key: 'so_gphn',            label: 'Số GPHN',               required: false, note: 'Số giấy phép hành nghề' },
  { key: 'ngay_cap_gphn',      label: 'Ngày cấp GPHN',         required: false, note: 'DD/MM/YYYY' },
  { key: 'co_quan_cong_tac',   label: 'Cơ quan công tác',      required: false, note: 'Nơi công tác chính' },
  { key: 'loai_hop_dong',      label: 'Loại hợp đồng',         required: false, note: 'toan_thoi_gian hoặc ban_thoi_gian' },
  { key: 'cham_soc_tai_nha',   label: 'Chăm sóc tại nhà',      required: false, note: 'co hoặc khong' },
]
