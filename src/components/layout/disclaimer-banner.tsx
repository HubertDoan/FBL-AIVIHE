'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const SENTENCES = [
  'Tr\u1EE3 l\u00FD AI s\u1EE9c kh\u1ECFe c\u00E1 nh\u00E2n gi\u00FAp ng\u01B0\u1EDDi d\u00E2n hi\u1EC3u v\u00E0 qu\u1EA3n l\u00FD d\u1EEF li\u1EC7u s\u1EE9c kh\u1ECFe c\u1EE7a m\u00ECnh.',
  'AI ch\u1EC9 h\u1ED7 tr\u1EE3 t\u1ED5ng h\u1EE3p v\u00E0 gi\u1EA3i th\u00EDch th\u00F4ng tin t\u1EEB d\u1EEF li\u1EC7u ng\u01B0\u1EDDi d\u00F9ng cung c\u1EA5p, kh\u00F4ng thay th\u1EBF b\u00E1c s\u0129 v\u00E0 kh\u00F4ng ch\u1EA9n \u0111o\u00E1n b\u1EC7nh.',
  'D\u1EEF li\u1EC7u s\u1EE9c kh\u1ECFe thu\u1ED9c v\u1EC1 ng\u01B0\u1EDDi d\u00F9ng v\u00E0 ch\u1EC9 \u0111\u01B0\u1EE3c chia s\u1EBB khi c\u00F3 s\u1EF1 cho ph\u00E9p c\u1EE7a ch\u1EE7 h\u1ED3 s\u01A1.',
]

export function DisclaimerBanner() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-50 border-t border-blue-200">
      <div className="max-w-5xl mx-auto px-4 py-2">
        {!expanded ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-blue-800" style={{ fontSize: '14px' }}>
              AI kh\u00F4ng thay th\u1EBF b\u00E1c s\u0129 &bull; D\u1EEF li\u1EC7u thu\u1ED9c v\u1EC1 b\u1EA1n
            </p>
            <button
              onClick={() => setExpanded(true)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 min-h-0 px-2 py-1"
              style={{ fontSize: '14px', minHeight: 'auto' }}
            >
              Xem th\u00EAm
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
                Thu g\u1ECDn
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
