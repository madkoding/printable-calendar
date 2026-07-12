import { test } from '@playwright/test'

test('take screenshot', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas.canvas-page', { timeout: 10000 })
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas.canvas-page')
    if (!c) return false
    const ctx = (c as HTMLCanvasElement).getContext('2d')
    if (!ctx) return false
    const img = ctx.getImageData(0, 0, 1, 1)
    return img.data[3] !== 0
  }, { timeout: 10000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshot.png', fullPage: true })
})
