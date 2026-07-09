'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black tracking-tighter text-white mb-4">
          <span className="text-red-500">5</span>00
        </h1>
        <p className="text-gray-500 text-sm mb-8 uppercase tracking-[0.25em]">
          Error del servidor
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Alguna cosa ha anat malament. Intenta-ho de nou.
        </p>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 border border-gray-800 text-gray-400
            text-sm uppercase tracking-wider hover:border-red-800 hover:text-red-400
            transition-colors"
        >
          Tornar a intentar
        </button>
      </div>
    </div>
  )
}
