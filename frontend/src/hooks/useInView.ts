import { useEffect, useRef, useState } from "react"

type Options = {
  rootMargin?: string
  threshold?: number
  once?: boolean
}

/** Lightweight IntersectionObserver hook for lazy media. */
export function useInView<T extends Element>(options: Options = {}) {
  const { rootMargin = "120px 0px", threshold = 0.15, once = false } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, inView }
}
