import { Logo } from '@/components/Logo'

export default function Loading() {
  return (
    <div className="section-container">
      <div className="max-w-lg w-full text-center px-4 animate-pulse">
        <div className="mb-8 opacity-50">
          <Logo />
        </div>
        <p className="text-xs text-gray-600 uppercase tracking-[0.25em]">Tallant la xerrameca</p>
        <div className="h-6 bg-gray-800 rounded w-3/4 mx-auto mt-4" />
      </div>
    </div>
  )
}
