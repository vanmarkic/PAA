import { test, expect, devices } from '@playwright/test';
import { HomePage, WorkflowDetailPage, BenefitsPage, ComparisonPage } from '../helpers/pages';
import { captureScreenshot } from '../helpers/screenshot-helper';

/**
 * Responsive Layout Testing
 *
 * Tests UI across different viewport sizes to ensure:
 * - Mobile-friendly layouts
 * - Proper responsive breakpoints
 * - Navigation menu adaptations
 * - Content reflow and readability
 * - Touch-friendly interactive elements
 *
 * Tests run on both desktop and mobile viewports
 */

test.describe('Responsive Layout: Desktop vs Mobile', () => {
  const viewports = [
    { name: 'Desktop HD', width: 1920, height: 1080 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const viewport of viewports) {
    test(`Homepage layout: ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const homePage = new HomePage(page);
      await homePage.goto();
      await page.waitForLoadState('networkidle');

      // Capture full page
      await captureScreenshot(page, `homepage-${viewport.name.toLowerCase().replace(' ', '-')}`, {
        testName: 'responsive-layout',
        playwrightOptions: { fullPage: true }
      });

      // Verify workflows are visible
      const hasWorkflows = await homePage.hasWorkflows();
      expect(hasWorkflows).toBeTruthy();

      // Check if navigation is adapted for viewport
      const isMobile = viewport.width < 768;
      if (isMobile) {
        // Mobile should have hamburger menu or compact navigation
        const mobileMenu = page.locator(
          '[data-testid="mobile-menu"], [aria-label*="menu" i], button[class*="menu" i]'
        ).first();
        console.log(`${viewport.name}: Mobile menu present: ${await mobileMenu.isVisible().catch(() => false)}`);
      }
    });
  }
});

test.describe('Responsive Layout: Navigation Menu', () => {
  test('Desktop navigation: Full menu visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'navigation-desktop-full', {
      testName: 'responsive-layout'
    });

    // Check for desktop navigation items
    const nav = page.locator('nav, [role="navigation"]').first();
    const isVisible = await nav.isVisible();
    expect(isVisible).toBeTruthy();

    // Capture navigation area
    if (isVisible) {
      await expect(nav).toHaveScreenshot('navigation-desktop.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('Mobile navigation: Hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'navigation-mobile-closed', {
      testName: 'responsive-layout'
    });

    // Look for mobile menu button
    const mobileMenuButton = page.locator(
      '[data-testid="mobile-menu-button"], [aria-label*="menu" i], button[class*="mobile" i]'
    ).first();

    const buttonVisible = await mobileMenuButton.isVisible().catch(() => false);
    if (buttonVisible) {
      // Capture closed state
      await expect(mobileMenuButton).toHaveScreenshot('mobile-menu-button.png');

      // Click to open
      await mobileMenuButton.click();
      await page.waitForTimeout(500); // Animation time

      await captureScreenshot(page, 'navigation-mobile-open', {
        testName: 'responsive-layout'
      });

      // Capture open menu
      const openMenu = page.locator('[role="menu"], [class*="mobile-menu" i]').first();
      if (await openMenu.isVisible().catch(() => false)) {
        await expect(openMenu).toHaveScreenshot('mobile-menu-open.png');
      }
    }
  });

  test('Tablet navigation: Hybrid layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'navigation-tablet', {
      testName: 'responsive-layout',
      playwrightOptions: { fullPage: true }
    });

    const nav = page.locator('nav, [role="navigation"]').first();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('navigation-tablet.png', {
        maxDiffPixels: 50,
      });
    }
  });
});

test.describe('Responsive Layout: Workflow Grid', () => {
  test('Desktop: Multi-column workflow grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'workflow-grid-desktop', {
      testName: 'responsive-layout'
    });

    // Count workflow cards in first row
    const workflowCards = page.locator('[data-testid="workflow-card"], .workflow-card, [class*="card"]');
    const count = await workflowCards.count();
    console.log(`Desktop: ${count} workflow cards visible`);

    // Desktop should show multiple columns (typically 2-3)
    expect(count).toBeGreaterThan(1);
  });

  test('Mobile: Single-column workflow grid', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'workflow-grid-mobile', {
      testName: 'responsive-layout'
    });

    // On mobile, cards should stack vertically
    const workflowCards = page.locator('[data-testid="workflow-card"], .workflow-card, [class*="card"]');
    const count = await workflowCards.count();
    console.log(`Mobile: ${count} workflow cards visible`);

    expect(count).toBeGreaterThan(0);
  });

  test('Responsive grid: Breakpoint transitions', async ({ page }) => {
    const homePage = new HomePage(page);

    // Test at each breakpoint
    const breakpoints = [
      { width: 1920, name: 'xl' },
      { width: 1280, name: 'lg' },
      { width: 1024, name: 'md' },
      { width: 768, name: 'sm' },
      { width: 375, name: 'xs' },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: 720 });
      await homePage.goto();
      await page.waitForLoadState('networkidle');

      await captureScreenshot(page, `grid-breakpoint-${breakpoint.name}`, {
        testName: 'responsive-layout'
      });

      const workflowCount = await homePage.getWorkflowCount();
      console.log(`Breakpoint ${breakpoint.name} (${breakpoint.width}px): ${workflowCount} workflows`);
    }
  });
});

test.describe('Responsive Layout: Content Reflow', () => {
  test('Workflow detail page: Desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const homePage = new HomePage(page);
    const workflowDetailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    const hasWorkflows = await homePage.hasWorkflows();
    if (hasWorkflows) {
      await homePage.clickWorkflowCard(0);
      await page.waitForLoadState('networkidle');

      await captureScreenshot(page, 'workflow-detail-desktop', {
        testName: 'responsive-layout',
        playwrightOptions: { fullPage: true }
      });

      await expect(page).toHaveScreenshot('workflow-detail-desktop-layout.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    }
  });

  test('Workflow detail page: Mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);
    const workflowDetailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    const hasWorkflows = await homePage.hasWorkflows();
    if (hasWorkflows) {
      await homePage.clickWorkflowCard(0);
      await page.waitForLoadState('networkidle');

      await captureScreenshot(page, 'workflow-detail-mobile', {
        testName: 'responsive-layout',
        playwrightOptions: { fullPage: true }
      });

      await expect(page).toHaveScreenshot('workflow-detail-mobile-layout.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });

      // Scroll to test mobile scrolling
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(300);

      await captureScreenshot(page, 'workflow-detail-mobile-scrolled', {
        testName: 'responsive-layout'
      });
    }
  });

  test('Benefits page: Responsive card layout', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await benefitsPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'benefits-desktop', {
      testName: 'responsive-layout',
      playwrightOptions: { fullPage: true }
    });

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await benefitsPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'benefits-mobile', {
      testName: 'responsive-layout',
      playwrightOptions: { fullPage: true }
    });
  });

  test('Comparison table: Horizontal scroll on mobile', async ({ page }) => {
    const comparisonPage = new ComparisonPage(page);

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await comparisonPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'comparison-mobile', {
      testName: 'responsive-layout'
    });

    // Check for horizontal scroll container
    const table = page.locator('table, [role="table"], [class*="comparison"]').first();
    if (await table.isVisible()) {
      // Capture table
      await expect(table).toHaveScreenshot('comparison-table-mobile.png', {
        maxDiffPixels: 100,
      });

      // Scroll horizontally if table is wider than viewport
      await page.evaluate(() => {
        const scrollable = document.querySelector('[class*="scroll"], .overflow-x-auto, table');
        if (scrollable) {
          scrollable.scrollLeft = 200;
        }
      });

      await page.waitForTimeout(300);

      await captureScreenshot(page, 'comparison-mobile-scrolled', {
        testName: 'responsive-layout'
      });
    }
  });
});

test.describe('Responsive Layout: Touch Targets', () => {
  test('Mobile: Touch target sizes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Check button sizes (should be at least 44x44px for touch)
    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();

    console.log(`Checking ${count} interactive elements for touch target size...`);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          console.log(`Element ${i}: ${box.width}x${box.height}px`);

          // Warn if touch target is too small
          if (box.width < 44 || box.height < 44) {
            console.warn(`⚠️  Touch target may be too small: ${box.width}x${box.height}px (recommended: 44x44px)`);
          }
        }
      }
    }

    await captureScreenshot(page, 'touch-targets-mobile', {
      testName: 'responsive-layout'
    });
  });

  test('Mobile: Tap interactions vs hover', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Simulate touch events
    const workflowCards = page.locator('[data-testid="workflow-card"], .workflow-card').first();
    if (await workflowCards.isVisible()) {
      // Tap on card
      await workflowCards.tap();
      await page.waitForTimeout(300);

      await captureScreenshot(page, 'mobile-tap-interaction', {
        testName: 'responsive-layout'
      });
    }
  });
});

test.describe('Responsive Layout: Orientation Changes', () => {
  test('Mobile: Portrait vs Landscape', async ({ page }) => {
    const homePage = new HomePage(page);

    // Portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'mobile-portrait', {
      testName: 'responsive-layout',
      playwrightOptions: { fullPage: true }
    });

    // Landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'mobile-landscape', {
      testName: 'responsive-layout',
      playwrightOptions: { fullPage: true }
    });
  });
});

test.describe('Responsive Layout: Text Readability', () => {
  test('Font sizes across viewports', async ({ page }) => {
    const homePage = new HomePage(page);

    const viewports = [
      { width: 1920, name: 'desktop-large' },
      { width: 1280, name: 'desktop' },
      { width: 768, name: 'tablet' },
      { width: 375, name: 'mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: 720 });
      await homePage.goto();
      await page.waitForLoadState('networkidle');

      // Check heading font sizes
      const heading = page.locator('h1, h2').first();
      if (await heading.isVisible()) {
        const fontSize = await heading.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });
        console.log(`${viewport.name}: Heading font size = ${fontSize}`);
      }

      // Check body text font sizes
      const bodyText = page.locator('p, div').first();
      if (await bodyText.isVisible()) {
        const fontSize = await bodyText.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });
        console.log(`${viewport.name}: Body font size = ${fontSize}`);
      }

      await captureScreenshot(page, `typography-${viewport.name}`, {
        testName: 'responsive-layout'
      });
    }
  });
});
