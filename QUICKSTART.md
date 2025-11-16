# Quick Start Guide

## What This POC Demonstrates

This POC shows how to encode Belgian social/legal business logic using a **hybrid architecture**:

1. **Gherkin** - Human-readable business rules that legal experts can validate
2. **XState** - Visual workflows for complex multi-step processes
3. **json-rules-engine** - Runtime rule evaluation with database-stored rules
4. **TypeScript** - Type-safe implementation with strong domain models

## Installation

```bash
cd /Users/dragan/Documents/PAA
npm install
```

## Run the Working Example

```bash
npm run example:agr
```

This demonstrates the **AGR (Allocation de Garantie de Revenus)** eligibility checker based on the rules defined in `features/benefits/income-guarantee.feature`.

### Example Output:

```
=== AGR Eligibility Check Examples ===

Example 1: Part-time worker with rights maintenance
Salary: 1200€, Hours: 24h/week
Result: {
  "benefitType": "agr",
  "isEligible": true,
  "calculatedAmount": 690,
  "optimizationSuggestion": "Zone optimale pour AGR"
}
```

## Key Files to Explore

### 1. Business Rules (Gherkin)
`features/benefits/income-guarantee.feature`
- Human-readable specification
- Becomes automated tests
- Validated by legal experts

### 2. Domain Models
`src/domain/types.ts`
- TypeScript types for all business entities
- Strong typing prevents errors

### 3. Rules Engine
`src/rules/agrRules.ts`
- Implements the Gherkin specs
- Uses json-rules-engine for runtime evaluation
- Rules can be stored in database

### 4. Workflow State Machine
`src/workflows/conversionMachine.ts`
- XState machine for legal text conversion
- Shows the 6-step pipeline
- Built-in retry logic

## Architecture Decision

### Why This Hybrid Approach?

**The Problem:**
Belgian social law is:
- Complex (hundreds of conditions)
- Changes frequently (new laws quarterly)
- Must be understood by multiple audiences:
  - Legal experts (to validate)
  - Social workers (to apply)
  - Beneficiaries (to claim rights)
  - Algorithms (to optimize)

**The Solution:**
Each tool handles what it does best:

| Need | Tool | Why |
|------|------|-----|
| Readable specs | Gherkin | Legal experts can read/validate without code |
| Visual workflows | XState | See the entire process at a glance |
| Runtime evaluation | json-rules-engine | Update rules without deployment |
| Type safety | TypeScript | Prevent calculation errors |

### What Makes This Special?

1. **Single Source of Truth** - Gherkin features are both documentation AND tests
2. **Auditable** - Every decision is traceable through state machines
3. **Updateable** - Rules stored in DB can change without code deployment
4. **Visual** - State machines can be rendered as diagrams
5. **Type-Safe** - Compile-time checks for critical calculations

## Real-World Example

**From the documentation:**

```gherkin
Scénario: Travailleur à temps partiel avec maintien des droits éligible
  Étant donné que je suis un travailleur à temps partiel
  Et que j'ai le maintien des droits
  Et que mon salaire brut mensuel est de 1200€
  Quand je vérifie mon éligibilité à l'AGR
  Alors je devrais être éligible
  Et le montant de l'allocation devrait être 360€
```

This becomes:
1. **Documentation** - Anyone can read and understand
2. **Automated test** - Cucumber runs this as a test
3. **Implementation guide** - Developers know exactly what to build
4. **Legal validation** - Lawyers can verify correctness

## Next Steps

### To Add a New Benefit (e.g., RIS):

1. **Write the spec:**
```gherkin
# features/benefits/ris.feature
Fonctionnalité: Revenu d'Intégration Sociale
  Scénario: Personne isolée
    Étant donné que je suis isolé
    Et que je n'ai aucun revenu
    Quand je vérifie mon éligibilité au RIS
    Alors je devrais être éligible
    Et le montant devrait être 1070.49€
```

2. **Add the type:**
```typescript
// src/domain/types.ts
export type BenefitType = 'agr' | 'ris' | ...
```

3. **Implement the rules:**
```typescript
// src/rules/risRules.ts
export function createRISEngine(): Engine { /* ... */ }
```

4. **Test:**
```bash
npm run example:ris
```

## Why NOT Just Use One Tool?

### Just Cucumber?
- ❌ Still need to implement the logic
- ❌ Doesn't handle workflows well
- ❌ No runtime rule evaluation

### Just XState?
- ❌ State machines for business rules = verbose
- ❌ Hard for non-developers
- ❌ No natural way to express eligibility conditions

### Just a Rules Engine?
- ❌ Doesn't handle workflows
- ❌ No visual representation
- ❌ Awkward for multi-step processes

### This Hybrid?
- ✅ **Best tool for each job**
- ✅ **Readable by all stakeholders**
- ✅ **Visual and auditable**
- ✅ **Updateable without deployment**

## Business Value

From the architecture documents, this approach enables:

1. **Legal Compliance** - Rules validated by legal experts
2. **Rapid Updates** - Change rules without code deployment
3. **Transparency** - Show exactly why a decision was made
4. **Optimization** - Find best benefit combinations algorithmically
5. **Accessibility** - Convert legal text to plain language automatically

## Questions?

Read:
- `README.md` - Full architecture explanation
- `ARCHITECTURE.md` - Diagrams and design patterns
- Feature files in `features/` - Business rule specifications

---

**Key Insight:** Complex business logic needs multiple tools working together. This POC proves the architecture is feasible and maintainable.
