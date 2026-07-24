/**
 * Records a short product demo of the public menu site with Playwright.
 *
 * Usage:
 *   node scripts/record-demo.mjs
 *   node scripts/record-demo.mjs --base http://127.0.0.1 --out demos --only mobile
 *
 * Important: recordVideo.size must match viewport CSS pixels 1:1.
 * Scaling to 1080p is done later with ffmpeg (lanczos), not by Playwright.
 */
import { chromium, devices } from "playwright"
import { mkdirSync, readdirSync, copyFileSync, statSync, rmSync } from "node:fs"
import { join, resolve } from "node:path"

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const BASE = getArg("--base", "http://127.0.0.1").replace(/\/$/, "")
const OUT_DIR = resolve(getArg("--out", "demos"))
const ONLY = getArg("--only", "all") // all | mobile | desktop

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function smoothScroll(page, distance, steps = 32) {
  const step = distance / steps
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), step)
    await sleep(26)
  }
}

async function waitSettled(page, ms = 900) {
  await page.waitForLoadState("networkidle").catch(() => {})
  await sleep(ms)
}

async function runTour(page, { mobile }) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" })
  await waitSettled(page, 1800)
  await sleep(mobile ? 2200 : 1600)

  await smoothScroll(page, mobile ? 260 : 320)
  await sleep(800)

  const featured = page.locator("text=Блюда").first()
  if (await featured.count()) {
    await featured.scrollIntoViewIfNeeded()
    await sleep(600)
    await smoothScroll(page, mobile ? 560 : 420)
    await sleep(1600)
  }

  const menuCta = page.getByRole("link", { name: /Смотреть меню/i }).first()
  if (await menuCta.count()) {
    await menuCta.scrollIntoViewIfNeeded()
    await sleep(350)
    await menuCta.click()
  } else {
    await page.goto(`${BASE}/menu`, { waitUntil: "domcontentloaded" })
  }

  await page.waitForURL(/\/menu/)
  await waitSettled(page, 1300)
  await smoothScroll(page, mobile ? 880 : 680)
  await sleep(1300)
  await smoothScroll(page, mobile ? 520 : 360)
  await sleep(900)

  const dishLink = page.locator('a[href^="/dish/"]').first()
  if (await dishLink.count()) {
    await dishLink.scrollIntoViewIfNeeded()
    await sleep(450)
    await dishLink.click()
    await page.waitForURL(/\/dish\//)
    await waitSettled(page, 1700)
    await smoothScroll(page, mobile ? 340 : 260)
    await sleep(1100)

    const back = page.getByRole("link", { name: /Назад/i }).first()
    if (await back.count()) {
      await back.click()
      await page.waitForURL(/\/menu/)
    } else {
      await page.goto(`${BASE}/menu`, { waitUntil: "domcontentloaded" })
    }
    await waitSettled(page, 900)
  }

  const categoryLink = page.locator('a[href^="/menu/"]').filter({ hasText: /.+/ }).nth(1)
  if (await categoryLink.count()) {
    await categoryLink.click()
    await waitSettled(page, 1200)
    await smoothScroll(page, mobile ? 480 : 340)
    await sleep(1400)
  }

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" })
  await waitSettled(page, 1500)
}

async function recordViewport({ name, device, mobile = false }) {
  console.log(`Recording ${name} @ ${device.viewport.width}x${device.viewport.height}...`)
  const rawDir = join(OUT_DIR, `_raw_${name}`)
  rmSync(rawDir, { recursive: true, force: true })
  mkdirSync(rawDir, { recursive: true })

  // 1 CSS px == 1 video px. Do NOT pass a different size — Playwright will
  // letterbox / squeeze the page (thin strip on the left).
  const size = { width: device.viewport.width, height: device.viewport.height }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...device,
    locale: "ru-RU",
    deviceScaleFactor: 1, // keep video pixels = CSS pixels
    recordVideo: { dir: rawDir, size },
  })
  const page = await context.newPage()
  try {
    await runTour(page, { mobile })
  } finally {
    await context.close()
    await browser.close()
  }

  const files = readdirSync(rawDir)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({ f, size: statSync(join(rawDir, f)).size }))
    .sort((a, b) => b.size - a.size)

  if (!files.length) throw new Error(`No webm produced for ${name}`)

  mkdirSync(OUT_DIR, { recursive: true })
  const dest = join(OUT_DIR, `videomenu-demo-${name}.webm`)
  copyFileSync(join(rawDir, files[0].f), dest)
  rmSync(rawDir, { recursive: true, force: true })
  console.log(`Saved ${dest} (${Math.round(files[0].size / 1024)} KB, ${size.width}x${size.height})`)
  return dest
}

const iphone = {
  ...devices["iPhone 12 Pro"],
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
}

const desktop = {
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
}

const results = []
if (ONLY === "all" || ONLY === "mobile") {
  results.push(await recordViewport({ name: "mobile", device: iphone, mobile: true }))
}
if (ONLY === "all" || ONLY === "desktop") {
  results.push(await recordViewport({ name: "desktop", device: desktop, mobile: false }))
}

console.log("Done.")
for (const r of results) console.log(r)
