'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf', 'image/heic']

interface Props {
  citizenId: string
  onUploadComplete: (documentId: string) => void
}

export function DocumentUploader({ citizenId, onUploadComplete }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((f: File): string | null => {
    if (f.size > MAX_SIZE) return 'Tệp quá lớn, tối đa 10MB.'
    if (!ALLOWED.includes(f.type)) {
      return 'Định dạng không hỗ trợ. Chấp nhận: JPEG, PNG, PDF, HEIC.'
    }
    return null
  }, [])

  const handleFile = useCallback(
    (f: File) => {
      const err = validateFile(f)
      if (err) {
        setError(err)
        return
      }
      setError(null)
      setFile(f)
      if (f.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(f))
      } else {
        setPreview(null)
      }
    },
    [validateFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleFile(dropped)
    },
    [handleFile]
  )

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(20)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('citizenId', citizenId)
      if (notes) formData.append('notes', notes)

      setProgress(50)
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(80)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Tải lên thất bại.')
        return
      }

      setProgress(100)
      onUploadComplete(data.documentId)
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30'
        }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Xem trước"
            className="mx-auto max-h-48 rounded-lg object-contain"
          />
        ) : file ? (
          <div className="space-y-2">
            <div className="mx-auto size-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
              PDF
            </div>
            <p className="text-lg">{file.name}</p>
          </div>
        ) : (
          <p className="text-lg text-muted-foreground">
            Kéo và thả tệp vào đây
          </p>
        )}
      </div>

      {/* File inputs */}
      <div className="flex gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.heic"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button
          variant="outline"
          size="lg"
          className="flex-1 text-lg min-h-[48px]"
          onClick={() => fileRef.current?.click()}
        >
          Chọn tệp
        </Button>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button
          variant="outline"
          size="lg"
          className="flex-1 text-lg min-h-[48px]"
          onClick={() => cameraRef.current?.click()}
        >
          Chụp ảnh
        </Button>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-lg">
          Ghi chú (tuỳ chọn)
        </Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ví dụ: Kết quả xét nghiệm máu tháng 3"
          maxLength={500}
          className="text-lg min-h-[48px]"
        />
      </div>

      {error && (
        <p className="text-destructive text-lg font-medium">{error}</p>
      )}

      {uploading && <Progress value={progress} />}

      <Button
        size="lg"
        className="w-full text-lg min-h-[52px]"
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? 'Đang tải lên...' : 'Tải lên'}
      </Button>
    </div>
  )
}
