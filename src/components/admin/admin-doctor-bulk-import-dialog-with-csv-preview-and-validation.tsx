'use client'

/**
 * Dialog nhập danh sách bác sĩ từ file XLSX hoặc CSV
 * Hỗ trợ: file GPHN chính thức của Sở Y tế (cột tiếng Việt) + file CSV chuẩn
 * Flow: Tải mẫu → Upload XLSX/CSV → Preview + validate → Xác nhận nhập
 */

import { useState, useRef } from 'react'
import { Upload, Download, CheckCircle, AlertTriangle, X, Loader2, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  parseCsvText,
  validateAndNormalizeRow,
  type DoctorImportRawRow,
  type DoctorImportValidatedRow,
} from '@/lib/doctors/doctor-gphn-import-row-validator-and-column-normalizer'

interface Props {
  open: boolean
  onClose: () => void
  onImported: () => void
}

interface PreviewRow {
  raw: DoctorImportRawRow
  validated: DoctorImportValidatedRow
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
}

/** Parse XLSX ArrayBuffer → rows using SheetJS (dynamic import, client-only) */
async function parseXlsx(buffer: ArrayBuffer): Promise<DoctorImportRawRow[]> {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  // raw: true keeps values as-is (no date conversion), header:1 for array mode
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  return data.map(row => {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(row)) {
      out[k] = String(v ?? '').trim()
    }
    return out
  })
}

export function AdminDoctorBulkImportDialogWithCsvPreviewAndValidation({ open, onClose, onImported }: Props) {
  const [rows, setRows]           = useState<PreviewRow[]>([])
  const [fileName, setFileName]   = useState('')
  const [parsing, setParsing]     = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const validRows   = rows.filter(r => r.validated.errors.length === 0)
  const invalidRows = rows.filter(r => r.validated.errors.length > 0)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParsing(true)
    try {
      let rawRows: DoctorImportRawRow[]
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        const buf = await file.arrayBuffer()
        rawRows = await parseXlsx(buf)
        // Drop header-only or empty rows (STT column often has number)
        rawRows = rawRows.filter(r => {
          const vals = Object.values(r).join('').trim()
          return vals.length > 0
        })
      } else {
        const text = await file.text()
        rawRows = parseCsvText(text)
      }
      setRows(rawRows.map(raw => ({ raw, validated: validateAndNormalizeRow(raw) })))
    } catch (err) {
      toast.error('Không đọc được file. Kiểm tra định dạng CSV/XLSX.')
      console.error(err)
    } finally {
      setParsing(false)
    }
  }

  function handleReset() {
    setRows([])
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleImport() {
    if (!validRows.length) return
    setImporting(true)
    try {
      const res = await fetch('/api/admin/doctors/bulk-upload', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rows: validRows.map(r => r.raw) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Nhập thất bại.'); return }

      const { created = 0, updated = 0, skipped = 0, errors = [] } = data
      toast.success(`Nhập xong: ${created} bác sĩ mới · ${updated} cập nhật · ${skipped} bỏ qua`)
      errors.forEach((e: string) => toast.error(e, { duration: 7000 }))
      onImported()
      onClose()
      handleReset()
    } catch {
      toast.error('Lỗi kết nối.')
    } finally {
      setImporting(false)
    }
  }

  function handleClose() { onClose(); handleReset() }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="size-5 text-teal-600" />
            Nhập danh sách bác sĩ từ XLSX / CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1 — Download template */}
          <div className="rounded-lg border border-dashed border-teal-300 bg-teal-50 p-4 space-y-2">
            <p className="text-sm font-semibold text-teal-800">Bước 1 — Chuẩn bị file</p>
            <p className="text-xs text-teal-700 leading-relaxed">
              Dùng file XLSX GPHN của <strong>Sở Y tế</strong> và thêm các cột:{' '}
              <code className="bg-teal-100 px-1 rounded">Số điện thoại*</code>{' '}
              <code className="bg-teal-100 px-1 rounded">Cơ quan công tác</code>{' '}
              <code className="bg-teal-100 px-1 rounded">Loại hợp đồng</code>{' '}
              <code className="bg-teal-100 px-1 rounded">Chăm sóc tại nhà</code>.
              Hoặc tải file mẫu CSV bên dưới.
              Cột bắt buộc: <strong>Họ tên · SĐT · Văn bằng · Chuyên môn</strong>.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a
                href="/templates/bac-si-import-mau-gphn-ho-ten-chuyen-khoa-hop-dong-tai-nha.csv"
                download
                className="inline-flex items-center gap-1.5 font-medium text-teal-700 hover:text-teal-900 underline"
              >
                <Download className="size-3.5" /> Tải file CSV mẫu
              </a>
              <span className="text-teal-400">·</span>
              <span className="text-teal-600">
                Loại hợp đồng: <code>toan_thoi_gian</code> / <code>ban_thoi_gian</code>
              </span>
              <span className="text-teal-400">·</span>
              <span className="text-teal-600">
                Tại nhà: <code>co</code> / <code>khong</code>
              </span>
            </div>
          </div>

          {/* Step 2 — Upload */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Bước 2 — Upload file</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                className="h-10 gap-2"
                disabled={parsing}
                onClick={() => fileRef.current?.click()}
              >
                {parsing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {parsing ? 'Đang đọc...' : 'Chọn file XLSX / CSV'}
              </Button>
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileSpreadsheet className="size-4 text-green-600" />
                  <span className="font-medium">{fileName}</span>
                  <button onClick={handleReset} className="text-gray-400 hover:text-red-500">
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">{rows.length} dòng</span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  <CheckCircle className="size-3" /> {validRows.length} hợp lệ
                </span>
                {invalidRows.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                    <AlertTriangle className="size-3" /> {invalidRows.length} lỗi — sẽ bỏ qua
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 text-xs">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      {['#','Họ tên','SĐT','Văn bằng','Chuyên môn','Số GPHN','Hợp đồng','Tại nhà','Trạng thái'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((r, i) => {
                      const ok  = r.validated.errors.length === 0
                      const v   = r.validated
                      return (
                        <tr key={i} className={ok ? 'bg-white hover:bg-gray-50' : 'bg-red-50'}>
                          <td className="px-3 py-2 text-gray-400">{i + 2}</td>
                          <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{v.full_name || '—'}</td>
                          <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.raw['so_dien_thoai'] as string || '—'}</td>
                          <td className="px-3 py-2 text-gray-600">{v.qualification || '—'}</td>
                          <td className="px-3 py-2 text-gray-700">{v.specialty || '—'}</td>
                          <td className="px-3 py-2 text-gray-500">{v.license_number || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              v.employment_type === 'full_time'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {EMPLOYMENT_LABELS[v.employment_type]}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">{v.home_care ? '✅' : '—'}</td>
                          <td className="px-3 py-2 max-w-[180px]">
                            {ok
                              ? <span className="text-green-600 font-medium">✓ OK</span>
                              : <span className="text-red-600 leading-tight" title={v.errors.join('\n')}>
                                  ⚠ {v.errors[0]}
                                  {v.errors.length > 1 && <span className="text-gray-400"> +{v.errors.length - 1}</span>}
                                </span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t">
            <Button variant="outline" onClick={handleClose}>Huỷ</Button>
            <Button
              className="gap-2 bg-teal-600 hover:bg-teal-700"
              disabled={!validRows.length || importing}
              onClick={handleImport}
            >
              {importing
                ? <><Loader2 className="size-4 animate-spin" /> Đang nhập...</>
                : <><Upload className="size-4" /> Nhập {validRows.length} bác sĩ</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
