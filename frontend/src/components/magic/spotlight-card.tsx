import { cn } from "@/lib/utils"

/** Lightweight card chrome — no per-frame mouse state (that re-renders every card). */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/80 shadow-[0_16px_50px_-36px_rgba(26,22,18,0.45)]",
        "transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  )
}
