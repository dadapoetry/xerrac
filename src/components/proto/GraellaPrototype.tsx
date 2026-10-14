'use client'

import { SawIcon } from '@/components/SawIcon'

interface Props {
  number: number
  label: string
  title: string
  subtitle?: string
  bodyHtml: string
  excerpt: string
  readingMinutes: number
  image?: string
}

export function GraellaPrototype({
  number,
  label,
  title,
  subtitle,
  bodyHtml,
  excerpt,
  readingMinutes,
  image,
}: Props) {
  const folio = String(number).padStart(2, '0')

  return (
    <div
      className="min-h-screen text-white"
      style={{ '--accent': '#ef4444', '--accent-rgb': '239, 68, 68' } as React.CSSProperties}
    >
      {/* Barra del prototip */}
      <div className="sticky top-0 z-20 bg-black/85 backdrop-blur-sm border-b border-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.25em] text-gray-400">
        Prototip · graella de 12 columnes + Fraunces
      </div>

      <article className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* CAPÇALERA: margen/foli a l'esquerra, titular a la dreta */}
        <header className="grid grid-cols-12 gap-x-5 gap-y-4">
          <div className="col-span-12 md:col-span-3 md:row-span-4 self-start">
            <div className="font-editorial text-6xl md:text-7xl leading-none text-white/10 select-none">
              {folio}
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span style={{ color: 'var(--accent)' }}>
                <SawIcon className="w-4 h-4" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gray-400">
                {label}
              </span>
            </div>
            <div className="mt-2 font-mono text-[10px] text-gray-600">
              Xerrac! núm. {folio} · ~{readingMinutes} min
            </div>
          </div>

          <h1 className="col-span-12 md:col-start-3 md:col-span-10 font-editorial font-semibold text-5xl md:text-7xl leading-[0.95] tracking-tight text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="col-span-12 md:col-start-3 md:col-span-7 text-lg md:text-xl leading-relaxed text-gray-300">
              {subtitle}
            </p>
          )}

          <div className="col-span-12 md:col-start-3 md:col-span-7 flex items-center gap-3">
            <span className="h-2 w-2 shrink-0" style={{ background: 'var(--accent)' }} />
            <span className="h-px flex-1" style={{ background: 'var(--accent)', opacity: 0.4 }} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
              {label}
            </span>
          </div>
        </header>

        {/* COS + NOTA DE MARGE */}
        <div className="mt-10 md:mt-14 grid grid-cols-12 gap-x-5 gap-y-8">
          <div
            className="col-span-12 md:col-start-3 md:col-span-6 editorial-body text-justify hyphens-auto text-gray-300"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          <aside className="col-span-12 md:col-start-10 md:col-span-3 self-start">
            <div
              className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3"
              style={{ color: 'var(--accent)' }}
            >
              Al marge
            </div>
            <p className="font-editorial text-2xl md:text-3xl leading-snug text-white/90">
              «{excerpt}»
            </p>
            <div className="mt-4 h-px w-10" style={{ background: 'var(--accent)', opacity: 0.6 }} />
          </aside>
        </div>

        {/* IMATGE: trenca la columna de text i ocupa tota l'amplada */}
        {image && (
          <figure className="mt-14">
            <img
              src={image}
              alt=""
              loading="lazy"
              className="w-full h-[40vh] md:h-[60vh] object-cover"
            />
            <figcaption className="mt-3 font-mono text-[10px] text-gray-500">
              Imatge a sang — surt de la columna de text i ocupa totes les 12 columnes.
            </figcaption>
          </figure>
        )}

        {/* LLEGENDA DELA GRAELLA */}
        <div className="mt-16 border-t border-white/10 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">
            La graella
          </p>
          <div className="grid grid-cols-12 gap-x-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="h-8 font-mono text-[10px] leading-8 text-center text-gray-600 bg-white/[0.03]"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-500">
            El titular ocupa les columnes 3–12, el cos va per les 3–8 i la nota de marge viu en les
            10–12. L&apos;imatge trenca la graella. Res va centrat al mig.
          </p>
        </div>
      </article>
    </div>
  )
}
