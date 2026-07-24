/**
 * Global cap on simultaneously playing card videos.
 * Each playing <video> costs a hardware decoder + memory; too many at once
 * is exactly what turns the page into a slideshow on phones.
 */

const MAX_ACTIVE =
  typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches ? 2 : 3

let active = 0
const waiters: Array<() => void> = []

/**
 * Request a playback slot. `grant` is called (sync or later) when a slot is free.
 * Returns a release function — call it when the video leaves the viewport/unmounts.
 */
export function acquireVideoSlot(grant: () => void): () => void {
  let granted = false
  let released = false

  const tryGrant = () => {
    if (released) return
    granted = true
    active++
    grant()
  }

  if (active < MAX_ACTIVE) tryGrant()
  else waiters.push(tryGrant)

  return () => {
    if (released) return
    released = true
    if (granted) {
      active--
      waiters.shift()?.()
    } else {
      const i = waiters.indexOf(tryGrant)
      if (i >= 0) waiters.splice(i, 1)
    }
  }
}
