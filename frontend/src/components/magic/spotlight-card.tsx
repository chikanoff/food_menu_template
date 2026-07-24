import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Lightweight card chrome. Mouse spotlight only on fine pointers (desktop),
 * skipped on touch to avoid layout work on phones.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot(null)}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/80 shadow-[0_16px_50px_-36px_rgba(26,22,18,0.45)]",
        "transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1",
        className
      )}
    >
      {spot && (
        <div
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity"
          style={{
            background: `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 42%)`,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}
