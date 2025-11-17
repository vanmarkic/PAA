# Page Object Models - Frontend E2E Testing

This directory contains TypeScript page object models for testing the PAA (Plateforme d'Aide Administrative) React frontend using Playwright.

## Overview

Page Object Models (POM) is a design pattern that enhances test maintenance and reduces duplication. This implementation provides:

- **Reusable page objects** for each major page/feature
- **Common base class** with shared functionality
- **Type-safe selectors** using TypeScript
- **Practical action methods** that mirror user behavior
- **Easy imports** via barrel export

## Structure

```
helpers/
├── pages/
│   ├── BasePage.ts           # Base class with common methods
│   ├── HomePage.ts           # Home page object
│   ├── WorkflowDetailPage.ts # Workflow detail page object
│   ├── BenefitsPage.ts       # Benefits page object
│   ├── ComparisonPage.ts     # Comparison/contrast page object
│   └── index.ts              # Barrel export for easy imports
├── README.md                 # This file
└── USAGE_GUIDE.md           # Detailed usage guide
```

## Quick Start

### Basic Import

```typescript
import { HomePage, WorkflowDetailPage, BenefitsPage, ComparisonPage } from '../helpers/pages';

test('example test', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.searchForWorkflow('RIS');
});
```

### Running Tests

```bash
# Run all frontend e2e tests
npm run test:docs

# Run specific test file
npx playwright test tests/e2e/frontend/user-journeys/example-workflow.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npm run test:docs:headed

# Debug mode
npm run test:docs:debug
```

## Page Objects

### BasePage
Common functionality shared by all pages:
- Navigation methods (`navigateToHome()`, `goBack()`)
- Language switching (`changeLanguage()`)
- Element interactions (`click()`, `typeText()`, `hover()`)
- Loading states (`waitForLoadingComplete()`)
- Error handling (`getErrorMessage()`)
- Scrolling (`scrollToTop()`, `scrollToElement()`)

### HomePage
Home page with workflow browsing:
- **Search**: `searchForWorkflow()`, `clearSearch()`
- **Filter**: `filterByCategory()`, `filterByComplexity()`
- **Cards**: `getWorkflowCount()`, `clickWorkflowCard()`, `getVisibleWorkflowNames()`
- **Compare**: `selectWorkflowForComparison()`, `clickCompare()`
- **Navigate**: `navigateToWizard()`, `navigateToBenefits()`, etc.

### WorkflowDetailPage
Workflow detail view with tabs:
- **Info**: `getWorkflowTitle()`, `getCategory()`, `getComplexity()`
- **Tabs**: `clickTab('overview|simulation|technical|legal|examples')`
- **Overview**: `getPlainLanguageDescription()`, `getKeywords()`
- **States**: `getStateCount()`, `getStatesList()`, `isDiagramVisible()`
- **Simulation**: `fillSimulationField()`, `runSimulation()`, `getSimulationResult()`
- **Legal**: `getLegalReferenceCount()`, `getLegalReferenceText()`
- **Examples**: `getExampleCount()`, `getExampleCode()`

### BenefitsPage
Benefits guide page:
- **Search**: `searchBenefit()`, `clearSearch()`
- **Filter**: `filterByCategory()`, `getEmploymentBenefits()`, `getFamilyBenefits()`
- **Cards**: `getBenefitCount()`, `getBenefitName()`, `getBenefitDescription()`
- **Details**: `getBenefitEligibility()`, `getBenefitKeyFacts()`, `getBenefitAmount()`
- **Interact**: `clickBenefit()`, `expandBenefit()`, `clickLearnMore()`

### ComparisonPage
Workflow comparison page:
- **Data**: `getFullComparisonData()`, `getComparisonValue()`, `getRowValues()`
- **Workflows**: `getComparedWorkflowCount()`, `getWorkflowNameInColumn()`, `removeWorkflow()`
- **Actions**: `clickDownload()`, `clickExport()`, `clickPrint()`
- **Table**: `getComparisonRowCount()`, `sortByColumn()`, `isTableScrollable()`

## Selector Strategy

Page objects use a layered selector approach for reliability:

1. **Primary**: `data-testid` attributes (explicitly added for testing)
2. **Secondary**: Semantic HTML (`h1`, `button:has-text()`, etc.)
3. **Fallback**: Role-based selectors (`[role="tab"]`, `[role="alert"]`)

Example:
```typescript
this.searchInput = page.locator(
  '[data-testid="search-input"], ' +          // Explicit test ID
  'input[placeholder*="Recherch"], ' +         // French placeholder
  'input[placeholder*="Search"]'               // English placeholder
).first();
```

## Best Practices

### 1. Always Wait for Page Load
```typescript
await homePage.goto();
await homePage.waitForPageLoad();
```

### 2. Use Specific Assertions
```typescript
const count = await homePage.getWorkflowCount();
expect(count).toBeGreaterThan(0); // Good - specific assertion

expect(await homePage.getWorkflowCount()).toBeTruthy(); // Avoid - too vague
```

### 3. Handle Optional Elements
```typescript
if (await page.elementExists(locator)) {
  await page.click(locator);
}
```

### 4. Clear State Between Tests
```typescript
test.beforeEach(async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.clearSearch();
});
```

### 5. Use Meaningful Test Names
```typescript
// Good - describes what the test does
test('should filter workflows by complexity level');

// Avoid - too generic
test('filtering works');
```

## Common Patterns

### Search and Verify Results
```typescript
const page = new HomePage(page);
await page.goto();
await page.waitForWorkflowsLoaded();
await page.searchForWorkflow('RIS');

const names = await page.getVisibleWorkflowNames();
expect(names.some(n => n.includes('RIS'))).toBeTruthy();
```

### Navigate and Check Details
```typescript
const home = new HomePage(page);
const detail = new WorkflowDetailPage(page);

await home.goto();
await home.clickWorkflowCard(0);
await detail.waitForWorkflowLoaded();

const title = await detail.getWorkflowTitle();
expect(title).toBeTruthy();
```

### Compare Multiple Items
```typescript
const home = new HomePage(page);
const comparison = new ComparisonPage(page);

await home.goto();
await home.selectMultipleWorkflows([0, 1, 2]);
await home.clickCompare();

const data = await comparison.getFullComparisonData();
expect(Object.keys(data).length).toBeGreaterThan(0);
```

### Handle Multi-Language
```typescript
await page.changeLanguage('fr');
// Page updates with French content

await page.changeLanguage('nl');
// Page updates with Dutch content
```

## Extending Page Objects

### Add New Page Object
1. Create file: `src/pages/NewPage.ts`
2. Extend `BasePage`:
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewPage extends BasePage {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1').first();
  }

  async goto() {
    await this.page.goto('/new-path');
    await this.waitForPageLoad();
  }
}
```
3. Export in `index.ts`
4. Use in tests

### Add Methods to Existing Page
```typescript
// In WorkflowDetailPage class
async getFullWorkflowInfo() {
  return {
    title: await this.getWorkflowTitle(),
    category: await this.getCategory(),
    complexity: await this.getComplexity(),
    description: await this.getPlainLanguageDescription(),
  };
}
```

## Locator Patterns

### By Text Content
```typescript
const button = page.locator('button:has-text("Click me")');
```

### By Attribute
```typescript
const input = page.locator('input[data-testid="search"]');
```

### By Role
```typescript
const tab = page.locator('[role="tab"]:has-text("Overview")');
```

### By Position
```typescript
const firstCard = page.locator('[data-testid="card"]').first();
const nthCard = page.locator('[data-testid="card"]').nth(3);
```

### By Combination
```typescript
const activeTab = page.locator('[role="tab"][aria-selected="true"]');
```

## Debugging

### Enable Debug Mode
```bash
npx playwright test --debug
```

### Print Locator Details
```typescript
const count = await page.locator('[data-testid="card"]').count();
console.log(`Found ${count} cards`);
```

### Take Screenshots
```typescript
await page.screenshot({ path: 'debug.png', fullPage: true });
```

### Trace Viewer
```typescript
const trace = await page.context().tracing;
await trace.startChunk();
// ... test actions ...
await trace.stopChunk({ path: 'trace.zip' });
```

## Configuration

### Playwright Config
Located in project root: `playwright.config.ts`

Key settings:
- `baseURL`: `http://localhost:4321`
- `timeout`: 30 seconds per test
- `retries`: 2 on CI, 0 locally
- `workers`: Parallel test execution
- `screenshot`: On failure only

### Environment Variables
```bash
# Override base URL for tests
export PLAYWRIGHT_BASE_URL=http://localhost:3000

# Run specific browser
npx playwright test --project=firefox
```

## Troubleshooting

### "Locator did not resolve to any element"
- Add explicit waits: `await page.waitForPageLoad()`
- Check if element exists: `await page.elementExists(locator)`
- Use `.first()` for multiple matches: `locator.first()`

### "Element is disabled"
```typescript
await page.waitForElement(locator); // Waits for visibility
// or
const enabled = await page.isEnabled(locator);
if (!enabled) { /* handle */ }
```

### "Timeout waiting"
- Increase timeout: `await page.waitForElement(locator, 15000)`
- Check network: `await page.waitForLoadState('networkidle')`
- Add debug logging

### "Stale element reference"
- Never store locators across navigations
- Always get fresh locators from page object
- Use dynamic locators, not stored references

## Resources

- **Playwright Docs**: https://playwright.dev
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-page
- **Debugging**: https://playwright.dev/docs/debug
- **Project CLAUDE.md**: `/home/user/PAA/CLAUDE.md`

## Contributing

When modifying page objects:

1. Keep methods focused and single-responsibility
2. Use JSDoc comments for all public methods
3. Add TypeScript types for parameters and returns
4. Test with multiple browsers (Chrome, Firefox, Safari)
5. Test with mobile viewport when applicable
6. Avoid flaky selectors (use data-testid when possible)
7. Document new patterns in USAGE_GUIDE.md

## Example Tests

See `/tests/e2e/frontend/user-journeys/example-workflow.spec.ts` for:
- Homepage search and filtering
- Workflow detail navigation
- Benefits page interaction
- Comparison page data verification
- Multi-language support
- Responsive design testing

## Support

For issues or questions:
1. Check USAGE_GUIDE.md for detailed examples
2. Review example-workflow.spec.ts for patterns
3. Enable debug mode: `npx playwright test --debug`
4. Check Playwright documentation
5. Examine browser console for JavaScript errors
