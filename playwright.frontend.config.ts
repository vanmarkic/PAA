import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for React frontend E2E tests
 * Tests the main user-facing application at http://localhost:5173
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e/frontend',

  // Maximum time one test can run for
  timeout: 60 * 1000,

  // Test directory patterns
  testMatch: /.*\.spec\.ts/,

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
    ['html', { outputFolder: 'playwright-report-frontend', open: 'never' }],
    ['json', { outputFile: 'playwright-report-frontend/results.json' }],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests - supports local development and deployed versions
    // Local: http://localhost:5173 (Vite dev server)
    // Deployed: Set PLAYWRIGHT_FRONTEND_URL environment variable
    baseURL: process.env.PLAYWRIGHT_FRONTEND_URL || 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot configuration - capture at key moments
    screenshot: 'on',

    // Video on first retry
    video: 'retain-on-failure',

    // Viewport size for desktop
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
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

  // Run local dev server before starting tests (only when not in CI and no custom URL)
  webServer: process.env.CI || process.env.PLAYWRIGHT_FRONTEND_URL ? undefined : {
    command: 'cd frontend && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
