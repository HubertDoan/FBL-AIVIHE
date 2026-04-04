'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MembershipCard } from '@/components/membership/membership-card'
import { useAuth } from '@/hooks/use-auth'
import {
  CreditCard,
  Banknote,
  History,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Copy,
} from 'lucide-react'

const BANK_INFO = {
  bank: 'BIDV',
  account: '12310000073672',
  holder: 'DOAN NGOC HAI',
}

const PLAN_PRICE = '300.000đ/tháng'
const PLAN_CYCLE = 'Đóng 6 tháng/lần: 1.800.000đ'

interface Payment {
  id: string
  date: string
  amount: string
  content: string
  status: 'confirmed' | 'pending' | 'rejected'
}

const DEMO_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    date: '24/03/2026',
    amount: '1.800.000đ',
    content: 'AIVIHE phí 6 tháng (04-09/2026)',
    status: 'confirmed',
  },
  {
    id: 'p2',
    date: '20/09/2025',
    amount: '1.800.000đ',
    content: 'AIVIHE phí 6 tháng (10/2025-03/2026)',
    status: 'confirmed',
  },
  {
    id: 'p3',
    date: '15/03/2025',
    amount: '1.800.000đ',
    content: 'AIVIHE phí 6 tháng (04-09/2025)',
    status: 'pending',
  },
]

function StatusBadge({ status }: { status: Payment['status'] }) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 text-sm font-medium">
        <CheckCircle className="size-4" />
        Đã xác nhận
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-3 py-1 text-sm font-medium">
        <Clock className="size-4" />
        Chờ xác nhận
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-1 text-sm font-medium">
      <XCircle className="size-4" />
      Từ chối
    </span>
  )
}

export default function MembershipPage() {
  const { user, loading } = useAuth()
  const [confirming, setConfirming] = useState(false)
  const [confirmSuccess, setConfirmSuccess] = useState(false)
  const [copied, setCopied] = useState('')

  const username = user?.citizenId ?? user?.phone ?? 'user'

  async function handleConfirmPayment() {
    setConfirming(true)
    try {
      await fetch('/api/membership/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: user?.citizenId,
          amount: 50000,
          content: `AIVIHE ${username}`,
        }),
      })
      setConfirmSuccess(true)
    } catch {
      // handle error silently
    } finally {
      setConfirming(false)
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Thành viên AIVIHE</h1>

      <Tabs defaultValue={0}>
        <TabsList className="w-full h-auto flex">
          <TabsTrigger value={0} className="flex-1 py-3 text-base gap-2">
            <CreditCard className="size-4" />
            Thẻ thành viên
          </TabsTrigger>
          <TabsTrigger value={1} className="flex-1 py-3 text-base gap-2">
            <Banknote className="size-4" />
            Phí hội viên
          </TabsTrigger>
          <TabsTrigger value={2} className="flex-1 py-3 text-base gap-2">
            <History className="size-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Membership Card */}
        <TabsContent value={0} className="mt-4">
          <MembershipCard
            fullName={user?.fullName ?? ''}
            memberId={username}
            tier="silver"
          />
        </TabsContent>

        {/* Tab 2: Payment Info */}
        <TabsContent value={1} className="mt-4 space-y-4">
          {/* Current plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gói hiện tại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Gói Bạc</span>
                <span className="text-xl font-bold text-purple-600">
                  {PLAN_PRICE}
                </span>
              </div>
              <p className="text-base text-orange-600 font-semibold">{PLAN_CYCLE}</p>
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">
                  Trạng thái
                </span>
                <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                  <CheckCircle className="size-4" />
                  Đã thanh toán
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">
                  Thanh toán tiếp theo
                </span>
                <span className="text-base font-medium">01/04/2026</span>
              </div>
            </CardContent>
          </Card>

          {/* Bank transfer info */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Building2 className="size-5" />
                Thông tin chuyển khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <InfoRow
                label="Ngân hàng"
                value={BANK_INFO.bank}
                onCopy={() => copyToClipboard(BANK_INFO.bank, 'bank')}
                copied={copied === 'bank'}
              />
              <InfoRow
                label="Số tài khoản"
                value={BANK_INFO.account}
                onCopy={() => copyToClipboard(BANK_INFO.account, 'account')}
                copied={copied === 'account'}
              />
              <InfoRow
                label="Chủ tài khoản"
                value={BANK_INFO.holder}
                onCopy={() => copyToClipboard(BANK_INFO.holder, 'holder')}
                copied={copied === 'holder'}
              />
              <InfoRow
                label="Nội dung CK"
                value={`AIVIHE ${username}`}
                onCopy={() =>
                  copyToClipboard(`AIVIHE ${username}`, 'content')
                }
                copied={copied === 'content'}
              />
            </CardContent>
          </Card>

          {/* VietQR Code */}
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.vietqr.io/image/970418-12310000073672-compact2.png?amount=1800000&addInfo=${encodeURIComponent(`AIVIHE ${username}`)}&accountName=${encodeURIComponent('DOAN NGOC HAI')}`}
                alt="QR Chuyển khoản BIDV - Doan Ngoc Hai"
                className="w-64 h-auto"
              />
            </div>
          </div>

          {/* Payment note */}
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-lg px-4 py-3 text-base">
            <Building2 className="size-5 shrink-0" />
            <span>
              Sau khi chuyển khoản, hệ thống SePay sẽ tự động xác nhận và thông báo cho bạn.
            </span>
          </div>

          {/* Confirm payment button */}
          {confirmSuccess ? (
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg px-4 py-3 text-lg font-medium">
              <CheckCircle className="size-5 shrink-0" />
              Đã ghi nhận! Hệ thống sẽ tự động xác nhận khi nhận được tiền qua SePay.
            </div>
          ) : (
            <Button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="w-full min-h-[56px] text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              {confirming ? (
                <>
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <CheckCircle className="size-5 mr-2" />
                  Tôi đã chuyển tiền
                </>
              )}
            </Button>
          )}
        </TabsContent>

        {/* Tab 3: Payment History */}
        <TabsContent value={2} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lịch sử thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base">Ngày</TableHead>
                    <TableHead className="text-base">Số tiền</TableHead>
                    <TableHead className="text-base hidden sm:table-cell">
                      Nội dung
                    </TableHead>
                    <TableHead className="text-base text-right">
                      Trạng thái
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_PAYMENTS.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-base">{p.date}</TableCell>
                      <TableCell className="text-base font-medium">
                        {p.amount}
                      </TableCell>
                      <TableCell className="text-base hidden sm:table-cell">
                        {p.content}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-base text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold">{value}</span>
        <button
          type="button"
          onClick={onCopy}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          title="Sao chép"
        >
          {copied ? (
            <CheckCircle className="size-4 text-green-600" />
          ) : (
            <Copy className="size-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  )
}
