import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedIssues } from '@/lib/actions'
import { getSiteUrl } from '@/lib/site'
import { RedRule } from '@/components/RedRule'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

const SECTION_LABELS: Record<string, string> = {
  portada: 'Portada',
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

function SectionTags({ sections }: { sections: { type: string }[] }) {
  const tags = sections
    .filter((s) => s.type !== 'portada')
    .map((s) => SECTION_LABELS[s.type] || s.type)
    .slice(0, 4)

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border border-gray-700 text-gray-400"
        >
          {tag}
        </span>
      ))}
      {sections.filter((s) => s.type !== 'portada').length > 4 && (
        <span className="text-[9px] text-gray-600 self-center ml-0.5">+{sections.filter((s) => s.type !== 'portada').length - 4}</span>
      )}
    </div>
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

  const latestIssue = issues[0] || null
  const previousIssues = issues.slice(1)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-0">
            <Link
              href="/"
              className="text-[10px] text-gray-500 hover:text-white transition-colors mb-12 inline-block uppercase tracking-[0.3em]"
            >
              ← Tornar a la revista
            </Link>

            <header className="mb-16 sm:mb-20">
              <span className="text-[9px] text-gray-500 tracking-[0.35em] uppercase block mb-3">
                Biblioteca
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[0.85] mb-4">
                Xerrac<span style={{ color: 'var(--accent, #ef4444)' }}>!</span>
              </h1>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                Una col·lecció creixent d&rsquo;aclariments culturals. Cada número és un objecte editorial únic.
              </p>
            </header>
          </div>

          {latestIssue && (
            <>
              <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
                <Link
                  href={`/?issue=${latestIssue.id}`}
                  className="group block relative"
                >
                  <div className="relative overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-colors duration-500">
                    {(() => {
                      const coverSection = latestIssue.sections?.find((s: any) => s.type === 'portada')
                      const coverBg = coverSection?.backgroundImage || ''
                      return coverBg ? (
                        <>
                          <div className="aspect-[16/9] sm:aspect-[21/9] relative">
                            <Image
                              src={coverBg}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-1000 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, 1200px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                          </div>
                        </>
                      ) : (
                        <div className="aspect-[16/9] sm:aspect-[21/9] bg-gray-950" />
                      )
                    })()}

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10">
                      <span className="text-[9px] sm:text-[10px] text-gray-400 tracking-[0.3em] uppercase block mb-2">
                        Últim número
                      </span>
                      <div className="flex items-end gap-4 sm:gap-6">
                        <span
                          className="text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight"
                          style={{ color: 'rgba(239, 68, 68, 0.15)' }}
                        >
                          {String(latestIssue.number).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-red-400 transition-colors duration-300">
                            {latestIssue.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                            {new Date(latestIssue.date).toLocaleDateString('ca-ES', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </p>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400 group-hover:text-white transition-colors duration-300 shrink-0">
                          Llegir
                          <span className="text-lg leading-none group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>

              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <RedRule className="mb-16 sm:mb-20" />
              </div>
            </>
          )}

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
            {issues.length === 0 ? (
              <div className="text-center py-32">
                <span className="text-8xl font-black text-gray-800 select-none">:</span>
                <p className="text-gray-600 text-sm mt-4">No hi ha números publicats encara.</p>
              </div>
            ) : (
              <>
                {previousIssues.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {previousIssues.map((issue, index) => {
                      const coverSection = issue.sections?.find((s: any) => s.type === 'portada')
                      const coverBg = coverSection?.backgroundImage || ''

                      return (
                        <Link
                          key={issue.id}
                          href={`/?issue=${issue.id}`}
                          className="group block relative border border-gray-800 hover:border-gray-600 transition-all duration-500 overflow-hidden"
                        >
                          <div className="aspect-[16/10] relative overflow-hidden">
                            {coverBg ? (
                              <>
                                <Image
                                  src={coverBg}
                                  alt=""
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                              </>
                            ) : (
                              <div className="absolute inset-0 bg-gray-950" />
                            )}
                            <span
                              className="absolute top-3 left-3 sm:top-4 sm:left-4 text-5xl sm:text-6xl md:text-7xl font-black leading-none select-none pointer-events-none"
                              style={{ color: 'rgba(239, 68, 68, 0.08)' }}
                            >
                              {String(issue.number).padStart(2, '0')}
                            </span>
                            <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[9px] text-gray-500 font-mono">
                              {new Date(issue.date).toLocaleDateString('ca-ES', {
                                year: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>

                          <div className="p-4 sm:p-5">
                            <h3 className="text-base sm:text-lg font-bold text-white leading-snug mb-2 group-hover:text-red-400 transition-colors duration-300">
                              {issue.title}
                            </h3>
                            <SectionTags sections={issue.sections} />
                          </div>

                          <span className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 text-xs text-gray-600 group-hover:text-gray-400 transition-colors duration-300">
                            →
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {issues.length > 0 && (
                  <div className="mt-16 sm:mt-20 text-center">
                    <p className="text-[10px] text-gray-700 tracking-[0.3em] uppercase">
                      {issues.length} {issues.length === 1 ? 'número publicat' : 'números publicats'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
