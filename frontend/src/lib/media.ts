import type { Dish, DishMedia } from "@/types"
import { mediaUrl } from "@/lib/utils"

/** Prefer static cover for lists: poster > photo > never raw video URL as <img> if unknown. */
export function getDishCover(dish: Dish): { src: string; hasVideo: boolean } {
  const media = dish.media ?? []
  const primary = media.find((m) => m.is_primary) || media[0]
  const photo = media.find((m) => m.type === "photo")
  const video = media.find((m) => m.type === "video")

  if (primary?.type === "video") {
    const poster = mediaUrl(primary.poster_url)
    if (poster) return { src: poster, hasVideo: true }
    if (photo) return { src: mediaUrl(photo.url), hasVideo: true }
    return { src: "", hasVideo: true }
  }

  if (primary?.type === "photo") {
    return { src: mediaUrl(primary.url), hasVideo: Boolean(video) }
  }

  if (photo) return { src: mediaUrl(photo.url), hasVideo: Boolean(video) }
  if (video) {
    const poster = mediaUrl(video.poster_url)
    return { src: poster, hasVideo: true }
  }

  return { src: "", hasVideo: false }
}

export function getPrimaryMedia(dish: Dish): DishMedia | undefined {
  return dish.media.find((m) => m.is_primary) || dish.media[0]
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Network Information API — treat Save-Data / 2g as low bandwidth. */
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
