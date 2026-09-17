const { chromium } = require('playwright-core')
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function main() {
  const browser = await chromium.launch({ executablePath: path })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.text()) })
  page.on('pageerror', (e) => console.log('[pageerror]', e.message))
  await page.goto('http://localhost:5178/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: /ENTER 3D WORLD/ }).click()
  await page.waitForFunction(() => window.__universe && typeof window.__universe.setView === 'function' && !window.__universe.useGame.getState().loading, { timeout: 25000 })
  await page.waitForTimeout(1500)

  const zones = ['landing', 'skills', 'projects', 'hubs']
  for (const z of zones) {
    await page.evaluate((zone) => window.__universe.faceZone(zone), z)
    await page.waitForTimeout(900)
    const r = await page.evaluate(() => ({
      view: window.__universe.view,
      zone: window.__universe.useGame.getState().currentZone,
      active: window.__universe.useGame.getState().activeInteraction,
      registry: window.__universe.debugRegistry ? window.__universe.debugRegistry().slice(0, 20) : 'none',
    }))
    console.log(z, JSON.stringify({ view: r.view, zone: r.zone, active: r.active, regCount: Array.isArray(r.registry) ? r.registry.length : 'no' }))
  }
  const dirs = await page.evaluate(() => {
    const reg = window.__universe.debugRegistry()
    return reg.map((p) => ({ kind: p.kind, id: p.id, x: p.pos.x, y: p.pos.y, z: p.pos.z }))
  })
  console.log('REGISTRY', JSON.stringify(dirs))
  await browser.close()
}
main().catch((e) => { console.error('FAIL', e.message); process.exit(1) })