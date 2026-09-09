import { expect, test } from '@playwright/test'

const cases = [
  {
    id: 'earthwork',
    zh: '土石方智慧控制调配系统',
    en: 'Smart Earthworks Dispatch System',
    role: '承担 Cesium 三维应用框架搭建',
    delivery: '坐标转换、空间范围解析与施工数据标准化。',
    disclosure: '不是该项目实景或交付验收材料',
  },
  {
    id: 'scholardog',
    zh: 'ScholarDog AI 智能教学助手',
    en: 'ScholarDog AI Teaching Assistant',
    role: '负责 AI 教学工具模块架构及核心开发',
    delivery: '流式消息连接、重连与保活机制。',
    disclosure: '不代表基础模型研发',
  },
  {
    id: 'micro-frontend',
    zh: '统一业务开放平台',
    en: 'Unified Business Platform',
    role: '负责微前端主应用架构与子应用开发模板',
    delivery: '可复用的子应用开发模板。',
    disclosure: '个人参与的架构与实现范围',
  },
]

for (const item of cases) {
  test(`${item.id} separates personal contributions and delivery boundaries in both languages`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('./#projects')
    const card = page.locator(`#project-${item.id}`)
    const opener = card.getByRole('button', { name: `查看${item.zh}详情`, exact: true })
    await opener.click()
    const dialog = page.getByRole('dialog')

    await expect(dialog.getByRole('heading', { name: item.zh, exact: true })).toBeVisible()
    await expect(dialog.getByRole('region', { name: /我的职责/ })).toContainText(item.role)
    await expect(
      dialog.getByRole('region', { name: /关键问题与实现/ }).getByRole('heading', { level: 4 }),
    ).toHaveCount(2)
    const deliverables = dialog.getByRole('region', { name: /交付内容/ })
    await expect(deliverables.getByRole('listitem')).toHaveCount(3)
    await expect(deliverables).toContainText(item.delivery)
    await expect(deliverables).toContainText(item.disclosure)
    await expect(dialog.locator('.modal-section > h3 > span')).toHaveText(['01', '02', '03', '04', '05'])
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()

    await page.getByRole('button', { name: 'Switch to English' }).click()
    await card.getByRole('button', { name: `View details of ${item.en}`, exact: true }).click()
    await expect(dialog.getByRole('region', { name: /My role/ })).toBeAttached()
    await expect(dialog.getByRole('region', { name: /Challenges and implementation/ })).toBeAttached()
    await expect(dialog.getByRole('region', { name: /Deliverables/ })).toBeAttached()
    expect(await dialog.innerText()).not.toMatch(/[\u3400-\u9fff]/)
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
    await page.keyboard.press('Escape')
  })
}

test('the other project dialogs retain their existing core-work structure', async ({ page }) => {
  await page.goto('./#projects')
  for (const id of ['uav', 'offshore-wind', 'water-twin']) {
    await page
      .locator(`#project-${id}`)
      .getByRole('button', { name: /^查看.+详情$/ })
      .click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: /核心工作/ })).toBeVisible()
    await expect(dialog.locator('.case-contribution')).toHaveCount(0)
    await expect(dialog.locator('.modal-section > h3 > span')).toHaveText(['01', '02', '03'])
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
})
