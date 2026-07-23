import { motion } from "motion/react"

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent)_45%,transparent),transparent_68%)] blur-2xl"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 top-40 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(26,22,18,0.14),transparent_70%)] blur-2xl"
        animate={{ x: [0, -30, 20, 0], y: [0, -25, 15, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[36rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent)_22%,transparent),transparent_70%)] blur-3xl"
        animate={{ x: [0, 50, -30, 0], opacity: [0.55, 0.8, 0.5, 0.55] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#1a1612_1px,transparent_1px),linear-gradient(to_bottom,#1a1612_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    </div>
  )
}
