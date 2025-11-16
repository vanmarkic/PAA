# Plateforme d'Aide Administrative - POC

## 🎯 Overview

This is a proof-of-concept demonstrating how to encode complex Belgian social/legal business logic into maintainable, executable code. The POC addresses the core challenge: **converting legal text to common language** and **calculating benefit eligibility** for the Plateforme d'Aide Administrative.

## 🧠 Business Context

The platform aims to:
- Convert Belgian legal/administrative text to plain language
- Optimize social benefits for precarious populations
- Provide conversational assistance (WhatsApp bot)
- Calculate eligibility and benefit amounts

**Key Challenge:** Legal rules are complex, change frequently, and must be understandable by:
- Social workers
- Beneficiaries (often with limited literacy)
- Automated systems (optimization algorithms)

## 🏗️ Architecture Decision: Why This Hybrid Approach?

After analyzing the requirements, we chose a **hybrid architecture** combining:

### 1. **Gherkin/Cucumber** - For Business Rules Specification

**Why:**
- ✅ **Human-readable** by non-technical stakeholders (legal experts, social workers)
- ✅ **Living documentation** that stays in sync with code
- ✅ **Executable specifications** that can be validated
- ✅ **Testable** - scenarios become automated tests
- ✅ **Versioned** - track rule changes over time

**Example:**
```gherkin
Scénario: Travailleur à temps partiel avec maintien des droits éligible
  Étant donné que je suis un travailleur à temps partiel
  Et que j'ai le maintien des droits
  Et que mon salaire brut mensuel est de 1200€
  Quand je vérifie mon éligibilité à l'AGR
  Alors je devrais être éligible
  Et le montant de l'allocation devrait être 360€
```

### 2. **XState** - For Workflow State Machines

**Why:**
- ✅ **Visual representation** of complex workflows
- ✅ **Predictable state transitions** (no hidden states)
- ✅ **Built-in retry logic** and error handling
- ✅ **Auditable** - track exactly where in the process something failed
- ✅ **Type-safe** with TypeScript

**Example:** Legal text conversion pipeline
```
idle → extractingStructure → identifyingConcepts → mappingVocabulary
  → generatingVersions → validating → completed
                              ↓ (if validation fails)
                        regeneratingWithConstraints ⟲
```

### 3. **json-rules-engine** - For Runtime Rule Evaluation

**Why:**
- ✅ **Declarative rules** that can be stored in database
- ✅ **Dynamic updates** without code deployment
- ✅ **Priority-based** evaluation
- ✅ **Composable conditions** (AND, OR, NOT)
- ✅ **Auditable** - know exactly which rules fired

### 4. **TypeScript** - For Type-Safe Implementation

**Why:**
- ✅ **Compile-time safety** for critical calculations (money, dates)
- ✅ **Self-documenting** with strong types
- ✅ **Refactoring confidence**
- ✅ **IDE support** for developers

## 📂 Project Structure

```
PAA/
├── features/                    # Gherkin business rules (human-readable)
│   ├── benefits/
│   │   └── income-guarantee.feature    # AGR eligibility rules
│   └── conversion/
│       └── legal-text-conversion.feature
│
├── src/
│   ├── domain/                  # Core business entities
│   │   └── types.ts            # User, Benefit, LegalText, etc.
│   │
│   ├── workflows/               # XState state machines
│   │   └── conversionMachine.ts    # Legal text conversion workflow
│   │
│   ├── rules/                   # Business rules implementation
│   │   └── agrRules.ts         # AGR eligibility rules engine
│   │
│   ├── services/                # Business logic services
│   │   └── conversionService.ts    # Legal text conversion service
│   │
│   └── examples/                # Runnable examples
│       ├── agrExample.ts       # AGR eligibility examples
│       └── conversionExample.ts    # Conversion workflow examples
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Installation

```bash
cd ../PAA
npm install
```

### Run Examples

**AGR Eligibility Check:**
```bash
npm run example:agr
```

This demonstrates:
- ✓ Eligible case (part-time, rights maintenance, salary < 1650€)
- ✗ Ineligible cases (salary too high, no rights maintenance, etc.)
- Optimization hints based on working hours

**Legal Text Conversion Workflow:**
```bash
npm run example:conversion
```

This demonstrates:
- State machine progression through conversion pipeline
- Retry logic when validation fails
- Context tracking at each step

### Build

```bash
npm run build
```

## 📋 Key Features Demonstrated

### 1. Business Rules in Gherkin

See `features/benefits/income-guarantee.feature`

Benefits:
- Legal experts can validate rules without reading code
- Rules serve as automated tests
- Changes are tracked in git with clear history
- Scenarios cover edge cases explicitly

### 2. State Machine Workflow

See `src/workflows/conversionMachine.ts`

The conversion pipeline implements the architecture from the documentation:
```typescript
1. Extract legal structure (NLP)
2. Identify key concepts
3. Map to common vocabulary
4. Generate multiple versions (simple, detailed, examples)
5. Validate semantic accuracy
6. Retry if validation fails (max 3 attempts)
```

Visualization available via XState tools.

### 3. Rules Engine

See `src/rules/agrRules.ts`

Rules are defined as JSON objects:
```typescript
{
  conditions: {
    all: [
      { fact: 'employmentStatus', operator: 'equal', value: 'part-time' },
      { fact: 'hasRightsMaintenance', operator: 'equal', value: true },
      { fact: 'monthlySalaryGross', operator: 'lessThan', value: 1650 }
    ]
  },
  event: { type: 'agr-eligible' }
}
```

Can be:
- Stored in database
- Updated without deployment
- Versioned for legal compliance
- Audited (which rules fired when)

### 4. Type Safety

See `src/domain/types.ts`

Strong typing prevents errors:
```typescript
interface EligibilityCheck {
  benefitType: BenefitType;  // Enum, not string
  isEligible: boolean;
  calculatedAmount?: number;  // Optional, only if eligible
  reason?: string;            // Required if not eligible
}
```

## 🎨 Design Patterns Used

### 1. **Domain-Driven Design (DDD)**
- Clear domain models (`User`, `Benefit`, `LegalText`)
- Ubiquitous language from business domain
- Bounded contexts (rules, workflows, services)

### 2. **State Pattern (XState)**
- Explicit state machines
- No hidden states or race conditions
- Predictable behavior

### 3. **Strategy Pattern (Rules Engine)**
- Rules are strategies for eligibility determination
- Can swap/add rules dynamically
- Composition over inheritance

### 4. **Pipeline Pattern**
- Conversion is a pipeline of transformations
- Each stage has clear input/output
- Stages can be tested independently

## 🔄 Comparison with Alternatives

### Why NOT pure Cucumber?
- ❌ Cucumber alone doesn't execute business logic
- ❌ Step definitions still need implementation
- ❌ Doesn't handle complex workflows well

### Why NOT pure XState?
- ❌ State machines for business rules = verbose
- ❌ Hard for non-developers to validate
- ❌ No natural representation of eligibility conditions

### Why NOT pure Rules Engine?
- ❌ Doesn't handle workflows/pipelines well
- ❌ No visual representation
- ❌ State transitions are awkward

### Why This Hybrid?
- ✅ **Gherkin** for **what** the rules are (readable specs)
- ✅ **XState** for **how** processes flow (visual workflows)
- ✅ **Rules Engine** for **when** conditions apply (runtime evaluation)
- ✅ **TypeScript** for **implementation** (type safety)

## 📊 What Each Tool Handles

| Concern | Tool | Why |
|---------|------|-----|
| Business rule specification | Gherkin | Human-readable by legal experts |
| Workflow orchestration | XState | Visual, predictable state management |
| Runtime rule evaluation | json-rules-engine | Dynamic, database-driven rules |
| Type safety & implementation | TypeScript | Compile-time guarantees |
| Data validation | Zod (planned) | Runtime schema validation |

## 🔮 Future Enhancements

### Phase 1 - Currently in POC
- ✅ Basic AGR rules
- ✅ Conversion workflow
- ✅ Type definitions

### Phase 2 - Next Steps
- [ ] Integrate actual LLM API (Claude/GPT)
- [ ] Add Zod schemas for validation
- [ ] Implement Cucumber step definitions
- [ ] Add more benefit types (RIS, unemployment, etc.)
- [ ] Create visual state machine diagrams

### Phase 3 - Production Ready
- [ ] Store rules in PostgreSQL
- [ ] Version rules with effective dates
- [ ] Audit trail for all eligibility checks
- [ ] Multi-language support (FR/NL/DE)
- [ ] Human-in-the-loop validation workflow

## 💡 How to Add New Rules

### 1. Define in Gherkin
```gherkin
# features/benefits/new-benefit.feature
Fonctionnalité: Nouveau Bénéfice
  Scénario: Cas d'éligibilité
    Étant donné que [conditions]
    Quand [action]
    Alors [résultat attendu]
```

### 2. Implement Rule
```typescript
// src/rules/newBenefitRules.ts
const rule: Rule = {
  conditions: { /* ... */ },
  event: { type: 'new-benefit-eligible' }
};
```

### 3. Add Types
```typescript
// src/domain/types.ts
export type BenefitType = 'agr' | 'ris' | 'new-benefit';
```

### 4. Test
```bash
npm run example:new-benefit
```

## 🎯 Best Practices

### For Business Rules
1. **One scenario per edge case** - Don't combine multiple cases
2. **Use scenario outlines** for parametric testing
3. **Write in French** for Belgian context (stakeholder language)
4. **Include "why"** in scenario descriptions

### For State Machines
1. **Keep states focused** - One responsibility per state
2. **Use meta descriptions** - Document what each state does
3. **Handle all transitions** - No undefined behavior
4. **Implement timeouts** for async operations

### For Rules Engine
1. **Prioritize rules** - Explicit order when overlap exists
2. **Document facts** - What each fact represents
3. **Test rule combinations** - Ensure no conflicts
4. **Version rules** - Track changes over time

## 📚 Resources

- [XState Documentation](https://xstate.js.org/)
- [Cucumber Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [json-rules-engine](https://github.com/CacheControl/json-rules-engine)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

## 🤝 Contributing

This is a POC demonstrating architectural patterns. To extend:

1. Add new `.feature` files for new business rules
2. Implement corresponding rule engines
3. Create examples demonstrating the functionality
4. Update this README with new patterns

## 📄 License

ISC

---

## 🎓 Key Takeaways

1. **No single tool solves everything** - Complex business logic needs a hybrid approach
2. **Readability matters** - Legal rules must be validated by domain experts
3. **Type safety prevents errors** - Especially critical for money/date calculations
4. **Workflows need visualization** - State machines make complex processes understandable
5. **Flexibility is key** - Rules stored in DB can change without deployment

**This POC proves the architecture is feasible and maintainable.**
