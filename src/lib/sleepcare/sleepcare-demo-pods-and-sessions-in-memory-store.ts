/**
 * SleepCare Demo — Pods & Sessions In-Memory Store
 * Persists across hot-reloads via globalThis (same pattern as demo-service-registration-in-memory-store.ts)
 *
 * Seed data: 1 pod + 3 completed sessions for demo citizen "Bác Minh"
 */

const MINH_ID = 'demo-0001-0000-0000-000000000001'
const POD_ID  = 'pod-demo-0001'

export interface SleepPod {
  id: string
  serial_number: string
  facility: string
  status: 'online' | 'offline' | 'error' | 'maintenance'
  last_seen_at: string | null
  variant: string
  room: string | null
}

export interface SleepSession {
  id: string
  pod_id: string
  citizen_id: string
  start_time: string
  end_time: string | null
  status: 'active' | 'completed' | 'interrupted'
  sleep_score: number | null
  ai_report_markdown: string | null
  ai_generated_at: string | null
  events_count: number
  duration_minutes: number | null
}

declare global {
  // eslint-disable-next-line no-var
  var __demoSleepPods: SleepPod[] | undefined
  // eslint-disable-next-line no-var
  var __demoSleepSessions: SleepSession[] | undefined
  // eslint-disable-next-line no-var
  var __demoSessionSeq: number | undefined
}

function seedPods(): SleepPod[] {
  return [{
    id: POD_ID,
    serial_number: 'SB-B1-HN-0001',
    facility: 'daycare-hapu',
    status: 'online',
    last_seen_at: new Date().toISOString(),
    variant: 'b1_personal',
    room: 'Phòng ngủ 01',
  }]
}

function seedSessions(): SleepSession[] {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  return [
    { id: 'sess-demo-001', pod_id: POD_ID, citizen_id: MINH_ID, start_time: new Date(now - 2 * day + 22 * 3600000).toISOString(), end_time: new Date(now - 2 * day + 30 * 3600000).toISOString(), status: 'completed', sleep_score: 78, ai_report_markdown: null, ai_generated_at: null, events_count: 5, duration_minutes: 480 },
    { id: 'sess-demo-002', pod_id: POD_ID, citizen_id: MINH_ID, start_time: new Date(now - 1 * day + 22 * 3600000).toISOString(), end_time: new Date(now - 1 * day + 30 * 3600000).toISOString(), status: 'completed', sleep_score: 82, ai_report_markdown: null, ai_generated_at: null, events_count: 3, duration_minutes: 470 },
    { id: 'sess-demo-003', pod_id: POD_ID, citizen_id: MINH_ID, start_time: new Date(now + 22 * 3600000 - day).toISOString(), end_time: null, status: 'active', sleep_score: null, ai_report_markdown: null, ai_generated_at: null, events_count: 0, duration_minutes: null },
  ]
}

function getPods(): SleepPod[] {
  if (!globalThis.__demoSleepPods) globalThis.__demoSleepPods = seedPods()
  return globalThis.__demoSleepPods
}

function getSessions(): SleepSession[] {
  if (!globalThis.__demoSleepSessions) globalThis.__demoSleepSessions = seedSessions()
  return globalThis.__demoSleepSessions
}

function nextSessionId(): string {
  if (globalThis.__demoSessionSeq === undefined) globalThis.__demoSessionSeq = 3
  globalThis.__demoSessionSeq += 1
  return `sess-demo-${String(globalThis.__demoSessionSeq).padStart(3, '0')}`
}

// ── Pods ───────────────────────────────────────────────

export function getPodById(id: string): SleepPod | null {
  return getPods().find(p => p.id === id) ?? null
}

export function updatePodHeartbeat(podId: string, firmware?: string): SleepPod | null {
  const pods = getPods()
  const idx = pods.findIndex(p => p.id === podId)
  if (idx === -1) return null
  pods[idx] = { ...pods[idx], status: 'online', last_seen_at: new Date().toISOString(), ...(firmware ? { firmware_version: firmware } as Partial<SleepPod> : {}) }
  return pods[idx]
}

export function getPodsForFacility(facility?: string): SleepPod[] {
  const pods = getPods()
  return facility ? pods.filter(p => p.facility === facility) : [...pods]
}

// ── Sessions ───────────────────────────────────────────

export function getSessionsByUser(citizenId: string, limit = 30): SleepSession[] {
  return getSessions()
    .filter(s => s.citizen_id === citizenId)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, limit)
}

export function getSessionById(id: string): SleepSession | null {
  return getSessions().find(s => s.id === id) ?? null
}

export function getActiveSessionForUser(citizenId: string): SleepSession | null {
  return getSessions().find(s => s.citizen_id === citizenId && s.status === 'active') ?? null
}

export function createSession(podId: string, citizenId: string): SleepSession {
  const session: SleepSession = {
    id: nextSessionId(),
    pod_id: podId,
    citizen_id: citizenId,
    start_time: new Date().toISOString(),
    end_time: null,
    status: 'active',
    sleep_score: null,
    ai_report_markdown: null,
    ai_generated_at: null,
    events_count: 0,
    duration_minutes: null,
  }
  getSessions().push(session)
  return session
}

export function endSession(sessionId: string): SleepSession | null {
  const sessions = getSessions()
  const idx = sessions.findIndex(s => s.id === sessionId)
  if (idx === -1) return null
  const s = sessions[idx]
  const endTime = new Date().toISOString()
  const duration = Math.round((Date.now() - new Date(s.start_time).getTime()) / 60000)
  sessions[idx] = { ...s, end_time: endTime, status: 'completed', duration_minutes: duration, sleep_score: Math.floor(60 + Math.random() * 30) }
  return sessions[idx]
}

export function updateSessionAiReport(sessionId: string, markdown: string): SleepSession | null {
  const sessions = getSessions()
  const idx = sessions.findIndex(s => s.id === sessionId)
  if (idx === -1) return null
  sessions[idx] = { ...sessions[idx], ai_report_markdown: markdown, ai_generated_at: new Date().toISOString() }
  return sessions[idx]
}
