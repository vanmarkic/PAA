# Migration to OpenFisca-Inspired Single Source of Truth Architecture

## Problem Statement

The current PAA architecture uses **4 separate artifacts** to encode a single Belgian social benefit:

1. **Gherkin Feature** (`features/benefits/*.feature`) - Human-readable specification
2. **Rules** (`src/rules/*Rules.ts`) - json-rules-engine implementation
3. **Machine** (`src/workflows/*Machine.ts`) - XState state machine (optional)
4. **Legal Metadata** (`src/domain/legalMetadata.ts`) - Legal references

This creates several issues:

### 1. Synchronization Overhead
- Version compliance system (`checkVersionCompliance`) needed to ensure feature version matches rules version
- When law changes, must update 3-4 files manually or via AI pipeline
- `add-new-law` pipeline generates 3 separate files that can drift

### 2. Duplication
- Eligibility conditions written in Gherkin (`Étant donné que...`) AND in json-rules-engine
- Amounts appear in both feature files and rules files
- Legal references scattered across files

### 3. Complexity
- Developers must understand Gherkin, json-rules-engine, AND XState
- AI pipeline (`pipelineOrchestrator.ts`) has complex multi-step generation
- Testing requires both Cucumber (for features) and Jest (for rules)

### 4. Cognitive Load
- To understand RIS eligibility, must read: `ris.feature` + `risRules.ts` + possibly `risMachine.ts`
- No single place to see complete benefit logic

---

## Research: Industry Standards for Rules-as-Code

### OpenFisca (Recommended)
- **Used by**: France, New Zealand, Barcelona, Australia
- **Recognized by**: OECD as principal Rules-as-Code implementation
- **Architecture**: Single Python Variable class = specification + implementation
- **Parameters**: YAML files for amounts/thresholds (separate from logic)
- **URL**: https://openfisca.org/

```python
# OpenFisca example - SINGLE SOURCE OF TRUTH
class revenu_integration_sociale(Variable):
    value_type = float
    entity = Person
    label = "Revenu d'Intégration Sociale"
    definition_period = MONTH
    reference = "https://www.ejustice.just.fgov.be/..."

    def formula(person, period, parameters):
        age = person('age', period)
        eligible = (age >= 18) * (residency >= 5)
        return eligible * parameters(period).ris.amount
```

### Catala
- **Innovation**: Literate programming - law text and code interleaved
- **Strength**: Mirrors legal text structure, built-in exception handling
- **Used for**: French family benefits, US Tax Code
- **Found bugs**: In official French government implementation
- **URL**: https://catala-lang.org/

### Blawx
- **Type**: Visual drag-and-drop interface
- **Target**: Non-programmers encoding laws
- **Developed by**: Canadian government
- **URL**: https://dev.blawx.com/

### L4/Legalese
- **Type**: Spreadsheet-based DSL
- **Focus**: Contracts more than social benefits
- **URL**: https://legalese.github.io/doc/dsl

---

## Proposed Solution: OpenFisca-Inspired TypeScript Architecture

### New Structure (2 artifacts instead of 4)

```
src/
  benefits/
    ris.benefit.ts        # Single source: logic + docs + legal refs
    agr.benefit.ts
    index.ts

  parameters/
    benefits/
      ris.yaml            # Amounts only (easy to update without code change)
      agr.yaml

  engine/
    types.ts              # Variable, Person, Period types
    defineVariable.ts     # OpenFisca-like Variable factory
    calculate.ts          # Runtime calculation engine
    generateDocs.ts       # Auto-generate markdown from Variables
    generateTests.ts      # Auto-generate test cases

  workflows/              # KEEP only for multi-step procedures
    conversionMachine.ts  # Legal text simplification still needs state
```

### Example: RIS as Single Source of Truth

```typescript
// src/benefits/ris.benefit.ts
export const RIS = defineVariable({
  name: 'revenu_integration_sociale',
  type: 'money',
  entity: 'person',
  period: 'month',

  // Replaces Gherkin feature header
  label: "Revenu d'Intégration Sociale",
  description: `
    Le RIS est une aide financière accordée par le CPAS aux personnes
    qui ne disposent pas de ressources suffisantes pour mener une vie
    conforme à la dignité humaine.
  `,

  // Replaces scattered legal references
  reference: {
    law: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
    url: 'https://www.ejustice.just.fgov.be/eli/loi/2002/05/26/2002022559/justel',
    articles: ['Art. 3', 'Art. 14'],
    authority: 'SPF Sécurité Sociale',
  },

  // Replaces Gherkin scenarios + json-rules-engine conditions
  formula: (person, period, params) => {
    // Eligibility conditions (readable, type-safe)
    const age = person.get('age', period);
    const residencyYears = person.get('residency_years', period);
    const income = person.get('income', period);
    const category = person.get('family_category', period);

    const isAdult = age >= 18;
    const hasResidency = residencyYears >= params.ris.min_residency_years;
    const belowThreshold = income < params.ris.income_threshold[category];

    if (!isAdult || !hasResidency || !belowThreshold) {
      return { eligible: false, amount: 0, reason: determineReason(...) };
    }

    return {
      eligible: true,
      amount: params.ris.amounts[category],
      reason: 'Toutes les conditions sont remplies',
    };
  },
});
```

### Parameters in YAML (amounts separated from logic)

```yaml
# parameters/benefits/ris.yaml
ris:
  metadata:
    version: "2025.1.0"
    effective_date: "2024-09-01"
    source: "Arrêté royal du 12 décembre 2023"

  min_residency_years: 5

  income_threshold:
    single: 1214.13
    cohabitant: 809.42
    family: 1640.83

  amounts:
    single: 1214.13
    cohabitant: 809.42
    family: 1640.83
```

---

## What Gets Removed

| Current Artifact | Status | Replacement |
|------------------|--------|-------------|
| `features/*.feature` | ❌ Remove | `label`, `description`, `reference` in Variable |
| `src/rules/*Rules.ts` | ❌ Remove | `formula` function in Variable |
| `json-rules-engine` dependency | ❌ Remove | Native TypeScript |
| Cucumber/Gherkin dependencies | ❌ Remove | Jest tests generated from Variables |
| Version sync checking | ❌ Remove | Single file = always in sync |
| `src/workflows/*Machine.ts` | ⚠️ Keep selectively | Only for multi-step procedures |

## What Gets Kept

| Component | Reason |
|-----------|--------|
| XState machines | Still needed for complex multi-step procedures (e.g., legal text conversion) |
| TypeORM/PostgreSQL | Data persistence unchanged |
| Fastify API | HTTP layer unchanged |
| Redis caching | Performance layer unchanged |

---

## Benefits of Migration

### 1. Single Source of Truth
- One file per benefit contains ALL information
- No version sync issues
- No drift between specification and implementation

### 2. Simplified Pipeline
```
Current:  Legal Text → [Claude] → Feature + Rules + Machine (3 files)
Proposed: Legal Text → [Claude] → Variable + Parameters (2 files)
```

### 3. Better Developer Experience
- Understand benefit by reading ONE file
- Type-safe formulas (TypeScript > json-rules-engine JSON)
- IDE autocomplete for all conditions

### 4. Easier Maintenance
- Amount changes: edit YAML only, no code changes
- Logic changes: edit formula only
- Legal reference updates: one place

### 5. Auto-Generated Documentation
- Generate markdown docs from Variable metadata
- Generate OpenAPI specs from Variable definitions
- Generate test cases from formula conditions

### 6. Reduced Dependencies
- Remove: `@cucumber/cucumber`, `json-rules-engine`
- Keep: `xstate` (for complex workflows only)

---

## Migration Plan

### Phase 1: Create Engine Infrastructure
- [ ] Implement `defineVariable()` helper function
- [ ] Implement parameter loader (YAML → typed objects)
- [ ] Implement `calculate()` runtime engine
- [ ] Add types: `Variable`, `Person`, `Period`, `Parameters`

### Phase 2: Migrate Existing Benefits
- [ ] Port RIS from feature + rules → single Variable
- [ ] Port AGR from feature + rules → single Variable
- [ ] Port Allocation Chauffage
- [ ] Verify calculation parity with existing tests

### Phase 3: Update Pipeline
- [ ] Modify `add-new-law` to generate Variable format
- [ ] Update Claude prompts for new format
- [ ] Simplify `pipelineOrchestrator.ts`

### Phase 4: Add Documentation Generation
- [ ] Implement `generateDocs.ts` (Variable → Markdown)
- [ ] Implement `generateTests.ts` (Variable → Jest tests)
- [ ] Generate API documentation

### Phase 5: Cleanup
- [ ] Remove `features/` directory
- [ ] Remove `src/rules/*Rules.ts` files
- [ ] Remove Cucumber dependencies
- [ ] Remove json-rules-engine dependency
- [ ] Update CLAUDE.md and CONTRIBUTING.md

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Loss of Gherkin readability for legal experts | Generate markdown docs with same structure |
| Formula complexity for non-developers | Clear comments, generated documentation |
| Migration breaks existing tests | Run both systems in parallel during migration |
| XState machines still needed | Keep for genuinely stateful procedures |

---

## Decision Required

1. **Full OpenFisca adoption**: Use actual OpenFisca framework (Python)
   - Pro: Proven, large community, built-in features
   - Con: Requires Python, different tech stack

2. **OpenFisca-inspired TypeScript** (Recommended): Copy patterns, keep TypeScript
   - Pro: Keeps existing tech stack, type safety, simpler
   - Con: Must build some infrastructure ourselves

3. **Catala adoption**: Use Catala DSL
   - Pro: Most readable, literate programming
   - Con: Steep learning curve, custom tooling, smaller community

---

## References

- [OpenFisca Documentation](https://openfisca.org/doc/index.html)
- [OpenFisca Coding Formulas](https://openfisca.readthedocs.io/en/latest/coding-the-legislation/10_basic_example.html)
- [Catala: A Programming Language for the Law](https://dl.acm.org/doi/10.1145/3473582)
- [Catala GitHub](https://github.com/CatalaLang/catala)
- [Blawx: Rules as Code Demonstration](https://law.mit.edu/pub/blawxrulesascodedemonstration)
- [MIT Computational Law Report](https://law.mit.edu/)
- [OECD Rules as Code](https://oecd-opsi.org/innovations/new-techniques-for-building-and-using-legal-encodings-in-the-drafting-room/)

---

## Labels
`architecture`, `refactoring`, `tech-debt`, `rules-as-code`, `future-migration`

## Priority
Medium - Current system works but creates maintenance overhead

## Effort Estimate
Large - Estimated 2-3 weeks of focused work for full migration
