export function SawDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 12"
      className={`w-full h-3 ${className}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern id="saw" width="16" height="12" patternUnits="userSpaceOnUse">
        <polygon points="0,12 8,0 16,12" fill="#dc2626" />
      </pattern>
      <rect width="100" height="12" fill="url(#saw)" />
    </svg>
  )
}
