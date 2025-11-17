# Methodology: Adding New Legal Procedures to PAA

**Date:** 2025-11-17
**Task:** Adding 500 new Belgian legal procedures and workflows across 10 domains

## Overview

This document describes the systematic methodology used to extend the PAA (Plateforme d'Aide Administrative) system with 500 new legal procedures across multiple Belgian administrative domains. Each domain includes approximately 50 procedures, following the established RIS (Revenu d'Intégration Sociale) pattern as the reference implementation.

## Reference Implementation: RIS

The RIS benefit implementation serves as the canonical pattern, consisting of:

1. **Gherkin Feature File** (`features/benefits/ris.feature`)
   - French language scenarios
   - Business-readable specifications
   - Test cases with examples
   - Legal context and requirements

2. **Domain Types** (`src/domain/risTypes.ts`)
   - TypeScript interfaces for domain entities
   - Type definitions for categories, statuses
   - Constants for amounts, thresholds, rates

3. **Business Rules** (`src/rules/risRules.ts`)
   - json-rules-engine implementation
   - Legal references with official URLs
   - Calculation functions
   - Singleton engine pattern for performance

4. **Workflow State Machine** (`src/workflows/risMachine.ts`)
   - XState machine for application workflow
   - States: idle → checking → eligible/ineligible → active
   - Context management with TypeScript
   - Meta descriptions for each state

## Target Domains (10 domains × 50 procedures = 500 procedures)

1. **Real Estate (Immobilier)** - 50 procedures
   - Property acquisition, rental rights, housing subsidies
   - Urban planning permits, construction regulations
   - Social housing eligibility and applications

2. **Co-ownership (Copropriété)** - 50 procedures
   - General assembly rules and voting
   - Syndic responsibilities and elections
   - Building maintenance and renovation rules
   - Financial contributions and budgets

3. **Democracy** - 50 procedures
   - Voter registration and electoral rights
   - Petition procedures and citizen initiatives
   - Municipal council participation
   - Referendum and consultation processes

4. **Foreigners' Rights (Droits des Étrangers)** - 50 procedures
   - Residence permits and visa applications
   - Family reunification procedures
   - Asylum and refugee status
   - Work permits and student visas

5. **Civil Rights (Droits Civils)** - 50 procedures
   - Identity documents (ID, passport, birth certificate)
   - Marriage, divorce, partnership procedures
   - Name changes and legal recognition
   - Privacy rights and data access

6. **Ecology (Écologie)** - 50 procedures
   - Environmental impact assessments
   - Waste management and recycling regulations
   - Energy subsidies and green certifications
   - Nature protection and biodiversity rules

7. **State Appeals (Recours contre l'État)** - 50 procedures
   - Administrative appeals process
   - Council of State procedures
   - Tax dispute resolution
   - Public service complaints

8. **European Court Appeals** - 50 procedures
   - Human rights violation procedures
   - Admissibility criteria
   - Application filing process
   - Interim measures requests

9. **Artist Status (Statut d'Artiste)** - 50 procedures
   - Artist status eligibility and application
   - Unemployment benefits for artists
   - Tax regime and social security
   - Commission des Artistes procedures

10. **Intellectual Property** - 50 procedures
    - Patent applications and protection
    - Trademark registration
    - Copyright procedures
    - Industrial design protection

## Standard Structure for Each Procedure

### File Organization

For each domain `{domain}` and procedure `{procedure}`:

```
features/{domain}/{procedure}.feature          # Gherkin scenarios
src/domain/{domain}Types.ts                    # Domain types
src/rules/{domain}/{procedure}Rules.ts         # Business rules
src/workflows/{domain}/{procedure}Machine.ts   # State machine
src/examples/{domain}/{procedure}Example.ts    # Usage examples
src/api/routes/{domain}Routes.ts               # API endpoints
src/api/controllers/{domain}Controller.ts      # Request handlers
src/database/entities/{Domain}Application.ts   # Persistence
```

### 1. Gherkin Feature File Template

```gherkin
# language: fr
Fonctionnalité: {Procedure Name}
  En tant que {user role}
  Je veux {goal}
  Afin de {benefit}

  Contexte:
    Étant donné que {initial conditions}

  Scénario: {Happy path scenario}
    Étant donné que {preconditions}
    Et que {more preconditions}
    Quand {action}
    Alors {expected result}
    Et {additional assertions}

  Scénario: {Error scenario}
    Étant donné que {preconditions}
    Quand {action}
    Alors {expected error}
    Et le motif devrait être "{error message}"

  Plan du Scénario: {Data-driven scenarios}
    Étant donné que {condition with <param>}
    Quand {action}
    Alors {result with <expected>}

    Exemples:
      | param | expected |
      | val1  | res1     |
```

### 2. Domain Types Template

```typescript
/**
 * {Domain} domain types
 *
 * Legal basis: {Law name and URL}
 */

export type {Domain}Category = 'category1' | 'category2' | 'category3';

export type {Domain}Status = 'status1' | 'status2' | 'status3';

export interface {Domain}User {
  id: string;
  // User-specific fields
}

export interface {Domain}Result {
  isEligible: boolean;
  reason?: string;
  details?: any;
}

export const {DOMAIN}_CONSTANTS = {
  // Domain-specific constants
};
```

### 3. Business Rules Template

```typescript
/**
 * Business Rules for {Procedure Name}
 *
 * BASE JURIDIQUE:
 * - {Law name}
 *   {Official URL}
 * - {Royal decree or other legislation}
 *   {Official URL}
 */

import { Engine } from 'json-rules-engine';
import { {Domain}User, {Domain}Result } from '../domain/{domain}Types';

function create{Domain}Engine(): Engine {
  const engine = new Engine();

  // Rule 1: {Description}
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'fieldName',
          operator: 'lessThan',
          value: threshold,
        },
      ],
    },
    event: {
      type: '{domain}-ineligible',
      params: {
        reason: '{human-readable reason}',
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

const {domain}EngineInstance = create{Domain}Engine();

export async function check{Domain}Eligibility(
  user: {Domain}User
): Promise<{Domain}Result> {
  const facts = {
    // Extract facts from user
  };

  const results = await {domain}EngineInstance.run(facts);

  // Process results
  return {
    isEligible: true,
    // Other fields
  };
}
```

### 4. State Machine Template

```typescript
/**
 * XState machine for {Procedure} Workflow
 */

import { createMachine, assign } from 'xstate';
import { {Domain}User, {Domain}Result } from '../domain/{domain}Types';

interface {Domain}Context {
  user: {Domain}User | null;
  result: {Domain}Result | null;
  retryCount: number;
  errors: string[];
}

export const {domain}{Procedure}Machine = createMachine({
  id: '{domain}{Procedure}',
  initial: 'idle',

  context: {
    user: null,
    result: null,
    retryCount: 0,
    errors: [],
  },

  states: {
    idle: {
      on: {
        START: {
          target: 'processing',
          actions: assign({
            user: ({ event }) => event.user,
          }),
        },
      },
      meta: {
        description: 'Waiting for process to start',
      },
    },

    processing: {
      on: {
        SUCCESS: {
          target: 'completed',
          actions: assign({
            result: ({ event }) => event.result,
          }),
        },
        FAILURE: {
          target: 'failed',
          actions: assign({
            errors: ({ event }) => event.errors,
          }),
        },
      },
      meta: {
        description: 'Processing application',
      },
    },

    completed: {
      meta: {
        description: 'Process completed successfully',
      },
    },

    failed: {
      on: {
        RETRY: {
          target: 'processing',
          guard: ({ context }) => context.retryCount < 3,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
      },
      meta: {
        description: 'Process failed - retry or cancel',
      },
    },
  },
});
```

## Implementation Strategy

### Phase 1: Parallel Development (Using Task Tool with Opus Agents)

Each domain is assigned to a specialized agent running in parallel:

1. **Agent 1**: Real Estate (Immobilier)
2. **Agent 2**: Co-ownership (Copropriété)
3. **Agent 3**: Democracy
4. **Agent 4**: Foreigners' Rights
5. **Agent 5**: Civil Rights
6. **Agent 6**: Ecology
7. **Agent 7**: State Appeals
8. **Agent 8**: European Court Appeals
9. **Agent 9**: Artist Status
10. **Agent 10**: Intellectual Property

Each agent creates 50 procedures following the templates above.

### Phase 2: Integration and Testing

1. Run TypeScript type checking: `npm run typecheck`
2. Run all tests: `npm test`
3. Run Cucumber scenarios: `npm run cucumber`
4. Fix any compilation or test errors

### Phase 3: Documentation Generation

1. Generate workflow metadata: `npm run docs:metadata`
2. Generate visualization docs: `npm run docs:generate`

### Phase 4: Version Control

1. Commit changes with descriptive message
2. Push to feature branch: `claude/add-new-features-workflows-01PyTg77hd5w1VJdmatwuv7x`

## Legal Reference Requirements

All procedures must include:

1. **Official legal basis**
   - Law name (Loi, Arrêté Royal, Code, etc.)
   - Publication date
   - Official URL from ejustice.just.fgov.be

2. **Key articles**
   - Specific article numbers
   - Relevant text excerpts
   - Last amendment date

3. **Multi-language support**
   - French (primary)
   - Dutch (translations)
   - German (where applicable)

## Quality Standards

### Code Quality
- TypeScript strict mode compliance
- ESLint conformance
- No compilation errors
- Type safety for all calculations

### Business Logic
- Accurate legal references
- Traceable decision logic
- Audit trail capability
- Clear error messages in French

### Testing
- Gherkin scenarios cover happy path and edge cases
- Unit tests for calculation functions
- Integration tests for workflows
- Minimum 80% code coverage

### Documentation
- Meta descriptions for all states
- Comments explaining business rules
- Examples demonstrating usage
- API documentation via Swagger

## Performance Considerations

1. **Singleton Engines**: Reuse json-rules-engine instances
2. **Caching**: Redis cache for frequently accessed rules
3. **Database Indexing**: Proper indexes on query fields
4. **Connection Pooling**: TypeORM connection pool optimization

## Scalability Approach

1. **Modular Structure**: Each domain is independent
2. **Database Sharding**: Ready for multi-tenant deployment
3. **Queue Processing**: Bull queue for async workflows
4. **API Rate Limiting**: Protect against abuse

## Monitoring and Audit

1. **Audit Service**: Track all eligibility checks
2. **Logging**: Structured logs for debugging
3. **Metrics**: Track processing times and success rates
4. **Alerts**: Notify on high error rates

## Conclusion

This methodology ensures consistency, quality, and maintainability across 500 new legal procedures. By following the established RIS pattern and leveraging parallel development with specialized agents, we can efficiently scale the PAA system to cover comprehensive Belgian administrative procedures.

---

**Generated:** 2025-11-17
**Author:** Claude Code
**Version:** 1.0
