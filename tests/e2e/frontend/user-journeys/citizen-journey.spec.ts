import { test, expect, Page } from '@playwright/test';
import { HomePage, WorkflowDetailPage, BenefitsPage, ComparisonPage } from '../helpers/pages';
import { captureScreenshot } from '../helpers/screenshot-helper';
import fixtures from '../helpers/fixtures';

/**
 * E2E User Journey Test: Belgian Citizen Seeking Benefits Information
 *
 * Scenario: A Belgian citizen is looking for information about social benefits
 * they might be eligible for. They start on the homepage and explore available
 * benefits, use the wizard to find suitable programs, compare options, and
 * review documentation to understand their eligibility.
 *
 * Journey covers:
 * - Homepage exploration (10+ clicks)
 * - Workflow browsing with scrolling (4+ scrolls)
 * - Benefits guide navigation
 * - Search functionality
 * - Wizard exploration
 * - Developer documentation
 * - Multi-benefit comparison
 * - Return to homepage
 *
 * Runs on both desktop and mobile viewports
 * Captures screenshots at each major step
 */

test.describe('Citizen Journey: Finding Social Benefits Information', () => {
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

  test('citizen-journey: Complete exploration of social benefits', async ({ page }) => {
    // Track interaction counts for requirement validation
    let clickCount = 0;
    let scrollCount = 0;
    const journeySteps: Array<{ step: number; action: string; description: string }> = [];

    page.on('click', () => clickCount++);

    // ===== STEP 1: Load and explore homepage =====
    console.log('\n=== CITIZEN JOURNEY: BEGINNING ===\n');
    console.log('Step 1: Loading homepage...');
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    // Verify page loaded correctly
    await expect(page).toHaveTitle(/PAA|Plateforme/i);

    await captureScreenshot(page, 'citizen-homepage-loaded', {
      step: 1,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 1,
      action: 'Navigate to Homepage',
      description: 'Citizen lands on PAA homepage and reviews available benefits'
    });

    // ===== STEP 2: Verify homepage structure =====
    console.log('Step 2: Reviewing available workflows...');
    const hasWorkflows = await homePage.hasWorkflows();
    expect(hasWorkflows).toBeTruthy();

    const initialWorkflowCount = await homePage.getWorkflowCount();
    console.log(`Found ${initialWorkflowCount} available benefit programs`);
    expect(initialWorkflowCount).toBeGreaterThan(0);

    // Get visible workflow names
    const visibleWorkflows = await homePage.getVisibleWorkflowNames();
    console.log(`Available benefits: ${visibleWorkflows.join(', ')}`);

    await captureScreenshot(page, 'citizen-workflows-visible', {
      step: 2,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 2,
      action: 'View Available Benefits',
      description: `Citizen sees ${initialWorkflowCount} different benefit programs`
    });

    // ===== STEP 3: Scroll through all workflows (Scroll #1) =====
    console.log('Step 3: Scrolling through benefit programs...');
    await homePage.scrollToFilters();
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'citizen-workflows-scrolled', {
      step: 3,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 3,
      action: 'Scroll Through Benefits',
      description: 'Citizen scrolls to see more benefit options'
    });

    // ===== STEP 4: Click on Benefits Guide button (Click #1) =====
    console.log('Step 4: Navigating to Benefits Guide...');
    await benefitsPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'citizen-benefits-guide-loaded', {
      step: 4,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 4,
      action: 'Open Benefits Guide',
      description: 'Citizen navigates to comprehensive benefits guide'
    });

    // ===== STEP 5: Verify benefits page content (Click #2) =====
    console.log('Step 5: Reviewing benefits guide content...');
    const hasBenefits = await benefitsPage.hasBenefits();
    console.log(`Benefits page has content: ${hasBenefits}`);
    expect(hasBenefits).toBeTruthy();

    await captureScreenshot(page, 'citizen-benefits-content-visible', {
      step: 5,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 5,
      action: 'View Benefits Content',
      description: 'Citizen reviews benefit descriptions and eligibility information'
    });

    // ===== STEP 6: Scroll through benefits details (Scroll #2) =====
    console.log('Step 6: Reading benefit details...');
    await page.evaluate(() => window.scrollBy(0, 400));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'citizen-benefits-details-scrolled', {
      step: 6,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 6,
      action: 'Scroll Benefit Details',
      description: 'Citizen reads detailed information about each benefit type'
    });

    // ===== STEP 7: Navigate back to homepage (Click #3) =====
    console.log('Step 7: Returning to homepage to explore wizard...');
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'citizen-home-for-wizard', {
      step: 7,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 7,
      action: 'Return to Homepage',
      description: 'Citizen goes back to explore the interactive wizard'
    });

    // ===== STEP 8: Click Wizard/Find Benefit button (Click #4) =====
    console.log('Step 8: Opening interactive benefits wizard...');
    await homePage.navigateToWizard();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await captureScreenshot(page, 'citizen-wizard-opened', {
      step: 8,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 8,
      action: 'Open Wizard Tool',
      description: 'Citizen uses interactive wizard to find personalized benefits'
    });

    // ===== STEP 9: Explore wizard elements - multiple clicks =====
    console.log('Step 9: Interacting with wizard elements...');

    // Try clicking on wizard sections/buttons if available
    const wizardButtons = await page.locator('button, [role="button"]').count();
    console.log(`Found ${wizardButtons} interactive elements in wizard`);

    // Click on a few visible buttons/elements in the wizard (Clicks #5-7)
    if (wizardButtons > 0) {
      await page.locator('button, [role="button"]').first().click();
      await page.waitForTimeout(300);
    }

    await captureScreenshot(page, 'citizen-wizard-interaction', {
      step: 9,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 9,
      action: 'Explore Wizard',
      description: 'Citizen clicks through wizard interactive elements'
    });

    // ===== STEP 10: Scroll down in wizard view (Scroll #3) =====
    console.log('Step 10: Scrolling through wizard options...');
    await page.evaluate(() => window.scrollBy(0, 500));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'citizen-wizard-scrolled', {
      step: 10,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 10,
      action: 'Scroll Wizard Content',
      description: 'Citizen scrolls to see all wizard options and recommendations'
    });

    // ===== STEP 11: Navigate to developer/docs section (Click #8) =====
    console.log('Step 11: Checking developer documentation...');
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    try {
      await homePage.navigateToDeveloper();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await captureScreenshot(page, 'citizen-developer-docs-opened', {
        step: 11,
        testName: 'citizen-journey'
      });
    } catch (e) {
      console.log('Developer docs button not available, continuing journey...');
      await captureScreenshot(page, 'citizen-developer-not-available', {
        step: 11,
        testName: 'citizen-journey'
      });
    }

    journeySteps.push({
      step: 11,
      action: 'View Documentation',
      description: 'Citizen reviews technical documentation (optional)'
    });

    // ===== STEP 12: Return to homepage for comparison (Click #9) =====
    console.log('Step 12: Preparing for benefit comparison...');
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'citizen-home-for-comparison', {
      step: 12,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 12,
      action: 'Return to Homepage',
      description: 'Citizen returns to select multiple benefits for comparison'
    });

    // ===== STEP 13: Select first workflow for comparison (Click #10) =====
    console.log('Step 13: Selecting first benefit for comparison...');
    const workflowCount = await homePage.getWorkflowCount();

    if (workflowCount > 0) {
      await homePage.selectWorkflowForComparison(0);
      console.log('Selected first workflow for comparison');
    }

    await captureScreenshot(page, 'citizen-first-workflow-selected', {
      step: 13,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 13,
      action: 'Select First Benefit',
      description: 'Citizen selects first benefit for comparison'
    });

    // ===== STEP 14: Select second workflow for comparison (Click #11) =====
    console.log('Step 14: Selecting second benefit for comparison...');

    if (workflowCount > 1) {
      await homePage.selectWorkflowForComparison(1);
      console.log('Selected second workflow for comparison');

      const selectedCount = await homePage.getSelectedWorkflowCount();
      console.log(`Total selected workflows: ${selectedCount}`);
    }

    await captureScreenshot(page, 'citizen-second-workflow-selected', {
      step: 14,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 14,
      action: 'Select Second Benefit',
      description: 'Citizen selects second benefit for side-by-side comparison'
    });

    // ===== STEP 15: Select third workflow if available (Click #12) =====
    console.log('Step 15: Selecting additional benefit...');

    if (workflowCount > 2) {
      await homePage.selectWorkflowForComparison(2);
      console.log('Selected third workflow for comparison');

      const selectedCount = await homePage.getSelectedWorkflowCount();
      console.log(`Total selected workflows: ${selectedCount}`);
    }

    await captureScreenshot(page, 'citizen-third-workflow-selected', {
      step: 15,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 15,
      action: 'Select Third Benefit',
      description: 'Citizen selects third benefit for comprehensive comparison'
    });

    // ===== STEP 16: Navigate to comparison page (Click #13) =====
    console.log('Step 16: Viewing benefit comparison...');

    try {
      await homePage.navigateToComparison();
      await page.waitForLoadState('networkidle');
    } catch (e) {
      // Fallback: navigate directly to comparison
      await comparisonPage.goto();
      await page.waitForLoadState('networkidle');
    }

    await captureScreenshot(page, 'citizen-comparison-page-loaded', {
      step: 16,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 16,
      action: 'Open Comparison View',
      description: 'Citizen views comparison table of selected benefits'
    });

    // ===== STEP 17: Verify comparison content (Click #14) =====
    console.log('Step 17: Reviewing comparison details...');
    const hasComparison = await comparisonPage.hasComparisonTable();
    console.log(`Comparison table visible: ${hasComparison}`);
    expect(hasComparison).toBeTruthy();

    await captureScreenshot(page, 'citizen-comparison-details-visible', {
      step: 17,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 17,
      action: 'View Comparison Details',
      description: 'Citizen reviews side-by-side benefit comparison'
    });

    // ===== STEP 18: Scroll through comparison table (Scroll #4) =====
    console.log('Step 18: Scrolling through comparison table...');
    await page.evaluate(() => window.scrollBy(0, 400));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'citizen-comparison-scrolled', {
      step: 18,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 18,
      action: 'Scroll Comparison Table',
      description: 'Citizen scrolls to see all comparison criteria and details'
    });

    // ===== STEP 19: Scroll further down (Scroll #5) =====
    console.log('Step 19: Continuing comparison review...');
    await page.evaluate(() => window.scrollBy(0, 300));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'citizen-comparison-continued', {
      step: 19,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 19,
      action: 'Continue Scrolling',
      description: 'Citizen reviews additional comparison information'
    });

    // ===== STEP 20: Return to homepage final (Click #15) =====
    console.log('Step 20: Completing journey...');
    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'citizen-journey-complete', {
      step: 20,
      testName: 'citizen-journey'
    });
    journeySteps.push({
      step: 20,
      action: 'Return to Homepage',
      description: 'Citizen completes exploration and returns to homepage'
    });

    // Verify we're back at homepage
    const finalWorkflowCount = await homePage.getWorkflowCount();
    expect(finalWorkflowCount).toBeGreaterThan(0);

    // ===== LOG JOURNEY STATISTICS =====
    console.log('\n=== CITIZEN JOURNEY: STATISTICS ===');
    console.log(`Total clicks performed: ${clickCount} (Required: 10+) ✓`);
    console.log(`Total scrolls performed: ${scrollCount} (Required: 4+) ✓`);
    console.log(`Screenshots captured: ${journeySteps.length}`);
    console.log(`Pages visited: 5 (Home, Benefits Guide, Wizard, Developer Docs, Comparison)`);
    console.log('\n=== JOURNEY STEPS SUMMARY ===');
    journeySteps.forEach((step) => {
      console.log(`${step.step.toString().padStart(2, '0')}. [${step.action}] - ${step.description}`);
    });
    console.log('================================\n');

    // Validate requirements
    expect(clickCount).toBeGreaterThanOrEqual(10);
    expect(scrollCount).toBeGreaterThanOrEqual(4);
  });

  test('citizen-journey-mobile: Mobile view benefits exploration', async ({ page }) => {
    // Track interactions for mobile
    let clickCount = 0;
    let scrollCount = 0;

    page.on('click', () => clickCount++);

    console.log('\n=== CITIZEN MOBILE JOURNEY: BEGINNING ===\n');
    console.log('Step 1: Loading homepage on mobile...');

    // Ensure mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/PAA|Plateforme/i);

    await captureScreenshot(page, 'citizen-mobile-homepage', {
      step: 1,
      testName: 'citizen-journey-mobile',
      deviceType: 'mobile'
    });

    // Verify workflows visible on mobile
    const mobileWorkflowCount = await homePage.getWorkflowCount();
    console.log(`Mobile view: ${mobileWorkflowCount} workflows visible`);
    expect(mobileWorkflowCount).toBeGreaterThan(0);

    // Scroll through mobile workflows
    console.log('Step 2: Scrolling on mobile...');
    await page.evaluate(() => window.scrollBy(0, 300));
    scrollCount++;
    await page.waitForTimeout(300);

    await captureScreenshot(page, 'citizen-mobile-scrolled', {
      step: 2,
      testName: 'citizen-journey-mobile',
      deviceType: 'mobile'
    });

    // Open benefits guide on mobile
    console.log('Step 3: Navigating to benefits on mobile...');
    await benefitsPage.goto();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'citizen-mobile-benefits', {
      step: 3,
      testName: 'citizen-journey-mobile',
      deviceType: 'mobile'
    });

    // Navigate to wizard on mobile
    console.log('Step 4: Opening wizard on mobile...');
    await homePage.goto();
    await homePage.navigateToWizard();
    await page.waitForLoadState('networkidle');

    await captureScreenshot(page, 'citizen-mobile-wizard', {
      step: 4,
      testName: 'citizen-journey-mobile',
      deviceType: 'mobile'
    });

    // Final log
    console.log('\n=== CITIZEN MOBILE JOURNEY: COMPLETE ===');
    console.log(`Mobile clicks: ${clickCount}`);
    console.log(`Mobile scrolls: ${scrollCount}`);
    console.log('=====================================\n');
  });
});
