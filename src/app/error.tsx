'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-black tracking-tighter text-white mb-4">
          <span style={{ color: 'var(--accent-text)' }}>5</span>00
        </h1>
        <p className="text-gray-400 text-sm mb-8 uppercase tracking-[0.25em]">
          Error del servidor
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Alguna cosa ha anat malament. Intenta-ho de nou.
        </p>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 border border-gray-600 text-gray-300
            text-sm uppercase tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent-text)]
            transition-colors"
        >
          Tornar a intentar
        </button>
      </div>
    </div>
  )
}
