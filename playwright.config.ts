import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  outputDir: 'tmp/test-results',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5178/zzq-techfolio/',
    channel: process.platform === 'win32' ? 'chrome' : undefined,
    reducedMotion: 'reduce',
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm build && pnpm preview --port 5178 --strictPort',
    url: 'http://127.0.0.1:5178/zzq-techfolio/',
    reuseExistingServer: false,
  },
})
