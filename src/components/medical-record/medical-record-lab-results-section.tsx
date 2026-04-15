import type { LabResult } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/** Section VIII — Cận lâm sàng & Xét nghiệm, nhóm theo category */

const CATEGORY_LABELS: Record<string, string> = {
  hematology: 'Huyết học',
  biochemistry: 'Hóa sinh',
  immunology: 'Miễn dịch',
  urine: 'Xét nghiệm nước tiểu',
  stool: 'Xét nghiệm phân',
  microbiology: 'Vi sinh',
  genetic: 'Di truyền',
  other: 'Khác',
}

const FLAG_CONFIG: Record<string, { label: string; className: string }> = {
  H: { label: 'Cao', className: 'bg-red-100 text-red-800 border-red-200' },
  L: { label: 'Thấp', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  W: { label: 'Theo dõi', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  N: { label: 'Bình thường', className: 'bg-green-100 text-green-800 border-green-200' },
}

export function MedicalRecordLabResultsSection({ items }: { items: LabResult[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 italic py-3">Chưa có kết quả xét nghiệm.</p>
  }

  // Group by category
  const grouped = items.reduce<Record<string, LabResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-4 pt-3">
      {Object.entries(grouped).map(([cat, results]) => (
        <div key={cat}>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            {CATEGORY_LABELS[cat] || cat}
          </p>
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2">Xét nghiệm</th>
                  <th className="text-right px-3 py-2">Kết quả</th>
                  <th className="text-left px-3 py-2 hidden sm:table-cell">Khoảng tham chiếu</th>
                  <th className="text-left px-3 py-2">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const flag = r.flag ? FLAG_CONFIG[r.flag] : null
                  return (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-900">{r.test_name}</p>
                        {r.notes && <p className="text-xs text-gray-500">{r.notes}</p>}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <span className="font-mono font-semibold text-gray-900">
                            {r.value} {r.unit || ''}
                          </span>
                          {flag && (
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${flag.className}`}>
                              {r.flag}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs hidden sm:table-cell">
                        {r.reference_range || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {r.date}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-500">
        H = Cao · L = Thấp · W = Cần theo dõi · N = Bình thường
      </p>
    </div>
  )
}
