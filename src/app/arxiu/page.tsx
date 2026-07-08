import Link from 'next/link'
import { getPublishedIssues } from '@/lib/actions'
import { RedRule } from '@/components/RedRule'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function ArxiuPage() {
  const issues = await getPublishedIssues()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 pt-20 pb-12">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors mb-10 inline-block uppercase tracking-[0.25em] font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
          >
            ← Tornar
          </Link>

          <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-mono block mb-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            Arxiu
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            Xerrac<span className="text-red-500">!</span>
          </h1>
          <p className="text-sm text-gray-400 mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            Tots els números publicats
          </p>
          <RedRule className="mb-12" />

          {issues.length === 0 ? (
            <p className="text-gray-500 italic text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">No hi ha números publicats.</p>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => {
                const coverSection = issue.sections?.find((s: any) => s.type === 'portada')
                const coverBg = coverSection?.backgroundImage || ''

                return (
                  <Link
                    key={issue.id}
                    href={`/?issue=${issue.id}`}
                    className="group flex items-center justify-between p-4 border border-gray-800 hover:border-red-900/40 transition-colors relative overflow-hidden bg-black"
                  >
                    {coverBg && (
                      <>
                        <div
                          className="absolute inset-0 z-0 bg-cover bg-center"
                          style={{ backgroundImage: `url("${coverBg}")` }}
                        />
                        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/90 via-black/75 to-black/90" />
                      </>
                    )}
                    <div className="relative z-[2] flex items-center gap-4">
                      <span className="text-[10px] text-gray-400 font-mono w-8 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                        {String(issue.number).padStart(2, '0')}
                      </span>
                      <div>
                        <h2 className="text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                          {issue.title}
                        </h2>
                        <span className="text-xs text-gray-400 mt-1 block drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                          {issue.sections.length} seccions
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] relative z-[2]">
                      {new Date(issue.date).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
