import { expect, test } from '@playwright/test'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { campusBuildings } from '../src/components/scenes/modules/campusData'

test.use({ reducedMotion: 'reduce', viewport: { width: 1512, height: 982 } })

test('clicking a visible campus roof selects that building through the canvas', async ({ page }) => {
  await page.goto('./#scene-lab')
  const lab = page.locator('#scene-lab')
  await lab.scrollIntoViewIfNeeded()
  await lab
    .locator('.scene-selector')
    .getByRole('button', { name: /园区三维/ })
    .click()
  await expect(lab.locator('.scene-lab-body')).toHaveAttribute('data-scene', 'campus')
  await expect(lab.locator('.scene-lab-body')).toHaveAttribute('data-status', 'ready', { timeout: 20000 })
  await lab.getByRole('button', { name: '重置三维视角', exact: true }).click()

  const canvas = lab.locator('.simulation-canvas canvas')
  await canvas.scrollIntoViewIfNeeded()
  const bounds = await canvas.boundingBox()
  expect(bounds).not.toBeNull()
  const building = campusBuildings.find((item) => item.id === 'campus-a01')!
  const record = lab.locator(`[data-object-id="${building.id}"]`)
  const details = lab.getByRole('region', { name: '选中对象详情' })
  await expect(record).toHaveAttribute('aria-pressed', 'false')
  await expect(details).toHaveCount(0)

  // Project the tallest building's unobstructed roof with the public scene's
  // reset camera. This exercises real pointer events and the renderer raycaster;
  // no list selection or browser-side scene hooks are involved.
  const aspect = bounds!.width / bounds!.height
  const fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(19)) * Math.max(1, 1.15 / aspect)))
  const camera = new PerspectiveCamera(fov, aspect, 0.1, 150)
  camera.position.set(19, 17, 24)
  camera.lookAt(0, 1, 0)
  camera.updateMatrixWorld()
  const roof = new Vector3(
    building.x,
    0.09 + building.floors * building.floorHeight + 0.06,
    building.z,
  ).project(camera)
  expect(Math.abs(roof.x)).toBeLessThan(1)
  expect(Math.abs(roof.y)).toBeLessThan(1)
  await page.mouse.click(
    bounds!.x + ((roof.x + 1) / 2) * bounds!.width,
    bounds!.y + ((1 - roof.y) / 2) * bounds!.height,
  )

  await expect(record).toHaveAttribute('aria-pressed', 'true')
  await expect(details.getByRole('heading', { name: building.name, exact: true })).toBeVisible()
  await expect(details).toContainText('建筑高度')
  await expect(details).toContainText('参数化概念模型')
})
