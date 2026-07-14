import Link from 'next/link'
import Image from 'next/image'
import { getPublishedIssues } from '@/lib/actions'
import { RedRule } from '@/components/RedRule'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function ArxiuPage() {
  const issues = await getPublishedIssues()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors mb-10 inline-block uppercase tracking-[0.25em]"
          >
            ← Tornar
          </Link>

          <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase block mb-4">
            Arxiu d'aclariments
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-3">
            Xerrac<span style={{ color: 'var(--accent, #ef4444)' }}>!</span>
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Tots els números publicats
          </p>
          <RedRule className="mb-12" />

          <div className="relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{
                backgroundImage: [
                  'repeating-linear-gradient(0deg, transparent, transparent 39px, var(--accent, #ef4444) 39px, var(--accent, #ef4444) 40px)',
                  'repeating-linear-gradient(90deg, transparent, transparent 39px, var(--accent, #ef4444) 39px, var(--accent, #ef4444) 40px)',
                ].join(', '),
              }}
            />
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-700 opacity-30 pointer-events-none" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-gray-700 opacity-30 pointer-events-none" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-gray-700 opacity-30 pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-700 opacity-30 pointer-events-none" />

            {issues.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No hi ha números publicats.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-[1]">
                {issues.map((issue) => {
                  const coverSection = issue.sections?.find((s: any) => s.type === 'portada')
                  const coverBg = coverSection?.backgroundImage || ''

                  return (
                    <Link
                      key={issue.id}
                      href={`/?issue=${issue.id}`}
                      className="group relative flex flex-col justify-end p-6 min-h-[220px] border border-gray-800 transition-colors overflow-hidden bg-black hover:[border-color:rgba(var(--accent-rgb,239,68,68),0.4)]"
                    >
                      {coverBg && (
                        <>
                          <Image
                            src={coverBg}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
                        </>
                      )}
                      <div className="relative z-[2]">
                        <span className="text-[10px] text-gray-500 font-mono block mb-2">
                          {String(issue.number).padStart(2, '0')} — {new Date(issue.date).toLocaleDateString('ca-ES', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <h2 className="text-xl font-bold text-white leading-snug mb-1 group-hover:[color:var(--accent,#ef4444)] transition-colors">
                          {issue.title}
                        </h2>
                        <span className="text-xs text-gray-500">
                          {issue.sections.filter((s: any) => s.type !== 'portada').length} seccions
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
