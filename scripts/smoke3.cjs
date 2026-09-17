const { chromium } = require('playwright-core')
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function main() {
  const browser = await chromium.launch({ executablePath: path })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`) })
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

  await page.goto('http://localhost:5178/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3500)
  await page.getByRole('button', { name: /ENTER 3D WORLD/ }).click()
  await page.waitForTimeout(2000)

  const readState = () =>
    page.evaluate(() => {
      const u = window.__universe
      if (!u) return null
      const s = u.useGame.getState()
      return { zone: s.currentZone, interaction: s.activeInteraction }
    })

  // Camera-relative: W = toward camera facing point; camera sits at +X,+Z from player
  // so holding W moves player toward -X, -Z direction. We'll probe all four headings.
  const walk = async (keys, ms) => {
    for (const k of keys) await page.keyboard.down(k)
    await page.waitForTimeout(ms)
    for (const k of keys) await page.keyboard.up(k)
  }

  const results = {}
  results.start = await readState()

  // Move toward project galaxy (camera looks at player from +X/Z; 'W' heads -X,-Z).
  // Projects island is at +X,+Z so hold W to head -X then... Actually camera is a follower:
  // whatever direction we move, camera keeps player center-screen. WASD is heading-relative.
  // We'll just try W, then S, then A, then D and see which zones we reach.
  for (const [label, key] of [['w', 'w'], ['s', 's'], ['a', 'a'], ['d', 'd']]) {
    const before = await readState()
    await walk([key], 8000)
    const after = await readState()
    results[label] = { before, after }
  }

  console.log(JSON.stringify({ results, errors }, null, 2))
  await browser.close()
}

main().catch((e) => { console.error('SMOKE FAILED', e); process.exit(1) })