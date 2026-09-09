import { test, expect } from '@playwright/test'

test('email copy reports success and falls back to a usable address when denied', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          if (value !== '15096061897@163.com') throw new Error('Unexpected email')
        },
      },
    })
  })
  await page.goto('./#contact')
  const copy = page.getByRole('button', { name: '复制邮箱', exact: true })
  await copy.click()
  await expect(page.locator('.copy-status')).toHaveText('邮箱已复制，可以粘贴到邮件应用。')
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Denied', 'NotAllowedError')
        },
      },
    })
  })
  await copy.click()
  await expect(page.locator('.copy-status')).toContainText('暂时无法复制')
  await expect(page.getByRole('link', { name: '15096061897@163.com', exact: true })).toHaveAttribute(
    'href',
    'mailto:15096061897@163.com',
  )
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.locator('.copy-status')).toContainText('Copy unavailable')
})

test('case dialog exits accessibly and can take the visitor into the matching scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('./')
  const opener = page.getByRole('button', { name: '查看无人机桥梁智能巡检与三维可视化平台详情', exact: true })
  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: /业务场景/ })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: /技术路径/ })).toBeAttached()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  await expect(page.locator('body')).not.toHaveClass(/modal-open/)
  await opener.click()
  await dialog.getByRole('button', { name: '体验三维模拟', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('#scene-lab')).toBeFocused()
  await expect(page.locator('.scene-selector').getByRole('button', { name: /桥梁巡检/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect
    .poll(async () => page.locator('#scene-lab').evaluate((el) => Math.round(el.getBoundingClientRect().top)))
    .toBeGreaterThanOrEqual(0)
  await expect
    .poll(async () => page.locator('#scene-lab').evaluate((el) => Math.round(el.getBoundingClientRect().top)))
    .toBeLessThan(200)
})

test('parameter reset preserves the active canvas and camera reset preserves parameters', async ({
  page,
}) => {
  await page.goto('./#scene-lab')
  const slider = page.getByRole('slider', { name: '设计标高' })
  await expect(slider).toBeEnabled()
  const original = await page.locator('.simulation-canvas canvas').elementHandle()
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveValue('19')
  await page.getByRole('button', { name: '重置三维视角', exact: true }).click()
  await expect(slider).toHaveValue('19')
  await page.getByRole('button', { name: '恢复默认参数', exact: true }).click()
  await expect(slider).toHaveValue('18')
  await expect(page.getByRole('button', { name: '恢复默认参数', exact: true })).toBeDisabled()
  expect(await original!.evaluate((el) => el.isConnected)).toBe(true)
  await expect(page.locator('.simulation-canvas canvas')).toHaveCount(1)
})

test('featured previews load under the deployment base and formula examples remain bilingual', async ({
  page,
}) => {
  await page.goto('./#projects')
  const previews = page.locator('.project-preview img')
  await expect(previews).toHaveCount(2)
  for (const preview of await previews.all()) {
    await preview.scrollIntoViewIfNeeded()
    await expect
      .poll(() => preview.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true)
    await expect(preview).toHaveAttribute('src', /^\/zzq-techfolio\/previews\/.+\.webp$/)
  }
  const demo = page.getByRole('link', { name: '打开MathJax Beautiful在线演示', exact: true })
  await expect(demo).toHaveAttribute('href', 'https://zzq-github.github.io/mathjax-beautiful/')
  await expect(demo).toHaveAttribute('target', '_blank')
  await page.getByRole('button', { name: '欧拉恒等式', exact: true }).click()
  await expect(page.locator('.formula-result math')).toHaveAttribute('aria-label', 'e 的 i π 次方加一等于零')
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.locator('.formula-result math')).toHaveAttribute(
    'aria-label',
    'e to the power of i pi plus one equals zero',
  )
  await page.getByRole('button', { name: 'Integral', exact: true }).click()
  await expect(page.locator('.formula-preview code')).toContainText('frac')
})
