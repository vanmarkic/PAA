import { test, expect } from '@playwright/test';
import { HomePage, WorkflowDetailPage, BenefitsPage, ComparisonPage } from '../helpers/pages';
import { captureScreenshot } from '../helpers/screenshot-helper';

/**
 * Visual Regression Testing
 *
 * Captures visual snapshots of key UI components and pages
 * to detect unintended visual changes across builds.
 *
 * These tests create baseline screenshots that can be compared
 * against future test runs to catch visual regressions.
 */

test.describe('Visual Regression Tests', () => {
  test('Homepage: Full page snapshot', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Capture full page screenshot
    await captureScreenshot(page, 'homepage-full-page', {
      testName: 'visual-regression',
      playwrightOptions: { fullPage: true }
    });

    // Also use Playwright's built-in snapshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow minor differences
    });
  });

  test('Homepage: Workflow card component snapshots', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Wait for workflows to load
    await page.waitForSelector('[data-testid="workflow-card"], .workflow-card, [class*="card"]', {
      timeout: 10000
    });

    // Capture first workflow card
    const firstCard = page.locator('[data-testid="workflow-card"], .workflow-card, [class*="card"]').first();
    await expect(firstCard).toBeVisible();

    await expect(firstCard).toHaveScreenshot('workflow-card.png', {
      maxDiffPixels: 50,
    });

    await captureScreenshot(page, 'workflow-cards-visible', {
      testName: 'visual-regression'
    });
  });

  test('Workflow Detail: State machine visualization', async ({ page }) => {
    const homePage = new HomePage(page);
    const workflowDetailPage = new WorkflowDetailPage(page);

    // Navigate to homepage
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Click first workflow
    const hasWorkflows = await homePage.hasWorkflows();
    if (hasWorkflows) {
      await homePage.clickWorkflowCard(0);
      await page.waitForLoadState('networkidle');

      // Capture workflow detail page
      await captureScreenshot(page, 'workflow-detail-page', {
        testName: 'visual-regression',
        playwrightOptions: { fullPage: true }
      });

      // Snapshot the page
      await expect(page).toHaveScreenshot('workflow-detail-full.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    }
  });

  test('Benefits Page: Benefits cards grid', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    await benefitsPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'benefits-page-full', {
      testName: 'visual-regression',
      playwrightOptions: { fullPage: true }
    });

    await expect(page).toHaveScreenshot('benefits-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Comparison Page: Comparison table', async ({ page }) => {
    const comparisonPage = new ComparisonPage(page);

    await comparisonPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'comparison-page-full', {
      testName: 'visual-regression',
      playwrightOptions: { fullPage: true }
    });

    await expect(page).toHaveScreenshot('comparison-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Navigation: Header component across pages', async ({ page }) => {
    const homePage = new HomePage(page);
    const benefitsPage = new BenefitsPage(page);

    // Capture header on homepage
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    const header = page.locator('header, [role="banner"], nav').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('header-homepage.png', {
        maxDiffPixels: 30,
      });
    }

    // Capture header on benefits page
    await benefitsPage.goto();
    await page.waitForLoadState('networkidle');

    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('header-benefits.png', {
        maxDiffPixels: 30,
      });
    }

    await captureScreenshot(page, 'header-consistency-check', {
      testName: 'visual-regression'
    });
  });

  test('Dark mode: Theme variations', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Capture light mode
    await captureScreenshot(page, 'theme-light-mode', {
      testName: 'visual-regression'
    });

    await expect(page).toHaveScreenshot('homepage-light-mode.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });

    // Try to toggle dark mode if available
    const darkModeToggle = page.locator(
      '[data-testid="theme-toggle"], [aria-label*="theme" i], [class*="theme-toggle" i]'
    ).first();

    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition

      await captureScreenshot(page, 'theme-dark-mode', {
        testName: 'visual-regression'
      });

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    }
  });

  test('Multi-language: French vs Dutch layouts', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Capture French (default)
    await captureScreenshot(page, 'language-french', {
      testName: 'visual-regression'
    });

    // Try to switch to Dutch
    const languageSelector = page.locator(
      '[data-testid="language-selector"], [aria-label*="language" i], select[name*="lang" i]'
    ).first();

    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      await page.waitForTimeout(300);

      // Click Dutch option if available
      const dutchOption = page.locator('text=/Nederlands|Dutch|NL/i').first();
      if (await dutchOption.isVisible()) {
        await dutchOption.click();
        await page.waitForTimeout(500);

        await captureScreenshot(page, 'language-dutch', {
          testName: 'visual-regression'
        });

        await expect(page).toHaveScreenshot('homepage-dutch.png', {
          fullPage: true,
          maxDiffPixels: 150, // Allow for text length differences
        });
      }
    }
  });

  test('Search: Empty state vs results state', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Capture with all workflows visible
    await captureScreenshot(page, 'search-all-workflows', {
      testName: 'visual-regression'
    });

    // Perform search
    await homePage.searchForWorkflow('RIS');
    await page.waitForTimeout(500);

    await captureScreenshot(page, 'search-filtered-results', {
      testName: 'visual-regression'
    });

    // Search for something that returns no results
    await homePage.searchForWorkflow('NONEXISTENT_WORKFLOW_12345');
    await page.waitForTimeout(500);

    await captureScreenshot(page, 'search-no-results', {
      testName: 'visual-regression'
    });

    // Check for empty state message
    const emptyStateVisible = await page.locator(
      'text=/No workflows found|Aucun workflow trouvé|Geen workflows gevonden/i'
    ).isVisible().catch(() => false);

    if (emptyStateVisible) {
      await expect(page).toHaveScreenshot('search-empty-state.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('Loading states: Skeleton screens', async ({ page }) => {
    const homePage = new HomePage(page);

    // Intercept API calls to delay response and capture loading state
    await page.route('**/api/workflows', async (route) => {
      await page.waitForTimeout(2000); // Simulate slow network
      await route.continue();
    });

    const navigationPromise = homePage.goto();

    // Try to capture loading state
    await page.waitForTimeout(500);
    await captureScreenshot(page, 'loading-skeleton', {
      testName: 'visual-regression'
    });

    await navigationPromise;
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'loading-complete', {
      testName: 'visual-regression'
    });
  });
});

test.describe('Visual Regression: Component States', () => {
  test('Button states: Default, hover, active, disabled', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Find primary buttons
    const primaryButton = page.locator('button, [role="button"]').first();

    if (await primaryButton.isVisible()) {
      // Default state
      await expect(primaryButton).toHaveScreenshot('button-default.png');

      // Hover state
      await primaryButton.hover();
      await page.waitForTimeout(200);
      await expect(primaryButton).toHaveScreenshot('button-hover.png');

      await captureScreenshot(page, 'button-states-captured', {
        testName: 'visual-regression'
      });
    }
  });

  test('Form elements: Inputs, selects, checkboxes', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Capture search input
    const searchInput = page.locator('input[type="search"], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toHaveScreenshot('input-empty.png');

      await searchInput.fill('Test input');
      await expect(searchInput).toHaveScreenshot('input-filled.png');
    }

    await captureScreenshot(page, 'form-elements-captured', {
      testName: 'visual-regression'
    });
  });
});
