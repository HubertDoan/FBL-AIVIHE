import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

/**
 * TEMPORARY admin endpoint to run SQL migrations on Supabase via direct PG connection
 * Protected by service role key
 *
 * POST /api/admin/run-migration
 * Header: X-Migration-Key: <SUPABASE_SERVICE_ROLE_KEY>
 * Body: { sql: "ALTER TABLE...", connection_string: "postgresql://..." }
 *
 * DELETE THIS ENDPOINT AFTER MIGRATIONS ARE COMPLETE
 */
export async function POST(request: NextRequest) {
  const migrationKey = request.headers.get('x-migration-key')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!migrationKey || !serviceKey || migrationKey !== serviceKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { sql, connection_string } = await request.json()

    if (!sql || !connection_string) {
      return NextResponse.json({ error: 'Missing sql or connection_string' }, { status: 400 })
    }

    const pool = new Pool({
      connectionString: connection_string,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    const result = await pool.query(sql)
    await pool.end()

    return NextResponse.json({ ok: true, rowCount: result.rowCount })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
