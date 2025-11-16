# Architecture Overview

## 🎯 The Three-Layer Architecture

This POC demonstrates a **three-layer separation of concerns**:

```mermaid
graph TB
    subgraph "1. Specification Layer (Human-Readable)"
        G[Gherkin Features]
        G1[income-guarantee.feature]
        G2[legal-text-conversion.feature]
    end

    subgraph "2. Orchestration Layer (Visual Workflows)"
        X[XState Machines]
        X1[conversionMachine.ts]
        X2[Future: chatbotMachine.ts]
    end

    subgraph "3. Execution Layer (Runtime Logic)"
        R[Rules Engines]
        S[Services]
        R1[agrRules.ts]
        S1[conversionService.ts]
    end

    subgraph "Foundation Layer (Type Safety)"
        T[TypeScript Domain Models]
        T1[types.ts]
    end

    G -.documents.-> R
    G -.documents.-> S
    X -->|orchestrates| R
    X -->|orchestrates| S
    R -->|uses| T
    S -->|uses| T
```

## 🔄 Legal Text Conversion Workflow

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> extractingStructure: START_CONVERSION
    extractingStructure --> identifyingConcepts: STRUCTURE_EXTRACTED
    identifyingConcepts --> mappingVocabulary: CONCEPTS_IDENTIFIED
    mappingVocabulary --> generatingVersions: TERMS_MAPPED
    generatingVersions --> validating: VERSIONS_GENERATED
    validating --> completed: VALIDATION_PASSED
    validating --> checkingRetries: VALIDATION_FAILED

    state checkingRetries <<choice>>
    checkingRetries --> regeneratingWithConstraints: [retryCount < 3]
    checkingRetries --> failed: [retryCount >= 3]

    regeneratingWithConstraints --> generatingVersions: RETRY
    completed --> [*]
    failed --> idle: RESET
```

## 💰 AGR Eligibility Decision Flow

```mermaid
flowchart TD
    Start([User applies for AGR]) --> Check1{Part-time<br/>worker?}
    Check1 -->|No| Reject1[❌ Not eligible:<br/>Must be part-time]
    Check1 -->|Yes| Check2{Has rights<br/>maintenance?}
    Check2 -->|No| Reject2[❌ Not eligible:<br/>No rights maintenance]
    Check2 -->|Yes| Check3{Salary < 1650€?}
    Check3 -->|No| Reject3[❌ Not eligible:<br/>Salary too high]
    Check3 -->|Yes| Check4{Receiving<br/>unemployment?}
    Check4 -->|Yes| Reject4[❌ Not eligible:<br/>Incompatible benefit]
    Check4 -->|No| Calculate[Calculate amount:<br/>1650 - salary × 0.8]
    Calculate --> Optimize{Working hours<br/>20-28h?}
    Optimize -->|Yes| Approve1[✅ Eligible<br/>Optimal zone]
    Optimize -->|No| Approve2[✅ Eligible<br/>Consider adjusting hours]
```

## 📦 Data Flow

```mermaid
sequenceDiagram
    participant User
    participant System
    participant RulesEngine
    participant LLM
    participant Validator

    User->>System: Check AGR eligibility
    System->>RulesEngine: Evaluate rules with user facts
    RulesEngine->>RulesEngine: Check conditions
    RulesEngine-->>System: Eligibility result
    System-->>User: Decision + amount + advice

    User->>System: Convert legal text
    System->>LLM: Extract structure
    LLM-->>System: Legal structure
    System->>LLM: Generate simple version
    LLM-->>System: Converted text
    System->>Validator: Validate semantic accuracy

    alt Validation passes
        Validator-->>System: ✓ Approved
        System-->>User: Converted text
    else Validation fails
        Validator-->>System: ✗ Failed
        System->>LLM: Regenerate with constraints
        LLM-->>System: Retry conversion
        System->>Validator: Validate again
        Validator-->>System: ✓ Approved
        System-->>User: Converted text
    end
```

## 🎯 Why This Architecture Works for Belgian Social Law

### Challenge 1: Complex, Changing Rules
**Solution:** Gherkin specifications + Rules Engine
- Rules are documented in plain language
- Can be updated without code deployment
- Versioned with effective dates
- Validated by legal experts

### Challenge 2: Multi-Step Processes
**Solution:** XState workflows
- Clear visualization of process
- Built-in retry logic
- Auditable state transitions
- No hidden states or race conditions

### Challenge 3: Type Safety for Money/Dates
**Solution:** TypeScript with strong typing
- Compile-time checks
- No mixing of types (EUR vs hours)
- IDE autocomplete
- Refactoring safety

### Challenge 4: Human-in-the-Loop Validation
**Solution:** State machine with validation states
- Can pause for human review
- Track who validated what
- Retry mechanism for corrections
- Audit trail

## 🔮 Extending the Architecture

### Adding New Benefits (e.g., RIS)

1. **Specification**
   ```gherkin
   # features/benefits/ris.feature
   Fonctionnalité: Revenu d'Intégration Sociale
   ```

2. **Rules**
   ```typescript
   // src/rules/risRules.ts
   export function createRISEngine(): Engine
   ```

3. **Types**
   ```typescript
   // src/domain/types.ts
   export type BenefitType = 'agr' | 'ris' | ...
   ```

### Adding New Workflows (e.g., WhatsApp Bot)

```typescript
// src/workflows/chatbotMachine.ts
export const chatbotMachine = createMachine({
  id: 'whatsappBot',
  initial: 'greeting',
  states: {
    greeting: { /* ... */ },
    identifyingProblem: { /* ... */ },
    collectingInfo: { /* ... */ },
    calculating: { /* ... */ },
    responding: { /* ... */ }
  }
});
```

### Adding Multi-Language Support

```typescript
// src/domain/types.ts
export type Language = 'fr' | 'nl' | 'de';

// src/rules/i18n.ts
export const translations = {
  fr: { 'agr-eligible': 'Éligible pour AGR' },
  nl: { 'agr-eligible': 'In aanmerking voor AGR' },
  de: { 'agr-eligible': 'Berechtigt für AGR' }
};
```

## 📊 Comparison: Before vs After

### Before (Traditional Approach)
```typescript
// Hard to read, hard to change
function checkEligibility(user) {
  if (user.status === 'PT' && user.rm === true && user.sal < 1650 && !user.unemp) {
    return 1650 - user.sal * 0.8;
  }
  return 0;
}
```
Problems:
- ❌ Cryptic variable names
- ❌ Magic numbers
- ❌ No documentation of why
- ❌ Hard to test edge cases
- ❌ Can't validate with legal experts

### After (This Architecture)
```gherkin
# Human-readable specification
Scénario: Travailleur à temps partiel avec maintien des droits éligible
  Étant donné que je suis un travailleur à temps partiel
  Et que j'ai le maintien des droits
  Et que mon salaire brut mensuel est de 1200€
  Quand je vérifie mon éligibilité à l'AGR
  Alors je devrais être éligible
  Et le montant de l'allocation devrait être 360€
```

Benefits:
- ✅ Legal experts can read and validate
- ✅ Clear intent and reasoning
- ✅ Becomes automated test
- ✅ Versioned in git
- ✅ Self-documenting

## 🎓 Architecture Principles

### 1. **Separation of Concerns**
- Specification ≠ Implementation
- Workflows ≠ Business Rules
- Types ≠ Runtime Logic

### 2. **Single Source of Truth**
- Gherkin features are the spec
- Code implements the spec
- Tests validate the spec

### 3. **Fail Fast, Fail Safe**
- TypeScript catches errors at compile time
- Rules engine catches logic errors at runtime
- Validation catches semantic errors before delivery

### 4. **Audit-First Design**
- State machines track every transition
- Rules engine tracks which rules fired
- All decisions are traceable

### 5. **Human-First**
- Non-developers can read specifications
- Visual workflows aid understanding
- Examples demonstrate behavior

---

## 📚 Further Reading

- **Domain-Driven Design:** Eric Evans
- **State Machines:** David Harel
- **Business Rules Engines:** Martin Fowler
- **Behavior-Driven Development:** Dan North

This architecture balances:
- **Readability** (for legal experts)
- **Maintainability** (for developers)
- **Flexibility** (for changing regulations)
- **Safety** (for critical calculations)
