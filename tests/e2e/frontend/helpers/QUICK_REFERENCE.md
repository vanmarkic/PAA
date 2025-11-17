# Page Object Models - Quick Reference

## Files Created

### Page Objects (TypeScript)
1. **BasePage.ts** (240 lines)
   - Base class with common navigation, element interaction, and utility methods
   - Inherited by all other page objects
   - Methods: navigate, language, scroll, click, type, assert, load states

2. **HomePage.ts** (580 lines)
   - Home page with workflow browsing, search, filtering, and comparison
   - Methods: search, filter, select workflows, click cards, navigate sections

3. **WorkflowDetailPage.ts** (620 lines)
   - Workflow detail view with 5 tabs (overview, simulation, technical, legal, examples)
   - Methods: display info, switch tabs, view states/events, run simulations, view legal refs

4. **BenefitsPage.ts** (580 lines)
   - Benefits guide page with categorized benefits
   - Methods: search, filter by category, view details, expand cards, get eligibility info

5. **ComparisonPage.ts** (600 lines)
   - Workflow comparison page with side-by-side comparison table
   - Methods: view data, remove workflows, add workflows, export, sort

6. **index.ts** (15 lines)
   - Barrel export for easy importing all page objects

### Documentation (Markdown)
1. **README.md** (280 lines)
   - Overview of page object model pattern
   - Quick start guide
   - Page object descriptions
   - Selector strategy
   - Best practices
   - Debugging tips

2. **USAGE_GUIDE.md** (620 lines)
   - Detailed usage examples for each page object
   - Complete API reference with code snippets
   - Full example test suite
   - Best practices and patterns
   - Troubleshooting guide

3. **QUICK_REFERENCE.md** (This file)
   - Quick lookup for file locations and methods

### Example Tests
1. **example-workflow.spec.ts** (620 lines)
   - Real-world test examples
   - 15+ test cases covering all page objects
   - Demonstrates user journeys
   - Shows common patterns and best practices

## File Locations

```
tests/e2e/frontend/
├── helpers/
│   ├── pages/
│   │   ├── BasePage.ts           ← Common functionality
│   │   ├── HomePage.ts           ← Home page object
│   │   ├── WorkflowDetailPage.ts ← Workflow detail page object
│   │   ├── BenefitsPage.ts       ← Benefits page object
│   │   ├── ComparisonPage.ts     ← Comparison page object
│   │   └── index.ts              ← Barrel export (import all from here)
│   ├── README.md                 ← Main documentation
│   ├── USAGE_GUIDE.md           ← Detailed examples
│   └── QUICK_REFERENCE.md       ← This file
├── user-journeys/
│   └── example-workflow.spec.ts  ← Example tests (NEW)
└── [other directories]
```

## Quick Start

### Import All Page Objects
```typescript
import {
  HomePage,
  WorkflowDetailPage,
  BenefitsPage,
  ComparisonPage,
  BasePage // if needed
} from '../helpers/pages';
```

### Basic Usage Pattern
```typescript
import { test } from '@playwright/test';
import { HomePage } from '../helpers/pages';

test('example', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();                    // Navigate to page
  await homePage.waitForWorkflowsLoaded();  // Wait for content

  const count = await homePage.getWorkflowCount();  // Get data
  // ... assertions ...
});
```

## Page Object Methods Summary

### HomePage
```typescript
// Search & Filter
searchForWorkflow(query)
clearSearch()
filterByCategory(name)
filterByComplexity(level)
clearAllFilters()

// Workflow Cards
getWorkflowCount()
clickWorkflowCard(index)
clickWorkflowByName(name)
getVisibleWorkflowNames()

// Comparison
selectWorkflowForComparison(index)
selectMultipleWorkflows(indices)
getSelectedWorkflowCount()
clickCompare()

// Navigation
navigateToWizard()
navigateToBenefits()
navigateToComparison()
navigateToDeveloper()

// States
waitForWorkflowsLoaded(timeout)
isLoading()
getError()
clickRetry()
```

### WorkflowDetailPage
```typescript
// Navigation
goto(workflowId)
clickBack()
clickTab(tabName)

// Info
getWorkflowTitle()
getCategory()
getComplexity()
getPlainLanguageDescription()

// States & Events
getStateCount()
getEventCount()
getStatesList()
isDiagramVisible()

// Simulation
fillSimulationField(field, value)
runSimulation()
getSimulationResult()

// Legal References
getLegalReferenceCount()
getLegalReferenceText(index)
clickLegalReference(index)
scrollToLegalSection()

// Examples
getExampleCount()
getExampleCode(index)
scrollToExamples()

// Actions
clickDownload()
clickShare()
clickCompare()
clickViewGherkin()
```

### BenefitsPage
```typescript
// Search & Filter
searchBenefit(query)
clearSearch()
filterByCategory(name)
getEmploymentBenefits()
getFamilyBenefits()

// Benefit Cards
getBenefitCount()
getBenefitName(index)
getBenefitDescription(index)
getBenefitAmount(index)
clickBenefit(index)
clickBenefitByName(name)

// Eligibility & Details
getBenefitEligibility(index)
getBenefitKeyFacts(index)
getAllBenefitDetails()

// Interaction
expandBenefit(index)
clickLearnMore(index)
clickApply(index)
isBenefitExpandable(index)

// Navigation
getVisibleBenefitNames()
getCategoryTabs()
getPageTitle()
getPageDescription()
```

### ComparisonPage
```typescript
// Navigation
goto(machineIds?)
clickBack()
clickGoHome()

// Comparison Data
getComparedWorkflowCount()
getWorkflowNameInColumn(index)
getComparisonValue(rowName, columnIndex)
getRowValues(rowName)
getAllRowLabels()
getFullComparisonData()

// Specific Comparisons
getComplexityComparison()
getStatesComparison()
getEventsComparison()

// Management
removeWorkflow(index)
clickAddWorkflow()
searchForWorkflow(query)
selectWorkflowSuggestion(index)

// Actions
clickDownload()
clickExport()
clickPrint()
sortByColumn(index, ascending)

// States
isTableVisible()
isEmpty()
hasError()
hasMinimumWorkflowsWarning()
```

### BasePage (Available in All)
```typescript
// Navigation
navigateToHome()
changeLanguage(code)
goBack()
reload()
waitForUrl(pattern)

// Element Interaction
click(locator)
typeText(locator, text)
hover(locator)
doubleClick(locator)
scrollToElement(locator)
scrollToTop()
scrollToBottom()

// Element Inspection
isVisible(locator)
getText(locator)
getAttribute(locator, name)
isDisabled(locator)
isEnabled(locator)
elementExists(locator)
getElementCount(locator)

// Page States
waitForPageLoad()
waitForElement(locator)
waitForLoadingComplete()
getErrorMessage()
getTitle()
getCurrentUrl()
```

## Selector Patterns Used

### Data TestID (Preferred)
```typescript
page.locator('[data-testid="search-input"]')
```

### Semantic HTML
```typescript
page.locator('h1').first()
page.locator('button:has-text("Search")')
page.locator('input[placeholder*="search"]')
```

### Role-Based
```typescript
page.locator('[role="tab"]')
page.locator('[role="alert"]')
page.locator('[role="progressbar"]')
```

## Running Tests

```bash
# All frontend tests
npm run test:docs

# Specific test file
npx playwright test tests/e2e/frontend/user-journeys/example-workflow.spec.ts

# Interactive UI mode
npx playwright test --ui

# Headed (see browser)
npm run test:docs:headed

# Debug mode
npm run test:docs:debug

# Show HTML report
npm run test:docs:report
```

## Configuration

- **Base URL**: `http://localhost:4321` (Astro preview server)
- **Timeout**: 30 seconds per test
- **Browsers**: Chrome, Firefox, Safari + mobile viewports
- **Config File**: `/home/user/PAA/playwright.config.ts`

## Best Practices

1. ✅ Always wait for page load: `await page.waitForPageLoad()`
2. ✅ Use data-testid selectors: `[data-testid="element-name"]`
3. ✅ Handle optional elements: `if (await page.elementExists(locator)) { ... }`
4. ✅ Clear state between tests: `test.beforeEach(async () => { ... })`
5. ✅ Use specific assertions: `expect(count).toBeGreaterThan(0)`
6. ✅ Meaningful test names: "should search and filter workflows"

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Locator did not resolve" | Add `await page.waitForPageLoad()` before interactions |
| "Element is disabled" | Check `await page.isEnabled(locator)` before click |
| "Timeout" | Use `.first()` for multiple matches or increase timeout |
| "Stale element" | Don't store locators - get fresh from page object |
| "Multiple elements" | Add `.first()` or make selector more specific |

## Documentation Files

- **README.md** - Comprehensive overview and setup
- **USAGE_GUIDE.md** - Detailed usage examples for all methods
- **QUICK_REFERENCE.md** - This file, quick lookup guide
- **example-workflow.spec.ts** - Real test examples

## Key Features

✨ **Type-Safe**: Full TypeScript support with proper types
🎯 **Selector Strategy**: Multi-layer fallbacks (data-testid → semantic → role)
🔧 **Reusable**: BasePage inheritance for common functionality
📚 **Well-Documented**: JSDoc comments on all methods
🧪 **Practical**: Methods mirror actual user behavior
🌍 **Multi-Language**: Support for FR, NL, EN switching
📱 **Responsive**: Works with desktop and mobile viewports
⚡ **Easy to Use**: Simple barrel export for clean imports

## Next Steps

1. Read `/home/user/PAA/tests/e2e/frontend/helpers/README.md`
2. Check `/home/user/PAA/tests/e2e/frontend/helpers/USAGE_GUIDE.md`
3. Review `/home/user/PAA/tests/e2e/frontend/user-journeys/example-workflow.spec.ts`
4. Run example tests: `npx playwright test example-workflow.spec.ts`
5. Create your own tests using the patterns shown

## Support

All page objects are designed to be:
- Easy to understand and maintain
- Well-commented with JSDoc
- Flexible for different test scenarios
- Resilient with fallback selectors

For detailed examples, see USAGE_GUIDE.md
For issues, check README.md "Troubleshooting" section
