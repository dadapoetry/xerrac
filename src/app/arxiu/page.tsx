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
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors mb-10 inline-block uppercase tracking-[0.25em] font-mono"
          >
            ← Tornar
          </Link>

          <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-mono block mb-4">
            Arxiu
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-3">
            Xerrac<span className="text-red-500">!</span>
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Tots els números publicats
          </p>
          <RedRule className="mb-12" />

          {issues.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No hi ha números publicats.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.map((issue) => {
                const coverSection = issue.sections?.find((s: any) => s.type === 'portada')
                const coverBg = coverSection?.backgroundImage || ''

                return (
                  <Link
                    key={issue.id}
                    href={`/?issue=${issue.id}`}
                    className="group relative flex flex-col justify-end p-6 min-h-[220px] border border-gray-800 hover:border-red-900/40 transition-colors overflow-hidden bg-black"
                  >
                    {coverBg && (
                      <>
                        <img
                          src={coverBg}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                      <h2 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors leading-snug mb-1">
                        {issue.title}
                      </h2>
                      <span className="text-xs text-gray-500">
                        {issue.sections.length} seccions
                      </span>
                    </div>
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
