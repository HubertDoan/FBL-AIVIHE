'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, ArrowRight } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format-date'

interface RecentDoc {
  id: string
  original_filename: string | null
  document_type: string
  created_at: string
}

interface PendingExtraction {
  id: string
  field_name: string
  field_value: string | null
  document_id: string
}

interface RecentActivityProps {
  recentDocs: RecentDoc[]
  pendingExtractions: PendingExtraction[]
}

export function RecentActivity({ recentDocs, pendingExtractions }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            T\u00E0i li\u1EC7u g\u1EA7n \u0111\u00E2y
            <Link href="/dashboard/upload">
              <Button variant="ghost" className="text-base">
                Xem t\u1EA5t c\u1EA3 <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentDocs.length === 0 ? (
            <p className="text-lg text-muted-foreground text-center py-4">
              Ch\u01B0a c\u00F3 t\u00E0i li\u1EC7u n\u00E0o
            </p>
          ) : (
            <ul className="space-y-3">
              {recentDocs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3">
                  <FileText className="size-5 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium truncate">
                      {doc.original_filename ?? 'T\u00E0i li\u1EC7u'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(doc.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {doc.document_type}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            Ch\u1EDD x\u00E1c nh\u1EADn
            <Link href="/dashboard/extraction">
              <Button variant="ghost" className="text-base">
                Xem t\u1EA5t c\u1EA3 <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingExtractions.length === 0 ? (
            <p className="text-lg text-muted-foreground text-center py-4">
              Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u ch\u1EDD x\u00E1c nh\u1EADn
            </p>
          ) : (
            <ul className="space-y-3">
              {pendingExtractions.map((ext) => (
                <li key={ext.id} className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium">{ext.field_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {ext.field_value}
                    </p>
                  </div>
                  <Link href={`/dashboard/extraction/${ext.document_id}`}>
                    <Button variant="outline" className="h-10 text-sm">
                      Xem & x\u00E1c nh\u1EADn
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
