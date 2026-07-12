import { test } from '@playwright/test'

test('take screenshot', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'screenshot.png', fullPage: true })
})
