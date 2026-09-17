const { chromium } = require('playwright-core')
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function main() {
  const browser = await chromium.launch({ executablePath: path })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

  await page.goto('http://localhost:5178/', { waitUntil: 'networkidle' })
  // wait for lazy scene chunk + font
  await page.waitForTimeout(4000)

  // Check intro is visible
  const introVisible = await page.getByText('THE DEVELOPER').first().isVisible().catch(() => false)

  // Click ENTER 3D WORLD
  await page.getByRole('button', { name: /ENTER 3D WORLD/ }).click()
  await page.waitForTimeout(2500)

  // check for zone title text (drei) won't be in DOM, but check canvas exists
  const canvasCount = await page.locator('canvas').count()

  // press W to move
  await page.keyboard.down('w')
  await page.waitForTimeout(600)
  await page.keyboard.up('w')

  // Press E to interact near landing beacon? Not guaranteed. Just screenshot.
  await page.screenshot({ path: 'smoke-1.png', fullPage: false })
  await page.waitForTimeout(500)

  // Test 2D mode toggle
  await page.getByRole('button', { name: /2D/ }).click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'smoke-2d.png', fullPage: false })
  const hasCvHeader = await page.getByText('SKILLS & TECH STACK').count()

  console.log(JSON.stringify({ introVisible, canvasCount, hasCvHeader, errors }, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error('SMOKE FAILED', e)
  process.exit(1)
})