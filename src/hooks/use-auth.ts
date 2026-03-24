'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

interface AuthUser {
  id: string
  citizenId: string
  fullName: string
  role: string
  phone: string
  email: string
}

export function useAuth(options?: { redirect?: boolean }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const shouldRedirect = options?.redirect ?? true

  useEffect(() => {
    async function checkAuth() {
      try {
        if (IS_DEMO) {
          const res = await fetch('/api/demo/me')
          const data = await res.json()
          if (data.user) {
            setUser({
              id: data.user.id,
              citizenId: data.user.citizenId,
              fullName: data.user.fullName,
              role: data.user.role,
              phone: data.user.phone ?? '',
              email: data.user.email ?? '',
            })
            setLoading(false)
            return
          }
        } else {
          const supabase = createClient()
          const { data: { user: sbUser } } = await supabase.auth.getUser()
          if (sbUser) {
            const { data: citizen } = await supabase
              .from('citizens')
              .select('id, full_name, phone, role')
              .eq('auth_id', sbUser.id)
              .single()
            if (citizen) {
              setUser({
                id: sbUser.id,
                citizenId: citizen.id,
                fullName: citizen.full_name ?? '',
                role: citizen.role ?? 'citizen',
                phone: citizen.phone ?? '',
                email: sbUser.email ?? '',
              })
              setLoading(false)
              return
            }
          }
        }
        // No user found
        if (shouldRedirect) {
          router.push('/login')
        }
        setLoading(false)
      } catch {
        if (shouldRedirect) {
          router.push('/login')
        }
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, shouldRedirect])

  return { user, loading }
}
