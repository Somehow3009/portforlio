// Probe: aim pull + drag-look diagnostics + click-to-inspect.
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

  const out = {}

  // ---- 1) Keyboard movement must yaw the view (same code path as drag) ----
  const y0 = await page.evaluate(() => window.__universe.view.yaw)
  await page.keyboard.down('d')
  await page.waitForTimeout(120)
  const ks = await page.evaluate(() => ({ x: window.__universe.input.x, z: window.__universe.input.z, omega: window.__universe.omega, tab: window.__universe.useGame.getState().tourIndex }))
  console.log('PROBE progress: key held, omega=' + ks.omega)
  await page.waitForTimeout(400)
  const ksmid = await page.evaluate(() => ({ yaw: window.__universe.view.yaw, omega: window.__universe.omega }))
  await page.keyboard.up('d')
  await page.waitForTimeout(400)
  const yKb = await page.evaluate(() => window.__universe.view.yaw)
  out.keyboardMovesView = Math.abs(yKb - y0) > 0.2
  out.keyState = { ...ks, ...ksmid }

  // ---- 2) Aim pull FOV ----
  await page.evaluate(() => window.__universe.setView(0.9, 0.05))
  await page.waitForFunction(() => window.__universe.useGame.getState().activeInteraction === null, { timeout: 8000 })
  await page.waitForTimeout(1300)
  const fovBefore = await page.evaluate(() => window.__universe.fov)
  await page.evaluate(() => window.__universe.faceZone('projects'))
  await page.waitForFunction(() => window.__universe.useGame.getState().activeInteraction?.type === 'project', { timeout: 8000 })
  await page.waitForTimeout(1200)
  const fovAfter = await page.evaluate(() => window.__universe.fov)
  out.restFov = Math.round(fovBefore)
  out.fovWhileAimed = Math.round(fovAfter)
  out.aimPullEngaged = fovAfter < fovBefore - 8
  out.detailChipVisible = (await page.getByText('Full AI SaaS product', { exact: false }).count()) > 0
  await page.screenshot({ path: 'screenshots/click-aim-pull.png' })

  // ---- 3) Real mouse drag on empty canvas ----
  const gate = await page.evaluate(() => ({
    tour: window.__universe.useGame.getState().tourIndex,
    controls: window.__universe.useGame.getState().controlsEnabled,
    phase: window.__universe.useGame.getState().phase,
  }))
  out.gateState = gate
  const hit = await page.evaluate(() => {
    const el = document.elementFromPoint(250, 600)
    if (!el) return 'none'
    return `${el.tagName} data-ui=${el.hasAttribute('data-ui')}`
  })
  out.elementAt250x600 = hit
  const b = await page.evaluate(() => window.__universe.view.yaw)
  await page.mouse.move(250, 600)
  await page.mouse.down()
  await page.mouse.move(650, 600, { steps: 10 })
  await page.waitForTimeout(300)
  const mid = await page.evaluate(() => ({ yaw: window.__universe.view.yaw, omega: window.__universe.omega }))
  await page.mouse.up()
  await page.waitForTimeout(500)
  const e2 = await page.evaluate(() => window.__universe.view.yaw)
  out.dragMidYawDelta = Math.round(Math.abs(mid.yaw - b) * 1000) / 1000
  out.dragMidOmega = Math.round(mid.omega * 1000) / 1000
  out.dragEndDelta = Math.round(Math.abs(e2 - b) * 1000) / 1000

  // ---- 4) Click-to-inspect (re-aim at projects: the drag above moved the view) ----
  await page.evaluate(() => window.__universe.faceZone('projects'))
  await page.waitForFunction(
    () => window.__universe.useGame.getState().activeInteraction?.type === 'project',
    { timeout: 8000 },
  )
  await page.waitForTimeout(900)
  try {
    const divs = page.locator('div[data-ui]')
    const n = await divs.count()
    let clicked = false
    for (let i = 0; i < n && !clicked; i++) {
      const el = divs.nth(i)
      const txt = (await el.textContent()) ?? ''
      if (txt.startsWith('RegFlow')) {
        try {
          await el.click({ timeout: 4000 })
          clicked = true
        } catch { /* overlap, try next */ }
      }
    }
    out.labelClickable = clicked
    await page.waitForTimeout(600)
    out.clickOpensPanel = (await page.getByText('VIEW ON GITHUB').count()) > 0
    await page.screenshot({ path: 'screenshots/click-opened-panel.png' })
    await page.getByLabel('Close').click({ timeout: 4000 }).catch(() => {})
  } catch (err) {
    out.clickError = String(err).slice(0, 120)
  }

  console.log(JSON.stringify({ out, errors }, null, 2))
  await browser.close()
  if (errors.length) process.exitCode = 2
}

main().catch((e) => { console.error('PROBE FAILED', e); process.exit(1) })