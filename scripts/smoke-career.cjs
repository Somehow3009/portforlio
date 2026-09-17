// Probe: career zone — face THE CAREER TRAIL, gaze a company node, open its panel.
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
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: /ENTER 3D WORLD/ }).click()
  await page.waitForFunction(
    () => window.__universe && typeof window.__universe.setView === 'function' && !window.__universe.useGame.getState().loading,
    { timeout: 25000 },
  )
  await page.waitForTimeout(1200)

  const out = {}
  const st = () =>
    page.evaluate(() => ({
      view: window.__universe.view,
      zone: window.__universe.useGame.getState().currentZone,
      tour: window.__universe.useGame.getState().tourIndex,
      active: window.__universe.useGame.getState().activeInteraction,
    }))

  // 1) Face the career trail
  await page.evaluate(() => window.__universe.faceZone('career'))
  await page.waitForTimeout(800)
  const s0 = await st()
  out.careerFaced = s0.zone === 'career'
  out.activeType = s0.active?.type
  out.activeId = s0.active?.id

  const reticle = await page.evaluate(() => {
    const el = document.querySelector('[data-reticle="label"]')
    return { visible: !!el, label: el ? el.textContent : null }
  })
  out.reticleVisible = reticle.visible
  out.reticleLabel = reticle.label
  await page.screenshot({ path: 'screenshots/career-zone.png' })

  // 2) Inspect the first company node with E
  const firstId = s0.active?.id
  if (s0.active?.type === 'career') {
    await page.keyboard.press('e')
    await page.waitForTimeout(700)
    const detail = await page.evaluate(() => window.__universe.useGame.getState().careerDetail)
    out.careerDetailOpens = detail === firstId
    out.panelShowsCompany = (await page.getByText('TITOP').count()) > 0 || (await page.getByText('TrustXLabs').count()) > 0
    out.panelShowsHighlights = (await page.getByText('HIGHLIGHTS').count()) > 0
    await page.screenshot({ path: 'screenshots/career-panel.png' })
  } else {
    out.careerDetailOpens = false
  }

  // 3) Tour includes the career stop (4th of 5)
  await page.keyboard.press('Tab')
  await page.waitForTimeout(1600)
  const t1 = await st()
  await page.keyboard.press('Tab')
  await page.waitForTimeout(1600)
  await page.keyboard.press('Tab')
  await page.waitForTimeout(1600)
  await page.keyboard.press('Tab')
  await page.waitForTimeout(1800)
  const t2 = await st()
  out.tourIndexAfter4Tabs = t2.tour
  out.tourReachesCareer = t2.zone === 'career'
  await page.screenshot({ path: 'screenshots/career-tour.png' })

  console.log(JSON.stringify({ out, errors }, null, 2))
  await browser.close()
  if (errors.length) process.exitCode = 2
}

main().catch((e) => { console.error('PROBE FAILED', e); process.exit(1) })