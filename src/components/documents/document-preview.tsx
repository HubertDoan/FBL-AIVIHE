'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  url: string
  fileType: string
  alt?: string
}

export function DocumentPreview({ url, fileType, alt = 'Tài liệu' }: Props) {
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const isImage = fileType.startsWith('image/')
  const isPdf = fileType === 'application/pdf'

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5))
  const resetZoom = () => setScale(1)

  if (isPdf) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border bg-muted/50 p-8 text-center space-y-3">
          <div className="mx-auto size-16 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold">
            PDF
          </div>
          <p className="text-lg text-muted-foreground">Tệp PDF</p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="w-full text-lg min-h-[48px]"
          onClick={() => window.open(url, '_blank')}
        >
          Mở tệp PDF
        </Button>
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="min-h-[48px] text-lg"
            onClick={zoomOut}
          >
            −
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-h-[48px] text-lg"
            onClick={resetZoom}
          >
            {Math.round(scale * 100)}%
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-h-[48px] text-lg"
            onClick={zoomIn}
          >
            +
          </Button>
        </div>
        <div
          ref={containerRef}
          className="overflow-auto rounded-xl border max-h-[60vh] touch-pinch-zoom"
        >
          <img
            src={url}
            alt={alt}
            className="w-full transition-transform origin-top-left"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-muted/50 p-8 text-center">
      <p className="text-lg text-muted-foreground">
        Không thể xem trước loại tệp này.
      </p>
      <Button
        variant="outline"
        size="lg"
        className="mt-4 text-lg min-h-[48px]"
        onClick={() => window.open(url, '_blank')}
      >
        Mở tệp
      </Button>
    </div>
  )
}
