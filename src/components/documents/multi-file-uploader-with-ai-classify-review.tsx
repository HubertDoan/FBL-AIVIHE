'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Camera, X, CheckCircle, Loader2, AlertCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { DocumentClassificationReviewDialog } from './document-classification-review-dialog'
import type { AiClassifyResult } from './document-classification-review-dialog'

/**
 * Multi-file uploader với AI classify + review verification
 * Workflow:
 * 1. User chọn nhiều file (PDF/image/text)
 * 2. Client upload từng file → sau khi upload success → gọi AI classify
 * 3. Show review dialog cho TỪNG file (category + patient name + fields)
 * 4. User sửa/confirm → POST /api/health-record/add → lưu vào mục tương ứng
 */

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/heic',
  'application/pdf',
  'text/plain',
]

interface FileItem {
  id: string
  file: File
  preview: string | null
  status: 'queued' | 'uploading' | 'classifying' | 'review' | 'saved' | 'error'
  error?: string
  documentId?: string
  classifyResult?: AiClassifyResult
}

interface Props {
  citizenId: string
  customerName: string
  onAllDone?: () => void
}

export function MultiFileUploaderWithAiClassifyReview({ citizenId, customerName, onAllDone }: Props) {
  const [items, setItems] = useState<FileItem[]>([])
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: FileItem[] = []
    Array.from(files).forEach(file => {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: quá lớn (>10MB)`)
        return
      }
      if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('text/')) {
        toast.error(`${file.name}: định dạng không hỗ trợ`)
        return
      }
      newItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        status: 'queued',
      })
    })
    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems])
      // Bắt đầu xử lý ngay
      newItems.forEach(it => processItem(it))
    }
  }, [])

  function updateItem(id: string, patch: Partial<FileItem>) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }

  async function processItem(item: FileItem) {
    // Step 1: upload
    updateItem(item.id, { status: 'uploading' })
    try {
      const fd = new FormData()
      fd.append('file', item.file)
      fd.append('citizenId', citizenId)
      const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        updateItem(item.id, { status: 'error', error: uploadData.error || 'Upload lỗi' })
        return
      }

      // Step 2: classify
      updateItem(item.id, { status: 'classifying', documentId: uploadData.documentId })
      const clsRes = await fetch('/api/documents/classify-and-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: item.file.name, customer_name: customerName, document_id: uploadData.documentId }),
      })
      const clsData = await clsRes.json()
      if (!clsRes.ok) {
        updateItem(item.id, { status: 'error', error: clsData.error || 'AI lỗi' })
        return
      }

      updateItem(item.id, { status: 'review', classifyResult: clsData.result })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi'
      updateItem(item.id, { status: 'error', error: msg })
    }
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  const reviewingItem = items.find(it => it.id === reviewingId)

  return (
    <div className="space-y-4">
      {/* Upload buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,text/plain"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <Button variant="outline" className="h-14" onClick={() => fileInputRef.current?.click()}>
          <Upload className="size-5 mr-2" />
          Chọn nhiều tệp (PDF · ảnh · text)
        </Button>
        <Button variant="outline" className="h-14" onClick={() => cameraInputRef.current?.click()}>
          <Camera className="size-5 mr-2" />
          Chụp ảnh
        </Button>
      </div>
      <p className="text-sm text-gray-500 text-center">
        Có thể chọn nhiều tệp cùng lúc · tối đa 10MB/tệp · AI tự phân loại
      </p>

      {/* Queue list */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">Danh sách tệp ({items.length})</p>
          {items.map(it => (
            <FileQueueRow key={it.id} item={it} onReview={() => setReviewingId(it.id)} onRemove={() => removeItem(it.id)} />
          ))}
        </div>
      )}

      {/* Review dialog */}
      {reviewingItem && reviewingItem.classifyResult && (
        <DocumentClassificationReviewDialog
          filename={reviewingItem.file.name}
          preview={reviewingItem.preview}
          classifyResult={reviewingItem.classifyResult}
          customerName={customerName}
          documentId={reviewingItem.documentId}
          onClose={() => setReviewingId(null)}
          onSaved={() => {
            updateItem(reviewingItem.id, { status: 'saved' })
            setReviewingId(null)
            toast.success('Đã lưu vào hồ sơ')
            // Check all done
            const allDone = items.every(i => i.id === reviewingItem.id || i.status === 'saved' || i.status === 'error')
            if (allDone) onAllDone?.()
          }}
        />
      )}
    </div>
  )
}

function FileQueueRow({ item, onReview, onRemove }: {
  item: FileItem
  onReview: () => void
  onRemove: () => void
}) {
  const statusConfig: Record<FileItem['status'], { label: string; color: string; icon: React.ReactNode }> = {
    queued: { label: 'Đang chờ', color: 'text-gray-500', icon: <Loader2 className="size-4" /> },
    uploading: { label: 'Đang tải lên...', color: 'text-blue-600', icon: <Loader2 className="size-4 animate-spin" /> },
    classifying: { label: 'AI đang phân tích...', color: 'text-purple-600', icon: <Loader2 className="size-4 animate-spin" /> },
    review: { label: 'Chờ xác thực', color: 'text-amber-600', icon: <AlertCircle className="size-4" /> },
    saved: { label: 'Đã lưu', color: 'text-green-600', icon: <CheckCircle className="size-4" /> },
    error: { label: 'Lỗi', color: 'text-red-600', icon: <AlertCircle className="size-4" /> },
  }
  const cfg = statusConfig[item.status]

  return (
    <Card>
      <CardContent className="pt-3 pb-3">
        <div className="flex items-center gap-3">
          {item.preview ? (
            <img src={item.preview} alt="" className="size-12 rounded object-cover shrink-0" />
          ) : (
            <div className="size-12 rounded bg-slate-100 flex items-center justify-center shrink-0">
              <FileText className="size-5 text-slate-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.file.name}</p>
            <p className={`text-xs flex items-center gap-1 ${cfg.color}`}>
              {cfg.icon}
              {cfg.label}
              {item.classifyResult && item.status === 'review' && (
                <span className="text-teal-600 ml-2">→ {item.classifyResult.category_label}</span>
              )}
              {item.error && <span className="ml-2 text-red-600">{item.error}</span>}
            </p>
          </div>
          <div className="flex gap-1">
            {item.status === 'review' && (
              <Button size="sm" onClick={onReview}>Xác thực</Button>
            )}
            {item.status !== 'saved' && (
              <Button size="icon" variant="ghost" onClick={onRemove}>
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
