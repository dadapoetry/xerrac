import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black tracking-tighter text-white mb-4">
          <span className="text-red-500">4</span>0<span className="text-red-500">4</span>
        </h1>
        <p className="text-gray-500 text-sm mb-8 uppercase tracking-[0.25em]">
          No trobat
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Aquesta pàgina no existeix o ha estat moguda.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-gray-800 text-gray-400
            text-sm uppercase tracking-wider hover:border-red-800 hover:text-red-400
            transition-colors"
        >
          ← Tornar a la revista
        </Link>
      </div>
    </div>
  )
}
