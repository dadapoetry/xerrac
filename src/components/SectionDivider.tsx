'use client'

export function SectionDivider() {
  return (
    <div className="section-divider" role="separator" aria-orientation="horizontal">
      <svg
        className="w-full h-[6px]"
        viewBox="0 0 200 6"
        preserveAspectRatio="none"
        fill="none"
        style={{ opacity: 0.25 }}
      >
        <path
          d="M0,3 4,0 8,3 12,0 16,3 20,0 24,3 28,0 32,3 36,0 40,3 44,0 48,3 52,0 56,3 60,0 64,3 68,0 72,3 76,0 80,3 84,0 88,3 92,0 96,3 100,0 104,3 108,0 112,3 116,0 120,3 124,0 128,3 132,0 136,3 140,0 144,3 148,0 152,3 156,0 160,3 164,0 168,3 172,0 176,3 180,0 184,3 188,0 192,3 196,0 200,3"
          stroke="var(--accent)"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
