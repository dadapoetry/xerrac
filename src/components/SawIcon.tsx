export function SawIcon({ className = '', color }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8,20 L92,20 L92,32 L88,32 L76,68 L64,32 L58,32 L46,68 L34,32 L28,32 L18,68 L8,32 Z" fill={color || '#ef4444'} />
    </svg>
  )
}
