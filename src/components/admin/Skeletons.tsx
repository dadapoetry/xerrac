export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-gray-800/70 ${className}`} />
}

export function SkeletonHeader({ title = 'h-8 w-56', subtitle = 'h-4 w-72' }: { title?: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <Skeleton className={title} />
      <Skeleton className={`${subtitle} mt-3`} />
    </div>
  )
}

export function IssueListSkeleton() {
  const cells = ['w-4', 'w-8', 'w-40', 'w-16', 'w-16', 'w-10', 'w-14']
  return (
    <div>
      <SkeletonHeader />
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="border border-gray-800 mt-6">
        <div className="hidden sm:grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-gray-800">
          {cells.map((c, i) => <Skeleton key={i} className={`h-3 ${c}`} />)}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-1 sm:grid-cols-[auto_auto_1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-gray-800 items-center"
          >
            {cells.map((c, i) => <Skeleton key={i} className={`h-4 ${c}`} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

export function IssueDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-32 mb-6" />
      <SkeletonHeader title="h-8 w-72" subtitle="h-4 w-52" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-gray-800 p-6 space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-20 mb-4" />
          <Skeleton className="h-[70px] w-full border border-dashed border-gray-800" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-gray-800 p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SectionListSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonHeader title="h-8 w-56" subtitle="h-4 w-64" />
      <Skeleton className="h-[70px] w-full border border-dashed border-gray-800" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function SectionFormSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-40 mb-6" />
      <SkeletonHeader title="h-8 w-48" subtitle="h-4 w-64" />
      <div className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div>
          <Skeleton className="h-3 w-40 mb-2" />
          <div className="flex gap-3">
            <Skeleton className="h-24 w-24 flex-shrink-0" />
            <Skeleton className="h-11 flex-1" />
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  )
}