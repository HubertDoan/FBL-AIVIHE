/**
 * SleepCare Demo — Events, Readings & Commands In-Memory Store
 * Companion to sleepcare-demo-pods-and-sessions-in-memory-store.ts
 *
 * Events: snore, posture_change, movement, safety_alert, motor_action
 * Readings: batch sensor data from Pi (stored as count only in demo — no raw time-series)
 * Commands: app → Pod dispatch queue
 */

export interface SleepEvent {
  id: string
  session_id: string
  pod_id: string
  event_type: 'posture_change' | 'snore_detected' | 'movement' | 'safety_alert' | 'motor_action'
  event_data: Record<string, unknown>
  occurred_at: string
}

export interface SleepCommand {
  id: string
  pod_id: string
  citizen_id: string
  command: string
  params: Record<string, unknown>
  status: 'pending' | 'acknowledged' | 'executed' | 'failed'
  created_at: string
  acknowledged_at: string | null
}

const VALID_COMMANDS = ['heat_foot', 'ventilate', 'play_brainwave', 'adjust_position', 'set_alarm'] as const
export type ValidCommand = typeof VALID_COMMANDS[number]
export function isValidCommand(cmd: string): cmd is ValidCommand {
  return (VALID_COMMANDS as readonly string[]).includes(cmd)
}

declare global {
  // eslint-disable-next-line no-var
  var __demoSleepEvents: SleepEvent[] | undefined
  // eslint-disable-next-line no-var
  var __demoSleepReadingsCount: Record<string, number> | undefined
  // eslint-disable-next-line no-var
  var __demoSleepCommands: SleepCommand[] | undefined
  // eslint-disable-next-line no-var
  var __demoEventSeq: number | undefined
  // eslint-disable-next-line no-var
  var __demoCommandSeq: number | undefined
}

function seedEvents(): SleepEvent[] {
  return [
    { id: 'evt-demo-001', session_id: 'sess-demo-001', pod_id: 'pod-demo-0001', event_type: 'snore_detected', event_data: { intensity: 'moderate', count: 3 }, occurred_at: new Date(Date.now() - 2 * 86400000 + 2 * 3600000).toISOString() },
    { id: 'evt-demo-002', session_id: 'sess-demo-001', pod_id: 'pod-demo-0001', event_type: 'posture_change', event_data: { from: 'supine', to: 'lateral_left' }, occurred_at: new Date(Date.now() - 2 * 86400000 + 4 * 3600000).toISOString() },
    { id: 'evt-demo-003', session_id: 'sess-demo-002', pod_id: 'pod-demo-0001', event_type: 'movement', event_data: { duration_seconds: 45 }, occurred_at: new Date(Date.now() - 86400000 + 3 * 3600000).toISOString() },
  ]
}

function getEvents(): SleepEvent[] {
  if (!globalThis.__demoSleepEvents) globalThis.__demoSleepEvents = seedEvents()
  return globalThis.__demoSleepEvents
}

function getReadingCounts(): Record<string, number> {
  if (!globalThis.__demoSleepReadingsCount) globalThis.__demoSleepReadingsCount = { 'sess-demo-001': 480, 'sess-demo-002': 470 }
  return globalThis.__demoSleepReadingsCount
}

function getCommands(): SleepCommand[] {
  if (!globalThis.__demoSleepCommands) globalThis.__demoSleepCommands = []
  return globalThis.__demoSleepCommands
}

function nextEventId(): string {
  if (globalThis.__demoEventSeq === undefined) globalThis.__demoEventSeq = 3
  globalThis.__demoEventSeq += 1
  return `evt-demo-${String(globalThis.__demoEventSeq).padStart(3, '0')}`
}

function nextCommandId(): string {
  if (globalThis.__demoCommandSeq === undefined) globalThis.__demoCommandSeq = 0
  globalThis.__demoCommandSeq += 1
  return `cmd-demo-${String(globalThis.__demoCommandSeq).padStart(3, '0')}`
}

// ── Events ────────────────────────────────────────────

export function getEventsBySession(sessionId: string): SleepEvent[] {
  return getEvents()
    .filter(e => e.session_id === sessionId)
    .sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
}

export function addEvent(
  sessionId: string,
  podId: string,
  eventType: SleepEvent['event_type'],
  eventData: Record<string, unknown>,
  occurredAt?: string
): SleepEvent {
  const event: SleepEvent = {
    id: nextEventId(),
    session_id: sessionId,
    pod_id: podId,
    event_type: eventType,
    event_data: eventData,
    occurred_at: occurredAt ?? new Date().toISOString(),
  }
  getEvents().push(event)
  return event
}

// ── Readings (count only in demo — no raw time-series storage) ────────────

export function addReadings(sessionId: string, count: number): number {
  const counts = getReadingCounts()
  counts[sessionId] = (counts[sessionId] ?? 0) + count
  return counts[sessionId]
}

export function getReadingCount(sessionId: string): number {
  return getReadingCounts()[sessionId] ?? 0
}

// ── Commands ──────────────────────────────────────────

export function dispatchCommand(
  podId: string,
  citizenId: string,
  command: string,
  params: Record<string, unknown> = {}
): SleepCommand {
  const cmd: SleepCommand = {
    id: nextCommandId(),
    pod_id: podId,
    citizen_id: citizenId,
    command,
    params,
    status: 'pending',
    created_at: new Date().toISOString(),
    acknowledged_at: null,
  }
  getCommands().push(cmd)
  return cmd
}

export function acknowledgeCommand(commandId: string): SleepCommand | null {
  const cmds = getCommands()
  const idx = cmds.findIndex(c => c.id === commandId)
  if (idx === -1) return null
  cmds[idx] = { ...cmds[idx], status: 'acknowledged', acknowledged_at: new Date().toISOString() }
  return cmds[idx]
}
