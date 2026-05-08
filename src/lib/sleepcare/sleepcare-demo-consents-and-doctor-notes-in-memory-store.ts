/**
 * SleepCare Demo — Consents & Doctor Notes In-Memory Store
 *
 * Consents: citizen cấp quyền cho doctor/caregiver/coach xem dữ liệu ngủ
 * DoctorNotes: BS gia đình/KTV PHCN ghi tư vấn về 1 phiên ngủ hoặc tổng quan
 */

export type ConsentType = 'doctor_share' | 'family_share' | 'coach_share'
export type ConsentScope = 'full' | 'summary_only'

export interface SleepConsent {
  id: string
  citizen_id: string
  consent_type: ConsentType
  grantee_user_id: string
  grantee_name: string
  scope: ConsentScope
  granted_at: string
  expires_at: string | null
  revoked_at: string | null
}

export interface DoctorNote {
  id: string
  session_id: string | null    // null = ghi tổng quan, không gắn session cụ thể
  citizen_id: string
  author_id: string
  author_name: string
  author_role: 'doctor' | 'specialist'
  content: string
  recommendation: string | null
  created_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __demoSleepConsents: SleepConsent[] | undefined
  // eslint-disable-next-line no-var
  var __demoDoctorNotes: DoctorNote[] | undefined
  // eslint-disable-next-line no-var
  var __demoConsentSeq: number | undefined
  // eslint-disable-next-line no-var
  var __demoDoctorNoteSeq: number | undefined
}

const MINH_ID = 'demo-0001-0000-0000-000000000001'
const BS_HAI_ID = 'demo-0005-0000-0000-000000000005'   // hain2026@aivihe.vn

function seedConsents(): SleepConsent[] {
  return [
    {
      id: 'consent-demo-001',
      citizen_id: MINH_ID,
      consent_type: 'doctor_share',
      grantee_user_id: BS_HAI_ID,
      grantee_name: 'BS. Nguyễn Hải',
      scope: 'full',
      granted_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      expires_at: new Date(Date.now() + 83 * 86400000).toISOString(), // 90 ngày từ khi grant
      revoked_at: null,
    },
  ]
}

function seedNotes(): DoctorNote[] {
  return [
    {
      id: 'note-demo-001',
      session_id: 'sess-demo-001',
      citizen_id: MINH_ID,
      author_id: BS_HAI_ID,
      author_name: 'BS. Doãn Hải',
      author_role: 'doctor',
      content: 'Đêm 06/05: ngáy moderate, đổi tư thế 2 lần, SpO₂ trung bình 96%. Nhìn chung ổn. Khuyến nghị giảm caffeine sau 14h.',
      recommendation: 'Hạn chế caffeine sau 14h. Tập thở 4-7-8 trước ngủ 10 phút.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ]
}

function getConsents(): SleepConsent[] {
  if (!globalThis.__demoSleepConsents) globalThis.__demoSleepConsents = seedConsents()
  return globalThis.__demoSleepConsents
}

function getNotes(): DoctorNote[] {
  if (!globalThis.__demoDoctorNotes) globalThis.__demoDoctorNotes = seedNotes()
  return globalThis.__demoDoctorNotes
}

function nextConsentId(): string {
  if (globalThis.__demoConsentSeq === undefined) globalThis.__demoConsentSeq = 1
  globalThis.__demoConsentSeq += 1
  return `consent-demo-${String(globalThis.__demoConsentSeq).padStart(3, '0')}`
}

function nextNoteId(): string {
  if (globalThis.__demoDoctorNoteSeq === undefined) globalThis.__demoDoctorNoteSeq = 1
  globalThis.__demoDoctorNoteSeq += 1
  return `note-demo-${String(globalThis.__demoDoctorNoteSeq).padStart(3, '0')}`
}

// ── Consents ──────────────────────────────────────────────────

export function getConsentsByCitizen(citizenId: string): SleepConsent[] {
  return getConsents().filter(c => c.citizen_id === citizenId && !c.revoked_at)
}

export function getConsentsByDoctor(doctorId: string): SleepConsent[] {
  const now = new Date()
  return getConsents().filter(c =>
    c.grantee_user_id === doctorId &&
    !c.revoked_at &&
    (c.expires_at === null || new Date(c.expires_at) > now)
  )
}

export function getActiveConsentForDoctor(citizenId: string, doctorId: string): SleepConsent | null {
  const now = new Date()
  return getConsents().find(c =>
    c.citizen_id === citizenId &&
    c.grantee_user_id === doctorId &&
    !c.revoked_at &&
    (c.expires_at === null || new Date(c.expires_at) > now)
  ) ?? null
}

export function grantConsent(
  citizenId: string,
  consentType: ConsentType,
  granteeUserId: string,
  granteeName: string,
  scope: ConsentScope,
  expiresInDays: number | null
): SleepConsent {
  const consent: SleepConsent = {
    id: nextConsentId(),
    citizen_id: citizenId,
    consent_type: consentType,
    grantee_user_id: granteeUserId,
    grantee_name: granteeName,
    scope,
    granted_at: new Date().toISOString(),
    expires_at: expiresInDays ? new Date(Date.now() + expiresInDays * 86400000).toISOString() : null,
    revoked_at: null,
  }
  getConsents().push(consent)
  return consent
}

export function revokeConsent(consentId: string, citizenId: string): SleepConsent | null {
  const consents = getConsents()
  const idx = consents.findIndex(c => c.id === consentId && c.citizen_id === citizenId)
  if (idx === -1) return null
  consents[idx] = { ...consents[idx], revoked_at: new Date().toISOString() }
  return consents[idx]
}

// ── Doctor Notes ──────────────────────────────────────────────

export function getNotesByCitizen(citizenId: string): DoctorNote[] {
  return getNotes()
    .filter(n => n.citizen_id === citizenId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getNotesBySession(sessionId: string): DoctorNote[] {
  return getNotes()
    .filter(n => n.session_id === sessionId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function addDoctorNote(
  citizenId: string,
  authorId: string,
  authorName: string,
  authorRole: DoctorNote['author_role'],
  content: string,
  recommendation: string | null,
  sessionId: string | null
): DoctorNote {
  const note: DoctorNote = {
    id: nextNoteId(),
    session_id: sessionId,
    citizen_id: citizenId,
    author_id: authorId,
    author_name: authorName,
    author_role: authorRole,
    content,
    recommendation,
    created_at: new Date().toISOString(),
  }
  getNotes().push(note)
  return note
}
