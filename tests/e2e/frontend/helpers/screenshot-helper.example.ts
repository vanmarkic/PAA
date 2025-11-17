/**
 * Screenshot Helper Usage Examples
 *
 * This file demonstrates various ways to use the screenshot-helper utility
 * in Playwright tests. These are example patterns, not runnable tests.
 *
 * To use these patterns in actual tests:
 * 1. Import the helper functions
 * 2. Call them in your test cases
 * 3. Screenshots will be automatically organized in __screenshots__/{desktop|mobile}/
 */

import { test, expect } from '@playwright/test';
import {
  captureScreenshot,
  captureFullPageScreenshot,
  captureResponsiveScreenshot,
  getTimestamp,
  formatStepNumber,
  createScreenshotPath,
} from './screenshot-helper';

/**
 * Example 1: Basic screenshot capture
 *
 * Captures a screenshot with automatic device type detection
 * and timestamp formatting.
 */
test.describe('Example 1: Basic Screenshot Capture', () => {
  test('capture homepage screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Capture screenshot - auto-detects device type from viewport
    // Example filename: homepage-20231215-143052.png
    const result = await captureScreenshot(page, 'homepage');

    console.log(`Screenshot saved to: ${result.fullPath}`);
    console.log(`Device type: ${result.deviceType}`);
    console.log(`Filename: ${result.filename}`);
  });
});

/**
 * Example 2: Sequential screenshots with step numbers
 *
 * Useful for documenting user journeys or workflows
 */
test.describe('Example 2: User Journey with Steps', () => {
  test('capture user journey flow', async ({ page }) => {
    await page.goto('/');

    // Step 1: Homepage
    // Example filename: 01-user-signup-homepage-20231215-143052.png
    await captureScreenshot(page, 'homepage', {
      step: 1,
      testName: 'user-signup',
    });

    // Step 2: Navigate to signup
    await page.click('text=Sign Up');
    await page.waitForLoadState('networkidle');

    // Example filename: 02-user-signup-signup-form-20231215-143052.png
    await captureScreenshot(page, 'signup-form', {
      step: 2,
      testName: 'user-signup',
    });

    // Step 3: Fill form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123');

    // Example filename: 03-user-signup-filled-form-20231215-143052.png
    await captureScreenshot(page, 'filled-form', {
      step: 3,
      testName: 'user-signup',
    });

    // Step 4: Confirmation
    await page.click('button:has-text("Create Account")');
    await page.waitForLoadState('networkidle');

    // Example filename: 04-user-signup-confirmation-20231215-143052.png
    await captureScreenshot(page, 'confirmation', {
      step: 4,
      testName: 'user-signup',
    });
  });
});

/**
 * Example 3: Full-page screenshots
 *
 * Captures entire page including content below the fold
 */
test.describe('Example 3: Full-Page Screenshots', () => {
  test('capture full-page screenshots for visual regression', async ({ page }) => {
    await page.goto('/');

    // Capture full page (includes scrollable content)
    // Example filename: homepage-full-page-20231215-143052.png
    const result = await captureFullPageScreenshot(page, 'homepage-full-page');

    expect(result.fullPath).toBeTruthy();
    expect(result.deviceType).toMatch(/^(desktop|mobile)$/);
  });
});

/**
 * Example 4: Force specific device type
 *
 * Override automatic device detection when needed
 */
test.describe('Example 4: Force Device Type', () => {
  test('capture same content as both desktop and mobile', async ({ page }) => {
    await page.goto('/');

    // Force desktop classification
    // Example filename: 01-responsive-test-desktop-view-20231215-143052.png
    const desktopResult = await captureScreenshot(page, 'desktop-view', {
      step: 1,
      testName: 'responsive-test',
      deviceType: 'desktop',
    });

    // Force mobile classification
    // Example filename: 02-responsive-test-mobile-view-20231215-143052.png
    const mobileResult = await captureScreenshot(page, 'mobile-view', {
      step: 2,
      testName: 'responsive-test',
      deviceType: 'mobile',
    });

    console.log(`Desktop: ${desktopResult.fullPath}`);
    console.log(`Mobile: ${mobileResult.fullPath}`);
  });
});

/**
 * Example 5: Responsive screenshots
 *
 * Capture same screenshot at multiple viewport sizes
 */
test.describe('Example 5: Responsive Screenshots', () => {
  test('capture at different viewports', async ({ page }) => {
    await page.goto('/');

    // Set viewport width and capture at both device types
    await page.setViewportSize({ width: 1200, height: 800 });

    const results = await captureResponsiveScreenshot(page, 'homepage', 1200, {
      step: 1,
      testName: 'responsive-test',
    });

    console.log(`Captured ${results.length} versions:`);
    results.forEach((result) => {
      console.log(`  - ${result.deviceType}: ${result.filename}`);
    });
  });
});

/**
 * Example 6: Screenshots with custom Playwright options
 *
 * Pass through Playwright-specific screenshot options
 */
test.describe('Example 6: Custom Playwright Options', () => {
  test('capture with custom options', async ({ page }) => {
    await page.goto('/');

    // Disable animations for consistent screenshots
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '* { animation: none !important; transition: none !important; }';
      document.head.appendChild(style);
    });

    // Capture with custom options
    const result = await captureScreenshot(page, 'no-animations', {
      testName: 'visual-regression',
      playwrightOptions: {
        fullPage: true,
        maskColor: '#FF00FF', // Highlight masked regions
        mask: [page.locator('[data-dynamic]')], // Mask dynamic content
        maxDiffPixels: 50, // Allow up to 50 pixel differences
      },
    });

    console.log(`Screenshot with custom options: ${result.filename}`);
  });
});

/**
 * Example 7: Screenshots without timestamps
 *
 * Useful when filename format should be more deterministic
 */
test.describe('Example 7: Screenshots Without Timestamps', () => {
  test('capture with fixed filenames', async ({ page }) => {
    await page.goto('/');

    // Example filename: 01-baseline-homepage.png (no timestamp)
    const result = await captureScreenshot(page, 'homepage', {
      step: 1,
      testName: 'baseline',
      includeTimestamp: false,
    });

    console.log(`Fixed filename: ${result.filename}`);
  });
});

/**
 * Example 8: Using helper utilities directly
 *
 * Lower-level utility functions for advanced use cases
 */
test.describe('Example 8: Direct Utility Usage', () => {
  test('use utility functions directly', async ({ page }) => {
    // Get current timestamp
    const timestamp = getTimestamp();
    console.log(`Current timestamp: ${timestamp}`);
    // Output: '20231215-143052'

    // Format step number
    const stepNum = formatStepNumber(5);
    console.log(`Formatted step: ${stepNum}`);
    // Output: '05'

    // Create path manually
    const pathConfig = createScreenshotPath('custom-screenshot', {
      step: 1,
      testName: 'manual-test',
      deviceType: 'desktop',
    });

    console.log(`Full path: ${pathConfig.fullPath}`);
    console.log(`Directory: ${pathConfig.directory}`);
    console.log(`Filename: ${pathConfig.filename}`);
  });
});

/**
 * Example 9: Error handling and async operations
 *
 * Proper error handling when capturing screenshots
 */
test.describe('Example 9: Error Handling', () => {
  test('handle screenshot errors gracefully', async ({ page }) => {
    try {
      await page.goto('/');

      const result = await captureScreenshot(page, 'test-page', {
        step: 1,
        testName: 'error-handling',
      });

      console.log(`Successfully captured: ${result.filename}`);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      throw error; // Re-throw to fail the test
    }
  });
});

/**
 * Example 10: Multi-step workflow with screenshots
 *
 * Complex workflow with screenshots at key points
 */
test.describe('Example 10: Complex Workflow', () => {
  test('complete e-commerce purchase flow', async ({ page }) => {
    const testName = 'ecommerce-purchase';

    // Step 1: Browse products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await captureScreenshot(page, 'product-listing', {
      step: 1,
      testName,
    });

    // Step 2: View product details
    await page.click('[data-product-id="123"]');
    await page.waitForLoadState('networkidle');
    await captureScreenshot(page, 'product-details', {
      step: 2,
      testName,
    });

    // Step 3: Add to cart
    await page.click('text=Add to Cart');
    await captureScreenshot(page, 'cart-confirmation', {
      step: 3,
      testName,
    });

    // Step 4: View cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await captureScreenshot(page, 'shopping-cart', {
      step: 4,
      testName,
    });

    // Step 5: Checkout
    await page.click('text=Proceed to Checkout');
    await page.waitForLoadState('networkidle');
    await captureScreenshot(page, 'checkout-page', {
      step: 5,
      testName,
    });

    // Step 6: Confirmation
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.click('text=Complete Purchase');
    await page.waitForLoadState('networkidle');
    await captureScreenshot(page, 'order-confirmation', {
      step: 6,
      testName,
    });
  });
});

/**
 * Example 11: Screenshots organized by test features
 *
 * Grouping screenshots by feature areas
 */
test.describe('Example 11: Feature-Based Screenshots', () => {
  test('capture authentication flow', async ({ page }) => {
    await captureScreenshot(page, 'login-form', {
      step: 1,
      testName: 'authentication-feature',
    });
  });

  test('capture payment processing', async ({ page }) => {
    await captureScreenshot(page, 'payment-form', {
      step: 1,
      testName: 'payment-feature',
    });
  });

  test('capture user profile', async ({ page }) => {
    await captureScreenshot(page, 'profile-page', {
      step: 1,
      testName: 'profile-feature',
    });
  });
});

/**
 * Example 12: Combining multiple features
 *
 * Advanced example combining multiple helper features
 */
test.describe('Example 12: Advanced Combinations', () => {
  test('complete visual regression test', async ({ page }) => {
    const testName = 'visual-regression';

    // Disable animations for consistency
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '* { animation: none !important; }';
      document.head.appendChild(style);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Full-page screenshot with step tracking
    const result = await captureFullPageScreenshot(page, 'homepage-full', {
      step: 1,
      testName,
      playwrightOptions: {
        mask: [page.locator('[data-timestamp]'), page.locator('[data-random]')],
      },
    });

    // Verify result
    expect(result.deviceType).toBe('desktop');
    expect(result.filename).toMatch(/^01-visual-regression-homepage-full-\d{8}-\d{6}\.png$/);
  });
});

export {};
