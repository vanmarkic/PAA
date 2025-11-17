# Documentation E2E Tests with Playwright

This directory contains end-to-end (E2E) tests for the PAA documentation site using Playwright. These tests serve as smoke tests and visual regression tests to catch issues before deployment.

## Test Suites

### 1. Static Pages (`static-pages.spec.ts`)
**Purpose**: Smoke tests for all static documentation pages

Tests include:
- Homepage loading and core content verification
- All main static pages (benefits, features, workflows, rules, comparison, developer, design-system, wizard, test-components)
- Basic accessibility checks (HTML lang attribute, heading hierarchy)
- Navigation functionality
- Visual regression snapshots for each page

**Run**: `npm run test:docs:smoke`

### 2. Dynamic Routes (`dynamic-routes.spec.ts`)
**Purpose**: Tests for dynamically generated pages using metadata

Tests include:
- Machine detail pages (`/machine/[id]`)
- Workflow detail pages (`/workflows/[id]`)
- Feature detail pages (`/features/[id]`)
- Category pages (`/category/[slug]`, `/features/category/[slug]`)
- Error handling for non-existent IDs
- Visual regression snapshots for sample pages from each category

**Run**: `npm run test:docs:smoke`

### 3. Visual Regression (`visual-regression.spec.ts`)
**Purpose**: Comprehensive visual regression testing with snapshots

Tests include:
- Homepage across different viewports (desktop, mobile, tablet)
- All core pages with full-page screenshots
- Interactive component states (navigation, wizard)
- Dark mode variations (if supported)
- Print styles
- Component showcase pages

**Run**: `npm run test:docs:visual`

**Update snapshots**: `npm run test:docs:visual:update`

### 4. Performance (`performance.spec.ts`)
**Purpose**: Performance benchmarks for documentation pages

Tests include:
- Page load time measurements
- Resource loading efficiency (CSS, JS, images)
- HTTP request count verification
- Web Vitals (LCP, FCP, TTI)
- Long-running JavaScript task detection
- Cache header verification
- Mobile performance testing

**Run**: `npm run test:docs:performance`

## Running Tests

### Prerequisites

1. Install Playwright browsers:
   ```bash
   npm run playwright:install
   ```

2. Build the documentation:
   ```bash
   npm run astro:build
   ```

### Local Testing

Run all tests:
```bash
npm run test:docs
```

Run smoke tests only:
```bash
npm run test:docs:smoke
```

Run visual regression tests:
```bash
npm run test:docs:visual
```

Run performance tests:
```bash
npm run test:docs:performance
```

Run tests with UI mode (interactive):
```bash
npm run test:docs:ui
```

Run tests in headed mode (see browser):
```bash
npm run test:docs:headed
```

Debug a specific test:
```bash
npm run test:docs:debug
```

View last test report:
```bash
npm run test:docs:report
```

## Visual Regression Testing

### How It Works

Visual regression tests capture screenshots of pages and compare them against baseline snapshots. Any visual changes will cause the test to fail, helping catch unintended UI changes.

### Snapshot Management

**Initial Setup** (first time only):
```bash
npm run test:docs:visual:update
```

This creates baseline snapshots in `tests/e2e/docs/__snapshots__/`.

**Updating Snapshots** (when UI intentionally changes):
```bash
npm run test:docs:visual:update
```

**Reviewing Failed Tests**:
1. Run tests: `npm run test:docs:visual`
2. If tests fail, view the report: `npm run test:docs:report`
3. The report shows:
   - Expected (baseline) screenshot
   - Actual (current) screenshot
   - Diff highlighting changes

### Snapshot Organization

Snapshots are organized by:
- Test file directory
- Test file name
- Browser/project (chromium, firefox, webkit, mobile)
- Platform (linux, darwin, win32)

Example path:
```
tests/e2e/docs/__snapshots__/
  static-pages.spec.ts-snapshots/
    homepage-chromium-linux.png
    benefits-chromium-linux.png
    ...
```

## CI/CD Integration

The tests run automatically in GitHub Actions on every push and pull request:

1. **Build Stage**: Documentation is built
2. **Test Stage**: Playwright tests run against the built docs
3. **Deploy Stage**: Only runs if tests pass (on master/main)

### CI Test Results

- Test reports are saved as artifacts (30 days retention)
- Failed visual regression snapshots are saved as artifacts (7 days retention)
- Smoke tests must pass for deployment to proceed
- Visual regression tests are informational (continue-on-error: true)

### Viewing CI Test Results

1. Go to the Actions tab in GitHub
2. Click on the workflow run
3. Download the `playwright-report` artifact
4. Extract and open `index.html` in a browser

## Configuration

Playwright configuration is in `/playwright.config.ts`:

- **Base URL**: Defaults to `http://localhost:4321` (Astro preview server)
- **Browsers**: Tests run on Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeouts**: 30s per test, 2 retries on CI
- **Workers**: 1 on CI (stability), 50% of cores locally (speed)
- **Screenshots**: Captured on failure
- **Videos**: Captured on retry
- **Traces**: Captured on first retry

## Best Practices

### Writing Tests

1. **Use semantic locators**: Prefer `role`, `label`, `text` over CSS selectors
2. **Wait for stability**: Use `waitForLoadState('networkidle')` before snapshots
3. **Disable animations**: Use `animations: 'disabled'` for consistent snapshots
4. **Handle dynamic content**: Use `maxDiffPixels` for pages with timestamps/random content
5. **Test mobile**: Include mobile viewport tests for responsive pages

### Maintaining Tests

1. **Update snapshots intentionally**: Only update when UI changes are expected
2. **Review diffs carefully**: Always review visual diffs before accepting changes
3. **Keep tests fast**: Avoid unnecessary waits, use parallel execution
4. **Document test intent**: Add clear test names and comments
5. **Handle flaky tests**: Increase timeout or add stability waits, don't disable tests

### Debugging Failures

1. **Local reproduction**:
   ```bash
   npm run test:docs:headed
   # or
   npm run test:docs:debug
   ```

2. **Check the report**:
   ```bash
   npm run test:docs:report
   ```

3. **Run specific test**:
   ```bash
   npx playwright test -g "homepage loads successfully"
   ```

4. **Update snapshots if change is expected**:
   ```bash
   npm run test:docs:visual:update
   ```

## Troubleshooting

### Tests fail with "baseURL not accessible"

**Solution**: Ensure the Astro preview server is running
```bash
npm run astro:preview
```

Or let Playwright start it automatically (configured in `playwright.config.ts`)

### Snapshots don't match on different OS

**Expected behavior**: Snapshots are platform-specific. CI uses Linux, so Linux snapshots are canonical.

### Tests are slow

**Solutions**:
- Run fewer browsers: `npx playwright test --project=chromium`
- Run specific test file: `npm run test:docs:smoke`
- Increase workers: Edit `playwright.config.ts`

### Visual tests fail with small pixel differences

**Solutions**:
- Check if fonts are loading correctly
- Verify images are fully loaded (use `waitForLoadState('networkidle')`)
- Increase `maxDiffPixels` threshold for pages with dynamic content

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Visual Regression Testing Guide](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)
