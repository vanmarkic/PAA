# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PAA (Plateforme d'Aide Administrative)** is a proof-of-concept demonstrating how to encode complex Belgian social/legal business logic into maintainable, executable code. The system converts legal text to common language and calculates benefit eligibility for social services.

## Essential Commands

### Development
```bash
npm run build              # Compile TypeScript to dist/
npm run typecheck          # Type-check without emitting files
npm run dev:api            # Start API server in development mode
npm start                  # Start production API server (requires build)
```

### Testing & Quality
```bash
npm test                   # Run all Jest tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:visualization # Run visualization-specific tests
npm run cucumber           # Run Cucumber/Gherkin BDD tests

npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix linting issues
```

### Database (TypeORM + PostgreSQL)
```bash
npm run docker:up          # Start PostgreSQL and Redis containers
npm run docker:down        # Stop Docker containers
npm run migration:generate # Generate migration from entities
npm run migration:run      # Apply pending migrations
npm run migration:revert   # Revert last migration
```

### Examples
```bash
npm run example:agr                # AGR eligibility check examples
npm run example:ris                # RIS eligibility check examples
npm run example:ris:workflow       # RIS workflow state machine demo
npm run example:conversion         # Legal text conversion pipeline demo
```

### Documentation Generation
```bash
npm run docs:generate      # Generate visualization documentation
npm run docs:metadata      # Generate machine metadata for all workflows
```

## Hybrid Architecture

This codebase uses a **hybrid approach** combining multiple tools, each serving a specific purpose:

### 1. Gherkin/Cucumber - Business Rules Specification
- **Purpose**: Human-readable specifications for legal rules
- **Location**: `features/` directory
- **Why**: Legal experts and social workers can validate rules without reading code
- **Example**: `features/benefits/income-guarantee.feature`, `features/benefits/ris.feature`

### 2. XState - Workflow State Machines
- **Purpose**: Visual, predictable workflow orchestration
- **Location**: `src/workflows/` directory
- **Why**: Complex multi-step processes (legal text conversion, application workflows) need explicit state management
- **Key machine**: `src/workflows/conversionMachine.ts` - demonstrates the legal text conversion pipeline
- **Pattern**: All workflows follow similar structure with states, transitions, guards, and meta descriptions

### 3. json-rules-engine - Runtime Rule Evaluation
- **Purpose**: Dynamic, database-driven business rules
- **Location**: `src/rules/` directory
- **Why**: Rules can be updated without deployment, stored in database, and audited
- **Examples**: `src/rules/agrRules.ts`, `src/rules/risRules.ts`

### 4. TypeScript - Type-Safe Implementation
- **Purpose**: Compile-time safety for critical calculations
- **Core types**: `src/domain/types.ts` - Contains all domain models (User, Benefit, LegalText, etc.)
- **Why**: Prevent errors in money/date calculations, enable refactoring confidence

## Architecture Patterns

### Domain-Driven Design (DDD)
- **Domain models**: `src/domain/` - Pure business entities and types
- **Services**: `src/services/` - Business logic orchestration
- **Entities**: `src/database/entities/` - TypeORM database entities
- **Ubiquitous language**: Use French terminology for Belgian legal concepts (AGR, RIS, CPAS, etc.)

### State Machine Workflow Pattern
All workflows in `src/workflows/` follow this structure:
```typescript
- idle state (starting point)
- Processing states (business logic execution)
- Validation/retry logic with max attempts
- completed (final success state)
- failed (final error state requiring human intervention)
```

Each state includes:
- `meta.description` - What the state does
- Transition guards - Conditional logic
- Actions using `assign()` - Context updates

### API Architecture (Fastify)
- **Server**: `src/api/server.ts` - Main Fastify application
- **Routes**: `src/api/routes/` - Route definitions
- **Controllers**: `src/api/controllers/` - Request handling logic
- **Middleware**: `src/middleware/` - Authentication, logging
- **Security**: Helmet, CORS, rate limiting, JWT authentication
- **Documentation**: Swagger/OpenAPI at `/docs` endpoint

### Data Layer
- **Database**: PostgreSQL via TypeORM
- **Caching**: Redis via `src/cache/cacheService.ts` (LRU cache)
- **Queuing**: Bull/Redis via `src/queue/conversionQueue.ts` for async jobs
- **Audit**: `src/utils/auditService.ts` - Track all eligibility checks and decisions

## Key Technical Decisions

### Why This Hybrid Approach?
- **Gherkin** defines **what** rules are (readable by legal experts)
- **XState** defines **how** processes flow (visual workflows with state)
- **json-rules-engine** defines **when** conditions apply (runtime evaluation)
- **TypeScript** provides **implementation** safety (type guarantees)

### XState Machine Patterns
When working with state machines:
1. Keep states focused - one responsibility per state
2. Always handle error states and timeouts
3. Use guards for conditional transitions
4. Document states with meta descriptions
5. Implement retry logic with max attempts (typically 3)
6. Include final states (completed/failed)

### Legal Text Handling
- All legal references use `LegalReference` type from `src/domain/types.ts`
- Belgian legal sources: `src/legal-sources/belgianLegalSources.ts` (FR), `belgianLegalSources.nl.ts` (NL)
- Metadata tracking: `src/domain/legalMetadata.ts`
- Multi-language support: FR (primary), NL, DE

### Testing Philosophy
- Jest for unit/integration tests
- Cucumber for BDD scenarios matching business rules
- Test files in `src/__tests__/` directory
- Semantic validation tests: `src/__tests__/semantic/`
- Visualization tests: `src/__tests__/visualization/`

## Critical Implementation Notes

### TypeORM Configuration
- Auto-sync enabled in development only (`synchronize: true` when NODE_ENV !== 'production')
- Migrations required for production schema changes
- Entities use decorators (`@Entity`, `@Column`, etc.)
- Connection pooling configured (min: 5, max: 20 connections)

### Environment Variables
Required for production:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL
- `REDIS_HOST`, `REDIS_PORT` - Redis cache/queue
- `JWT_SECRET` - Authentication (MUST change from default)
- `NODE_ENV` - Set to 'production' for production builds
- `PORT`, `HOST` - API server binding (default: 3000, 0.0.0.0)

### Belgian Social Benefits Context
- **AGR** (Allocation de Garantie de Revenus) - Income guarantee for part-time workers
- **RIS** (Revenu d'Intégration Sociale) - Social integration income
- **CPAS** (Centre Public d'Action Sociale) - Public social welfare center
- Benefits have complex eligibility rules based on employment status, income, family situation
- Rules change frequently - must be versioned and auditable

### Workflow Machine Metadata
- Generate metadata for visualization: `npm run docs:metadata`
- Metadata helper: `src/utils/machineMetadataHelper.ts`
- Used for automatic documentation and UI generation

## Docker Infrastructure

Services defined in `docker-compose.yml`:
- **postgres**: PostgreSQL 15 database (port 5432)
- **redis**: Redis 7 cache/queue (port 6379)
- **pgadmin**: Database UI (port 5050, user: admin@paa.local, pass: admin)
- **redis-commander**: Redis UI (port 8081)

Start infrastructure: `npm run docker:up`

## Common Development Workflows

### Adding a New Benefit Type
1. Add benefit type to `BenefitType` enum in `src/domain/types.ts`
2. Create Gherkin scenarios in `features/benefits/[benefit-name].feature`
3. Implement rules in `src/rules/[benefit-name]Rules.ts`
4. If workflow needed, create state machine in `src/workflows/[benefit-name]Machine.ts`
5. Add example in `src/examples/[benefit-name]Example.ts`
6. Add API routes/controllers if exposing via REST API

### Adding a New Workflow State Machine
1. Create machine file in `src/workflows/`
2. Define context type and event types
3. Implement states with meta descriptions
4. Add guards for conditional transitions
5. Include retry logic for resilient processing
6. Add final states (completed/failed)
7. Test with example script

### Working with Legal References
- Always include `LegalReference` in benefits/rules when applicable
- Reference official URLs (ejustice.just.fgov.be)
- Track amendments with `lastAmended` dates
- Document articles/sections clearly
- Belgian legislation types: loi, arrete_royal, arrete_ministeriel, code, ordonnance, decret

### Database Migrations
When entities change:
```bash
npm run migration:generate -- src/database/migrations/DescriptiveName
npm run migration:run
```
Never use auto-sync in production.

## Project Structure Logic

- `src/domain/` - Pure domain models, no dependencies
- `src/workflows/` - XState machines, self-contained workflow logic
- `src/rules/` - json-rules-engine rules, declarative conditions
- `src/services/` - Orchestration layer, combines workflows + rules
- `src/api/` - HTTP layer, Fastify routes/controllers
- `src/database/` - Data persistence, TypeORM entities/migrations
- `src/cache/` - Redis caching layer
- `src/queue/` - Async job processing
- `src/utils/` - Shared utilities (audit, logging, helpers)
- `features/` - Gherkin BDD scenarios
- `scripts/` - Build/generation tools

## Multi-Language Support

Belgian administrative context requires trilingual support:
- French (FR) - Primary language for Wallonia
- Dutch (NL) - Flemish region
- German (DE) - Small eastern region

Legal sources and conversions must maintain semantic accuracy across all languages.
