import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for documentation pages
 * These tests capture and compare screenshots to detect unintended visual changes
 *
 * Run with: npm run test:docs:visual
 * Update snapshots with: npm run test:docs:visual:update
 */

test.describe('Visual Regression - Homepage', () => {
  test('homepage desktop view matches snapshot', async ({ page }) => {
    await page.goto('/');

    // Wait for any fonts or images to load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage mobile view matches snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage tablet view matches snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Core Pages', () => {
  const corePages = [
    { path: '/benefits', name: 'benefits' },
    { path: '/features', name: 'features' },
    { path: '/workflows', name: 'workflows' },
    { path: '/rules', name: 'rules' },
    { path: '/comparison', name: 'comparison' },
    { path: '/developer', name: 'developer' },
  ];

  for (const { path, name } of corePages) {
    test(`${name} page matches snapshot`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`${name}-page.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual Regression - Interactive Components', () => {
  test('navigation menu in different states', async ({ page }) => {
    await page.goto('/');

    // Snapshot of navigation in default state
    const nav = page.locator('nav, header').first();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('nav-default.png');

      // Try to find and open mobile menu if it exists
      const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300); // Wait for animation

        await expect(nav).toHaveScreenshot('nav-mobile-open.png');
      }
    }
  });

  test('wizard component states', async ({ page }) => {
    await page.goto('/wizard');
    await page.waitForLoadState('networkidle');

    // Take snapshot of initial wizard state
    await expect(page).toHaveScreenshot('wizard-initial.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // If there are interactive elements (buttons, forms), test them
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Suivant")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('wizard-step2.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

test.describe('Visual Regression - Dark Mode (if supported)', () => {
  test('homepage in dark mode', async ({ page }) => {
    await page.goto('/');

    // Try to enable dark mode if supported
    const darkModeToggle = page.locator('[aria-label*="dark" i], [aria-label*="theme" i]').first();

    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        animations: 'disabled',
      });
    } else {
      // Try to emulate dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('homepage-dark-emulated.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

test.describe('Visual Regression - Print Styles', () => {
  test('homepage print styles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    await expect(page).toHaveScreenshot('homepage-print.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Component Library', () => {
  test('test-components page matches snapshot', async ({ page }) => {
    await page.goto('/test-components');
    await page.waitForLoadState('networkidle');

    // This page likely showcases all components
    await expect(page).toHaveScreenshot('components-showcase.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('design-system page matches snapshot', async ({ page }) => {
    await page.goto('/design-system');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('design-system-showcase.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
