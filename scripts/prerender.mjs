// Postbuild prerender: snapshot the client-rendered "/" into dist/index.html so
// crawlers/social bots that don't run JS see real content. Single-route SPA, so
// one snapshot is enough. Uses the already-installed Playwright Chromium.
import { preview } from 'vite'
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = 4188

// Deploy-safe: if the Playwright browser isn't installed (e.g. a CI runner that
// skipped `npx playwright install chromium`), warn and keep the client-only
// build instead of failing the deploy.
try {
  const server = await preview({ preview: { port: PORT, strictPort: true } })
  const url = `http://localhost:${PORT}/`
  const browser = await chromium.launch({ args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage()
    // Block API calls so the snapshot captures the SAME pre-fetch fallback state
    // the client renders on first paint — otherwise baked live data mismatches
    // the client's initial render and React bails hydration (error #418).
    await page.route('**/api/**', (route) => route.abort())
    // ?prerender tells animation code (CardSwap) to stay in its initial render
    // so the snapshot matches the client's first paint (clean hydration).
    await page.goto(`${url}?prerender=1`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.lux-hero-title', { timeout: 20000 }) // app mounted
    await page.waitForTimeout(500) // let the rest of the fold settle
    const html = await page.content()
    writeFileSync(resolve('dist/index.html'), html)
    console.log(`Prerendered dist/index.html (${html.length} bytes)`)
  } finally {
    await browser.close()
    await server.httpServer.close()
  }
} catch (err) {
  console.warn('[prerender] skipped — keeping client-only build:', err.message)
  console.warn('[prerender] enable on CI with: npx playwright install chromium')
}
process.exit(0)
