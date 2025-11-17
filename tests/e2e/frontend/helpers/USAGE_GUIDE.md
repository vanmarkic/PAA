# Page Object Model Usage Guide

This guide demonstrates how to use the page object models for frontend e2e testing.

## Quick Start

### Import Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { HomePage, WorkflowDetailPage, BenefitsPage, ComparisonPage } from './pages';

test('homepage workflow', async ({ page }) => {
  const homePage = new HomePage(page);
  const detailPage = new WorkflowDetailPage(page);

  // Use page objects
  await homePage.goto();
  await homePage.searchForWorkflow('RIS');
});
```

## Page Object Reference

### BasePage - Common Functionality

All page objects extend `BasePage` which provides common methods:

#### Navigation
```typescript
await page.navigateToHome();
await page.changeLanguage('fr'); // 'fr', 'nl', 'en'
await page.goBack();
```

#### Element Interaction
```typescript
await page.click(locator);
await page.typeText(locator, 'text');
await page.hover(locator);
await page.doubleClick(locator);
await page.scrollToElement(locator);
await page.scrollToTop();
await page.scrollToBottom();
```

#### Element Inspection
```typescript
const isVisible = await page.isVisible(locator);
const text = await page.getText(locator);
const value = await page.getAttribute(locator, 'href');
const count = await page.getElementCount(locator);
const exists = await page.elementExists(locator);
```

#### Loading & Errors
```typescript
await page.waitForLoadingComplete();
const error = await page.getErrorMessage();
```

---

### HomePage

**Location:** `/`

#### Search & Filter
```typescript
const home = new HomePage(page);

// Search workflows
await home.searchForWorkflow('RIS');
await home.clearSearch();

// Filter by category
await home.filterByCategory('Social');

// Filter by complexity
await home.filterByComplexity('Medium');

// Clear all filters
await home.clearAllFilters();
```

#### Workflow Cards
```typescript
// Get workflow count
const count = await home.getWorkflowCount();

// Get workflow names
const names = await home.getVisibleWorkflowNames();

// Click specific workflow
await home.clickWorkflowCard(0); // By index
await home.clickWorkflowByName('RIS Eligibility'); // By name

// Check if workflow visible
const visible = await home.isWorkflowVisible('AGR');
```

#### Comparison
```typescript
// Select workflows for comparison
await home.selectWorkflowForComparison(0);
await home.selectWorkflowForComparison(1);

// Multiple selection
await home.selectMultipleWorkflows([0, 1, 2]);

// Get selected count
const selected = await home.getSelectedWorkflowCount();

// Start comparison
await home.clickCompare();
```

#### Navigation
```typescript
await home.navigateToWizard();
await home.navigateToBenefits();
await home.navigateToComparison();
await home.navigateToDeveloper();
```

#### Loading & Errors
```typescript
const isLoading = await home.isLoading();
await home.waitForWorkflowsLoaded();
const error = await home.getError();
await home.clickRetry();
```

---

### WorkflowDetailPage

**Location:** `/workflows/:id`

#### Page Info
```typescript
const detail = new WorkflowDetailPage(page);

const title = await detail.getWorkflowTitle();
const category = await detail.getCategory();
const complexity = await detail.getComplexity();
```

#### Tab Navigation
```typescript
// Click tabs
await detail.clickTab('overview');
await detail.clickTab('simulation');
await detail.clickTab('technical');
await detail.clickTab('legal');
await detail.clickTab('examples');
```

#### Overview Section
```typescript
const description = await detail.getPlainLanguageDescription();
const stateCount = await detail.getStateCount();
const eventCount = await detail.getEventCount();
const keywords = await detail.getKeywords();
```

#### State Visualization
```typescript
// Check diagram visibility
const isVisible = await detail.isDiagramVisible();

// Get states list
const states = await detail.getStatesList();

// Click on a state
await detail.clickState(0);

// Scroll to diagram
await detail.scrollToVisualization();
```

#### Simulation
```typescript
// Fill simulation form
await detail.fillSimulationField('userAge', '25');
await detail.fillSimulationField('income', '1500');

// Run simulation
await detail.runSimulation();

// Get result
const result = await detail.getSimulationResult();
// Returns: 'eligible', 'not-eligible', etc.
```

#### Legal References
```typescript
// Get reference count
const count = await detail.getLegalReferenceCount();

// Get reference details
const text = await detail.getLegalReferenceText(0);

// Get reference URL
const url = await detail.clickLegalReference(0);

// Scroll to legal section
await detail.scrollToLegalSection();
```

#### Examples
```typescript
// Get example count
const count = await detail.getExampleCount();

// Get example code
const code = await detail.getExampleCode(0);

// Scroll to examples
await detail.scrollToExamples();
```

#### Actions
```typescript
await detail.clickDownload();
await detail.clickShare();
await detail.clickCompare();
await detail.clickViewGherkin();
```

---

### BenefitsPage

**Location:** `/benefits`

#### Search & Filter
```typescript
const benefits = new BenefitsPage(page);

// Search
await benefits.searchBenefit('RIS');
await benefits.clearSearch();

// Filter by category
await benefits.filterByCategory('Emploi');
await benefits.filterByCategory('Famille');
```

#### Benefit Cards
```typescript
// Get count
const count = await benefits.getBenefitCount();

// Get benefit details
const name = await benefits.getBenefitName(0);
const description = await benefits.getBenefitDescription(0);
const amount = await benefits.getBenefitAmount(0);

// Get all details
const allDetails = await benefits.getAllBenefitDetails();
// Returns: [{ name: string, description: string, amount: string }, ...]

// Get visible benefits
const names = await benefits.getVisibleBenefitNames();
```

#### Eligibility & Key Facts
```typescript
// Get eligibility criteria
const eligibility = await benefits.getBenefitEligibility(0);
// Returns: ['18 ans ou plus', 'Résidence en Belgique', ...]

// Get key facts
const facts = await benefits.getBenefitKeyFacts(0);
// Returns: { amount: '1070€', application: 'CPAS', processing: '30 jours' }
```

#### Benefit Interaction
```typescript
// Click benefit
await benefits.clickBenefit(0); // By index
await benefits.clickBenefitByName('RIS'); // By name

// Expand benefit
await benefits.expandBenefit(0);

// Check if expandable
const expandable = await benefits.isBenefitExpandable(0);

// Click actions
await benefits.clickLearnMore(0);
await benefits.clickApply(0);
```

#### Categories
```typescript
// Get available categories
const categories = await benefits.getCategoryTabs();

// Get specific category benefits
const empBenefits = await benefits.getEmploymentBenefits();
const famBenefits = await benefits.getFamilyBenefits();
```

---

### ComparisonPage

**Location:** `/comparison?machine=id1&machine=id2`

#### Navigation
```typescript
const comparison = new ComparisonPage(page);

// Navigate with workflows
await comparison.goto(['workflow1', 'workflow2', 'workflow3']);

// Without workflows (shows empty state)
await comparison.goto();
```

#### Comparison Data
```typescript
// Get compared workflow count
const count = await comparison.getComparedWorkflowCount();

// Get workflow names in columns
const name1 = await comparison.getWorkflowNameInColumn(0);
const name2 = await comparison.getWorkflowNameInColumn(1);

// Get specific comparison value
const complexity = await comparison.getComparisonValue('Complexité', 0);

// Get all values in a row
const complexities = await comparison.getComplexityComparison();
const states = await comparison.getStatesComparison();
const events = await comparison.getEventsComparison();

// Get all row labels
const labels = await comparison.getAllRowLabels();

// Get full comparison data
const data = await comparison.getFullComparisonData();
// Returns: { 'Nom': ['RIS', 'AGR'], 'Complexité': ['Medium', 'Simple'], ... }
```

#### Management
```typescript
// Remove workflow from comparison
await comparison.removeWorkflow(0);

// Add new workflow
await comparison.clickAddWorkflow();
await comparison.searchForWorkflow('test');
await comparison.selectWorkflowSuggestion(0);
```

#### Export & Actions
```typescript
await comparison.clickDownload();
await comparison.clickExport();
await comparison.clickPrint();
```

#### Table Management
```typescript
// Sort by column
await comparison.sortByColumn(0, true); // ascending
await comparison.sortByColumn(1, false); // descending

// Scroll table
const scrollable = await comparison.isTableScrollable();
await comparison.scrollTableHorizontally(100);

// Check states
const isEmpty = await comparison.isEmpty();
const hasError = await comparison.hasError();
const isLoading = await comparison.isLoading();
```

---

## Complete Example Test

```typescript
import { test, expect } from '@playwright/test';
import { HomePage, WorkflowDetailPage, BenefitsPage, ComparisonPage } from '../helpers/pages';

test.describe('PAA Frontend User Journey', () => {
  test('search and compare workflows', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);
    const comparisonPage = new ComparisonPage(page);

    // Navigate to home
    await homePage.goto();
    expect(await homePage.getWorkflowCount()).toBeGreaterThan(0);

    // Search for workflow
    await homePage.searchForWorkflow('RIS');
    const names = await homePage.getVisibleWorkflowNames();
    expect(names.some(n => n.toUpperCase().includes('RIS'))).toBeTruthy();

    // Click first workflow
    await homePage.clickWorkflowCard(0);
    await detailPage.waitForWorkflowLoaded();
    const title = await detailPage.getWorkflowTitle();
    expect(title).toBeTruthy();

    // Check details
    const description = await detailPage.getPlainLanguageDescription();
    expect(description.length).toBeGreaterThan(0);

    // Go back and select for comparison
    await detailPage.clickBack();
    await homePage.selectWorkflowForComparison(0);
    await homePage.selectWorkflowForComparison(1);
    const selected = await homePage.getSelectedWorkflowCount();
    expect(selected).toBe(2);

    // Start comparison
    await homePage.clickCompare();
    await comparisonPage.waitForTableLoaded();

    // Verify comparison data
    const data = await comparisonPage.getFullComparisonData();
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  test('navigate benefits and filter', async ({ page }) => {
    const benefitsPage = new BenefitsPage(page);

    await benefitsPage.goto();
    await benefitsPage.waitForBenefitsLoaded();

    // Get employment benefits
    const empBenefits = await benefitsPage.getEmploymentBenefits();
    expect(empBenefits.length).toBeGreaterThan(0);

    // Get first benefit details
    const details = await benefitsPage.getAllBenefitDetails();
    expect(details[0].name).toBeTruthy();
    expect(details[0].amount).toBeTruthy();

    // Check eligibility
    const eligibility = await benefitsPage.getBenefitEligibility(0);
    expect(eligibility.length).toBeGreaterThan(0);

    // Check key facts
    const facts = await benefitsPage.getBenefitKeyFacts(0);
    expect(Object.keys(facts).length).toBeGreaterThan(0);
  });

  test('workflow detail tabs', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new WorkflowDetailPage(page);

    await homePage.goto();
    await homePage.clickWorkflowCard(0);
    await detailPage.waitForWorkflowLoaded();

    // Check overview
    await detailPage.clickTab('overview');
    const description = await detailPage.getPlainLanguageDescription();
    expect(description.length).toBeGreaterThan(0);

    // Check legal
    await detailPage.clickTab('legal');
    const refCount = await detailPage.getLegalReferenceCount();
    expect(refCount).toBeGreaterThan(0);

    // Check examples
    await detailPage.clickTab('examples');
    const exampleCount = await detailPage.getExampleCount();
    expect(exampleCount).toBeGreaterThanOrEqual(0);
  });
});
```

---

## Best Practices

### 1. Wait for Loading
Always wait for page load before performing actions:
```typescript
await page.waitForPageLoad();
await page.waitForLoadingComplete();
await detailPage.waitForWorkflowLoaded();
```

### 2. Use Meaningful Assertions
```typescript
// Good
expect(await homePage.getWorkflowCount()).toBeGreaterThan(0);
expect(await detailPage.getComplexity()).toBe('Medium');

// Avoid
expect(await homePage.getWorkflowCount()).toBeTruthy();
```

### 3. Handle Optionals
```typescript
// Good - Check if element exists first
if (await page.elementExists(locator)) {
  await page.click(locator);
}

// Good - Handle null returns
const error = await page.getErrorMessage();
if (error) {
  console.log('Error found:', error);
}
```

### 4. Test Isolation
```typescript
// Reset state in beforeEach if needed
test.beforeEach(async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
});
```

### 5. Semantic Selectors
Page objects prefer using `data-testid` attributes, falling back to semantic selectors:
```typescript
// In page object:
this.searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Search"]').first();
```

---

## Troubleshooting

### "Locator did not resolve to any element"
- Add waits: `await page.waitForPageLoad()`
- Check if element exists: `await page.elementExists(locator)`
- Use `.first()` to avoid multiple matches

### "Button is not enabled"
```typescript
const isEnabled = await page.isEnabled(locator);
if (!isEnabled) {
  // Handle or wait for button to enable
}
```

### "Timeout waiting for element"
```typescript
// Add custom timeout
try {
  await page.waitForElement(locator, 10000);
} catch {
  console.log('Element did not appear in time');
}
```

### "Stale element reference"
- Page objects create new locators dynamically
- Don't store locator references across page navigations
- Always get fresh locators from page object

---

## File Structure

```
tests/e2e/frontend/
├── helpers/
│   └── pages/
│       ├── BasePage.ts           # Common functionality
│       ├── HomePage.ts           # Home page object
│       ├── WorkflowDetailPage.ts # Workflow detail page object
│       ├── BenefitsPage.ts       # Benefits page object
│       ├── ComparisonPage.ts     # Comparison page object
│       └── index.ts              # Barrel export
├── user-journeys/
│   └── workflow-exploration.spec.ts
├── ui-regression/
│   └── visual-tests.spec.ts
└── README.md
```

---

## Contributing

When adding new selectors or methods:

1. Use `data-testid` attributes first
2. Fall back to semantic HTML selectors
3. Document the method with JSDoc
4. Add type hints for parameters and return values
5. Consider reusable patterns in BasePage
6. Test with both desktop and mobile viewports
