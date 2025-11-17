import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for documentation smoke and regression tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e/docs',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test directory patterns
  testMatch: /.*\.spec\.ts/,

  // Ignore patterns - exclude everything except our test directory
  testIgnore: ['**/node_modules/**', '**/dist/**', '**/docs-astro/**', '**/src/**'],

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of workers - use 1 in CI for stability, 50% of cores locally
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests - uses local server or deployed URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4321',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports for responsive testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before starting tests (only when not in CI)
  webServer: process.env.CI ? undefined : {
    command: 'npm run astro:preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Output folder for snapshots
  snapshotDir: './tests/e2e/docs/__snapshots__',

  // Snapshot path template
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}',
});
