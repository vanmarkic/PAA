# PAA Test Suite

This directory contains comprehensive tests for the Plateforme d'Aide Administrative (PAA) project.

## Test Files

### 1. `mermaid-syntax.test.ts`
**Purpose:** Validates Mermaid diagram syntax across all documentation files

**Coverage:**
- ✅ Validates stateDiagram-v2 syntax usage
- ✅ Checks for HTML tags in state diagrams
- ✅ Validates choice state declarations with `<<choice>>` syntax
- ✅ Ensures choice state transitions use square bracket syntax (e.g., `[retryCount < 3]`)
- ✅ Prevents old underscore naming patterns (e.g., `retryCount_less_3`)
- ✅ Validates all Mermaid blocks in:
  - `ARCHITECTURE.md`
  - `docs/state-machines-visualization.md`
  - `docs/index.html`

**Key Tests:**
```typescript
// Validates proper choice state syntax
checkingRetries --> regeneratingWithConstraints: [retryCount < 3]  // ✅ Correct
checkingRetries --> failed: [retryCount >= 3]                      // ✅ Correct

// Rejects old patterns
checkingRetries --> regeneratingWithConstraints: retryCount_less_3 // ❌ Wrong
```

### 2. `ui-visualization.test.ts`
**Purpose:** Comprehensive UI tests for the PAA visualization HTML page

**Coverage:**

#### HTML Structure Tests
- ✅ Document structure (doctype, meta tags, charset)
- ✅ Page title and header content
- ✅ Mermaid library integration
- ✅ Main container presence
- ✅ Responsive design styles
- ✅ Gradient background styling

#### Language Support Tests
- ✅ Three language options (English, French, Dutch)
- ✅ Language selector functionality
- ✅ Content sections for all languages
- ✅ Default language (English) activation
- ✅ Multilingual footer tagline

#### Navigation Tests
- ✅ Five tabs per language (Overview, Architecture, RIS, Conversion, About)
- ✅ Tab labels and ordering
- ✅ Default active tab
- ✅ Tab switching functionality

#### Mermaid Diagram Tests
- ✅ Presence of multiple diagrams
- ✅ RIS workflow state diagrams (11 states, 11 events)
- ✅ Legal Conversion Pipeline diagrams (8 states, 9 events)
- ✅ All diagrams use stateDiagram-v2 syntax
- ✅ **Choice state syntax validation** (square brackets)

#### Content Validation Tests
- ✅ RIS amounts for 2024 (€1,070.49, €713.66, €1,450.52)
- ✅ Impact metrics (+287%, +171%, -82%, -83%)
- ✅ Info boxes with explanations
- ✅ Feature badges
- ✅ Technology stack documentation (XState v5.24.0, TypeScript, json-rules-engine)

#### Interactive Features Tests
- ✅ `switchLanguage()` function availability
- ✅ `showTab()` function availability
- ✅ Event handlers for buttons

#### Architecture Documentation Tests
- ✅ System architecture overview
- ✅ State machines integration diagrams
- ✅ Technology stack information
- ✅ Component documentation

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- mermaid-syntax.test.ts
npm test -- ui-visualization.test.ts
```

## Test Environment

- **Testing Framework:** Jest 30.2.0
- **TypeScript Support:** ts-jest 29.4.5
- **DOM Testing:** JSDOM 25.0.1
- **Node Environment:** Used for syntax validation tests
- **JSDOM Environment:** Used for UI tests

## Recent Changes

### Fixed: Conversion Validation Choice State Syntax (2025-11-16)

**Issue:** The Legal Text Conversion Pipeline state machine was using incorrect syntax for choice state transitions in `docs/index.html`.

**Before (❌ Incorrect):**
```mermaid
state checkingRetries <<choice>>
checkingRetries --> regeneratingWithConstraints: retryCount_less_3
checkingRetries --> failed: retryCount_greater_equal_3
```

**After (✅ Correct):**
```mermaid
state checkingRetries <<choice>>
checkingRetries --> regeneratingWithConstraints: [retryCount < 3]
checkingRetries --> failed: [retryCount >= 3]
```

**Tests Added:**
1. `mermaid-syntax.test.ts` now validates choice state syntax with square brackets
2. `ui-visualization.test.ts` includes specific test for conversion pipeline choice states
3. Both tests ensure old underscore patterns are rejected

## Test Coverage Goals

- **Target:** 80%+ code coverage
- **Critical Paths:** 100% coverage for state machine transitions
- **Documentation:** All Mermaid diagrams validated
- **UI Components:** All interactive features tested

## Contributing

When adding new features:
1. Add corresponding tests in the appropriate test file
2. Update this README with test descriptions
3. Ensure all tests pass before committing
4. Aim for meaningful test descriptions that explain the "why"

## Continuous Integration

Tests are automatically run on:
- Every commit
- Pull request creation
- Pre-deployment checks

Ensure all tests pass before pushing to the repository.
