'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Crown, CheckCircle, Send, Users } from 'lucide-react'
import { toastSuccess } from '@/lib/utils/toast-helpers'

interface Program {
  id: string
  name: string
  description: string
  price: string
  features: string[]
  active: boolean
}

const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    name: 'Chương trình Thành viên Cơ bản',
    description: 'Truy cập cơ bản vào hệ thống quản lý sức khỏe cá nhân.',
    price: 'Miễn phí',
    features: [
      'Lưu trữ hồ sơ sức khỏe',
      'Xem lịch sử khám bệnh',
      'Nhận thông báo từ hệ thống',
    ],
    active: true,
  },
  {
    id: 'prog-2',
    name: 'Chương trình Thành viên Nâng cao',
    description: 'Truy cập đầy đủ tính năng AI và tư vấn sức khỏe.',
    price: '99.000đ/tháng',
    features: [
      'Tất cả tính năng Cơ bản',
      'Trích xuất AI từ giấy khám',
      'Tư vấn bác sĩ gia đình',
      'Lưu trữ không giới hạn',
    ],
    active: true,
  },
  {
    id: 'prog-3',
    name: 'Chương trình Gia đình',
    description: 'Quản lý sức khỏe cho cả gia đình, tối đa 6 thành viên.',
    price: '199.000đ/tháng',
    features: [
      'Tất cả tính năng Nâng cao',
      'Tối đa 6 thành viên gia đình',
      'Chia sẻ hồ sơ gia đình',
      'Báo cáo sức khỏe gia đình',
      'Ưu tiên hỗ trợ',
    ],
    active: true,
  },
]

export function ProgramManager() {
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS)
  const [formOpen, setFormOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [active, setActive] = useState(true)
  const [sendOpen, setSendOpen] = useState(false)
  const [sendProgram, setSendProgram] = useState<Program | null>(null)
  const [sendTarget, setSendTarget] = useState<'all' | 'group' | 'individual'>('all')
  const [sendPhone, setSendPhone] = useState('')

  function openSend(prog: Program) {
    setSendProgram(prog)
    setSendTarget('all')
    setSendPhone('')
    setSendOpen(true)
  }

  function handleSend() {
    const targetLabel = sendTarget === 'all' ? 'tất cả thành viên'
      : sendTarget === 'group' ? 'nhóm thành viên'
      : `SĐT ${sendPhone}`
    toastSuccess(`Đã gửi "${sendProgram?.name}" đến ${targetLabel}`)
    setSendOpen(false)
  }

  function openCreate() {
    setEditIndex(null)
    setName('')
    setDescription('')
    setPrice('')
    setFeaturesText('')
    setActive(true)
    setFormOpen(true)
  }

  function openEdit(idx: number) {
    const p = programs[idx]
    setEditIndex(idx)
    setName(p.name)
    setDescription(p.description)
    setPrice(p.price)
    setFeaturesText(p.features.join('\n'))
    setActive(p.active)
    setFormOpen(true)
  }

  function handleSave() {
    if (!name.trim()) return
    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
    const updated: Program = {
      id: editIndex !== null ? programs[editIndex].id : `prog-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: price.trim() || 'Miễn phí',
      features,
      active,
    }

    if (editIndex !== null) {
      setPrograms((prev) => prev.map((p, i) => (i === editIndex ? updated : p)))
    } else {
      setPrograms((prev) => [...prev, updated])
    }
    setFormOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {programs.length} chương trình
        </p>
        <Button onClick={openCreate} className="min-h-[44px] text-base">
          <Plus className="size-4 mr-2" />
          Tạo chương trình mới
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((prog, idx) => (
          <Card key={prog.id} className={!prog.active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="size-5 text-purple-600 shrink-0" />
                  {prog.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(idx)}
                  title="Chỉnh sửa"
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{prog.description}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-base font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                >
                  {prog.price}
                </Badge>
                {prog.active ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="secondary">Tạm dừng</Badge>
                )}
              </div>
              <ul className="space-y-1.5">
                {prog.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="size-4 text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {prog.active && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full min-h-[40px] text-sm mt-2"
                  onClick={() => openSend(prog)}
                >
                  <Send className="size-4 mr-2" />
                  Gửi cho thành viên
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog gửi chương trình */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Gửi chương trình
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-base font-medium">{sendProgram?.name}</p>
            <div className="space-y-2">
              <Label className="text-base">Gửi đến</Label>
              <select
                value={sendTarget}
                onChange={(e) => setSendTarget(e.target.value as 'all' | 'group' | 'individual')}
                className="w-full h-12 text-base px-3 rounded-lg border border-input bg-background"
              >
                <option value="all">Tất cả thành viên</option>
                <option value="group">Nhóm thành viên (theo chi nhánh)</option>
                <option value="individual">Gửi cho cá nhân</option>
              </select>
            </div>
            {sendTarget === 'individual' && (
              <div className="space-y-2">
                <Label className="text-base">Số điện thoại</Label>
                <Input
                  value={sendPhone}
                  onChange={(e) => setSendPhone(e.target.value)}
                  placeholder="0912345678"
                  className="h-12 text-base"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)} className="min-h-[44px]">
              Hủy
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendTarget === 'individual' && !sendPhone.trim()}
              className="min-h-[44px]"
            >
              <Send className="size-4 mr-2" />
              Gửi thông báo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editIndex !== null ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-base">Tên chương trình</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên chương trình..."
                className="h-10 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn..."
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Giá</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="VD: 99.000đ/tháng hoặc Miễn phí"
                className="h-10 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Tính năng (mỗi dòng 1 tính năng)</Label>
              <Textarea
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="Lưu trữ hồ sơ&#10;Tư vấn bác sĩ&#10;..."
                className="min-h-24 text-base"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="prog-active"
                checked={active}
                onCheckedChange={(v) => setActive(v === true)}
              />
              <Label htmlFor="prog-active" className="text-base cursor-pointer">
                {active ? 'Hoạt động' : 'Tạm dừng'}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="min-h-[44px] text-base"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="min-h-[44px] text-base"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
