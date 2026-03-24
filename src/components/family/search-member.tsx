'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, UserPlus, Loader2 } from 'lucide-react'

const RELATIONSHIPS = [
  { value: 'wife', label: 'Vợ' },
  { value: 'husband', label: 'Chồng' },
  { value: 'father', label: 'Bố' },
  { value: 'mother', label: 'Mẹ' },
  { value: 'son', label: 'Con trai' },
  { value: 'daughter', label: 'Con gái' },
  { value: 'grandfather', label: 'Ông' },
  { value: 'grandmother', label: 'Bà' },
  { value: 'sibling', label: 'Anh/Chị/Em' },
  { value: 'other', label: 'Khác' },
]

interface SearchResult {
  id: string
  full_name: string
  phone: string
}

interface SearchMemberProps {
  onInviteSent?: () => void
}

export function SearchMember({ onInviteSent }: SearchMemberProps) {
  const [phone, setPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [relationship, setRelationship] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!phone || !/^0\d{9}$/.test(phone.trim())) {
      setError('Vui lòng nhập đúng 10 chữ số, bắt đầu bằng 0.')
      return
    }
    setSearching(true)
    setResult(null)
    setNotFound(false)
    setError('')
    setSent(false)

    try {
      const res = await fetch(`/api/family/search?phone=${phone.trim()}`)
      const data = await res.json()
      if (data.found && data.citizen) {
        setResult(data.citizen)
      } else {
        setNotFound(true)
      }
    } catch {
      setError('Lỗi khi tìm kiếm. Vui lòng thử lại.')
    }
    setSearching(false)
  }

  const handleInvite = async () => {
    if (!result || !relationship) return
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/family/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          relationship,
          message: message.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        setResult(null)
        setPhone('')
        setRelationship('')
        setMessage('')
        onInviteSent?.()
      } else {
        setError(data.error ?? 'Gửi lời mời thất bại.')
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    }
    setSending(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-lg font-medium">Số điện thoại người thân</Label>
        <div className="flex gap-3">
          <Input
            className="h-14 text-lg flex-1"
            placeholder="0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            className="h-14 text-lg px-6 min-w-[120px]"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Search className="size-5 mr-2" />
                Tìm kiếm
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-destructive text-base font-medium">{error}</p>
      )}

      {sent && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <p className="text-green-800 text-lg font-medium">
              Đã gửi lời mời thành công! Đang chờ người nhận chấp nhận.
            </p>
          </CardContent>
        </Card>
      )}

      {notFound && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <p className="text-orange-800 text-lg">
              Không tìm thấy người dùng với số điện thoại này.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                {result.full_name.split(' ').pop()?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-xl font-semibold">{result.full_name}</p>
                <p className="text-base text-muted-foreground">{result.phone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-lg">Mối quan hệ</Label>
              <Select value={relationship} onValueChange={(v) => setRelationship(v ?? '')}>
                <SelectTrigger className="h-14 text-lg w-full">
                  <SelectValue placeholder="Chọn mối quan hệ" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-base">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-lg">Lời nhắn (không bắt buộc)</Label>
              <Textarea
                className="text-base min-h-[80px]"
                placeholder="Nhập lời nhắn cho người nhận..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
              />
            </div>

            <Button
              className="w-full h-14 text-lg"
              onClick={handleInvite}
              disabled={sending || !relationship}
            >
              {sending ? (
                <Loader2 className="size-5 animate-spin mr-2" />
              ) : (
                <UserPlus className="size-5 mr-2" />
              )}
              {sending ? 'Đang gửi...' : 'Mời vào gia đình'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
