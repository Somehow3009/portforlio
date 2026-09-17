const { chromium } = require('playwright-core')
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function main() {
  const browser = await chromium.launch({ executablePath: path })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`) })
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

  await page.goto('http://localhost:5178/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3500)
  await page.getByRole('button', { name: /ENTER 3D WORLD/ }).click()
  await page.waitForTimeout(2500)

  // Sample canvas pixels to detect actual 3D content (not uniform black)
  const variance = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    if (!c) return -1
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return -2
    const w = gl.drawingBufferWidth
    const h = gl.drawingBufferHeight
    const px = new Uint8Array(w * h * 4)
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px)
    let n = 0, sum = 0, sumSq = 0
    for (let i = 0; i < px.length; i += 4) {
      const l = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
      sum += l; sumSq += l * l; n++
    }
    const mean = sum / n
    const var_ = sumSq / n - mean * mean
    return { mean: +mean.toFixed(2), variance: +var_.toFixed(2), w, h }
  })

  // Test: hold E + detect whether interaction triggers (spawn area has no interaction, so just verify no crash)
  await page.keyboard.down('w')
  await page.waitForTimeout(1500)
  await page.keyboard.up('w')
  const zoneIndicator = await page.locator('text=/LANDING|FORGE|GALAXY|HUB|VOID/').first().textContent().catch(() => null)

  // Walk toward hub direction (camera looks along -? ) — try pressing 'w' then 'd'
  await page.keyboard.down('w')
  await page.waitForTimeout(4000)
  await page.keyboard.up('w')
  const zoneIndicator2 = await page.locator('text=/LANDING|FORGE|GALAXY|HUB|VOID/').first().textContent().catch(() => null)

  console.log(JSON.stringify({ variance, zoneIndicator, zoneIndicator2, errors }, null, 2))
  await browser.close()
}

main().catch((e) => { console.error('SMOKE FAILED', e); process.exit(1) })