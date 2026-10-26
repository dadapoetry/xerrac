'use client'

import { Analytics } from '@vercel/analytics/next'

// El callback `beforeSend` ha de viure en un component client: no es pot
// passar una funció des d'un server component a un client component.
export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        // Neteja la mostra: descarta admin, previews, bots i la teva pròpia
        // visita (posa `localStorage.setItem('xerrac-self','1')` a la consola).
        if (event.url.startsWith('/admin')) return null
        if (typeof window !== 'undefined' && /vercel\.app$/.test(window.location.hostname)) return null
        if (typeof navigator !== 'undefined' && navigator.webdriver) return null
        if (typeof localStorage !== 'undefined' && localStorage.getItem('xerrac-self') === '1') return null
        return event
      }}
    />
  )
}
