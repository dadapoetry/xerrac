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

function CoverImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        priority={priority}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />
    </div>
  )
}

function IssueNumber({ num, size = 'default' }: { num: number; size?: 'default' | 'hero' }) {
  const cls = size === 'hero'
    ? 'text-[min(30vw,16rem)]'
    : 'text-[min(25vw,10rem)]'
  return (
    <span
      className={`${cls} font-black leading-[0.8] tracking-tighter select-none pointer-events-none`}
      style={{ color: 'var(--issue-accent, #ef4444)', opacity: 0.07 }}
      aria-hidden="true"
    >
      {String(num).padStart(2, '0')}
    </span>
  )
}

function SectionList({ sections }: { sections: { type: string }[] }) {
  const names = sections
    .filter((s) => s.type !== 'portada')
    .map((s) => SECTION_LABELS[s.type] || s.type)

  if (names.length === 0) return null

  return (
    <ul className="space-y-1">
      {names.map((name) => (
        <li key={name} className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-[0.15em] leading-relaxed">
          {name}
        </li>
      ))}
    </ul>
  )
}

interface IssueShape {
  id: string
  number: number
  title: string
  date: Date
  sections: { type: string }[]
  coverBg: string
  accentColor: string
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
    accentColor: issue.accentColor || '#ef4444',
  }
}

type Treatment = 'hero' | 'split-left' | 'split-right' | 'typography' | 'gallery'

function getTreatment(index: number, total: number): Treatment {
  if (index === 0) return 'hero'
  const t = index % 8
  if (t === 1 || t === 5) return 'split-left'
  if (t === 2 || t === 6) return 'split-right'
  if (t === 3 || t === 7) return 'typography'
  return 'gallery'
}

function HeroIssue({ issue }: { issue: IssueShape }) {
  return (
    <Link
      href={`/?issue=${issue.id}`}
      className="group block relative overflow-hidden border-b border-gray-900"
      style={{ '--issue-accent': issue.accentColor } as React.CSSProperties}
    >
      <div className="aspect-[4/3] sm:aspect-[21/9] md:aspect-[2.6/1] relative">
        {issue.coverBg ? (
          <CoverImage src={issue.coverBg} alt={`Portada del número ${issue.number}`} priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        <div className="relative h-full flex flex-col justify-end p-5 sm:p-8 md:p-12">
          <span className="text-[8px] sm:text-[9px] text-gray-500 tracking-[0.3em] uppercase mb-2 sm:mb-3">
            Últim número
          </span>

          <div className="flex items-end gap-4 sm:gap-6 md:gap-8">
            <div className="hidden sm:block -mb-4 -ml-2 sm:-ml-3 md:-ml-4 shrink-0">
              <IssueNumber num={issue.number} size="hero" />
            </div>
            <div className="flex-1 min-w-0 pb-1 sm:pb-2">
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight group-hover:text-[var(--issue-accent)] transition-colors duration-300">
                {issue.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                {issue.date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-500 group-hover:text-white transition-colors duration-300 shrink-0 pb-1 sm:pb-2">
              Llegir
              <span className="text-lg leading-none group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </div>

          <div className="sm:hidden absolute bottom-5 right-5">
            <IssueNumber num={issue.number} size="hero" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function SplitIssue({ issue, reverse }: { issue: IssueShape; reverse?: boolean }) {
  const imageSide = reverse ? 'md:order-2' : ''
  const contentSide = reverse ? 'md:order-1' : ''

  return (
    <Link
      href={`/?issue=${issue.id}`}
      className="group block relative overflow-hidden border-b border-gray-900"
      style={{ '--issue-accent': issue.accentColor } as React.CSSProperties}
    >
      <div className="md:grid md:grid-cols-2 md:min-h-[50vh]">
        <div className={`relative aspect-[4/3] md:aspect-auto ${imageSide}`}>
          {issue.coverBg ? (
            <CoverImage src={issue.coverBg} alt={`Portada del número ${issue.number}`} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
          )}
        </div>

        <div className={`relative flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-14 ${contentSide}`}>
          <div className="hidden sm:block absolute -top-6 -right-4 sm:right-0 lg:-top-10">
            <IssueNumber num={issue.number} />
          </div>

          <span className="text-[8px] text-gray-600 tracking-[0.3em] uppercase mb-2">
            Número {String(issue.number).padStart(2, '0')}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-[0.95] tracking-tight mb-3 sm:mb-4 group-hover:text-[var(--issue-accent)] transition-colors duration-300">
            {issue.title}
          </h2>
          <p className="text-xs text-gray-600 mb-4 sm:mb-6">
            {issue.date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}
          </p>
          <SectionList sections={issue.sections} />

          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-600 group-hover:text-gray-400 transition-colors duration-300 mt-4 sm:mt-6">
            Explorar
            <span className="text-lg leading-none group-hover:translate-x-1 transition-transform duration-300">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

function TypographyIssue({ issue }: { issue: IssueShape }) {
  return (
    <Link
      href={`/?issue=${issue.id}`}
      className="group block relative overflow-hidden border-b border-gray-900"
      style={{ '--issue-accent': issue.accentColor } as React.CSSProperties}
    >
      <div className="relative px-6 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
        <div className="hidden sm:block absolute -top-8 right-4 sm:right-8 lg:-top-12 lg:right-12">
          <IssueNumber num={issue.number} />
        </div>

        <div className="max-w-lg">
          <span className="text-[8px] text-gray-700 tracking-[0.3em] uppercase mb-2 block">
            Número {String(issue.number).padStart(2, '0')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.92] tracking-tight mb-4 sm:mb-6 group-hover:text-[var(--issue-accent)] transition-colors duration-300">
            {issue.title}
          </h2>
          <p className="text-xs text-gray-600 mb-4">
            {issue.date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}
          </p>
          <SectionList sections={issue.sections} />

          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-700 group-hover:text-gray-500 transition-colors duration-300 mt-4 sm:mt-6">
            Explorar →)
          </span>
        </div>
      </div>
    </Link>
  )
}

function GalleryIssue({ issue }: { issue: IssueShape }) {
  return (
    <Link
      href={`/?issue=${issue.id}`}
      className="group block relative overflow-hidden border-b border-gray-900"
    >
      <div className="aspect-[3/2] sm:aspect-[2/1] md:aspect-[3/1] relative">
        {issue.coverBg ? (
          <CoverImage src={issue.coverBg} alt={`Portada del número ${issue.number}`} />
        ) : (
          <div className="absolute inset-0 bg-gray-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="relative h-full flex flex-col justify-end p-5 sm:p-8 md:p-10">
          <div className="flex items-end gap-4">
            <span
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight shrink-0"
              style={{ color: 'rgba(239, 68, 68, 0.12)' }}
            >
              {String(issue.number).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-red-400 transition-colors duration-300">
                {issue.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {issue.date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'short' })}
              </p>
            </div>
            <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors duration-300 shrink-0 self-end pb-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-0">
            <div className="max-w-6xl mx-auto">
              <Link
                href="/"
                className="text-[9px] text-gray-300 hover:text-white transition-colors mb-10 sm:mb-14 inline-block uppercase tracking-[0.3em]"
              >
                ← Tornar a la revista
              </Link>
            </div>

            <header className="max-w-6xl mx-auto mb-14 sm:mb-16 md:mb-20">
              <span className="text-[8px] text-gray-400 tracking-[0.35em] uppercase block mb-3">
                Biblioteca d&rsquo;aclariments
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.82] mb-3 sm:mb-4">
                Xerrac<span style={{ color: 'var(--accent, #ef4444)' }}>!</span>
              </h1>
              <div className="h-px w-16 sm:w-20 bg-red-900/60 mt-6 sm:mt-8" />
            </header>
          </div>

          {issues.length === 0 ? (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-32">
              <div className="text-center">
                <span className="text-8xl font-black text-gray-800 select-none">:</span>
                <p className="text-gray-400 text-sm mt-4">No hi ha números publicats encara.</p>
              </div>
            </div>
          ) : (
            <div>
              {issues.map((issue, index) => {
                const s = shapeIssue(issue)
                const treatment = getTreatment(index, issues.length)

                switch (treatment) {
                  case 'hero':
                    return <HeroIssue key={s.id} issue={s} />
                  case 'split-left':
                    return <SplitIssue key={s.id} issue={s} />
                  case 'split-right':
                    return <SplitIssue key={s.id} issue={s} reverse />
                  case 'typography':
                    return <TypographyIssue key={s.id} issue={s} />
                  case 'gallery':
                    return <GalleryIssue key={s.id} issue={s} />
                }
              })}

              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 text-center">
                <p className="text-[9px] text-gray-500 tracking-[0.3em] uppercase">
                  {issues.length} {issues.length === 1 ? 'volum' : 'volums'} a la biblioteca
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
