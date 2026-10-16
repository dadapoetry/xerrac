'use client'

import { useEffect, useState } from 'react'
import { SawIcon } from './SawIcon'

// Segons que espera la pàgina abans de tornar sola a la portada. La persona
// sempre té el botó per anar-hi abans, i el comptador li diu quant falta.
const SECONDS = 6

type Mode = 'subscripcio' | 'baixa'

const COPY: Record<Mode, { okTitle: string; okBody: string; koTitle: string; koBody: string }> = {
  subscripcio: {
    okTitle: 'Subscripció confirmada',
    okBody: 'Ja ets a la llista. Rebràs cada número de Xerrac! al teu correu.',
    koTitle: 'No s\'ha pogut confirmar',
    koBody: 'L\'enllaç no és vàlid o ja s\'ha fet servir. Si ja estaves subscrit, no cal que facis res més.',
  },
  baixa: {
    okTitle: 'Baixa feta',
    okBody: 'Ja no rebràs més el butlletí de Xerrac! Sempre et pots tornar a subscriure.',
    koTitle: 'No s\'ha pogut fer la baixa',
    koBody: 'L\'enllaç no és vàlid o la subscripció ja no existia.',
  },
}

export function NewsletterResult({ mode, ok }: { mode: Mode; ok: boolean }) {
  const copy = COPY[mode]
  const [remaining, setRemaining] = useState(SECONDS)

  useEffect(() => {
    if (!ok) return
    const id = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(id)
          window.location.replace('/')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [ok])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span style={{ color: 'var(--accent-text)' }}>
            <SawIcon className="w-4 h-4" />
          </span>
          <span className="text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase">
            Butlletí
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase leading-tight mb-4">
          {ok ? copy.okTitle : copy.koTitle}
        </h1>

        <p className="text-gray-300 text-[15px] leading-relaxed mb-8">
          {ok ? copy.okBody : copy.koBody}
        </p>

        {ok && (
          <p className="text-xs text-gray-500 mb-5">
            Et portem a la portada en {remaining} segon{remaining === 1 ? '' : 's'}…
          </p>
        )}

        <a
          href="/"
          className="inline-block text-sm py-3.5 px-8 uppercase tracking-[0.2em] transition-colors"
          style={{ backgroundColor: 'var(--accent, #dc2626)', color: 'var(--accent-on, #ffffff)' }}
        >
          {ok ? 'Vés a la portada' : 'Torna a la portada'}
        </a>
      </div>
    </div>
  )
}
