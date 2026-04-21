// API: GET (list) + POST (create) personal_documents của user

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

const VALID_TYPES = ['article', 'note', 'link', 'book', 'video', 'other'] as const

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ documents: [] })

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('personal_documents')
      .select('*')
      .eq('citizen_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ documents: [] })
    return NextResponse.json({ documents: data ?? [] })
  } catch {
    return NextResponse.json({ documents: [] })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { title, content, url, file_url, document_type, tags, source, is_favorite } = body

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return NextResponse.json({ error: 'Tiêu đề không hợp lệ' }, { status: 400 })
  }
  const finalType = VALID_TYPES.includes(document_type) ? document_type : 'article'

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, id: 'demo-' + Date.now() })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('personal_documents')
      .insert({
        citizen_id: user.id,
        title: title.trim(),
        content: content || null,
        url: url || null,
        file_url: file_url || null,
        document_type: finalType,
        tags: Array.isArray(tags) ? tags : [],
        source: source || null,
        is_favorite: !!is_favorite,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
