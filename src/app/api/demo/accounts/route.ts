import { NextResponse } from 'next/server'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

// Returns all demo accounts (id, fullName, role only — no passwords)
// Used by messaging to populate recipient list
export async function GET() {
  const safeList = DEMO_ACCOUNTS.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    role: a.role,
  }))
  return NextResponse.json(safeList)
}
