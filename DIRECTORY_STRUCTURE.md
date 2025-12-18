# PAA Directory Structure

This document provides an overview of the PAA repository's directory structure and organization principles.

## Root Directory

```
PAA/
├── .github/          # GitHub Actions workflows and configurations
├── .husky/           # Git hooks for code quality (pre-commit, etc.)
├── database/         # Database-related files and scraping data
├── docs/             # Project documentation
├── docs-astro/       # Astro-based documentation site
├── features/         # Gherkin/Cucumber BDD feature files
├── scripts/          # Build and automation scripts
├── src/              # Main source code
├── tests/            # End-to-end tests
└── Configuration files (package.json, tsconfig.json, etc.)
```

## Key Directories

### `/src` - Source Code
Main application source code following Domain-Driven Design principles:

- **`__tests__/`** - Unit and integration tests (Jest)
  - `semantic/` - Semantic validation tests
  - `visualization/` - Visualization component tests
- **`ai/`** - AI/ML related functionality
- **`domain/`** - Core domain models and types (pure business logic)
- **`legal-sources/`** - Belgian legal reference data
  - `__tests__/` - Tests for legal source handling
- **`rules/`** - Eligibility rules engine (json-rules-engine)
- **`utils/`** - Shared utility functions
- **`workflows/`** - XState machines for administrative procedures

### `/features` - Gherkin Specifications
Human-readable eligibility rules specifications:
- Organized by benefit type (AGR, RIS, etc.)
- Used for BDD testing with Cucumber
- Readable by legal experts and social workers

### `/docs` - Documentation
Project documentation organized by topic:

- **`analysis/`** - Analysis documents and summaries
- **`archive/`** - Historical documents (brainstorms, old plans)
  - `brainstorms/` - Iterative design brainstorms
- **`architecture/`** - System architecture documentation
- **`benefits/`** - Belgian benefits system analysis
- **`features/`** - Feature documentation
- **`implementation/`** - Implementation reports and summaries
- **`issues/`** - Known issues and migration plans
- **`legal/`** - Legal text handling documentation
- **`pipeline/`** - Scraping pipeline documentation
- **`plans/`** - Future development plans
- **`testing/`** - Testing strategy and E2E documentation
- **`visualization/`** - Visualization components documentation

Top-level docs:
- `METADATA_ARCHITECTURE.md` - Metadata system architecture
- `METADATA_GUIDE.md` - How to work with metadata
- `METHODOLOGY.md` - Project methodology
- `MIGRATION_PRIORITIES.md` - Migration task priorities
- `TERMINOLOGY_MAPPING.md` - Multilingual terminology reference
- `VERSIONING.md` - Versioning strategy

### `/docs-astro` - Documentation Website
Astro-based static site for browsing documentation:
- Separate package.json with its own dependencies
- See `docs-astro/README.md` for details

### `/scripts` - Automation Scripts
TypeScript scripts for code generation and maintenance:
- **`generate*`** - Code/documentation generation scripts
- **`add-new-law.ts`** - Interactive law addition tool
- **`monitorLegalSources.ts`** - Legal source change monitoring
- **`checkVersionCompliance.ts`** - Version compliance checker
- **`validate-links.ts`** - Documentation link validator

Note: Compiled JS files (`.js`, `.d.ts`, `.js.map`) are git-ignored and generated at build time.

### `/database` - Data Storage
Database-related files:
- **`registry.json`** - Registry of legal sources and metadata
- **`manual-law-search-needed.json`** - Laws requiring manual research
- **`scrapings/`** - Scraped legal text data with versioning

### `/tests` - E2E Tests
End-to-end tests (Playwright):
- **`e2e/`** - Browser-based integration tests

## File Organization Principles

### Compiled Artifacts
- All TypeScript compilation outputs (`.js`, `.d.ts`, `.js.map`) are git-ignored
- Exception: Intentional JS files like `analyzeFigmaSite.js` are tracked
- Build artifacts go to `dist/` directory (also git-ignored)

### Generated Documentation
- Generated HTML files (machine visualizations) are git-ignored
- Generated metadata JSON files are git-ignored
- Use `npm run docs:build` to regenerate all documentation

### Test Organization
- Unit tests: Co-located with source in `src/__tests__/`
- Integration tests: Also in `src/__tests__/`
- E2E tests: Separate `tests/e2e/` directory
- BDD scenarios: `features/` directory

### Documentation
- Active documentation in appropriate `docs/` subdirectories
- Historical/archived documents in `docs/archive/`
- Each major subdirectory should have a README explaining contents

## Configuration Files

Root-level configuration:
- **`package.json`** - NPM dependencies and scripts
- **`tsconfig.json`** - TypeScript compiler configuration
- **`jest.config.js`** - Jest testing framework configuration
- **`eslint.config.js`** - ESLint linting rules
- **`playwright.config.ts`** - Playwright E2E test configuration
- **`playwright.frontend.config.ts`** - Frontend-specific Playwright config
- **`.gitignore`** - Git ignore patterns
- **`.env.example`** - Example environment variables

## Naming Conventions

### Files
- TypeScript source: `camelCase.ts` or `PascalCase.ts` for classes
- Tests: `*.test.ts` or `*.spec.ts`
- Features: `kebab-case.feature`
- Documentation: `SCREAMING_SNAKE_CASE.md` or `kebab-case.md`

### Directories
- Lowercase with hyphens: `legal-sources/`
- Exception: `__tests__/` follows convention for test directories

## Build Outputs

### Generated Files (git-ignored)
- `dist/` - Compiled TypeScript output
- `scripts/compiled/` - Compiled script files
- `scripts/*.{js,d.ts,js.map}` - Individual compiled scripts (except tracked JS)
- `docs/**/*.html` - Generated visualization HTML
- `coverage/` - Test coverage reports
- `playwright-report/` - Test reports
- `node_modules/` - Dependencies

### Generated Files (tracked)
None currently - all generated content is regenerated during build.

## Getting Started

See [QUICKSTART.md](./QUICKSTART.md) for development setup and [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - AI assistant guidance for this codebase
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [README.md](./README.md) - Project overview
