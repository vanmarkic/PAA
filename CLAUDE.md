# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PAA (Plateforme d'Aide Administrative)** is a proof-of-concept demonstrating how to encode complex Belgian social/legal business logic into maintainable, executable code. The system converts legal text to common language and calculates benefit eligibility for social services.

## Project Terminology

This project uses French terminology for all business-domain directories and concepts to better align with Belgian administrative language and make the codebase more accessible to French-speaking domain experts. See `GLOSSAIRE-TERMINOLOGIE.md` for the complete terminology reference.

Key directory mappings:
- Business specifications: `specifications-metier/` (formerly features/)
- Eligibility rules: `regles-eligibilite/` (formerly rules/)
- Administrative processes: `processus-administratifs/` (formerly workflows/)
- Business model: `modele-metier/` (formerly domain/)

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
npm run example:ris:processus      # RIS administrative process state machine demo
npm run example:conversion         # Legal text conversion pipeline demo
```

### Documentation Generation
```bash
npm run docs:generate      # Generate visualization documentation
npm run docs:metadata      # Generate machine metadata for all administrative processes
```

## Hybrid Architecture

This codebase uses a **hybrid approach** combining multiple tools, each serving a specific purpose. The French terminology reflects the business domain while technical implementation remains in English:

### 1. Gherkin/Cucumber - Business Specifications (Spécifications Métier)
- **Purpose**: Human-readable specifications for legal rules
- **Location**: `specifications-metier/` directory
- **Why**: Legal experts and social workers can validate rules without reading code
- **Example**: `specifications-metier/prestations/allocation-garantie-revenus.feature`, `specifications-metier/prestations/revenu-integration-sociale.feature`
- **Naming convention**: French for business concepts, reflecting actual administrative terminology

### 2. XState - Administrative Processes (Processus Administratifs)
- **Purpose**: Visual, predictable workflow orchestration for administrative procedures
- **Location**: `src/processus-administratifs/` directory
- **Why**: Complex multi-step processes (legal text conversion, application workflows) need explicit state management
- **Key machine**: `src/processus-administratifs/conversionMachine.ts` - demonstrates the legal text conversion pipeline
- **Pattern**: All processes follow similar structure with states, transitions, guards, and meta descriptions
- **Naming rationale**: "Processus administratifs" better captures the bureaucratic workflows than generic "workflows"

### 3. json-rules-engine - Eligibility Rules (Règles d'Éligibilité)
- **Purpose**: Dynamic, database-driven business rules for benefit eligibility
- **Location**: `src/regles-eligibilite/` directory
- **Why**: Rules can be updated without deployment, stored in database, and audited
- **Examples**: `src/regles-eligibilite/agrRules.ts`, `src/regles-eligibilite/risRules.ts`
- **Naming rationale**: "Règles d'éligibilité" precisely describes the eligibility determination logic

### 4. TypeScript - Type-Safe Implementation with Business Model (Modèle Métier)
- **Purpose**: Compile-time safety for critical calculations
- **Core types**: `src/modele-metier/types.ts` - Contains all domain models (User, Benefit, LegalText, etc.)
- **Why**: Prevent errors in money/date calculations, enable refactoring confidence
- **Naming rationale**: "Modèle métier" represents the business domain model in DDD terms

## Architecture Patterns

### Domain-Driven Design (DDD)
- **Domain models**: `src/modele-metier/` - Pure business entities and types
- **Services**: `src/services/` - Business logic orchestration
- **Entities**: `src/database/entities/` - TypeORM database entities
- **Ubiquitous language**: Use French terminology for Belgian legal concepts (AGR, RIS, CPAS, etc.)

### State Machine Process Pattern
All administrative processes in `src/processus-administratifs/` follow this structure:
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
- **Gherkin** (specifications-metier) defines **what** rules are (readable by legal experts)
- **XState** (processus-administratifs) defines **how** processes flow (visual workflows with state)
- **json-rules-engine** (regles-eligibilite) defines **when** conditions apply (runtime evaluation)
- **TypeScript** (modele-metier) provides **implementation** safety (type guarantees)

### XState Machine Patterns
When working with state machines in `processus-administratifs`:
1. Keep states focused - one responsibility per state
2. Always handle error states and timeouts
3. Use guards for conditional transitions
4. Document states with meta descriptions
5. Implement retry logic with max attempts (typically 3)
6. Include final states (completed/failed)

### Legal Text Handling
- All legal references use `LegalReference` type from `src/modele-metier/types.ts`
- Belgian legal sources: `src/legal-sources/belgianLegalSources.ts` (FR), `belgianLegalSources.nl.ts` (NL)
- Metadata tracking: `src/modele-metier/legalMetadata.ts`
- Multi-language support: FR (primary), NL, DE

### Testing Philosophy
- Jest for unit/integration tests
- Cucumber for BDD scenarios matching business specifications
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

### Process Machine Metadata
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
1. Add benefit type to `BenefitType` enum in `src/modele-metier/types.ts`
2. Create Gherkin scenarios in `specifications-metier/prestations/[benefit-name].feature`
3. Implement rules in `src/regles-eligibilite/[benefit-name]Rules.ts`
4. If process needed, create state machine in `src/processus-administratifs/[benefit-name]Machine.ts`
5. Add example in `src/examples/[benefit-name]Example.ts`
6. Add API routes/controllers if exposing via REST API

### Adding a New Administrative Process State Machine
1. Create machine file in `src/processus-administratifs/`
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

- `src/modele-metier/` - Pure business models, no dependencies (Domain layer)
- `src/processus-administratifs/` - XState machines, self-contained administrative process logic
- `src/regles-eligibilite/` - json-rules-engine eligibility rules, declarative conditions
- `src/services/` - Orchestration layer, combines processes + rules
- `src/api/` - HTTP layer, Fastify routes/controllers
- `src/database/` - Data persistence, TypeORM entities/migrations
- `src/cache/` - Redis caching layer
- `src/queue/` - Async job processing
- `src/utils/` - Shared utilities (audit, logging, helpers)
- `specifications-metier/` - Gherkin BDD business specifications
- `scripts/` - Build/generation tools

## Multi-Language Support

Belgian administrative context requires trilingual support:
- French (FR) - Primary language for Wallonia
- Dutch (NL) - Flemish region
- German (DE) - Small eastern region

Legal sources and conversions must maintain semantic accuracy across all languages.

## Terminology Reference

For a complete glossary of French business terminology used in this codebase, see `GLOSSAIRE-TERMINOLOGIE.md`. This includes:
- Directory naming conventions
- Business domain concepts
- Administrative process terminology
- Translations and explanations

The use of French terminology for business-domain directories and files helps bridge the gap between technical implementation and Belgian administrative reality, making the codebase more accessible to domain experts while maintaining English for technical implementation details.