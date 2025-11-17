# Screenshot Helper Utility

A TypeScript utility for organizing and managing screenshots in Playwright end-to-end tests. Automatically handles viewport detection, timestamping, and organized file structure.

## Features

- **Automatic Device Detection**: Determines desktop vs. mobile based on viewport width
- **Timestamp Organization**: Adds YYYYMMDD-HHMMSS format timestamps to filenames
- **Step Numbering**: Support sequential screenshots with step numbers (01, 02, 03, etc.)
- **Organized Structure**: Automatically creates and manages desktop/mobile folders
- **TypeScript Types**: Full type safety with comprehensive interfaces
- **Flexible Naming**: Support for test names, screenshot names, and custom steps
- **Playwright Integration**: Uses Playwright's Page.screenshot() API directly
- **Responsive Support**: Capture screenshots at multiple viewports

## Installation

The screenshot helper is already available in the project. Simply import it:

```typescript
import { captureScreenshot } from './helpers/screenshot-helper';
```

## File Structure

Screenshots are automatically organized into:

```
tests/e2e/frontend/__screenshots__/
├── desktop/
│   ├── 01-homepage-load-20231215-143052.png
│   ├── 02-search-click-20231215-143052.png
│   └── ...
└── mobile/
    ├── 01-homepage-load-20231215-143100.png
    ├── 02-search-click-20231215-143100.png
    └── ...
```

## Basic Usage

### Simple Screenshot

```typescript
import { test } from '@playwright/test';
import { captureScreenshot } from './helpers/screenshot-helper';

test('capture homepage', async ({ page }) => {
  await page.goto('/');

  // Device type auto-detected from viewport
  // Filename: homepage-20231215-143052.png
  await captureScreenshot(page, 'homepage');
});
```

### Screenshot with Step Number

```typescript
test('user journey', async ({ page }) => {
  await page.goto('/');

  // Filename: 01-user-journey-homepage-20231215-143052.png
  await captureScreenshot(page, 'homepage', {
    step: 1,
    testName: 'user-journey'
  });

  await page.click('[data-button="search"]');

  // Filename: 02-user-journey-search-results-20231215-143052.png
  await captureScreenshot(page, 'search-results', {
    step: 2,
    testName: 'user-journey'
  });
});
```

### Full-Page Screenshot

```typescript
import { captureFullPageScreenshot } from './helpers/screenshot-helper';

test('capture full page', async ({ page }) => {
  await page.goto('/');

  // Captures entire page including scrollable content
  await captureFullPageScreensheet(page, 'homepage-full-page');
});
```

## API Reference

### Functions

#### `captureScreenshot(page, screenshotName, options?)`

Main function to capture a screenshot with automatic organization.

**Parameters:**
- `page` (Page): Playwright page object
- `screenshotName` (string): Name for the screenshot (e.g., 'homepage', 'search-results')
- `options` (ScreenshotOptions): Optional configuration

**Returns:** Promise<ScreenshotPath>

**Example:**
```typescript
const result = await captureScreenshot(page, 'homepage', {
  step: 1,
  testName: 'smoke-test'
});

console.log(result.fullPath);        // /absolute/path/to/screenshot.png
console.log(result.deviceType);      // 'desktop' or 'mobile'
console.log(result.filename);        // 'screenshot.png'
console.log(result.timestamp);       // '20231215-143052'
```

#### `captureFullPageScreenshot(page, screenshotName, options?)`

Convenience wrapper for full-page screenshots.

**Parameters:** Same as `captureScreenshot()`

**Returns:** Promise<ScreenshotPath>

**Example:**
```typescript
// Captures entire page including scrollable content
await captureFullPageScreenshot(page, 'homepage', {
  testName: 'visual-regression'
});
```

#### `captureResponsiveScreenshot(page, screenshotName, viewportWidth, options?)`

Capture screenshots at specific viewport width and save as both desktop/mobile.

**Parameters:**
- `page` (Page): Playwright page object
- `screenshotName` (string): Name for screenshot
- `viewportWidth` (number): Viewport width to test
- `options` (ScreenshotOptions): Optional configuration

**Returns:** Promise<ScreenshotPath[]>

**Example:**
```typescript
const results = await captureResponsiveScreenshot(page, 'homepage', 768, {
  testName: 'responsive-test'
});

// results[0] = desktop version
// results[1] = mobile version
```

#### `getTimestamp()`

Get current timestamp in YYYYMMDD-HHMMSS format.

**Returns:** string

**Example:**
```typescript
const timestamp = getTimestamp();
console.log(timestamp); // '20231215-143052'
```

#### `formatStepNumber(step)`

Format step number with leading zeros.

**Parameters:**
- `step` (number): Step number (1-indexed)

**Returns:** string

**Example:**
```typescript
formatStepNumber(1);   // '01'
formatStepNumber(10);  // '10'
formatStepNumber(100); // '100'
```

#### `detectDeviceType(page, options?)`

Determine device type based on viewport width.

**Parameters:**
- `page` (Page): Playwright page object
- `options` (optional):
  - `deviceTypeOverride` ('desktop' | 'mobile'): Force specific device type

**Returns:** Promise<'desktop' | 'mobile'>

**Example:**
```typescript
const deviceType = await detectDeviceType(page);
console.log(deviceType); // 'mobile' or 'desktop'
```

#### `createScreenshotPath(screenshotName, options)`

Create screenshot path configuration without capturing.

**Parameters:**
- `screenshotName` (string): Name for screenshot
- `options` (ScreenshotOptions & { deviceType }): Configuration

**Returns:** ScreenshotPath

**Example:**
```typescript
const pathConfig = createScreenshotPath('homepage', {
  step: 1,
  testName: 'test',
  deviceType: 'desktop'
});

console.log(pathConfig.fullPath);      // Absolute path
console.log(pathConfig.directory);     // Directory path
console.log(pathConfig.filename);      // Filename only
```

#### `ensureScreenshotDirectory(directoryPath)`

Create screenshot directory if it doesn't exist.

**Parameters:**
- `directoryPath` (string): Full path to directory

**Returns:** void

#### `buildScreenshotFilename(components, options?)`

Build filename from components without creating directory.

**Parameters:**
- `components` (string[]): Filename components to join
- `options` (ScreenshotOptions): Optional configuration

**Returns:** string

**Example:**
```typescript
const filename = buildScreenshotFilename(
  ['homepage'],
  { step: 1, testName: 'test' }
);
// Returns: '01-test-homepage-20231215-143052.png'
```

### Types

#### `ScreenshotOptions`

Configuration options for screenshot capture.

```typescript
interface ScreenshotOptions {
  step?: number;                    // Step number (1-indexed)
  testName?: string;                // Test name for grouping
  extension?: string;               // File extension (default: 'png')
  includeTimestamp?: boolean;       // Add timestamp (default: true)
  deviceType?: 'desktop' | 'mobile'; // Force device type
  playwrightOptions?: {             // Playwright screenshot options
    fullPage?: boolean;
    mask?: Locator[];
    maxDiffPixels?: number;
    // ... other Playwright options
  };
}
```

#### `ScreenshotPath`

Result configuration from screenshot capture.

```typescript
interface ScreenshotPath {
  fullPath: string;           // Absolute file path with filename
  directory: string;          // Directory containing screenshot
  filename: string;           // Filename with extension
  deviceType: 'desktop' | 'mobile'; // Detected device type
  timestamp: string;          // YYYYMMDD-HHMMSS format
}
```

## Device Type Detection

Device type is automatically determined based on viewport width:

| Viewport Width | Device Type |
|---|---|
| ≤ 768px | Mobile |
| > 768px | Desktop |

To override detection:

```typescript
// Force as mobile regardless of viewport
await captureScreenshot(page, 'homepage', {
  deviceType: 'mobile'
});

// Force as desktop regardless of viewport
await captureScreenshot(page, 'homepage', {
  deviceType: 'desktop'
});
```

## Filename Format

Filenames are automatically formatted with the following pattern:

```
[step-][testName-][screenshotName]-[timestamp].ext
```

**Examples:**

| Configuration | Filename |
|---|---|
| `captureScreenshot(page, 'homepage')` | `homepage-20231215-143052.png` |
| `captureScreenshot(page, 'homepage', { step: 1 })` | `01-homepage-20231215-143052.png` |
| `captureScreenshot(page, 'homepage', { testName: 'test' })` | `test-homepage-20231215-143052.png` |
| `captureScreenshot(page, 'homepage', { step: 1, testName: 'test' })` | `01-test-homepage-20231215-143052.png` |
| `captureScreenshot(page, 'homepage', { includeTimestamp: false })` | `homepage.png` |

## Common Patterns

### User Journey with Steps

```typescript
test('complete purchase flow', async ({ page }) => {
  const testName = 'purchase-flow';

  // Step 1: Browse products
  await page.goto('/products');
  await captureScreenshot(page, 'product-list', { step: 1, testName });

  // Step 2: View product
  await page.click('[data-product="123"]');
  await captureScreenshot(page, 'product-details', { step: 2, testName });

  // Step 3: Add to cart
  await page.click('[data-action="add-cart"]');
  await captureScreenshot(page, 'cart-added', { step: 3, testName });

  // Step 4: Checkout
  await page.goto('/checkout');
  await captureScreenshot(page, 'checkout', { step: 4, testName });

  // Step 5: Confirmation
  await page.click('[data-action="purchase"]');
  await captureScreenshot(page, 'confirmation', { step: 5, testName });
});
```

### Visual Regression Testing

```typescript
test('visual regression - homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Disable animations for consistent snapshots
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '* { animation: none !important; }';
    document.head.appendChild(style);
  });

  await captureFullPageScreenshot(page, 'homepage', {
    testName: 'visual-regression',
    playwrightOptions: {
      maxDiffPixels: 100, // Allow minor rendering differences
      mask: [page.locator('[data-dynamic]')] // Mask dynamic content
    }
  });
});
```

### Responsive Testing

```typescript
test('responsive design', async ({ page }) => {
  const testName = 'responsive';

  // Test at different viewport widths
  const viewports = [
    { name: 'mobile', width: 375 },
    { name: 'tablet', width: 768 },
    { name: 'desktop', width: 1920 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: 800 });
    await page.goto('/');

    await captureScreenshot(page, `homepage-${viewport.name}`, {
      testName
    });
  }
});
```

### Multi-Browser Testing

```typescript
test('multi-browser screenshot', async ({ page, browserName }) => {
  await page.goto('/');

  await captureScreenshot(page, `homepage-${browserName}`, {
    testName: 'multi-browser',
    step: 1
  });
});
```

## Best Practices

### 1. Use Descriptive Names

```typescript
// Good
await captureScreenshot(page, 'search-results-loaded', { step: 2 });

// Avoid
await captureScreenshot(page, 'screen2', { step: 2 });
```

### 2. Group Related Screenshots

```typescript
// Good - all part of same workflow
await captureScreenshot(page, 'homepage', { step: 1, testName: 'checkout' });
await captureScreenshot(page, 'cart', { step: 2, testName: 'checkout' });
await captureScreenshot(page, 'payment', { step: 3, testName: 'checkout' });
```

### 3. Wait for Page Stability

```typescript
// Good - wait for content to load
await page.goto('/');
await page.waitForLoadState('networkidle');
await captureScreenshot(page, 'homepage');

// Avoid - screenshot might catch loading state
await page.goto('/');
await captureScreenshot(page, 'homepage');
```

### 4. Disable Animations for Consistency

```typescript
// Good - consistent snapshots
await page.evaluate(() => {
  const style = document.createElement('style');
  style.textContent = '* { animation: none !important; }';
  document.head.appendChild(style);
});
await captureScreenshot(page, 'homepage');
```

### 5. Mask Dynamic Content

```typescript
// Good - mask timestamps and random content
await captureScreenshot(page, 'homepage', {
  playwrightOptions: {
    mask: [page.locator('[data-timestamp]'), page.locator('[data-random]')]
  }
});
```

### 6. Organize by Feature

```typescript
// Good - clear test organization
const testName = 'user-authentication';
await captureScreenshot(page, 'login-form', { step: 1, testName });
await captureScreenshot(page, 'error-message', { step: 2, testName });
```

## Troubleshooting

### Screenshots not being saved

**Check:**
1. Verify the `__screenshots__` directory exists
2. Check file permissions on the directory
3. Ensure page is fully loaded before capturing

```typescript
await page.waitForLoadState('networkidle');
await captureScreenshot(page, 'homepage');
```

### Inconsistent device type detection

**Solution:** Explicitly set device type

```typescript
// Instead of relying on auto-detection
await captureScreenshot(page, 'homepage', {
  deviceType: 'mobile' // Or 'desktop'
});
```

### Large file sizes

**Solution:** Use Playwright masking or compression options

```typescript
await captureScreenshot(page, 'homepage', {
  playwrightOptions: {
    // Only capture visible area, not full page
    fullPage: false
  }
});
```

### Timestamp collisions

**Solution:** Screenshots taken at same second will use millisecond precision in path

Note: This is rare and usually not a problem. If needed, add testName to ensure uniqueness:

```typescript
await captureScreenshot(page, 'homepage', {
  testName: 'unique-identifier'
});
```

## Integration with CI/CD

Screenshots are automatically saved to `tests/e2e/frontend/__screenshots__/{desktop|mobile}/`

To include screenshots in CI artifacts:

```yaml
# .github/workflows/e2e-tests.yml
- name: Upload screenshots
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: screenshots
    path: tests/e2e/frontend/__screenshots__/
    retention-days: 30
```

## See Also

- [Playwright Documentation](https://playwright.dev)
- [Screenshot Examples](./screenshot-helper.example.ts)
- [Main E2E Tests Documentation](../docs/README.md)
