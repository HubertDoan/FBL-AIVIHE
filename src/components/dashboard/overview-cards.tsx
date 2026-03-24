'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Stethoscope, Clock, Users } from 'lucide-react'

interface OverviewCardsProps {
  documentCount: number
  visitCount: number
  pendingCount: number
  familyCount: number
}

const CARDS = [
  {
    key: 'documents',
    label: 'Tài liệu',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
    href: '/dashboard/upload',
    countKey: 'documentCount' as const,
  },
  {
    key: 'visits',
    label: 'Lần khám',
    icon: Stethoscope,
    color: 'text-green-600 bg-green-50',
    href: '/dashboard/timeline',
    countKey: 'visitCount' as const,
  },
  {
    key: 'pending',
    label: 'Chờ xác nhận',
    icon: Clock,
    color: 'text-amber-600 bg-amber-50',
    href: '/dashboard/extraction',
    countKey: 'pendingCount' as const,
  },
  {
    key: 'family',
    label: 'Gia đình',
    icon: Users,
    color: 'text-purple-600 bg-purple-50',
    href: '/dashboard/family',
    countKey: 'familyCount' as const,
  },
]

export function OverviewCards(props: OverviewCardsProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-2 gap-4">
      {CARDS.map((card) => (
        <Card
          key={card.key}
          className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
          onClick={() => router.push(card.href)}
        >
          <CardContent className="flex items-center gap-4 py-2">
            <div className={`rounded-xl p-3 ${card.color}`}>
              <card.icon className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{props[card.countKey]}</p>
              <p className="text-base text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
