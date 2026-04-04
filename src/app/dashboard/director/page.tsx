'use client'

import { useState, useEffect, useCallback } from 'react'
import { Megaphone, Shield, Loader2, HandHeart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { DirectorAnnouncementForm } from '@/components/director/director-announcement-form'
import {
  DirectorAnnouncementsList,
  announcementToFormData,
} from '@/components/director/director-announcements-list'
import { DirectorFeedbackInbox } from '@/components/director/director-feedback-inbox'
import { DirectorGreetingEditor } from '@/components/director/director-greeting-editor'
import type { DirectorAnnouncement } from '@/lib/demo/demo-director-announcement-data'
import type { DirectorAnnouncementFormData } from '@/components/director/director-announcement-form'

const DIRECTOR_ROLES = ['director', 'branch_director', 'super_admin']

export default function DirectorPage() {
  const { user } = useAuth({ redirect: false })
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [announcements, setAnnouncements] = useState<DirectorAnnouncement[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<DirectorAnnouncementFormData | null>(null)

  const userRole = user?.role ?? ''
  const isAuthorized = DIRECTOR_ROLES.includes(userRole)

  useEffect(() => {
    setAuthorized(user !== null ? isAuthorized : null)
  }, [user, isAuthorized])

  const fetchAnnouncements = useCallback(async () => {
    setLoadingItems(true)
    try {
      const res = await fetch('/api/director/announcements?mine=true')
      if (res.ok) {
        const json = await res.json()
        setAnnouncements(json.data ?? [])
      }
    } catch {
      // keep empty
    }
    setLoadingItems(false)
  }, [])

  useEffect(() => {
    if (authorized) fetchAnnouncements()
  }, [authorized, fetchAnnouncements])

  function handleCreateClick() {
    setEditData(null)
    setFormOpen(true)
  }

  function handleEditClick(item: DirectorAnnouncement) {
    setEditData(announcementToFormData(item))
    setFormOpen(true)
  }

  async function handleDeleteClick(id: string) {
    try {
      await fetch(`/api/director/announcements/${id}`, { method: 'DELETE' })
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch {
      // ignore
    }
  }

  async function handleSave(data: DirectorAnnouncementFormData) {
    if (data.id) {
      const res = await fetch(`/api/director/announcements/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) await fetchAnnouncements()
    } else {
      const res = await fetch('/api/director/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) await fetchAnnouncements()
    }
  }

  // Loading auth state
  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Unauthorized
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Shield className="size-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Trang này chỉ dành cho Giám đốc và Giám đốc chi nhánh.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="size-6" />
          Truyền thông nội bộ
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông báo và phản hồi từ thành viên
        </p>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="announcements" className="text-base gap-1.5">
            <Megaphone className="size-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-base gap-1.5">
            Phản hồi
          </TabsTrigger>
          <TabsTrigger value="greeting" className="text-base gap-1.5">
            <HandHeart className="size-4" />
            Lời chào
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <DirectorAnnouncementsList
            items={announcements}
            loading={loadingItems}
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </TabsContent>

        <TabsContent value="feedback">
          <DirectorFeedbackInbox announcements={announcements} />
        </TabsContent>

        <TabsContent value="greeting">
          <DirectorGreetingEditor />
        </TabsContent>
      </Tabs>

      <DirectorAnnouncementForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editData}
        onSave={handleSave}
      />
    </div>
  )
}
