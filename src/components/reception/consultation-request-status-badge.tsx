/**
 * Badge hiển thị trạng thái của yêu cầu tư vấn
 * new → contacted → info_completed → approved / rejected → converted
 */

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'Mới', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  contacted: { label: 'Đã liên hệ', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  info_completed: { label: 'Đủ thông tin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200' },
  converted: { label: 'Đã chuyển đổi', color: 'bg-teal-100 text-teal-700 border-teal-200' },
}

export function ConsultationRequestStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}
