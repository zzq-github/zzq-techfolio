import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import ts from 'typescript'
import { en } from '../src/i18n/en'

test('every Chinese content string has an English translation', () => {
  const missing: string[] = []
  for (const path of ['src/data/profile.ts', 'src/components/scenes/sceneData.ts']) {
    const file = ts.createSourceFile(path, fs.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
    const visit = (node: ts.Node) => {
      if (ts.isStringLiteral(node) && /[\u3400-\u9fff]/.test(node.text) && !en[node.text])
        missing.push(node.text)
      ts.forEachChild(node, visit)
    }
    visit(file)
  }
  expect(missing).toEqual([])
})

test('language covers the whole page, project dialogs and all scene descriptions', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle(/Zhou Zhiqiang/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Zhou Zhiqiang/)
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
  expect((await page.locator('body').innerText()).replace('中文', '')).not.toMatch(/[\u3400-\u9fff]/)
  const details = page.getByRole('button', { name: /^View details of/ })
  await expect(details).toHaveCount(6)
  for (let i = 0; i < 6; i++) {
    await details.nth(i).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await page.getByRole('dialog').innerText()).not.toMatch(/[\u3400-\u9fff]/)
    await page.keyboard.press('Escape')
    await expect(details.nth(i)).toBeFocused()
  }
  for (const name of ['Earthworks', 'Bridge inspection', 'Offshore wind', 'Water twin', 'Campus']) {
    await page
      .locator('.scene-selector')
      .getByRole('button', { name: new RegExp(name, 'i') })
      .click()
    expect(await page.locator('.scene-lab').innerText()).not.toMatch(/[\u3400-\u9fff]/)
  }
  await page.reload()
  await expect(page.getByRole('button', { name: '切换为中文' })).toBeVisible()
  await page.getByRole('button', { name: '切换为中文' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('.hero-role')).toHaveText('AI 应用开发 · GIS 三维 · 全栈研发')
  expect(errors).toEqual([])
})

test('system theme tracks OS changes while explicit choices persist', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')
  const root = page.locator('html')
  const theme = page.getByRole('combobox', { name: '外观主题' })
  await expect(theme).toHaveValue('system')
  await expect(root).toHaveAttribute('data-theme', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(root).toHaveAttribute('data-theme', 'light')
  await theme.selectOption('dark')
  await page.reload()
  await expect(root).toHaveAttribute('data-theme', 'dark')
  await expect(theme).toHaveValue('dark')
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(root).toHaveAttribute('data-theme', 'dark')
  await theme.selectOption('light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(root).toHaveAttribute('data-theme', 'light')
  await theme.selectOption('system')
  await expect(root).toHaveAttribute('data-theme', 'dark')
})

test('saved theme is applied before React loads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => localStorage.setItem('techfolio.theme', 'light'))
  await page.route('**/assets/index-*.js', (route) => route.abort())
  await page.goto('./')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('#root')).toBeEmpty()
})

test('disabled storage does not break either preference', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage unavailable')
    }
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable')
    }
  })
  await page.goto('./')
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await page.getByRole('combobox', { name: 'Appearance' }).selectOption('light')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('language and theme changes preserve the current 3D scene and parameters', async ({ page }) => {
  await page.goto('./')
  await page
    .locator('.scene-selector')
    .getByRole('button', { name: /海上风电/ })
    .click()
  const range = page.locator('#scene-value-offshore-wind')
  await expect(range).toBeEnabled()
  for (let i = 0; i < 4; i++) await range.press('ArrowRight')
  await page
    .locator('.simulation-canvas canvas')
    .evaluate((canvas) => canvas.setAttribute('data-instance', 'original'))
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await page.getByRole('combobox', { name: 'Appearance' }).selectOption('light')
  await expect(range).toHaveValue('12')
  await expect(page.locator('.simulation-canvas canvas')).toHaveAttribute('data-instance', 'original')
  await expect(page.locator('.simulation-stage')).toHaveCSS('background-color', 'rgb(7, 19, 29)')
  await expect(page.locator('.spatial-scene')).toHaveCSS('background-color', 'rgb(6, 11, 16)')
  await expect(page.locator('.scene-camera-tools')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
})

test('both languages and appearances fit mobile, tablet and desktop layouts', async ({ page }) => {
  for (const width of [320, 390, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    for (const language of ['zh', 'en']) {
      if (language === 'en') await page.getByRole('button', { name: 'Switch to English' }).click()
      for (const theme of ['light', 'dark']) {
        await page.getByRole('combobox').selectOption(theme)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        )
        expect(overflow, `${width}px / ${language} / ${theme}`).toBe(false)
        const controls = page.locator('.preference-controls')
        const box = await controls.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      }
      if (width < 768) {
        await page.locator('.menu-button').click()
        await expect(page.locator('#main-navigation')).toBeVisible()
        await page.locator('#main-navigation a[href="#projects"]').click()
        await expect(page.locator('#main-navigation')).toBeHidden()
      }
    }
    // Reset for the next viewport because language intentionally persists across visits.
    await page.getByRole('button', { name: '切换为中文' }).click()
  }
})

test('published resource URLs have one base prefix and return their actual files', async ({
  page,
  request,
}) => {
  await page.goto('./')
  const urls = await page
    .locator('script[src], link[rel="icon"], link[rel="stylesheet"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src') ?? node.getAttribute('href')))
  for (const url of urls) {
    expect(url).toMatch(/^\/zzq-techfolio\/(?:assets\/|preferences\.js|favicon-3d\.png)/)
    expect(url).not.toContain('/zzq-techfolio/zzq-techfolio/')
    const response = await request.get(url!)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).not.toContain('text/html')
  }
  for (const asset of ['data/land-110m.geojson', 'atmosphere/terrain.svg']) {
    const response = await request.get('/zzq-techfolio/' + asset)
    expect(response.ok()).toBe(true)
    expect(await response.body()).toEqual(fs.readFileSync('public/' + asset))
  }
})

test('the retired PDF resume is absent from both languages and published files', async ({
  page,
  request,
}) => {
  expect(fs.existsSync('public/resume.pdf')).toBe(false)
  expect(fs.existsSync('dist/resume.pdf')).toBe(false)
  await page.goto('./')
  await expect(page.getByRole('link', { name: /简历|résumé|resume/i })).toHaveCount(0)
  await expect(page.locator('a[href*="resume.pdf"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: '探索我的项目', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click()
  await expect(page.getByRole('link', { name: /简历|résumé|resume/i })).toHaveCount(0)
  await expect(page.locator('a[href*="resume.pdf"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Explore my work', exact: true })).toBeVisible()
  // A static SPA preview may return its HTML fallback, but must never return the removed PDF.
  const response = await request.get('/zzq-techfolio/resume.pdf')
  expect(response.headers()['content-type'] ?? '').not.toContain('application/pdf')
  expect((await response.body()).subarray(0, 5).toString()).not.toBe('%PDF-')
})
