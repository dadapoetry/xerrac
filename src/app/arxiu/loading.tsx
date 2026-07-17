export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="h-3 w-36 bg-gray-900 mb-10 sm:mb-14 animate-pulse" />
          <div className="h-3 w-48 bg-gray-900 mb-3 animate-pulse" />
          <div className="h-16 sm:h-20 md:h-24 w-72 sm:w-96 bg-gray-900 mb-3 animate-pulse" />
          <div className="h-4 w-64 bg-gray-900 mb-6 animate-pulse" />
          <div className="h-px w-16 bg-gray-900 animate-pulse" />
        </div>
      </div>

      <div className="mt-14 sm:mt-16 md:mt-20">
        <div className="aspect-[4/3] sm:aspect-[21/9] md:aspect-[2.6/1] bg-gray-900 animate-pulse" />
        <div className="aspect-[4/3] sm:aspect-[2/1] bg-gray-950 animate-pulse" />
        <div className="h-40 sm:h-48 md:h-56 bg-gray-900 animate-pulse" />
        <div className="aspect-[3/2] sm:aspect-[2/1] md:aspect-[3/1] bg-gray-950 animate-pulse" />
      </div>
    </div>
  )
}
