'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'

interface UnsavedGuardValue {
  setDirty: (dirty: boolean) => void
  guardLeave: (onProceed: () => void) => void
}

const UnsavedGuardContext = createContext<UnsavedGuardValue>({
  setDirty: () => {},
  guardLeave: (onProceed) => onProceed(),
})

export function useUnsavedGuard() {
  return useContext(UnsavedGuardContext)
}

export function UnsavedGuardProvider({ children }: { children: React.ReactNode }) {
  const dirtyRef = useRef(false)
  const [pending, setPending] = useState<(() => void) | null>(null)

  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty
  }, [])

  const guardLeave = useCallback((onProceed: () => void) => {
    if (!dirtyRef.current) {
      onProceed()
      return
    }
    setPending(() => onProceed)
  }, [])

  // Si el formulari es desmonta sense haver desat, el guarda es desactiva.
  useEffect(() => () => { dirtyRef.current = false }, [])

  return (
    <UnsavedGuardContext.Provider value={{ setDirty, guardLeave }}>
      {children}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => {
          dirtyRef.current = false
          const proceed = pending
          setPending(null)
          proceed?.()
        }}
        title="Canvis no desats"
        message="Tens canvis que no has desat. Si surts ara, es perdran."
        confirmLabel="Sortir sense desar"
        variant="danger"
      />
    </UnsavedGuardContext.Provider>
  )
}