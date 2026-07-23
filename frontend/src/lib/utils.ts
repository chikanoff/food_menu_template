import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string, currency = "₽") {
  const n = typeof price === "string" ? Number(price) : price
  return `${n.toLocaleString("ru-RU")} ${currency}`
}

export function mediaUrl(url: string | null | undefined) {
  if (!url) return ""
  if (url.startsWith("http") || url.startsWith("blob:")) return url
  return url
}
