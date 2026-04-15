/**
 * Document type chips — hỗ trợ AI classify chính xác hơn
 * User chọn loại tài liệu trước khi upload (gợi ý, không bắt buộc)
 * Port từ SSK-VNeID prototype
 */

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'lab_report', label: '📄 Kết quả XN', icon: '📄', daycat: 'lab' },
  { value: 'ultrasound', label: '🫀 Siêu âm', icon: '🫀', daycat: 'imaging' },
  { value: 'imaging', label: '🩻 CT / X-Quang', icon: '🩻', daycat: 'imaging' },
  { value: 'prescription', label: '💊 Đơn thuốc', icon: '💊', daycat: 'medication' },
  { value: 'visit_note', label: '📋 Phiếu khám', icon: '📋', daycat: 'encounter' },
  { value: 'summary_report', label: '📑 Báo cáo tổng hợp', icon: '📑', daycat: 'summary' },
] as const

export type DocumentTypeValue = typeof DOCUMENT_TYPE_OPTIONS[number]['value']

export function SmartUploadDocumentTypeChips({
  selected,
  onSelect,
}: {
  selected: DocumentTypeValue | null
  onSelect: (v: DocumentTypeValue | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DOCUMENT_TYPE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(selected === opt.value ? null : opt.value)}
          className={`px-3 py-1.5 rounded-full border text-sm transition ${
            selected === opt.value
              ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
              : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-red-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
