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

  const out = {}

  // Test E-key flow: aim the dome view at Project Galaxy (via the dev hook)
  // then press E to open the detail panel.
  const readState = () =>
    page.evaluate(() => window.__universe.useGame.getState())

  await page.waitForFunction(() => window.__universe && window.__universe.useGame && typeof window.__universe.faceZone === 'function' && !window.__universe.useGame.getState().loading, { timeout: 20000 })

  // aim at the project constellation: a node is auto-focused by the reticle
  await page.evaluate(() => window.__universe.faceZone('projects'))
  await page.waitForFunction(() => window.__universe.useGame.getState().activeInteraction?.type === 'project', { timeout: 8000 })
  await page.waitForTimeout(500)
  await page.keyboard.press('e')
  await page.waitForTimeout(700)
  const detailText = await page.getByText('VIEW ON GITHUB').count()
  out.eKeyOpensDetail = detailText > 0
  // close
  await page.getByLabel('Close').click()
  await page.waitForTimeout(300)
  out.detailClosed = (await readState()).projectDetail === null

  // Force open contact panel + project detail via store to validate UI
  await page.evaluate(() => {
    window.__universe.useGame.getState().setContactOpen(true)
  })
  await page.waitForTimeout(400)
  out.contactPanelOpens = (await page.getByText('CONTACT TERMINAL').count()) > 0

  // AI chat
  await page.getByPlaceholder('Ask the AI companion...').fill('Do you work remote?')
  await page.getByRole('button', { name: 'SEND' }).first().click()
  await page.waitForTimeout(900)
  out.aiAnswered = (await page.getByText(/remote|Remote|fully remote/i).count()) > 0

  // Contact form
  await page.getByPlaceholder('your@email.com').fill('test@y.com')
  await page.getByPlaceholder('Type your message here...').fill('Hello from smoke test')
  await page.getByRole('button', { name: 'TRANSMIT' }).click()
  await page.waitForTimeout(400)
  out.contactSent = (await page.getByText('MESSAGE TRANSMITTED').count()) > 0

  // Project detail via store
  await page.evaluate(() => {
    window.__universe.useGame.getState().setContactOpen(false)
    window.__universe.useGame.getState().setProjectDetail('bizen-ai')
  })
  await page.waitForTimeout(400)
  out.projectDetailOpens = (await page.getByText('Bizen.ai').count()) > 0
  out.projectGithubLink = (await page.locator('a[href*="github"]').count()) > 0

  // Switch to 2D mode
  await page.getByRole('button', { name: /2D/ }).click()
  await page.waitForTimeout(500)
  out.cv2d = (await page.getByText('SKILLS & TECH STACK').count()) > 0

  // Home button -> back to intro
  await page.getByRole('button', { name: /home/i }).click()
  await page.waitForTimeout(500)
  out.homeToIntro = (await page.getByText('THE DEVELOPER').count()) > 0

  console.log(JSON.stringify({ out, errors }, null, 2))
  await browser.close()
}

main().catch((e) => { console.error('SMOKE FAILED', e); process.exit(1) })