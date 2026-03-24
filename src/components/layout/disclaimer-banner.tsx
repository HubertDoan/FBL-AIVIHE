'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const SENTENCES = [
  'Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.',
  'AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh.',
  'Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.',
]

export function DisclaimerBanner() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-50 border-t border-blue-200">
      <div className="max-w-5xl mx-auto px-4 py-2">
        {!expanded ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-blue-800" style={{ fontSize: '14px' }}>
              AI không thay thế bác sĩ &bull; Dữ liệu thuộc về bạn
            </p>
            <button
              onClick={() => setExpanded(true)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 min-h-0 px-2 py-1"
              style={{ fontSize: '14px', minHeight: 'auto' }}
            >
              Xem thêm
              <ChevronUp className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <ul className="space-y-1">
                {SENTENCES.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-blue-800"
                    style={{ fontSize: '14px' }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setExpanded(false)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 min-h-0 px-2 py-1"
                style={{ fontSize: '14px', minHeight: 'auto' }}
              >
                Thu gọn
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
