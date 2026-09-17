const { chromium } = require('playwright-core')
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const fs = require('fs')

async function main() {
  const browser = await chromium.launch({ executablePath: path })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`) })
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

  fs.mkdirSync('screenshots', { recursive: true })

  await page.goto('http://localhost:5178/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3000)

  const readState = () => page.evaluate(() => window.__universe.useGame.getState())
  const out = {}

  // 1. Enter 3D
  await page.getByRole('button', { name: /ENTER 3D WORLD/ }).click()
  await page.waitForTimeout(800)
  // loading screen should be visible now (terminal lines)
  out.loadingScreenVisible = (await page.getByText(/INITIALIZING UNIVERSE|LOADING EXPERIENCE|BOOTING/).count()) > 0
  await page.screenshot({ path: 'screenshots/smoke5-loading.png' })

  // 2. Wait for the loading screen to finish (~4s) and cinematic reveal
  await page.waitForFunction(() => window.__universe.useGame.getState().loading === false, { timeout: 20000 })
  out.loadingCleared = true
  // reveal title should appear within the next ~3.5s
  try {
    await page.getByText('BEGIN', { exact: true }).waitFor({ timeout: 4000, state: 'visible' })
    out.cinematicReveal = true
  } catch {
    out.cinematicReveal = false
  }
  await page.screenshot({ path: 'screenshots/smoke5-reveal.png' })

  // 3. Give it a moment for reveal to finish; then Tab through the tour
  await page.waitForTimeout(3800)
  out.scrollHintVisible = (await page.getByText('SCROLL TO ZOOM').count()) > 0

  const tabTour = async (n) => {
    for (let i = 0; i < n; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(1900)
    }
  }

  await tabTour(1)
  await page.waitForTimeout(1500)
  const t1 = (await readState()).tourIndex
  out.tourIndexAfter1Tab = t1
  await page.screenshot({ path: 'screenshots/smoke5-tour1.png' })

  await tabTour(2)
  const t3 = (await readState()).tourIndex
  out.tourIndexAfter3Tabs = t3
  await page.screenshot({ path: 'screenshots/smoke5-tour3.png' })

  // 4. Press a movement key -> tour should exit back to free roam
  await page.keyboard.press('w')
  await page.waitForTimeout(600)
  out.tourResetAfterMove = (await readState()).tourIndex === -1

  // 5. Check interaction + E still works after all that
  await page.keyboard.down('a')
  await page.waitForTimeout(1500)
  await page.keyboard.up('a')
  const near = await readState()
  out.activeInteractionType = near.activeInteraction ? near.activeInteraction.type : 'none'

  console.log(JSON.stringify({ out, errors }, null, 2))
  await browser.close()

  // fail loudly if any console errors (e.g. bloom shader issues)
  if (errors.length) { process.exitCode = 2 }
}

main().catch((e) => { console.error('SMOKE FAILED', e); process.exit(1) })