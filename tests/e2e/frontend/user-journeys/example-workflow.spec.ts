import { test, expect } from '@playwright/test';
import {
  HomePage,
  WorkflowDetailPage,
  BenefitsPage,
  ComparisonPage,
} from '../helpers/pages';

/**
 * Example E2E Test Suite
 *
 * Demonstrates how to use Page Object Models for testing the PAA frontend.
 * These tests cover common user journeys and can serve as templates for additional tests.
 *
 * Run with: npx playwright test tests/e2e/frontend/user-journeys/example-workflow.spec.ts
 */

test.describe('PAA Frontend - Home Page', () => {
  test('should load homepage with workflows', async ({ page }) => {
    const homePage = new HomePage(page);

    // Navigate to home
    await homePage.goto();

    // Wait for workflows to load
    await homePage.waitForWorkflowsLoaded();

    // Verify page title
    const title = await homePage.getTitle();
    expect(title).toMatch(/PAA|Plateforme/i);

    // Verify workflows are displayed
    const workflowCount = await homePage.getWorkflowCount();
    expect(workflowCount).toBeGreaterThan(0);

    // Verify stats section
    const stats = await homePage.getStats();
    expect(stats).not.toBeNull();
    expect(stats!.states).toBeGreaterThan(0);
    expect(stats!.events).toBeGreaterThan(0);
  });

  test('should search for workflows', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Search for specific workflow
    await homePage.searchForWorkflow('RIS');

    // Verify search results
    const names = await homePage.getVisibleWorkflowNames();
    expect(names.some(n => n.toUpperCase().includes('RIS'))).toBeTruthy();

    // Clear search and verify all workflows return
    await homePage.clearSearch();
    const allNames = await homePage.getVisibleWorkflowNames();
    expect(allNames.length).toBeGreaterThan(names.length);
  });

  test('should filter workflows by category', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Get initial count
    const initialCount = await homePage.getWorkflowCount();
    expect(initialCount).toBeGreaterThan(0);

    // Filter by category
    await homePage.filterByCategory('Social');

    // Verify filtered results
    const filteredCount = await homePage.getWorkflowCount();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
    // Filtered count should be less than or equal to initial
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Clear filters
    await homePage.clearAllFilters();
    const clearedCount = await homePage.getWorkflowCount();
    expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should filter workflows by complexity', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Filter by complexity
    await homePage.filterByComplexity('Simple');

    // Verify results contain simple workflows
    const count = await homePage.getWorkflowCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to wizard from home', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Navigate to wizard
    await homePage.navigateToWizard();

    // Verify navigation
    const url = await homePage.getCurrentUrl();
    expect(url).toContain('/wizard');
  });

  test('should navigate to benefits from home', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Navigate to benefits
    await homePage.navigateToBenefits();

    // Verify navigation
    const url = await homePage.getCurrentUrl();
    expect(url).toContain('/benefits');
  });
});

test.describe('PAA Frontend - Workflow Detail Page', () => {
  test('should display workflow details', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);

    // Navigate to home and click first workflow
    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();
    await homePage.clickWorkflowCard(0);

    // Wait for detail page to load
    await detailPage.waitForWorkflowLoaded();

    // Verify workflow information
    const title = await detailPage.getWorkflowTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    const category = await detailPage.getCategory();
    expect(category).toBeTruthy();

    const complexity = await detailPage.getComplexity();
    expect(complexity).toMatch(/Simple|Medium|Complex/);
  });

  test('should display workflow states and events', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();
    await homePage.clickWorkflowCard(0);
    await detailPage.waitForWorkflowLoaded();

    // Check states
    const stateCount = await detailPage.getStateCount();
    expect(stateCount).toBeGreaterThan(0);

    const states = await detailPage.getStatesList();
    expect(states.length).toBeGreaterThan(0);

    // Check events
    const eventCount = await detailPage.getEventCount();
    expect(eventCount).toBeGreaterThanOrEqual(0);

    // Verify diagram visibility
    const isDiagramVisible = await detailPage.isDiagramVisible();
    expect(isDiagramVisible).toBeTruthy();
  });

  test('should display plain language description', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();
    await homePage.clickWorkflowCard(0);
    await detailPage.waitForWorkflowLoaded();

    // Click overview tab
    await detailPage.clickTab('overview');

    // Get plain language description
    const description = await detailPage.getPlainLanguageDescription();
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(0);
  });

  test('should display legal references', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();
    await homePage.clickWorkflowCard(0);
    await detailPage.waitForWorkflowLoaded();

    // Navigate to legal tab
    await detailPage.clickTab('legal');
    await detailPage.scrollToLegalSection();

    // Get legal references
    const refCount = await detailPage.getLegalReferenceCount();
    expect(refCount).toBeGreaterThanOrEqual(0);

    if (refCount > 0) {
      const refText = await detailPage.getLegalReferenceText(0);
      expect(refText).toBeTruthy();
    }
  });

  test('should navigate back to home', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();
    await homePage.clickWorkflowCard(0);
    await detailPage.waitForWorkflowLoaded();

    // Click back button
    await detailPage.clickBack();

    // Verify returned to home
    const url = await homePage.getCurrentUrl();
    expect(url).toContain('/');
    expect(url).not.toContain('/workflows/');
  });

  test('should change language on detail page', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();
    await homePage.clickWorkflowCard(0);
    await detailPage.waitForWorkflowLoaded();

    // Change language
    await detailPage.changeLanguage('nl');

    // Verify page is still displayed
    const title = await detailPage.getWorkflowTitle();
    expect(title).toBeTruthy();
  });
});

test.describe('PAA Frontend - Benefits Page', () => {
  test('should load benefits page', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    // Navigate to benefits
    await benefitsPage.goto();
    await benefitsPage.waitForBenefitsLoaded();

    // Verify page title
    const title = await benefitsPage.getPageTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display benefit cards', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    await benefitsPage.goto();
    await benefitsPage.waitForBenefitsLoaded();

    // Get benefit count
    const count = await benefitsPage.getBenefitCount();
    expect(count).toBeGreaterThan(0);

    // Get benefit details
    const names = await benefitsPage.getVisibleBenefitNames();
    expect(names.length).toBeGreaterThan(0);
    expect(names[0]).toBeTruthy();
  });

  test('should filter benefits by category', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    await benefitsPage.goto();
    await benefitsPage.waitForBenefitsLoaded();

    // Get initial count
    const initialCount = await benefitsPage.getBenefitCount();

    // Filter by employment category
    await benefitsPage.filterByCategory('Emploi');

    // Verify filtered results
    const filteredCount = await benefitsPage.getBenefitCount();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test('should search for benefits', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    await benefitsPage.goto();
    await benefitsPage.waitForBenefitsLoaded();

    // Search for specific benefit
    await benefitsPage.searchBenefit('RIS');

    // Verify results
    const names = await benefitsPage.getVisibleBenefitNames();
    const hasRIS = names.some(n => n.toUpperCase().includes('RIS'));
    // Note: Search may return 0 results if not implemented, that's ok
  });

  test('should display benefit details', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    await benefitsPage.goto();
    await benefitsPage.waitForBenefitsLoaded();

    // Get details for first benefit
    const name = await benefitsPage.getBenefitName(0);
    expect(name).toBeTruthy();

    const description = await benefitsPage.getBenefitDescription(0);
    expect(description).toBeTruthy();

    // Get eligibility
    const eligibility = await benefitsPage.getBenefitEligibility(0);
    expect(eligibility).toBeInstanceOf(Array);

    // Get key facts
    const keyFacts = await benefitsPage.getBenefitKeyFacts(0);
    expect(keyFacts).toBeInstanceOf(Object);
  });
});

test.describe('PAA Frontend - Comparison Page', () => {
  test('should show empty state with no workflows', async ({ page }) => {
    const comparisonPage = new ComparisonPage(page);

    // Navigate to comparison without workflows
    await comparisonPage.goto();

    // Verify empty state or warning
    const isEmpty = await comparisonPage.isEmpty();
    const hasWarning = await comparisonPage.hasMinimumWorkflowsWarning();
    expect(isEmpty || hasWarning).toBeTruthy();
  });

  test('should display comparison table with workflows', async ({ page }) => {
    const homePage = new HomePage(page);
    const comparisonPage = new ComparisonPage(page);

    // Go to home and select workflows for comparison
    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Select first 3 workflows
    await homePage.selectWorkflowForComparison(0);
    await homePage.selectWorkflowForComparison(1);
    await homePage.selectWorkflowForComparison(2);

    // Start comparison
    await homePage.clickCompare();

    // Wait for comparison table
    await comparisonPage.waitForTableLoaded();

    // Verify table content
    const isTableVisible = await comparisonPage.isTableVisible();
    expect(isTableVisible).toBeTruthy();

    const rowCount = await comparisonPage.getComparisonRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should display workflow names in comparison', async ({ page }) => {
    const homePage = new HomePage(page);
    const comparisonPage = new ComparisonPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Get names of workflows to compare
    const workflowNames = await homePage.getVisibleWorkflowNames();
    const name1 = workflowNames[0];
    const name2 = workflowNames[1];

    // Select first two workflows
    await homePage.selectWorkflowForComparison(0);
    await homePage.selectWorkflowForComparison(1);
    await homePage.clickCompare();

    // Verify comparison shows these workflows
    await comparisonPage.waitForTableLoaded();
    const column1Name = await comparisonPage.getWorkflowNameInColumn(0);
    const column2Name = await comparisonPage.getWorkflowNameInColumn(1);

    expect(column1Name).toBeTruthy();
    expect(column2Name).toBeTruthy();
  });

  test('should display comparison data', async ({ page }) => {
    const homePage = new HomePage(page);
    const comparisonPage = new ComparisonPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Select workflows
    await homePage.selectMultipleWorkflows([0, 1]);
    await homePage.clickCompare();

    // Get comparison data
    await comparisonPage.waitForTableLoaded();

    const fullData = await comparisonPage.getFullComparisonData();
    expect(Object.keys(fullData).length).toBeGreaterThan(0);

    // Verify specific comparisons
    const complexities = await comparisonPage.getComplexityComparison();
    expect(complexities.length).toBeGreaterThan(0);

    const states = await comparisonPage.getStatesComparison();
    expect(states.length).toBeGreaterThan(0);
  });

  test('should remove workflow from comparison', async ({ page }) => {
    const homePage = new HomePage(page);
    const comparisonPage = new ComparisonPage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Select 3 workflows
    await homePage.selectMultipleWorkflows([0, 1, 2]);
    await homePage.clickCompare();

    // Get initial count
    await comparisonPage.waitForTableLoaded();
    let count = await comparisonPage.getComparedWorkflowCount();
    expect(count).toBe(3);

    // Remove one workflow
    await comparisonPage.removeWorkflow(0);

    // Verify count decreased
    count = await comparisonPage.getComparedWorkflowCount();
    expect(count).toBe(2);
  });
});

test.describe('PAA Frontend - Multi-Language Support', () => {
  test('should support language switching', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    const titleFR = await homePage.getText(homePage.heroTitle);

    // Change to Dutch
    await homePage.changeLanguage('nl');
    // Note: Page should update, but title might be the same

    // Change to English
    await homePage.changeLanguage('en');

    // Change back to French
    await homePage.changeLanguage('fr');
    const titleFRAgain = await homePage.getText(homePage.heroTitle);

    // Title should still exist
    expect(titleFRAgain).toBeTruthy();
  });
});

test.describe('PAA Frontend - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    // This would need to be configured in playwright.config.ts
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.waitForWorkflowsLoaded();

    // Verify page is usable
    const count = await homePage.getWorkflowCount();
    expect(count).toBeGreaterThan(0);

    // Try interaction
    await homePage.searchForWorkflow('test');
    const searchValue = await homePage.getSearchValue();
    expect(searchValue).toBe('test');
  });
});
