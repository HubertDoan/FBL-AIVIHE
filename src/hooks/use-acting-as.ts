'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import React from 'react'

interface ActingAsState {
  citizenId: string | null
  citizenName: string | null
}

interface ActingAsContextValue {
  actingAs: ActingAsState
  setActingAs: (citizenId: string, name: string) => void
  clearActingAs: () => void
  getCurrentCitizenId: (selfCitizenId: string) => string
  isActingAs: boolean
}

const STORAGE_KEY = 'aivihe_acting_as'

const ActingAsContext = createContext<ActingAsContextValue | null>(null)

export function ActingAsProvider({ children }: { children: ReactNode }) {
  const [actingAs, setActingAsState] = useState<ActingAsState>({
    citizenId: null,
    citizenName: null,
  })

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        setActingAsState(JSON.parse(stored))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  const setActingAs = useCallback((citizenId: string, name: string) => {
    const state = { citizenId, citizenName: name }
    setActingAsState(state)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [])

  const clearActingAs = useCallback(() => {
    setActingAsState({ citizenId: null, citizenName: null })
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const getCurrentCitizenId = useCallback(
    (selfCitizenId: string) => actingAs.citizenId ?? selfCitizenId,
    [actingAs.citizenId]
  )

  return React.createElement(
    ActingAsContext.Provider,
    {
      value: {
        actingAs,
        setActingAs,
        clearActingAs,
        getCurrentCitizenId,
        isActingAs: actingAs.citizenId !== null,
      },
    },
    children
  )
}

export function useActingAs() {
  const ctx = useContext(ActingAsContext)
  if (!ctx) {
    throw new Error('useActingAs must be used within ActingAsProvider')
  }
  return ctx
}
