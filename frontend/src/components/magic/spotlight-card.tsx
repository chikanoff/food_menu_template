import { motion, useMotionTemplate, useMotionValue } from "motion/react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const background = useMotionTemplate`radial-gradient(520px circle at ${mouseX}px ${mouseY}px, color-mix(in oklab, var(--color-accent) 28%, transparent), transparent 42%)`

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/75 shadow-[0_24px_70px_-42px_rgba(26,22,18,0.55)] backdrop-blur-md",
        className
      )}
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style={{ background }} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 ring-1 ring-inset ring-accent/20" />
      <div className="relative">{children}</div>
    </motion.div>
  )
}
