import { Logo } from '@/components/Logo'
import { SawIcon } from '@/components/SawIcon'

export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Barra superior */}
      <div className="sticky top-0 z-10 bg-black/75 backdrop-blur-md border-b border-gray-800/50 safe-top min-h-[2.5rem]">
        <div className="flex items-center gap-2 px-3 min-h-[2.5rem]">
          <Logo compact />
          <SawIcon className="w-4 h-4 opacity-20" color="#dc2626" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 bg-gray-800 rounded-sm shrink-0 animate-pulse"
                  style={{ width: `${60 + (i % 3) * 20}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          <div className="w-8 h-8 border border-gray-800 animate-pulse" />
        </div>
      </div>

      {/* Contingut */}
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 max-w-4xl mx-auto">
        {/* Masthead */}
        <div className="mb-12 md:mb-16 opacity-40 animate-pulse">
          <Logo className="mb-4" />
        </div>

        {/* Secció 1 */}
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-4 h-4 bg-gray-800 animate-pulse" />
            <span className="text-2xs tracking-[0.3em] uppercase font-mono text-gray-700">01</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>
          <div className="h-10 sm:h-14 md:h-16 bg-gray-800 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-6 animate-pulse" />
          <div className="space-y-3">
            <div className="h-3 bg-gray-800/60 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-800/60 rounded w-full animate-pulse" style={{ animationDelay: '0.1s' }} />
            <div className="h-3 bg-gray-800/60 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-3 bg-gray-800/60 rounded w-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="h-3 bg-gray-800/60 rounded w-2/3 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Secció 2 */}
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-4 h-4 bg-gray-800 animate-pulse" />
            <span className="text-2xs tracking-[0.3em] uppercase font-mono text-gray-700">02</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>
          <div className="h-8 sm:h-10 md:h-12 bg-gray-800 rounded w-2/3 mb-4 animate-pulse" />
          <div className="space-y-3">
            <div className="h-3 bg-gray-800/60 rounded w-full animate-pulse" style={{ animationDelay: '0.15s' }} />
            <div className="h-3 bg-gray-800/60 rounded w-full animate-pulse" style={{ animationDelay: '0.25s' }} />
            <div className="h-3 bg-gray-800/60 rounded w-4/5 animate-pulse" style={{ animationDelay: '0.35s' }} />
          </div>
        </div>

        {/* Missatge */}
        <div className="text-center mt-12">
          <p className="text-xs text-gray-600 uppercase tracking-[0.25em] animate-pulse">
            Tallant la xerrameca
          </p>
        </div>
      </div>
    </div>
  )
}