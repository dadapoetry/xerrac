'use client'

interface SectionHeaderProps {
  number: number
  title: string
  subtitle?: string | null
}

export function SectionHeader({ number, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-12 md:mb-16">
      <span className="text-[10px] text-gray-600 tracking-[0.3em] uppercase font-mono block mb-4">
        {String(number).padStart(2, '0')}
      </span>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 tracking-wider uppercase mb-4">
          {subtitle}
        </p>
      )}
      <div className="w-12 h-[2px] bg-red-500/60" />
    </div>
  )
}
