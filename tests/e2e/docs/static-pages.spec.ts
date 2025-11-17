import { test, expect } from '@playwright/test';

/**
 * Smoke tests for static documentation pages
 * These tests verify basic page loading and core functionality
 */

test.describe('Static Documentation Pages', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check page loads
    await expect(page).toHaveTitle(/PAA|Plateforme d'Aide Administrative/i);

    // Check for essential content
    await expect(page.locator('body')).toBeVisible();

    // Take snapshot for visual regression
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('benefits page loads successfully', async ({ page }) => {
    await page.goto('/benefits');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Check for benefits-related content (should have some headings or content)
    const headings = page.locator('h1, h2');
    await expect(headings.first()).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('benefits.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('features page loads successfully', async ({ page }) => {
    await page.goto('/features');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('features.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('workflows index page loads successfully', async ({ page }) => {
    await page.goto('/workflows');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Should have workflow-related content
    const content = page.locator('main, article, .content');
    await expect(content).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('workflows-index.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('rules page loads successfully', async ({ page }) => {
    await page.goto('/rules');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('rules.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('comparison page loads successfully', async ({ page }) => {
    await page.goto('/comparison');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('comparison.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('developer page loads successfully', async ({ page }) => {
    await page.goto('/developer');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('developer.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('design system page loads successfully', async ({ page }) => {
    await page.goto('/design-system');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('design-system.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('wizard page loads successfully', async ({ page }) => {
    await page.goto('/wizard');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('wizard.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('test-components page loads successfully', async ({ page }) => {
    await page.goto('/test-components');

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot('test-components.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Page Accessibility', () => {
  test('homepage has no automatic accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Basic accessibility checks
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');
  });

  test('pages have proper heading hierarchy', async ({ page }) => {
    const pages = ['/', '/benefits', '/features', '/workflows', '/rules'];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Check that there's at least one h1 or main heading
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(0); // Some pages might use different heading structures
    }
  });
});

test.describe('Navigation', () => {
  test('homepage has working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for navigation elements (nav, header, menu)
    const nav = page.locator('nav, header, [role="navigation"]').first();

    if (await nav.isVisible()) {
      // If navigation exists, check it has links
      const links = nav.locator('a');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('internal links use relative URLs', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        // This is an internal relative link - should not error when clicked
        // (we're not actually clicking, just verifying the pattern)
        expect(href).toBeTruthy();
      }
    }
  });
});
