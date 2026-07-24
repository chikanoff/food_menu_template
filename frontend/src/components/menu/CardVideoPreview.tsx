import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { shouldAutoplayVideo } from "@/lib/media"
import { useInView } from "@/hooks/useInView"
import { acquireVideoSlot } from "@/lib/video-slots"

type Props = {
  /** Lightweight looping preview (transcoded ~0.5–1.5 MB mp4), NOT the full video. */
  src: string
  poster: string
  alt: string
  eager?: boolean
  className?: string
}

/**
 * Looping video preview for dish cards that stays cheap:
 * - poster <img> renders immediately (LCP-friendly), video fades in over it
 * - <video> mounts only while visible and only when a playback slot is free
 * - unmounts on scroll-out, releasing decoder + memory
 * - skipped entirely on Save-Data / 2g / prefers-reduced-motion
 */
export function CardVideoPreview({ src, poster, alt, eager = false, className }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "60px 0px", threshold: 0.3 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mountVideo, setMountVideo] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!inView || !shouldAutoplayVideo()) return
    const release = acquireVideoSlot(() => setMountVideo(true))
    return () => {
      release()
      setMountVideo(false)
      setPlaying(false)
    }
  }, [inView])

  useEffect(() => {
    if (!mountVideo) return
    void videoRef.current?.play().catch(() => {})
  }, [mountVideo])

  return (
    <div ref={ref} className={cn("relative h-full w-full", className)}>
      <img
        src={poster}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="h-full w-full object-cover"
      />
      {mountVideo && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            playing ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  )
}
