import { useEffect, useState } from "react"
import { isLowBandwidth, prefersReducedMotion } from "@/lib/media"

/** Static atmospheric background — no infinite animations on weak devices. */
export function AmbientBackground() {
  const [lite, setLite] = useState(true)

  useEffect(() => {
    setLite(prefersReducedMotion() || isLowBandwidth() || window.matchMedia("(max-width: 768px)").matches)
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 top-10 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent)_40%,transparent),transparent_68%)] blur-2xl" />
      <div className="absolute -right-16 top-40 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(26,22,18,0.12),transparent_70%)] blur-2xl" />
      {!lite && (
        <div className="absolute bottom-[-8rem] left-1/3 h-[18rem] w-[30rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_70%)] blur-3xl" />
      )}
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#1a1612_1px,transparent_1px),linear-gradient(to_bottom,#1a1612_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    </div>
  )
}
