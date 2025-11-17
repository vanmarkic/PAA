# E2E Testing Guide - PAA Frontend

Comprehensive Playwright E2E testing suite for the PAA (Plateforme d'Aide Administrative) React frontend application.

## Overview

This test suite provides end-to-end testing for the PAA React frontend, covering:

- **User Journey Tests**: Realistic scenarios simulating social workers and citizens
- **Visual Regression**: Component and page snapshots to detect visual changes
- **Responsive Layout**: Testing across desktop, tablet, and mobile viewports
- **UI Bug Detection**: Console errors, layout shifts, and accessibility issues

## Test Structure

```
tests/e2e/frontend/
├── user-journeys/
│   ├── social-worker-journey.spec.ts    # Social worker searching for RIS info
│   └── citizen-journey.spec.ts          # Citizen exploring benefits
├── ui-regression/
│   ├── visual-regression.spec.ts        # Visual snapshots
│   └── responsive-layout.spec.ts        # Responsive design tests
├── helpers/
│   ├── screenshot-helper.ts             # Screenshot utilities
│   ├── fixtures.ts                      # Mock data & test constants
│   └── pages/                           # Page Object Models
│       ├── BasePage.ts
│       ├── HomePage.ts
│       ├── WorkflowDetailPage.ts
│       ├── BenefitsPage.ts
│       └── ComparisonPage.ts
└── __screenshots__/
    ├── desktop/                         # Desktop screenshots
    └── mobile/                          # Mobile screenshots
```

## Requirements

### User Journey Test Compliance

Both user journey tests meet the following requirements:

- ✅ **10+ Mouse Clicks**: Each test includes 11-15+ clicks
- ✅ **4+ Scrolls**: Each test includes 5-6 scroll actions
- ✅ **Desktop & Mobile**: Tests run on 5 different viewports
- ✅ **Screenshots**: 20+ screenshots captured per journey
- ✅ **Local & Deployed**: Configurable via environment variables

## Installation

```bash
# Install Playwright browsers (if not already installed)
npm run playwright:install

# Verify installation
npx playwright --version
```

## Running Tests

### All Frontend Tests

```bash
# Run all frontend E2E tests
npm run test:frontend

# Run with UI mode (interactive)
npm run test:frontend:ui

# Run in headed mode (see browser)
npm run test:frontend:headed

# View test report
npm run test:frontend:report
```

### Specific Test Suites

```bash
# User journey tests only
npx playwright test tests/e2e/frontend/user-journeys/ --config=playwright.frontend.config.ts

# Visual regression tests only
npx playwright test tests/e2e/frontend/ui-regression/visual-regression.spec.ts --config=playwright.frontend.config.ts

# Responsive layout tests only
npx playwright test tests/e2e/frontend/ui-regression/responsive-layout.spec.ts --config=playwright.frontend.config.ts
```

### Desktop vs Mobile

```bash
# Desktop browsers only (Chrome, Firefox, Safari)
npm run test:frontend:desktop

# Mobile browsers only (Mobile Chrome, Mobile Safari)
npm run test:frontend:mobile
```

### Debugging

```bash
# Debug mode with Playwright Inspector
npm run test:frontend:debug

# Run specific test in debug mode
npx playwright test tests/e2e/frontend/user-journeys/social-worker-journey.spec.ts --config=playwright.frontend.config.ts --debug
```

## Running Against Different Environments

### Local Development (Default)

By default, tests run against `http://localhost:5173` (Vite dev server).

The config will automatically start the Vite dev server if it's not running:

```bash
npm run test:frontend
```

### Deployed Version

To test against a deployed version, set the `PLAYWRIGHT_FRONTEND_URL` environment variable:

```bash
# Test against staging
PLAYWRIGHT_FRONTEND_URL=https://staging.paa.example.com npm run test:frontend

# Test against production
PLAYWRIGHT_FRONTEND_URL=https://paa.example.com npm run test:frontend
```

### CI/CD

In CI environments, the config detects `CI=true` and adjusts settings:

```bash
# .github/workflows/e2e-tests.yml
CI=true PLAYWRIGHT_FRONTEND_URL=${{ secrets.STAGING_URL }} npm run test:frontend
```

## Test Coverage

### User Journey Tests

#### Social Worker Journey (`social-worker-journey.spec.ts`)

Scenario: CPAS social worker helping client understand RIS eligibility

**Journey Steps (20 steps, 11+ clicks, 6+ scrolls):**

1. Load homepage
2. Verify workflows visible
3. Click search input
4. Type "RIS" search query
5. Scroll to filters
6. Open filter panel
7. Click category filter
8. Scroll through results
9. Click RIS workflow card
10. Verify workflow details
11. Scroll through states
12. Click legal references tab
13. Scroll legal references
14. Navigate to benefits page
15. View benefits content
16. Scroll benefits
17. Navigate to comparison
18. View comparison table
19. Scroll comparison
20. Return to homepage

**Screenshots**: 20 captured (numbered 01-20)

#### Citizen Journey (`citizen-journey.spec.ts`)

Scenario: Belgian citizen exploring available social benefits

**Journey Steps (15+ clicks, 5+ scrolls):**

1. Load homepage and browse workflows
2. Navigate to benefits guide
3. Read benefit details with scrolling
4. Open wizard tool
5. Explore wizard options
6. View developer documentation
7. Select multiple workflows for comparison
8. Analyze comparison table
9. Return home

**Screenshots**: 26+ captured

### Visual Regression Tests

**`visual-regression.spec.ts`** captures baseline screenshots for:

- Full page snapshots (homepage, workflow detail, benefits, comparison)
- Component snapshots (workflow cards, navigation header, buttons)
- Theme variations (light mode, dark mode)
- Multi-language layouts (French, Dutch)
- Search states (all results, filtered, empty)
- Loading states (skeleton screens)
- Interactive states (default, hover, active, disabled)
- Form elements (inputs, selects, checkboxes)

**Total**: 40+ visual regression tests

### Responsive Layout Tests

**`responsive-layout.spec.ts`** validates responsive design across:

**Viewports Tested:**
- Desktop HD (1920x1080)
- Desktop (1280x720)
- Tablet (768x1024)
- Mobile (375x667)

**Tests Include:**
- Navigation menu adaptations (full nav, hamburger menu, tablet hybrid)
- Workflow grid layouts (multi-column vs single-column)
- Content reflow (detail pages, benefits cards, comparison tables)
- Touch target sizes (minimum 44x44px for mobile)
- Orientation changes (portrait vs landscape)
- Typography scaling (font sizes across viewports)
- Horizontal scrolling for wide tables on mobile

**Total**: 25+ responsive tests

### UI Bug Detection

Built-in monitoring for:

- **Console Errors**: JavaScript errors logged to console
- **Page Errors**: Uncaught exceptions and promise rejections
- **Layout Shifts**: Cumulative Layout Shift (CLS) score measurement
- **Network Failures**: Failed API requests
- **Accessibility**: Basic ARIA and semantic HTML checks

## Screenshots

### Screenshot Organization

Screenshots are automatically organized by:

- **Device Type**: `desktop/` or `mobile/` folders
- **Test Name**: Grouped by test suite (e.g., `social-worker-journey`)
- **Step Number**: Sequential numbering (01, 02, 03...)
- **Timestamp**: YYYYMMDD-HHMMSS format

### Example Screenshot Paths

```
tests/e2e/frontend/__screenshots__/
├── desktop/
│   ├── 01-social-worker-journey-homepage-loaded-20250117-143052.png
│   ├── 02-social-worker-journey-search-results-ris-20250117-143053.png
│   └── ...
└── mobile/
    ├── 01-citizen-journey-homepage-loaded-20250117-143100.png
    ├── 02-citizen-journey-benefits-guide-20250117-143101.png
    └── ...
```

### Viewing Screenshots

Screenshots are captured automatically during test runs. To view them:

```bash
# Screenshots location
ls -la tests/e2e/frontend/__screenshots__/desktop/
ls -la tests/e2e/frontend/__screenshots__/mobile/

# Open in file browser
open tests/e2e/frontend/__screenshots__/

# View in HTML report
npm run test:frontend:report
```

## Page Object Models

The test suite uses Page Object Models (POM) for maintainable tests:

### Available Page Objects

- **`BasePage`**: Common navigation and interaction methods
- **`HomePage`**: Search, filter, browse workflows
- **`WorkflowDetailPage`**: View workflow details, states, legal references
- **`BenefitsPage`**: Browse benefits guide
- **`ComparisonPage`**: Compare multiple workflows

### Usage Example

```typescript
import { HomePage, WorkflowDetailPage } from '../helpers/pages';

test('example test', async ({ page }) => {
  const homePage = new HomePage(page);
  const detailPage = new WorkflowDetailPage(page);

  await homePage.goto();
  await homePage.searchForWorkflow('RIS');
  await homePage.clickWorkflowCard(0);

  const title = await detailPage.getWorkflowTitle();
  expect(title).toContain('RIS');
});
```

See `tests/e2e/frontend/helpers/README.md` for complete POM documentation.

## Test Utilities

### Screenshot Helper

**`screenshot-helper.ts`** provides utilities for organized screenshot capture:

```typescript
import { captureScreenshot } from '../helpers/screenshot-helper';

// Capture with step numbering
await captureScreenshot(page, 'description', {
  step: 1,
  testName: 'my-test'
});
// Output: 01-my-test-description-20250117-143052.png
```

See `tests/e2e/frontend/helpers/SCREENSHOT_HELPER.md` for full API documentation.

### Test Fixtures

**`fixtures.ts`** provides mock data and test constants:

```typescript
import fixtures from '../helpers/fixtures';

// Use mock workflows
const risWorkflow = fixtures.MOCK_WORKFLOW_RIS;

// Use mock users
const socialWorker = fixtures.MOCK_USERS.socialWorker;

// Use test constants
const timeout = fixtures.TEST_CONSTANTS.DEFAULT_TIMEOUT;
```

## Configuration

### Playwright Configuration

The frontend tests use **`playwright.frontend.config.ts`** (separate from docs tests).

Key settings:

```typescript
{
  testDir: './tests/e2e/frontend',
  timeout: 60000, // 60 seconds per test
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_FRONTEND_URL || 'http://localhost:5173',
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLAYWRIGHT_FRONTEND_URL` | Base URL for tests | `http://localhost:5173` |
| `CI` | CI environment flag | `false` |

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npm run playwright:install

      - name: Build frontend
        run: cd frontend && npm run build

      - name: Run E2E tests
        run: npm run test:frontend
        env:
          CI: true

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-frontend
          path: playwright-report-frontend/
          retention-days: 7

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: tests/e2e/frontend/__screenshots__/
          retention-days: 7
```

## Troubleshooting

### Tests Fail to Start

**Issue**: "Error: No tests found"

**Solution**:
```bash
# Verify config file exists
ls -la playwright.frontend.config.ts

# Check test directory
ls -la tests/e2e/frontend/
```

### Vite Dev Server Not Starting

**Issue**: "TimeoutError: Waiting for http://localhost:5173 failed"

**Solution**:
```bash
# Start Vite manually first
cd frontend && npm run dev

# Then run tests
npm run test:frontend
```

### Screenshots Not Captured

**Issue**: Screenshot folder is empty

**Solution**:
```bash
# Verify screenshot directory exists
ls -la tests/e2e/frontend/__screenshots__/

# Create folders if missing
mkdir -p tests/e2e/frontend/__screenshots__/{desktop,mobile}
```

### Visual Regression Differences

**Issue**: "Screenshot comparison failed: pixels differ"

**Solution**:
```bash
# Update baseline snapshots
npx playwright test --config=playwright.frontend.config.ts --update-snapshots
```

### Mobile Tests Failing

**Issue**: "Element not clickable" on mobile viewport

**Solution**: Check touch target sizes and ensure elements are properly responsive.

```typescript
// Increase viewport size if needed
await page.setViewportSize({ width: 375, height: 667 });

// Use tap() instead of click() for mobile
await element.tap();
```

### API Not Available

**Issue**: Tests fail because API is not running

**Solution**:
```bash
# Start backend API
npm run dev:api

# Run tests
npm run test:frontend
```

## Best Practices

### Writing New Tests

1. **Use Page Objects**: Don't write raw selectors in tests
   ```typescript
   // ✅ Good
   await homePage.searchForWorkflow('RIS');

   // ❌ Bad
   await page.fill('input[type="search"]', 'RIS');
   ```

2. **Wait for Network Idle**: Ensure pages fully load
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. **Capture Screenshots**: Document test steps
   ```typescript
   await captureScreenshot(page, 'step-description', {
     step: 1,
     testName: 'my-test'
   });
   ```

4. **Handle Dynamic Content**: Use appropriate waits
   ```typescript
   await page.waitForSelector('[data-testid="workflow-card"]');
   ```

5. **Test Both Viewports**: Ensure mobile and desktop work
   ```typescript
   test.use({ viewport: { width: 375, height: 667 } }); // Mobile
   ```

### Maintaining Tests

- Run tests regularly to catch regressions early
- Update page objects when UI changes
- Review and update snapshots when designs change intentionally
- Keep test data (fixtures) up to date with business rules
- Monitor test execution time and optimize slow tests

## Related Documentation

- **Page Objects**: `tests/e2e/frontend/helpers/README.md`
- **Screenshot Helper**: `tests/e2e/frontend/helpers/SCREENSHOT_HELPER.md`
- **Playwright Docs**: https://playwright.dev/
- **PAA Project**: `/home/user/PAA/CLAUDE.md`

## Support

For issues or questions about E2E tests:

1. Check this README and helper documentation
2. Review test examples in `user-journeys/`
3. Check Playwright documentation: https://playwright.dev/
4. Open an issue in the repository

---

**Last Updated**: 2025-01-17
**Playwright Version**: 1.56.1
**Test Coverage**: 90+ tests across 4 test files
