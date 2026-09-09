import { expect, test, type Locator, type Page } from '@playwright/test'
import { createBridgeScene } from '../src/components/scenes/modules/bridgeScene'
import { createEarthworkScene } from '../src/components/scenes/modules/earthworkScene'
import { createSceneSession } from '../src/components/scenes/sceneSession'
import type { SceneSnapshot } from '../src/components/scenes/sceneTypes'

test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } })

async function switchScene(lab: Locator, name: string, kind: string) {
  await lab
    .getByRole('group', { name: '选择模拟三维场景' })
    .getByRole('button', { name: new RegExp(name) })
    .click()
  await expect(lab.locator('.scene-lab-body')).toHaveAttribute('data-scene', kind)
  await expect(lab.locator('.scene-lab-body')).toHaveAttribute('data-status', 'ready', { timeout: 20000 })
}

async function openLab(page: Page) {
  await page.goto('./#scene-lab')
  const lab = page.locator('#scene-lab')
  await lab.scrollIntoViewIfNeeded()
  await expect(lab.locator('.scene-lab-body')).toHaveAttribute('data-status', 'ready', { timeout: 20000 })
  return lab
}

test('design surface never reports construction completion outside process mode', () => {
  let snapshot: SceneSnapshot = { metrics: [], objects: [] }
  const scene = createEarthworkScene((value) => (snapshot = value))
  const options = createSceneSession('earthwork')
  scene.update(options, 0, 0)
  expect(snapshot.progress).toBeUndefined()
  expect(snapshot.metrics).toContainEqual({ label: '当前显示', value: '设计完成面' })
  expect(snapshot.metrics.some(({ label }) => label === '施工完成')).toBe(false)
  expect(snapshot.metrics.map(({ label }) => label)).toEqual([
    '设计挖方总量',
    '设计填方总量',
    '设计余缺方量',
    '当前显示',
  ])

  scene.update({ ...options, mode: 'process', progress: 37 }, 0, 0)
  expect(snapshot.progress).toBe(37)
  expect(snapshot.metrics).toContainEqual({ label: '施工完成', value: 37, unit: '%' })
  scene.update({ ...options, mode: 'overview', progress: 37 }, 0, 0)
  expect(snapshot.progress).toBeUndefined()
  expect(snapshot.metrics).toContainEqual({ label: '当前显示', value: '原始地形' })
})

test('automatic bridge discoveries restore independently of manual checkpoint commands', () => {
  let snapshot: SceneSnapshot = { metrics: [], objects: [] }
  const scene = createBridgeScene((value) => (snapshot = value))
  const options = { ...createSceneSession('uav'), mode: 'process' as const, value: 150 }
  for (let tick = 0; tick < 2000 && snapshot.progress !== 100; tick++) {
    scene.update(options, tick / 10, 0.1)
  }
  expect(snapshot.progress).toBe(100)
  // No UI "next checkpoint" command was issued during automatic inspection.
  expect(options.progress).toBe(0)
  const foundIds = snapshot.objects.filter(({ status }) => status !== 'undiscovered').map(({ id }) => id)
  expect(foundIds).toHaveLength(4)

  let restoredSnapshot: SceneSnapshot = { metrics: [], objects: [] }
  const restored = createBridgeScene((value) => (restoredSnapshot = value))
  const restoredOptions = {
    ...options,
    paused: true,
    discoveredIds: foundIds,
    reviewedIds: [foundIds[0]],
    selectedId: foundIds[0],
  }
  restored.update(restoredOptions, 0, 0)
  expect(restoredSnapshot.progress).toBe(100)
  expect(restoredSnapshot.objects.filter(({ status }) => status === 'reviewed')).toHaveLength(1)
  expect(restored.focus?.(foundIds[0])).not.toBeNull()
  restored.update(restoredOptions, 0, 0)
  expect(restoredSnapshot.progress).toBe(100)

  restored.update({ ...createSceneSession('uav'), resetVersion: 1 }, 0, 0)
  expect(restoredSnapshot.progress).toBe(0)
  expect(restoredSnapshot.objects.every(({ status }) => status === 'undiscovered')).toBe(true)
})

test('scene switch keeps earthwork controls and selection; resetting one scene preserves the other', async ({
  page,
}) => {
  const lab = await openLab(page)
  const elevation = lab.getByRole('slider', { name: '设计标高' })
  await expect(lab.getByRole('slider', { name: '施工进度' })).toHaveCount(0)
  await expect(lab.locator('.scene-mode-summary')).toContainText('设计完成面')
  await elevation.focus()
  await elevation.press('End')
  await lab.getByRole('button', { name: '过程推演', exact: true }).click()
  const progress = lab.getByRole('slider', { name: '施工进度' })
  await progress.focus()
  await progress.press('End')
  await progress.press('ArrowLeft')
  await expect(progress).toHaveValue('99')
  await lab.getByRole('checkbox', { name: '叠加原始地形' }).check()
  const cut = lab.locator('[data-object-id="earthwork-cut"]')
  await cut.click()
  await expect(lab.getByRole('region', { name: '选中对象详情' })).toBeFocused()

  await switchScene(lab, '桥梁巡检', 'uav')
  await lab.getByRole('button', { name: '下一检查点', exact: true }).click()
  await expect(lab.getByRole('progressbar', { name: '巡检覆盖' })).toHaveAttribute('value', '25')
  await switchScene(lab, '土石方调配', 'earthwork')
  await expect(elevation).toHaveValue('30')
  await expect(progress).toHaveValue('99')
  await expect(lab.getByRole('button', { name: '过程推演', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(lab.getByRole('checkbox', { name: '叠加原始地形' })).toBeChecked()
  await expect(cut).toHaveAttribute('aria-pressed', 'true')
  // Restoring an old object must leave focus on the user's scene-selection control.
  await expect(lab.locator('.scene-selector').getByRole('button', { name: /土石方调配/ })).toBeFocused()
  await lab.getByRole('button', { name: '恢复默认参数', exact: true }).click()
  await expect(elevation).toHaveValue('18')
  await expect(progress).toHaveCount(0)
  await expect(lab.getByRole('region', { name: '选中对象详情' })).toHaveCount(0)
  await expect(lab.getByRole('checkbox', { name: '叠加原始地形' })).not.toBeChecked()
  await switchScene(lab, '桥梁巡检', 'uav')
  await expect(lab.getByRole('progressbar', { name: '巡检覆盖' })).toHaveAttribute('value', '25')
})

test('bridge review, filter and coverage survive a scene switch without losing keyboard focus', async ({
  page,
}) => {
  const lab = await openLab(page)
  await switchScene(lab, '桥梁巡检', 'uav')
  const next = lab.getByRole('button', { name: '下一检查点', exact: true })
  const coverage = lab.getByRole('progressbar', { name: '巡检覆盖' })
  await next.click()
  await expect(coverage).toHaveAttribute('value', '25')
  await next.click()
  await expect(coverage).toHaveAttribute('value', '50')
  await lab.locator('[data-object-id="bridge-deck-crack"]').click()
  const details = lab.getByRole('region', { name: '选中对象详情' })
  await expect(details).toBeFocused()
  await details.getByRole('button', { name: '标记已复核', exact: true }).click()
  const reviewed = details.getByRole('button', { name: '已复核', exact: true })
  await expect(reviewed).toBeFocused()
  await expect(reviewed).toHaveAttribute('aria-disabled', 'true')
  await lab
    .getByRole('group', { name: '病害状态筛选' })
    .getByRole('button', { name: '已复核', exact: true })
    .click()

  await switchScene(lab, '园区三维', 'campus')
  await switchScene(lab, '桥梁巡检', 'uav')
  await expect(coverage).toHaveAttribute('value', '50')
  await expect(lab.locator('.scene-object-list .scene-object')).toHaveCount(1)
  await expect(lab.locator('.scene-object-list .scene-object')).toHaveAttribute('aria-pressed', 'true')
  await expect(reviewed).toHaveAttribute('aria-disabled', 'true')
  await expect(next).toBeEnabled()
  await next.click()
  await expect(coverage).toHaveAttribute('value', '75')
  await next.click()
  await expect(coverage).toHaveAttribute('value', '100')
  await expect(next).toBeDisabled()
  await lab.getByRole('button', { name: '恢复默认参数', exact: true }).click()
  await expect(coverage).toHaveAttribute('value', '0')
  await expect(next).toBeEnabled()
  await expect(lab.locator('.scene-object-list .scene-object')).toHaveCount(4)
})

test('automatic inspection disables the next checkpoint at completion and restores completed coverage', async ({
  page,
}) => {
  test.setTimeout(90000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const lab = await openLab(page)
  await switchScene(lab, '桥梁巡检', 'uav')
  await lab.getByRole('button', { name: '展开场景', exact: true }).click()
  const speed = lab.getByRole('slider', { name: '巡航速度', exact: true })
  await speed.focus()
  await speed.press('End')
  await lab.getByRole('button', { name: '开始巡检', exact: true }).click()
  const coverage = lab.getByRole('progressbar', { name: '巡检覆盖' })
  await expect(coverage).toHaveAttribute('value', '100', { timeout: 70000 })
  await expect(lab.getByRole('button', { name: '下一检查点', exact: true })).toBeDisabled()
  await switchScene(lab, '园区三维', 'campus')
  await switchScene(lab, '桥梁巡检', 'uav')
  await expect(coverage).toHaveAttribute('value', '100')
  await expect(lab.getByRole('button', { name: '下一检查点', exact: true })).toBeDisabled()
  await expect(lab.getByRole('slider', { name: '巡航速度', exact: true })).toHaveValue('150')
})
