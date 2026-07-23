import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export function TextReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h1",
}: {
  text: string
  className?: string
  delay?: number
  as?: "h1" | "h2" | "p" | "span"
}) {
  const words = text.split(" ")
  return (
    <Tag className={cn("flex flex-wrap gap-x-[0.28em] gap-y-1", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0, rotate: 4 }}
            animate={{ y: "0%", opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
