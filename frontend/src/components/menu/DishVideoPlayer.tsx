import { useEffect, useRef, useState } from "react"
import { Play } from "lucide-react"
import { cn, mediaUrl } from "@/lib/utils"
import { shouldAutoplayVideo } from "@/lib/media"
import { useInView } from "@/hooks/useInView"

type Props = {
  src: string
  poster?: string | null
  className?: string
}

/**
 * One lazy video player for dish detail.
 * - No network until near viewport (or user taps)
 * - Pauses when off-screen
 * - Skips autoplay on Save-Data / slow networks / reduced-motion
 */
export function DishVideoPlayer({ src, poster, className }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "100px 0px", threshold: 0.2 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loadVideo, setLoadVideo] = useState(false)
  const [userRequested, setUserRequested] = useState(false)
  const [playing, setPlaying] = useState(false)
  const posterUrl = mediaUrl(poster) || undefined
  const videoSrc = mediaUrl(src)
  const canAutoplay = shouldAutoplayVideo()

  useEffect(() => {
    if (inView && canAutoplay) setLoadVideo(true)
  }, [inView, canAutoplay])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !loadVideo) return

    const tryPlay = () => {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }

    if (userRequested || (inView && canAutoplay)) {
      tryPlay()
    } else if (!inView) {
      video.pause()
      setPlaying(false)
    }
  }, [inView, loadVideo, canAutoplay, userRequested])

  return (
    <div ref={ref} className={cn("relative h-full w-full bg-muted", className)}>
      {loadVideo ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterUrl}
          muted
          playsInline
          loop
          controls
          preload="metadata"
          className="h-full w-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : posterUrl ? (
        <img src={posterUrl} alt="" className="h-full w-full object-cover" decoding="async" />
      ) : (
        <div className="grid h-full place-items-center text-muted-foreground">Видео</div>
      )}

      {!playing && (
        <button
          type="button"
          className="absolute inset-0 grid place-items-center bg-black/20"
          aria-label="Смотреть видео"
          onClick={() => {
            setUserRequested(true)
            setLoadVideo(true)
          }}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-foreground shadow-lg">
            <Play className="h-6 w-6 fill-current pl-0.5" />
          </span>
        </button>
      )}
    </div>
  )
}
