'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FamilyMemberCard } from '@/components/family/family-member-card'
import { InviteMemberDialog } from '@/components/family/invite-member-dialog'
import { SearchMember } from '@/components/family/search-member'
import { InvitationList } from '@/components/family/invitation-list'
import { FamilyMemberHealth } from '@/components/family/family-member-health'
import { useAuth } from '@/hooks/use-auth'
import { useActingAs } from '@/hooks/use-acting-as'
import { UserPlus, Users, Search, Mail, Heart } from 'lucide-react'
import type { FamilyRole } from '@/types/database'

interface MemberRow {
  id: string
  citizen_id: string
  role: FamilyRole
  relationship: string | null
  joined_at: string
  citizens: { full_name: string }
  citizen?: { full_name: string }
}

type TabKey = 'members' | 'search' | 'invitations'

export default function FamilyPage() {
  const { user, loading: authLoading } = useAuth()
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [familyName, setFamilyName] = useState('')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [myRole, setMyRole] = useState<FamilyRole>('member')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('members')
  const [invitationRefresh, setInvitationRefresh] = useState(0)
  const [healthDialog, setHealthDialog] = useState<{
    open: boolean
    memberId: string
    memberName: string
  }>({ open: false, memberId: '', memberName: '' })
  const router = useRouter()
  const { setActingAs } = useActingAs()

  const fetchFamily = useCallback(async () => {
    if (!user) return

    try {
      const famRes = await fetch('/api/family')
      if (!famRes.ok) { setLoading(false); return }
      const memberships = await famRes.json()

      if (!Array.isArray(memberships) || memberships.length === 0) {
        setLoading(false)
        return
      }

      const first = memberships[0]
      const fId = first.family_id
      setFamilyId(fId)
      setMyRole(first.role as FamilyRole)
      setFamilyName(first.families?.name ?? '')

      const memRes = await fetch(`/api/family/members?familyId=${fId}`)
      if (memRes.ok) {
        const mems = await memRes.json()
        const normalized = (mems as MemberRow[]).map((m) => ({
          ...m,
          citizens: m.citizens ?? m.citizen ?? { full_name: '' },
        }))
        setMembers(normalized)
      }
    } catch {
      // Silently handle fetch errors
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading || !user) return
    fetchFamily()
  }, [authLoading, user, fetchFamily])

  const handleCreateFamily = async () => {
    if (!user) return
    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Gia đình` }),
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
  const isOwner = myRole === 'owner'

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  // No family yet — show create + search options
  if (!familyId) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-8">
        <div className="text-center space-y-4">
          <Users className="size-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Quản lý gia đình</h2>
          <p className="text-lg text-muted-foreground">
            Bạn chưa thuộc nhóm gia đình nào.
          </p>
          <Button className="h-14 text-lg px-8" onClick={handleCreateFamily}>
            Tạo nhóm gia đình
          </Button>
        </div>

        {/* Even without a family, show received invitations */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Lời mời gia đình</h3>
          <InvitationList refreshKey={invitationRefresh} />
        </div>
      </div>
    )
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'members', label: 'Thành viên', icon: <Users className="size-5" /> },
    { key: 'search', label: 'Tìm người thân', icon: <Search className="size-5" /> },
    { key: 'invitations', label: 'Lời mời', icon: <Mail className="size-5" /> },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý gia đình</h1>
          <p className="text-lg text-muted-foreground">{familyName}</p>
        </div>
        {canManage && (
          <Button className="h-12 text-base" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-5 mr-2" />
            Thêm nhanh
          </Button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-base font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((m) => (
            <div key={m.id} className="relative">
              <FamilyMemberCard
                memberId={m.id}
                citizenId={m.citizen_id}
                name={m.citizens?.full_name ?? ''}
                relationship={m.relationship}
                role={m.role}
                joinedAt={m.joined_at}
                canManage={canManage && m.citizen_id !== user?.citizenId}
                onViewProfile={(cid) => router.push(`/dashboard/profile?citizen=${cid}`)}
                onActOnBehalf={(cid, name) => setActingAs(cid, name)}
              />
              {isOwner && m.citizen_id !== user?.citizenId && (
                <Button
                  variant="outline"
                  className="w-full h-12 text-base mt-2 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() =>
                    setHealthDialog({
                      open: true,
                      memberId: m.id,
                      memberName: m.citizens?.full_name ?? '',
                    })
                  }
                >
                  <Heart className="size-4 mr-2" />
                  Xem hồ sơ sức khỏe
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'search' && (
        <SearchMember
          onInviteSent={() => setInvitationRefresh((n) => n + 1)}
        />
      )}

      {activeTab === 'invitations' && (
        <InvitationList refreshKey={invitationRefresh} />
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        familyId={familyId}
        onInvite={handleInvite}
      />

      <FamilyMemberHealth
        open={healthDialog.open}
        onOpenChange={(open) => setHealthDialog((prev) => ({ ...prev, open }))}
        memberId={healthDialog.memberId}
        memberName={healthDialog.memberName}
      />
    </div>
  )
}
