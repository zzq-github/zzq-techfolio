import { expect, test, type Locator, type Page } from '@playwright/test'

test.use({ reducedMotion: 'reduce', viewport: { width: 1512, height: 982 } })
test.setTimeout(60000)

async function openScene(page: Page, name: string, kind: string) {
  await page.goto('./#scene-lab')
  const lab = page.locator('#scene-lab')
  await lab.scrollIntoViewIfNeeded()
  await lab
    .locator('.scene-selector')
    .getByRole('button', { name: new RegExp(name) })
    .click()
  await expect(lab.locator('.scene-lab-body')).toHaveAttribute('data-scene', kind)
  await expect(lab.locator('.scene-lab-body')).toHaveAttribute('data-status', 'ready', { timeout: 20000 })
  await expect(lab.locator('.simulation-canvas canvas')).toHaveCount(1)
  return lab
}

function metric(lab: Locator, name: string) {
  return lab
    .locator('.scene-metrics > div')
    .filter({ has: lab.page().getByText(name, { exact: true }) })
    .locator('strong')
}

async function metricNumber(lab: Locator, name: string) {
  const text = await metric(lab, name).innerText()
  const number = Number(text.replaceAll(',', '').match(/-?\d+(?:\.\d+)?/)?.[0])
  expect(Number.isFinite(number), `A numeric result should be displayed for ${name}`).toBe(true)
  return number
}

async function captureExpanded(page: Page, lab: Locator, filename: string) {
  await lab.getByRole('button', { name: '展开场景', exact: true }).click()
  await expect(lab).toHaveAttribute('aria-modal', 'true')
  await lab.screenshot({ path: `tmp/scenario-upgrade/${filename}.png`, animations: 'disabled' })
  await page.keyboard.press('Escape')
  await expect(lab).toHaveAttribute('role', 'region')
}

test('bridge inspection can discover and review defects without animation, then reset the same canvas', async ({
  page,
}) => {
  const lab = await openScene(page, '桥梁巡检', 'uav')
  const canvas = await lab.locator('.simulation-canvas canvas').elementHandle()
  const records = lab.locator('.scene-object-list .scene-object')
  const coverage = lab.getByRole('progressbar', { name: '巡检覆盖' })
  const next = lab.getByRole('button', { name: '下一检查点', exact: true })
  await expect(lab.getByRole('button', { name: '开始巡检', exact: true })).toBeDisabled()
  await expect(coverage).toHaveAttribute('value', '0')
  await expect(records).toHaveCount(4)
  for (const record of await records.all()) await expect(record).toBeDisabled()

  await next.click()
  await expect(coverage).toHaveAttribute('value', '25')
  const deck = lab.locator('[data-object-id="bridge-deck-crack"]')
  await expect(deck).toBeEnabled()
  await expect(deck).toContainText('桥面裂缝')
  await deck.click()
  const details = lab.getByRole('region', { name: '选中对象详情' })
  await expect(details.getByRole('heading', { name: '桥面裂缝', exact: true })).toBeVisible()
  await expect(details).toContainText('预设示例')
  await expect(details).toContainText('非 AI 识别结果')
  await details.getByRole('button', { name: '标记已复核', exact: true }).click()
  await expect(deck).toContainText('已复核')
  await expect(metric(lab, '已复核')).toHaveText('1')

  const filters = lab.getByRole('group', { name: '病害状态筛选' })
  await filters.getByRole('button', { name: '已复核', exact: true }).click()
  await expect(records).toHaveCount(1)
  await filters.getByRole('button', { name: '全部', exact: true }).click()
  for (const progress of [50, 75, 100]) {
    await next.click()
    await expect(coverage).toHaveAttribute('value', String(progress))
  }
  await expect(next).toBeDisabled()
  await expect(metric(lab, '已发现')).toHaveText('4')
  await lab.locator('[data-object-id="bridge-girder-spall"]').click()
  await expect(details).toContainText('梁体混凝土剥落')
  await captureExpanded(page, lab, '02-bridge-defect-review')

  await lab.getByRole('button', { name: '恢复默认参数', exact: true }).click()
  await expect(coverage).toHaveAttribute('value', '0')
  await expect(metric(lab, '已发现')).toHaveText('0')
  await expect(metric(lab, '已复核')).toHaveText('0')
  await expect(details).toHaveCount(0)
  for (const record of await records.all()) await expect(record).toBeDisabled()
  await expect(next).toBeEnabled()
  expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true)
  await expect(lab.locator('.simulation-canvas canvas')).toHaveCount(1)
})

test('campus layers, building details and clipping survive expanded viewing and Escape', async ({ page }) => {
  const lab = await openScene(page, '园区三维', 'campus')
  const canvasLocator = lab.locator('.simulation-canvas canvas')
  const canvas = await canvasLocator.elementHandle()
  const buildings = lab.locator('.scene-object-list .scene-object')
  const firstBuilding = buildings.first()
  const buildingName = await firstBuilding.locator('strong').innerText()
  await firstBuilding.click()
  const details = lab.getByRole('region', { name: '选中对象详情' })
  await expect(details.getByRole('heading', { name: buildingName, exact: true })).toBeVisible()
  await expect(details).toContainText('建筑高度')
  await expect(details).toContainText('参数化概念模型')

  const buildingLayer = lab.getByRole('checkbox', { name: '建筑', exact: true })
  const roadLayer = lab.getByRole('checkbox', { name: '道路', exact: true })
  const greeneryLayer = lab.getByRole('checkbox', { name: '绿化', exact: true })
  const clipping = lab.getByRole('checkbox', { name: '楼层剖切', exact: true })
  await clipping.check()
  await expect(details).toContainText('半高剖切')
  await clipping.uncheck()
  await expect(details).toContainText('完整建筑')

  const fullView = await canvasLocator.screenshot()
  await roadLayer.uncheck()
  await greeneryLayer.uncheck()
  await expect(roadLayer).not.toBeChecked()
  await expect(greeneryLayer).not.toBeChecked()
  const hiddenLayersView = await canvasLocator.screenshot()
  expect(hiddenLayersView.equals(fullView), 'Hiding roads and greenery must change the rendered scene').toBe(
    false,
  )
  await roadLayer.check()
  await greeneryLayer.check()
  await buildingLayer.uncheck()
  await expect(details).toHaveCount(0)
  await expect(clipping).toBeDisabled()
  for (const building of await buildings.all()) await expect(building).toBeDisabled()
  await buildingLayer.check()
  await expect(firstBuilding).toBeEnabled()
  await firstBuilding.click()
  await clipping.check()
  const hour = lab.getByRole('slider', { name: '日照时刻' })
  await hour.focus()
  await hour.press('ArrowRight')
  await expect(hour).toHaveValue('15')
  await expect(metric(lab, '示意时刻')).toHaveText('15:00')

  const expand = lab.getByRole('button', { name: '展开场景', exact: true })
  await captureExpanded(page, lab, '04-campus-building-section')
  await expect(expand).toBeFocused()
  await expect(clipping).toBeChecked()
  await expect(firstBuilding).toHaveAttribute('aria-pressed', 'true')
  await expect(hour).toHaveValue('15')
  await expect(details).toContainText('半高剖切')
  expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true)
  await expect(canvasLocator).toHaveCount(1)
})

test('earthwork design elevation changes cut and fill results and progress changes the construction surface', async ({
  page,
}) => {
  const lab = await openScene(page, '土石方调配', 'earthwork')
  const elevation = lab.getByRole('slider', { name: '设计标高' })
  const initialCut = await metricNumber(lab, '挖方量')
  const initialFill = await metricNumber(lab, '填方量')
  await elevation.focus()
  await elevation.press('End')
  await expect(elevation).toHaveValue('30')
  await expect.poll(() => metricNumber(lab, '挖方量')).toBeLessThan(initialCut)
  await expect.poll(() => metricNumber(lab, '填方量')).toBeGreaterThan(initialFill)
  await lab.getByRole('button', { name: '恢复默认参数', exact: true }).click()
  await expect(elevation).toHaveValue('18')

  const progress = lab.getByRole('slider', { name: '施工进度' })
  await progress.focus()
  await progress.press('End')
  await expect(metric(lab, '施工完成')).toHaveText('100%')
  const completeView = await lab.locator('.simulation-canvas canvas').screenshot()
  await progress.press('Home')
  await expect(metric(lab, '施工完成')).toHaveText('0%')
  const originalView = await lab.locator('.simulation-canvas canvas').screenshot()
  expect(originalView.equals(completeView), 'Construction progress must change the terrain rendering').toBe(
    false,
  )
  await progress.press('End')
  for (let i = 0; i < 25; i++) await progress.press('ArrowLeft')
  await expect(progress).toHaveValue('75')
  await expect(metric(lab, '施工完成')).toHaveText('75%')
  await expect(lab.getByRole('button', { name: '播放施工过程', exact: true })).toBeDisabled()
  await lab.getByRole('checkbox', { name: '叠加原始地形', exact: true }).check()
  await lab.locator('.scene-object-list .scene-object').first().click()
  await expect(lab.getByRole('region', { name: '选中对象详情' })).toContainText('施工过程')
  await captureExpanded(page, lab, '01-earthwork-cut-fill-progress')
})

test('connected flood analysis changes affected buildings between low water and overtopping while an isolated basin stays dry', async ({
  page,
}) => {
  const lab = await openScene(page, '水利孪生', 'water-twin')
  const presets = lab.getByRole('group', { name: '水位情景' })
  await presets.getByRole('button', { name: '低水位', exact: true }).click()
  await expect(lab.getByRole('slider', { name: '分析水位' })).toHaveValue('8')
  await expect(metric(lab, '当前水位')).toHaveText('8m')
  const lowArea = await metricNumber(lab, '淹没面积')
  const lowAffected = await metricNumber(lab, '受影响建筑')
  await lab.locator('[data-object-id="water-basin"]').click()
  const details = lab.getByRole('region', { name: '选中对象详情' })
  await expect(details).toContainText('未连通')
  await expect(details).toContainText('保持干燥')
  await lab.getByRole('button', { name: '返回场景全览', exact: true }).click()
  await captureExpanded(page, lab, '03a-water-low-level')

  await presets.getByRole('button', { name: '漫坝情景', exact: true }).click()
  await expect(lab.getByRole('slider', { name: '分析水位' })).toHaveValue('28')
  await expect(metric(lab, '当前水位')).toHaveText('28m')
  await expect.poll(() => metricNumber(lab, '淹没面积')).toBeGreaterThan(lowArea)
  await expect.poll(() => metricNumber(lab, '受影响建筑')).toBeGreaterThan(lowAffected)
  await expect(lab.locator('.scene-event')).toContainText('上下游已连通')
  const affected = lab.locator('.scene-object-list .scene-object.is-affected')
  expect(await affected.count()).toBeGreaterThan(0)
  await affected.first().click()
  await expect(details).toContainText('已受淹')
  await expect(details).toContainText('首层水深')
  await lab.locator('[data-object-id="water-basin"]').click()
  await expect(details).toContainText('未连通')
  await expect(details).toContainText('保持干燥')
  await lab.getByRole('button', { name: '返回场景全览', exact: true }).click()
  await captureExpanded(page, lab, '03b-water-overtopping')
})
