import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-black tracking-tighter text-white mb-4">
          <span style={{ color: 'var(--accent-text)' }}>4</span>0<span style={{ color: 'var(--accent-text)' }}>4</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8 uppercase tracking-[0.25em]">
          No trobat
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Aquesta pàgina no existeix o ha estat moguda.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-gray-500 text-gray-300
            text-sm uppercase tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent-text)]
            transition-colors"
        >
          ← Tornar a la revista
        </Link>
      </div>
    </div>
  )
}
