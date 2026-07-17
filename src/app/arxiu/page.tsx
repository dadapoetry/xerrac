import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedIssues } from '@/lib/actions'
import { getSiteUrl } from '@/lib/site'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

const SECTION_LABELS: Record<string, string> = {
  editorial: 'Editorial',
  aclariment_cultural: 'Aclariment Cultural',
  fadu_catala: 'Fadu Català',
  pagines_grogues: 'Pàgines Grogues',
  calaix_sastre: 'Calaix de Sastre',
  visita: 'Visita',
  full_mural: 'Full Mural',
  ludita: 'Ludita',
}

export const metadata: Metadata = {
  title: 'Arxiu — Xerrac!',
  description: 'Tots els números publicats de Xerrac! — Revista d\'aclariment cultural',
  alternates: { canonical: `${getSiteUrl()}/arxiu` },
  openGraph: {
    title: 'Arxiu — Xerrac!',
    description: 'Tots els números publicats de Xerrac! — Revista d\'aclariment cultural',
    url: `${getSiteUrl()}/arxiu`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arxiu — Xerrac!',
    description: 'Tots els números publicats de Xerrac! — Revista d\'aclariment cultural',
  },
}

interface IssueShape {
  id: string
  number: number
  title: string
  date: Date
  sections: { type: string }[]
  coverBg: string
}

function shapeIssue(issue: any): IssueShape {
  const cover = issue.sections?.find((s: any) => s.type === 'portada')
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    date: new Date(issue.date),
    sections: issue.sections || [],
    coverBg: cover?.backgroundImage || '',
  }
}

function SectionTags({ sections }: { sections: { type: string }[] }) {
  const names = sections
    .filter((s) => s.type !== 'portada')
    .map((s) => SECTION_LABELS[s.type] || s.type)
    .slice(0, 5)
  if (names.length === 0) return null
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {names.map((n) => (
        <span key={n} className="text-[9px] text-gray-600 uppercase tracking-[0.2em]">{n}</span>
      ))}
    </div>
  )
}

function IssueCover({ src, alt, aspect, priority }: { src: string; alt: string; aspect: string; priority?: boolean }) {
  return (
    <div className={`${aspect} relative overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        sizes="100vw"
        priority={priority}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  )
}

function IssueNumber({ num, className }: { num: number; className?: string }) {
  return (
    <span
      className={`font-black leading-none tracking-tighter select-none pointer-events-none ${className || ''}`}
      style={{ color: 'rgba(239, 68, 68, 0.08)' }}
      aria-hidden="true"
    >
      {String(num).padStart(2, '0')}
    </span>
  )
}

/* ───── Hero — latest issue only ───── */

function HeroIssue({ issue }: { issue: IssueShape }) {
  return (
    <Link
      href={`/?issue=${issue.id}`}
      className="group block relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="relative overflow-hidden border border-gray-800 group-hover:border-gray-700 transition-colors duration-500">
          {issue.coverBg ? (
            <IssueCover src={issue.coverBg} alt={`Portada del número ${issue.number}`} aspect="aspect-[4/3] sm:aspect-[21/9] md:aspect-[2.6/1]" priority />
          ) : (
            <div className="aspect-[4/3] sm:aspect-[21/9] md:aspect-[2.6/1] bg-gray-900" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10">
            <span className="text-[8px] sm:text-[9px] text-gray-500 tracking-[0.35em] uppercase block mb-2 sm:mb-3">
              Últim número
            </span>
            <div className="flex items-end gap-4 sm:gap-6 md:gap-8">
              <div className="hidden sm:block shrink-0 -mb-2 -ml-1 sm:-ml-2">
                <IssueNumber num={issue.number} className="text-[min(28vw,12rem)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.92] tracking-tight group-hover:text-red-400 transition-colors duration-300">
                  {issue.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                  {issue.date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}
                </p>
              </div>
              <span className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500 group-hover:text-white transition-colors duration-300 shrink-0 pb-1">
                Llegir
                <span className="text-base leading-none group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </div>
          </div>

          <div className="sm:hidden absolute bottom-4 right-4">
            <IssueNumber num={issue.number} className="text-[min(20vw,8rem)]" />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ───── Standard — every other issue ───── */

function StandardIssue({ issue }: { issue: IssueShape }) {
  return (
    <Link
      href={`/?issue=${issue.id}`}
      className="group block"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="border border-gray-800 group-hover:border-gray-700 transition-colors duration-500 overflow-hidden">
          {issue.coverBg ? (
            <IssueCover src={issue.coverBg} alt={`Portada del número ${issue.number}`} aspect="aspect-[16/9]" />
          ) : (
            <div className="aspect-[16/9] bg-gray-900" />
          )}
        </div>

        <div className="flex gap-5 sm:gap-6 md:gap-8 pt-4 sm:pt-5 md:pt-6 pb-8 sm:pb-10 md:pb-12 border-b border-gray-900">
          <div className="hidden sm:block shrink-0 w-14 md:w-20 text-right">
            <IssueNumber num={issue.number} className="text-4xl md:text-5xl" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="sm:hidden text-[8px] text-gray-600 tracking-[0.25em] uppercase mb-1 block">
              Núm. {String(issue.number).padStart(2, '0')}
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-[0.95] tracking-tight mb-1.5 sm:mb-2 group-hover:text-red-400 transition-colors duration-300">
              {issue.title}
            </h3>
            <p className="text-xs text-gray-600 mb-3 sm:mb-4">
              {issue.date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}
            </p>
            <SectionTags sections={issue.sections} />
          </div>
          <span className="self-start mt-1 text-xs text-gray-700 group-hover:text-gray-500 transition-colors duration-300 shrink-0">→</span>
        </div>
      </div>
    </Link>
  )
}

/* ───── Page ───── */

export default async function ArxiuPage() {
  const issues = await getPublishedIssues()
  const siteUrl = getSiteUrl()

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Arxiu — Xerrac!',
    description: 'Tots els números publicats de Xerrac! — Revista d\'aclariment cultural',
    url: `${siteUrl}/arxiu`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: issues.map((issue: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/?issue=${issue.id}`,
        name: issue.title,
      })),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Xerrac!',
    },
  }

  const latest = issues.length > 0 ? shapeIssue(issues[0]) : null
  const rest = issues.slice(1).map(shapeIssue)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          {/* ── Header ── */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-14 sm:pt-16 md:pt-20 pb-12 sm:pb-14 md:pb-16">
            <Link
              href="/"
              className="text-[9px] text-gray-700 hover:text-white transition-colors mb-10 sm:mb-12 md:mb-14 inline-block uppercase tracking-[0.3em]"
            >
              ← Tornar a la revista
            </Link>
            <header>
              <span className="text-[8px] text-gray-700 tracking-[0.35em] uppercase block mb-3">
                Biblioteca
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.8] mb-3 sm:mb-4">
                Xerrac<span style={{ color: 'var(--accent, #ef4444)' }}>!</span>
              </h1>
              <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
                Tots els volums publicats, ordenats per data de publicació.
              </p>
            </header>
          </div>

          {/* ── Issues ── */}
          {issues.length === 0 ? (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32">
              <div className="text-center">
                <span className="text-7xl sm:text-8xl font-black text-gray-800 select-none">:</span>
                <p className="text-gray-600 text-sm mt-3">No hi ha números publicats encara.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {latest && (
                <section className="mb-14 sm:mb-16 md:mb-20">
                  <HeroIssue issue={latest} />
                </section>
              )}

              {rest.length > 0 && (
                <section className="space-y-0">
                  {rest.map((issue) => (
                    <StandardIssue key={issue.id} issue={issue} />
                  ))}
                </section>
              )}

              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
                <p className="text-[9px] text-gray-800 text-center tracking-[0.3em] uppercase">
                  {issues.length} {issues.length === 1 ? 'volum' : 'volums'} a la col·lecció
                </p>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  )
}
