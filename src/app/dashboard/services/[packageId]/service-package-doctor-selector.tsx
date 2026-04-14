'use client'

// Doctor selector panel for packageType 1 (family-doctor) and packageType 3 (specialist)
// Shows 5 recommended demo doctors with star ratings

import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface DemoDoctor {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  avatar: null
}

export const DEMO_DOCTORS: DemoDoctor[] = [
  { id: 'doc-1', name: 'BS. Nguyễn Hải', specialty: 'Nội tổng quát', rating: 4.8, reviews: 45, avatar: null },
  { id: 'doc-2', name: 'BS. Trần Văn Nam', specialty: 'Tim mạch', rating: 4.9, reviews: 62, avatar: null },
  { id: 'doc-3', name: 'BS. Phạm Văn Đức', specialty: 'Cơ xương khớp', rating: 4.7, reviews: 38, avatar: null },
  { id: 'doc-4', name: 'BS. Lê Thị Hoa', specialty: 'Nội tiết', rating: 4.6, reviews: 29, avatar: null },
  { id: 'doc-5', name: 'BS. Hoàng Minh Tú', specialty: 'Thần kinh', rating: 4.8, reviews: 51, avatar: null },
]

interface Props {
  selectedDoctorId: string
  onSelect: (id: string) => void
}

export function ServicePackageDoctorSelector({ selectedDoctorId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold text-gray-800">Chọn bác sĩ</p>
      <p className="text-base text-gray-500">Chọn bác sĩ phù hợp hoặc để hệ thống gợi ý sau khi đăng ký.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_DOCTORS.map((doc) => {
          const selected = selectedDoctorId === doc.id
          return (
            <Card
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={`cursor-pointer transition-all border-2 ${
                selected
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <CardContent className="flex items-center gap-3 p-4">
                {/* Avatar placeholder */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
                  {doc.name.charAt(4)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-gray-900 truncate">{doc.name}</p>
                  <Badge variant="outline" className="mt-0.5 text-xs">
                    {doc.specialty}
                  </Badge>
                  <div className="mt-1 flex items-center gap-1 text-sm text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                    <span className="font-medium">{doc.rating}</span>
                    <span className="text-gray-400">({doc.reviews} đánh giá)</span>
                  </div>
                </div>
                {selected && (
                  <div className="h-4 w-4 rounded-full bg-teal-500 shrink-0" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
