export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 w-full">
        <div className="h-3 w-40 bg-gray-900 mb-12 animate-pulse" />
        <div className="h-3 w-24 bg-gray-900 mb-3 animate-pulse" />
        <div className="h-16 sm:h-20 w-72 bg-gray-900 mb-4 animate-pulse" />
        <div className="h-4 w-64 bg-gray-900 mb-16 animate-pulse" />

        <div className="aspect-[16/9] sm:aspect-[21/9] bg-gray-900 mb-16 animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-900 overflow-hidden">
              <div className="aspect-[16/10] bg-gray-900 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-900 animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-900 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
