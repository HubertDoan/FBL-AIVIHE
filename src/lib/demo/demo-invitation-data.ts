// Demo data for family invitations system
// Provides mock invitations and health data for demo mode

import { DEMO_ACCOUNTS } from './demo-accounts'
import { getDemoHealthProfile, getDemoCitizen, getDemoHealthEvents } from './demo-data'

// ─── Types ──────────────────────────────────────────────────────────────────

interface DemoInvitation {
  id: string
  family_id: string
  inviter_id: string
  invitee_id: string
  invitee_phone: string
  relationship: string
  status: 'pending' | 'accepted' | 'declined'
  message: string | null
  responded_at: string | null
  created_at: string
  inviter?: { full_name: string }
  invitee?: { full_name: string }
}

// ─── IDs ────────────────────────────────────────────────────────────────────

const MINH = 'demo-0001-0000-0000-000000000001'
const DUC = 'demo-0004-0000-0000-000000000004'
const HOA = 'demo-0007-0000-0000-000000000007'

// ─── In-memory store ────────────────────────────────────────────────────────

const invitations: DemoInvitation[] = [
  {
    id: 'inv-demo-001',
    family_id: 'fam-demo-002',
    inviter_id: DUC,
    invitee_id: HOA,
    invitee_phone: '0901000007',
    relationship: 'daughter',
    status: 'pending',
    message: 'Con ơi, vào nhóm gia đình để bố theo dõi sức khỏe nhé.',
    responded_at: null,
    created_at: '2025-03-20T08:00:00Z',
    inviter: { full_name: 'Phạm Văn Đức' },
    invitee: { full_name: 'Lê Thị Hoa' },
  },
]

// ─── Functions ──────────────────────────────────────────────────────────────

export function getDemoInvitations(userId: string) {
  const received = invitations.filter(
    (inv) => inv.invitee_id === userId && inv.status === 'pending'
  )
  const sent = invitations.filter((inv) => inv.inviter_id === userId)
  return { received, sent }
}

export function getDemoPendingCount(userId: string): number {
  return invitations.filter(
    (inv) => inv.invitee_id === userId && inv.status === 'pending'
  ).length
}

export function addDemoInvitation(
  inviterId: string,
  data: { phone: string; relationship: string; message?: string }
): DemoInvitation | { error: string } {
  const invitee = DEMO_ACCOUNTS.find(
    (a) => a.phone === data.phone && a.id !== inviterId
  )
  if (!invitee) {
    return { error: 'Không tìm thấy người dùng với số điện thoại này.' }
  }

  const inviter = DEMO_ACCOUNTS.find((a) => a.id === inviterId)
  if (!inviter) {
    return { error: 'Không tìm thấy tài khoản.' }
  }

  // Check duplicate pending
  const dup = invitations.find(
    (inv) =>
      inv.inviter_id === inviterId &&
      inv.invitee_id === invitee.id &&
      inv.status === 'pending'
  )
  if (dup) {
    return { error: 'Đã gửi lời mời cho người này rồi.' }
  }

  const newInv: DemoInvitation = {
    id: `inv-demo-${Date.now()}`,
    family_id: 'fam-demo-new',
    inviter_id: inviterId,
    invitee_id: invitee.id,
    invitee_phone: data.phone,
    relationship: data.relationship,
    status: 'pending',
    message: data.message ?? null,
    responded_at: null,
    created_at: new Date().toISOString(),
    inviter: { full_name: inviter.fullName },
    invitee: { full_name: invitee.fullName },
  }

  invitations.push(newInv)
  return newInv
}

export function respondDemoInvitation(
  userId: string,
  invitationId: string,
  action: 'accept' | 'decline'
): DemoInvitation | { error: string } {
  const inv = invitations.find(
    (i) => i.id === invitationId && i.invitee_id === userId && i.status === 'pending'
  )
  if (!inv) {
    return { error: 'Không tìm thấy lời mời hoặc đã được xử lý.' }
  }

  inv.status = action === 'accept' ? 'accepted' : 'declined'
  inv.responded_at = new Date().toISOString()
  return inv
}

// ─── Health data for family member view ─────────────────────────────────────

const FAMILY_OWNER_MAP: Record<string, string[]> = {
  [MINH]: ['fm-001', 'fm-002', 'fm-003'],
  [DUC]: ['fm-004'],
}

const MEMBER_CITIZEN_MAP: Record<string, string> = {
  'fm-001': MINH,
  'fm-002': 'demo-0002-0000-0000-000000000002',
  'fm-003': 'demo-0003-0000-0000-000000000003',
  'fm-004': DUC,
}

export function getDemoMemberHealth(requesterId: string, memberId: string) {
  const allowedMembers = FAMILY_OWNER_MAP[requesterId]
  if (!allowedMembers?.includes(memberId)) {
    return { error: 'Bạn không có quyền xem thông tin sức khỏe.' }
  }

  const citizenId = MEMBER_CITIZEN_MAP[memberId]
  if (!citizenId) {
    return { error: 'Không tìm thấy thành viên.' }
  }

  const citizen = getDemoCitizen(citizenId)
  const healthProfile = getDemoHealthProfile(citizenId)
  const recentEvents = getDemoHealthEvents(citizenId).slice(0, 5)

  return {
    citizen: citizen
      ? {
          full_name: citizen.full_name,
          date_of_birth: citizen.date_of_birth,
          gender: citizen.gender,
          phone: citizen.phone,
        }
      : null,
    healthProfile: healthProfile
      ? {
          chronic_conditions: healthProfile.chronic_conditions,
          current_medications: healthProfile.current_medications,
          blood_type: healthProfile.blood_type,
          allergies: healthProfile.allergies,
        }
      : null,
    recentEvents,
  }
}
