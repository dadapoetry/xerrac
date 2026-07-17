export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 sm:px-6 md:px-8 pt-14 sm:pt-16 md:pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="h-3 w-32 bg-gray-900 mb-10 sm:mb-12 md:mb-14 animate-pulse" />
          <div className="h-3 w-40 bg-gray-900 mb-3 animate-pulse" />
          <div className="h-14 sm:h-16 md:h-20 w-64 sm:w-80 bg-gray-900 mb-3 animate-pulse" />
          <div className="h-4 w-56 bg-gray-900 animate-pulse" />

          <div className="mt-10 sm:mt-12 md:mt-14">
            <div className="aspect-[4/3] sm:aspect-[21/9] md:aspect-[2.6/1] bg-gray-900 animate-pulse" />
            <div className="flex gap-6 pt-5 pb-8 border-b border-gray-900">
              <div className="hidden sm:block shrink-0 w-14 md:w-20 h-12 bg-gray-900 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 bg-gray-900 animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-900 animate-pulse" />
                <div className="flex gap-4 mt-3">
                  <div className="h-3 w-20 bg-gray-900 animate-pulse" />
                  <div className="h-3 w-24 bg-gray-900 animate-pulse" />
                  <div className="h-3 w-16 bg-gray-900 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex gap-6 pt-5 pb-8 border-b border-gray-900">
              <div className="hidden sm:block shrink-0 w-14 md:w-20 h-12 bg-gray-900 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-2/3 bg-gray-900 animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-900 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
