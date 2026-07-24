import type { Dish, DishMedia } from "@/types"
import { mediaUrl } from "@/lib/utils"

export type DishCover = {
  /** Static cover: poster or photo. Never a video URL. */
  src: string
  hasVideo: boolean
  /** Lightweight looping mp4 for the card, if the backend generated one. */
  previewSrc: string
}

/** Prefer static cover for lists: poster > photo. Never use video URL as <img>. */
export function getDishCover(dish: Dish): DishCover {
  const media = dish.media ?? []
  const primary = media.find((m) => m.is_primary) || media[0]
  const photo = media.find((m) => m.type === "photo")
  const video = media.find((m) => m.type === "video")
  const previewSrc = mediaUrl(video?.preview_url)

  if (primary?.type === "video") {
    const poster = mediaUrl(primary.poster_url)
    if (poster) return { src: poster, hasVideo: true, previewSrc }
    if (photo) return { src: mediaUrl(photo.url), hasVideo: true, previewSrc }
    return { src: "", hasVideo: true, previewSrc }
  }

  if (primary?.type === "photo") {
    return { src: mediaUrl(primary.url), hasVideo: Boolean(video), previewSrc }
  }

  if (photo) return { src: mediaUrl(photo.url), hasVideo: Boolean(video), previewSrc }
  if (video) {
    const poster = mediaUrl(video.poster_url)
    return { src: poster, hasVideo: true, previewSrc }
  }

  return { src: "", hasVideo: false, previewSrc: "" }
}

export function getPrimaryMedia(dish: Dish): DishMedia | undefined {
  return dish.media.find((m) => m.is_primary) || dish.media[0]
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function isLowBandwidth(): boolean {
  if (typeof navigator === "undefined") return false
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (!conn) return false
  if (conn.saveData) return true
  const t = conn.effectiveType
  return t === "slow-2g" || t === "2g"
}

export function shouldAutoplayVideo(): boolean {
  return !prefersReducedMotion() && !isLowBandwidth()
}
