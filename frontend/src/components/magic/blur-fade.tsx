import { motion, useInView } from "motion/react"
import { useRef } from "react"

export function BlurFade({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
