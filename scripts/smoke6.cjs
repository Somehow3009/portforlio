const { chromium } = require('playwright-core')
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const fs = require('fs')

// Phase-5 smoke: WebGPU dome — inside-a-sphere navigation, constellation gaze.
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

  // 1) Initial view: facing the landing constellation, slightly pitched up
  const s0 = await st()
  out.initialYawHostsLanding = Math.abs(s0.view.yaw - Math.PI) < 0.5
  out.initialZone = s0.zone

  // 2) Drag to look: dragging empty space yaws the view
  await page.mouse.move(640, 400)
  await page.mouse.down()
  await page.mouse.move(960, 400, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(400)
  const s1 = await st()
  out.lookDragged = Math.abs(s1.view.yaw - s0.view.yaw) > 0.4
  await page.screenshot({ path: 'screenshots/smoke6-drag.png' })

  // 3) Aim at the skill constellation: zone + gaze reticle engage
  await page.evaluate(() => window.__universe.faceZone('skills'))
  await page.waitForTimeout(600)
  const s2 = await st()
  out.skillsFaced = s2.zone === 'skills'
  out.gazeSkill = s2.active?.type === 'skill'
  const reticle = await page.evaluate(() => {
    const el = document.querySelector('[data-reticle="label"]')
    return { visible: !!el, label: el ? el.textContent : null }
  })
  out.reticleVisible = reticle.visible
  out.reticleLabel = reticle.label
  await page.screenshot({ path: 'screenshots/smoke6-skills.png' })

  // 4) Inspect a project with E
  await page.evaluate(() => window.__universe.faceZone('projects'))
  await page.waitForFunction(() => window.__universe.useGame.getState().activeInteraction?.type === 'project', { timeout: 8000 })
  await page.keyboard.press('e')
  await page.waitForTimeout(700)
  out.eOpensProject = (await page.getByText('VIEW ON GITHUB').count()) > 0
  await page.getByLabel('Close').click()
  await page.waitForTimeout(300)
  out.eClosedProject = (await page.evaluate(() => window.__universe.useGame.getState().projectDetail)) === null

  // 5) Tab tour swings to another constellation, keys exit free roam
  const before = await st()
  await page.keyboard.press('Tab')
  await page.waitForTimeout(1600)
  const after = await st()
  out.tourEngaged = after.tour >= 0
  out.tourMovedView = Math.hypot(after.view.yaw - before.view.yaw, after.view.pitch - before.view.pitch) > 0.1
  await page.keyboard.press('w')
  await page.waitForTimeout(400)
  out.tourExitedOnKey = (await st()).tour === -1
  await page.screenshot({ path: 'screenshots/smoke6-tour.png' })

  // 6) Open channel from hubs
  await page.evaluate(() => window.__universe.faceZone('hubs'))
  await page.waitForFunction(() => window.__universe.useGame.getState().activeInteraction?.id === 'terminal', { timeout: 8000 })
  await page.keyboard.press('e')
  await page.waitForTimeout(700)
  out.terminalOpens = (await page.getByText('CONTACT TERMINAL').count()) > 0
  await page.screenshot({ path: 'screenshots/smoke6-hubs.png' })

  console.log(JSON.stringify({ out, errors }, null, 2))
  await browser.close()
  if (errors.length) process.exitCode = 2
}

main().catch((e) => { console.error('SMOKE FAILED', e); process.exit(1) })