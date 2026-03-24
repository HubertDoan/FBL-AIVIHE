'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FamilyMemberCard } from '@/components/family/family-member-card'
import { InviteMemberDialog } from '@/components/family/invite-member-dialog'
import { createClient } from '@/lib/supabase/client'
import { useActingAs } from '@/hooks/use-acting-as'
import { UserPlus, Users } from 'lucide-react'
import type { FamilyRole } from '@/types/database'

interface MemberRow {
  id: string
  citizen_id: string
  role: FamilyRole
  relationship: string | null
  joined_at: string
  citizens: { full_name: string }
}

export default function FamilyPage() {
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [familyName, setFamilyName] = useState('')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [myRole, setMyRole] = useState<FamilyRole>('member')
  const [citizenId, setCitizenId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { setActingAs } = useActingAs()

  const fetchFamily = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: citizen } = await supabase
      .from('citizens').select('id').eq('auth_id', user.id).single()
    if (!citizen) { setLoading(false); return }
    setCitizenId(citizen.id)

    const { data: membership } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('citizen_id', citizen.id)
      .limit(1)
      .single()

    if (!membership) { setLoading(false); return }
    setFamilyId(membership.family_id)
    setMyRole(membership.role as FamilyRole)

    const { data: family } = await supabase
      .from('families').select('name').eq('id', membership.family_id).single()
    setFamilyName(family?.name ?? '')

    const { data: mems } = await supabase
      .from('family_members')
      .select('id, citizen_id, role, relationship, joined_at, citizens(full_name)')
      .eq('family_id', membership.family_id)

    setMembers((mems as unknown as MemberRow[]) ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchFamily() }, [fetchFamily])

  const handleCreateFamily = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !citizenId) return

    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Gia \u0111\u00ECnh` }),
    })
    if (res.ok) fetchFamily()
  }

  const handleInvite = async (data: { phone: string; relationship: string; role: string }) => {
    if (!familyId) return
    const res = await fetch('/api/family/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyId, ...data }),
    })
    if (res.ok) fetchFamily()
  }

  const canManage = myRole === 'owner' || myRole === 'manager'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">\u0110ang t\u1EA3i...</p>
        </div>
      </div>
    )
  }

  if (!familyId) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <Users className="size-16 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold">Qu\u1EA3n l\u00FD gia \u0111\u00ECnh</h2>
        <p className="text-lg text-muted-foreground">
          B\u1EA1n ch\u01B0a thu\u1ED9c nh\u00F3m gia \u0111\u00ECnh n\u00E0o.
        </p>
        <Button className="h-14 text-lg px-8" onClick={handleCreateFamily}>
          T\u1EA1o nh\u00F3m gia \u0111\u00ECnh
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Qu\u1EA3n l\u00FD gia \u0111\u00ECnh</h1>
          <p className="text-lg text-muted-foreground">{familyName}</p>
        </div>
        {canManage && (
          <Button className="h-12 text-base" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-5 mr-2" />
            Th\u00EAm th\u00E0nh vi\u00EAn
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m) => (
          <FamilyMemberCard
            key={m.id}
            memberId={m.id}
            citizenId={m.citizen_id}
            name={m.citizens?.full_name ?? ''}
            relationship={m.relationship}
            role={m.role}
            joinedAt={m.joined_at}
            canManage={canManage && m.citizen_id !== citizenId}
            onViewProfile={(cid) => router.push(`/dashboard/profile?citizen=${cid}`)}
            onActOnBehalf={(cid, name) => setActingAs(cid, name)}
          />
        ))}
      </div>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        familyId={familyId}
        onInvite={handleInvite}
      />
    </div>
  )
}
