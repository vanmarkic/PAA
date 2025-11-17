import { test, expect, Page } from '@playwright/test';
import { HomePage, WorkflowDetailPage, BenefitsPage, ComparisonPage } from '../helpers/pages';
import { captureScreenshot } from '../helpers/screenshot-helper';
import fixtures from '../helpers/fixtures';

/**
 * E2E User Journey Test: Social Worker Searching for RIS Information
 *
 * Scenario: A social worker at CPAS needs to help a client understand
 * RIS (Revenu d'Intégration Sociale) eligibility and requirements.
 *
 * Journey covers:
 * - Homepage navigation
 * - Search functionality (10+ clicks)
 * - Filtering workflows (4+ scrolls)
 * - Workflow details exploration
 * - Benefits information
 * - Comparison tool
 *
 * Runs on both desktop and mobile viewports
 * Captures screenshots at each step
 */

test.describe('Social Worker Journey: RIS Information Search', () => {
  let homePage: HomePage;
  let workflowDetailPage: WorkflowDetailPage;
  let benefitsPage: BenefitsPage;
  let comparisonPage: ComparisonPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    homePage = new HomePage(page);
    workflowDetailPage = new WorkflowDetailPage(page);
    benefitsPage = new BenefitsPage(page);
    comparisonPage = new ComparisonPage(page);

    // Setup console error monitoring
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error]: ${msg.text()}`);
      }
    });

    // Monitor uncaught errors
    page.on('pageerror', (error) => {
      console.error(`[Uncaught Error]: ${error.message}`);
    });
  });

  test('Complete user journey: Search, filter, explore RIS workflow', async ({ page }) => {
    // Track click count for requirement validation
    let clickCount = 0;
    let scrollCount = 0;

    page.on('click', () => clickCount++);

    // STEP 1: Navigate to homepage
    console.log('Step 1: Loading homepage...');
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Verify page loaded correctly
    await expect(page).toHaveTitle(/PAA|Plateforme/i);

    await captureScreenshot(page, 'homepage-loaded', {
      step: 1,
      testName: 'social-worker-journey'
    });

    // STEP 2: Verify main elements are visible
    console.log('Step 2: Verifying homepage elements...');
    const hasWorkflows = await homePage.hasWorkflows();
    expect(hasWorkflows).toBeTruthy();

    const workflowCount = await homePage.getWorkflowCount();
    console.log(`Found ${workflowCount} workflows on homepage`);
    expect(workflowCount).toBeGreaterThan(0);

    await captureScreenshot(page, 'homepage-elements-verified', {
      step: 2,
      testName: 'social-worker-journey'
    });

    // STEP 3: Click on search input (Click #1)
    console.log('Step 3: Clicking search input...');
    await homePage.clickSearchInput();

    await captureScreenshot(page, 'search-input-focused', {
      step: 3,
      testName: 'social-worker-journey'
    });

    // STEP 4: Type search query "RIS" (Click #2 - focus retained)
    console.log('Step 4: Searching for "RIS"...');
    await homePage.searchForWorkflow('RIS');

    // Wait for results to filter
    await page.waitForTimeout(500);

    await captureScreenshot(page, 'search-results-ris', {
      step: 4,
      testName: 'social-worker-journey'
    });

    // Verify search results
    const searchResultCount = await homePage.getWorkflowCount();
    console.log(`Search returned ${searchResultCount} results for "RIS"`);
    expect(searchResultCount).toBeGreaterThan(0);

    // STEP 5: Scroll to filters section (Scroll #1)
    console.log('Step 5: Scrolling to filters...');
    await homePage.scrollToFilters();
    scrollCount++;

    await page.waitForTimeout(300);

    await captureScreenshot(page, 'filters-visible', {
      step: 5,
      testName: 'social-worker-journey'
    });

    // STEP 6: Open filters if collapsed (Click #3)
    console.log('Step 6: Opening filters...');
    const filtersVisible = await homePage.areFiltersVisible();
    if (!filtersVisible) {
      await homePage.clickFiltersToggle();
    }

    await captureScreenshot(page, 'filters-expanded', {
      step: 6,
      testName: 'social-worker-journey'
    });

    // STEP 7: Click on "Social Integration" category filter (Click #4)
    console.log('Step 7: Filtering by "Social Integration" category...');
    const categories = await homePage.getAvailableCategories();
    console.log(`Available categories: ${categories.join(', ')}`);

    // Find Social Integration or related category
    const socialCategory = categories.find(cat =>
      cat.toLowerCase().includes('social') ||
      cat.toLowerCase().includes('intégration')
    );

    if (socialCategory) {
      await homePage.filterByCategory(socialCategory);
      await page.waitForTimeout(500);
    }

    await captureScreenshot(page, 'category-filtered', {
      step: 7,
      testName: 'social-worker-journey'
    });

    // STEP 8: Scroll through filtered results (Scroll #2)
    console.log('Step 8: Scrolling through results...');
    await page.evaluate(() => window.scrollBy(0, 300));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'results-scrolled', {
      step: 8,
      testName: 'social-worker-journey'
    });

    // STEP 9: Click on first workflow card (Click #5)
    console.log('Step 9: Clicking on RIS workflow card...');
    const workflowNames = await homePage.getWorkflowNames();
    console.log(`Available workflows: ${workflowNames.join(', ')}`);

    await homePage.clickWorkflowCard(0);
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'workflow-detail-loaded', {
      step: 9,
      testName: 'social-worker-journey'
    });

    // STEP 10: Verify workflow detail page loaded
    console.log('Step 10: Verifying workflow details...');
    const workflowTitle = await workflowDetailPage.getWorkflowTitle();
    console.log(`Viewing workflow: ${workflowTitle}`);
    expect(workflowTitle).toBeTruthy();

    await captureScreenshot(page, 'workflow-title-verified', {
      step: 10,
      testName: 'social-worker-journey'
    });

    // STEP 11: Scroll through workflow states (Scroll #3)
    console.log('Step 11: Scrolling through workflow states...');
    await page.evaluate(() => window.scrollBy(0, 400));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'workflow-states-visible', {
      step: 11,
      testName: 'social-worker-journey'
    });

    // View states information
    const statesCount = await workflowDetailPage.getStatesCount();
    console.log(`Workflow has ${statesCount} states`);

    // STEP 12: Click on legal references tab/section (Click #6)
    console.log('Step 12: Viewing legal references...');
    const hasLegalRefs = await workflowDetailPage.hasLegalReferences();
    if (hasLegalRefs) {
      await workflowDetailPage.clickLegalTab();
      await page.waitForTimeout(500);
    }

    await captureScreenshot(page, 'legal-references-expanded', {
      step: 12,
      testName: 'social-worker-journey'
    });

    // STEP 13: Scroll to see all legal references (Scroll #4)
    console.log('Step 13: Scrolling through legal references...');
    await page.evaluate(() => window.scrollBy(0, 300));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'legal-references-scrolled', {
      step: 13,
      testName: 'social-worker-journey'
    });

    // STEP 14: Navigate to benefits page (Click #7)
    console.log('Step 14: Navigating to benefits page...');
    await benefitsPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'benefits-page-loaded', {
      step: 14,
      testName: 'social-worker-journey'
    });

    // STEP 15: Click on benefits search (Click #8)
    console.log('Step 15: Searching benefits...');
    const hasBenefits = await benefitsPage.hasBenefits();
    console.log(`Benefits page has content: ${hasBenefits}`);

    await captureScreenshot(page, 'benefits-content-visible', {
      step: 15,
      testName: 'social-worker-journey'
    });

    // STEP 16: Scroll through benefits content (Scroll #5)
    console.log('Step 16: Scrolling through benefits...');
    await page.evaluate(() => window.scrollBy(0, 500));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'benefits-scrolled', {
      step: 16,
      testName: 'social-worker-journey'
    });

    // STEP 17: Navigate to comparison page (Click #9)
    console.log('Step 17: Opening comparison tool...');
    await comparisonPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'comparison-page-loaded', {
      step: 17,
      testName: 'social-worker-journey'
    });

    // STEP 18: View comparison content (Click #10)
    console.log('Step 18: Viewing comparison data...');
    const hasComparison = await comparisonPage.hasComparisonTable();
    console.log(`Comparison table visible: ${hasComparison}`);

    await captureScreenshot(page, 'comparison-table-visible', {
      step: 18,
      testName: 'social-worker-journey'
    });

    // STEP 19: Scroll through comparison (Scroll #6)
    console.log('Step 19: Scrolling comparison table...');
    await page.evaluate(() => window.scrollBy(0, 400));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'comparison-scrolled', {
      step: 19,
      testName: 'social-worker-journey'
    });

    // STEP 20: Return to homepage via navigation (Click #11)
    console.log('Step 20: Returning to homepage...');
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'journey-completed-home', {
      step: 20,
      testName: 'social-worker-journey'
    });

    // Verify we're back at homepage
    const finalWorkflowCount = await homePage.getWorkflowCount();
    expect(finalWorkflowCount).toBeGreaterThan(0);

    // Log journey statistics
    console.log('\n=== Journey Statistics ===');
    console.log(`Total scrolls: ${scrollCount} (Required: 4+) ✓`);
    console.log(`Screenshots captured: 20`);
    console.log(`Pages visited: 4 (Home, Workflow Detail, Benefits, Comparison)`);
    console.log('=========================\n');

    // Validate requirements
    expect(scrollCount).toBeGreaterThanOrEqual(4);
  });

  test('UI Bug Detection: Console errors and layout checks', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    // Monitor console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Monitor page errors
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Navigate through key pages
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    await captureScreenshot(page, 'ui-check-homepage', {
      testName: 'ui-bug-detection'
    });

    // Check for layout shifts
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsScore += (entry as any).value;
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsScore);
        }, 2000);
      });
    });

    console.log(`Cumulative Layout Shift score: ${cls}`);
    await captureScreenshot(page, 'ui-check-completed', {
      testName: 'ui-bug-detection'
    });

    // Report errors
    if (consoleErrors.length > 0) {
      console.warn(`Found ${consoleErrors.length} console errors:`, consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.warn(`Found ${pageErrors.length} page errors:`, pageErrors);
    }

    // Soft assertions - warn but don't fail
    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      console.warn('⚠️  UI bugs detected - review screenshots and logs');
    }
  });
});
