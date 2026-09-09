import { test, expect } from '@playwright/test'

test('globe supports pause, reset, reduced motion and offscreen suspension', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('./')
  const visual = page.locator('.globe-visual')
  const globe = page.locator('.globe-webgl')
  await expect(visual).toHaveAttribute('data-renderer', 'webgl')
  await expect(globe).toHaveCSS('opacity', '1')
  await page.getByRole('button', { name: '暂停地球动画', exact: true }).click()
  await expect(globe).toHaveAttribute('data-playback', 'paused')
  const capture = () =>
    globe.screenshot({
      style:
        '.scene-tag, .globe-origin, .globe-tools, .scene-label, .scene-footer { visibility: hidden !important; }',
    })
  const pausedImage = await capture()
  // Verify actual rendered pixels stay still, including the orbit markers.
  await page.waitForTimeout(220)
  expect((await capture()).equals(pausedImage)).toBe(true)
  await page.getByRole('button', { name: '继续地球动画', exact: true }).click()
  await expect(globe).toHaveAttribute('data-playback', 'playing')
  await page.waitForTimeout(250)
  await page.getByRole('button', { name: '暂停地球动画', exact: true }).click()
  expect((await capture()).equals(pausedImage)).toBe(false)
  await page.getByRole('button', { name: '重置地球视角', exact: true }).click()
  await expect(globe).toHaveAttribute('data-playback', 'paused')
  await expect(page.locator('.globe-origin')).toBeVisible()
  await page.getByRole('button', { name: '继续地球动画', exact: true }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(globe).toHaveAttribute('data-playback', 'paused')
  await expect(page.getByRole('button', { name: '暂停地球动画', exact: true })).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(globe).toHaveAttribute('data-playback', 'playing')
  await page.locator('#main-navigation').getByRole('link', { name: '经历', exact: true }).click()
  await expect(globe).toHaveAttribute('data-playback', 'paused')
})

test('a lost graphics context returns to the local map without breaking navigation', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await expect(page.locator('.globe-visual')).toHaveAttribute('data-renderer', 'webgl')
  await page.locator('.globe-webgl canvas').evaluate((node) => {
    const gl = (node as HTMLCanvasElement).getContext('webgl2')!
    const extension = gl.getExtension('WEBGL_lose_context')
    if (!extension) throw new Error('The test browser must support context loss simulation')
    extension.loseContext()
  })
  await expect(page.locator('.globe-visual')).toHaveAttribute('data-renderer', 'fallback')
  await expect(page.locator('.globe-visual canvas')).toHaveCount(1)
  await expect(page.locator('.globe-tools')).toHaveCount(0)
  await expect(page.locator('.globe-visual canvas')).toBeVisible()
  await page.getByRole('link', { name: '探索我的项目', exact: true }).click()
  await expect(page).toHaveURL(/#projects$/)
  expect(errors).toEqual([])
})

test('a blocked land request keeps the lit globe and controls available', async ({ page }) => {
  await page.route('**/data/land-110m.geojson', (route) => route.abort())
  await page.goto('./')
  await expect(page.locator('.globe-visual')).toHaveAttribute('data-renderer', 'webgl')
  await expect(page.getByRole('button', { name: '重置地球视角', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.getByRole('button', { name: 'Reset globe view', exact: true })).toBeVisible()
})

test('unavailable WebGL leaves a visible static globe and working page controls', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2') return null
      return getContext.apply(this, [type, ...args] as Parameters<typeof getContext>)
    } as typeof getContext
  })
  await page.goto('./')
  await expect(page.locator('.globe-visual')).toHaveAttribute('data-renderer', 'fallback')
  await expect(page.locator('.globe-visual canvas')).toBeVisible()
  await expect(page.locator('.globe-tools')).toHaveCount(0)
  await page.getByRole('combobox', { name: '外观主题' }).selectOption('light')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('link', { name: '探索我的项目', exact: true }).click()
  await expect(page).toHaveURL(/#projects$/)
})

test('mobile globe and controls fit both themes without capturing touch scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.locator('.globe-visual')).toHaveAttribute('data-renderer', 'webgl')
  for (const theme of ['light', 'dark']) {
    await page.getByRole('combobox', { name: '外观主题' }).selectOption(theme)
    await page.locator('.spatial-scene').scrollIntoViewIfNeeded()
    await expect(page.locator('.globe-webgl')).toHaveCSS('opacity', '1')
    const box = await page.locator('.globe-tools').boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    await expect(page.locator('.spatial-scene')).toHaveCSS('touch-action', 'auto')
    await expect(page.locator('.globe-visual')).toHaveCSS('pointer-events', 'none')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    await page.screenshot({ path: `tmp/globe-upgrade/mobile-${theme}.png` })
  }
})
