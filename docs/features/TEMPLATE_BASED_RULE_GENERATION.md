# Template-Based Rule Generation with Claude API

## Overview

The rule generation pipeline now uses a **template-based approach** where:
1. **Template** provides the consistent file structure (imports, metadata, function signatures)
2. **Claude API** fills in the business logic based on Gherkin features

This ensures:
- ✅ Consistent structure across all rule files
- ✅ Proper imports and metadata
- ✅ Type-safe function signatures
- ✅ Business logic generated from Gherkin scenarios

## Architecture

### Components

1. **`src/ai/ruleTemplateGenerator.ts`**
   - Generates rule file templates with consistent structure
   - Extracts context from Gherkin features
   - Provides placeholders for business logic

2. **`src/ai/claudeIntegration.ts`** (updated)
   - `generateRulesFromFeature()` - Uses template approach
   - `generateRulesGenerationPromptWithTemplate()` - New prompt that uses template

### Flow

```
Gherkin Feature
    ↓
Extract Template Context (featureId, className, legalBasis, etc.)
    ↓
Generate Template (structure with TODO placeholders)
    ↓
Claude API Prompt (template + feature + examples)
    ↓
Claude fills in business logic
    ↓
Complete Rule File (template + business logic)
```

## Template Structure

The template includes:

1. **File Header**
   - Legal basis comments
   - Feature reference
   - Purpose description

2. **Imports**
   - `json-rules-engine` Engine
   - Domain types
   - Legal sources (if applicable)

3. **Metadata Export**
   - Version information
   - Specification reference
   - Compliance tracking

4. **Constants Section**
   - Placeholder for legal constants

5. **Engine Creation Function**
   - `create[ClassName]Engine()` function
   - TODO placeholder for rules

6. **Singleton Instance**
   - Cached engine instance

7. **Calculation Function**
   - `calculate[ClassName]Amount()` placeholder

8. **Eligibility Check Function**
   - `check[ClassName]Eligibility()` placeholder
   - Facts mapping TODO

9. **JSON Export**
   - `[FEATURE_ID]_RULES_JSON` placeholder

## Example

### Input: Gherkin Feature
```gherkin
Fonctionnalité: Revenu d'Intégration Sociale (RIS)
  Scénario: Personne isolée éligible
    Étant donné que je suis une personne isolée
    Et que j'ai 25 ans
    Et que je suis Belge
    Quand je vérifie mon éligibilité au RIS
    Alors je devrais être éligible
    Et le montant du RIS devrait être 1070.49€
```

### Template Generated
```typescript
/**
 * Business Rules for Revenu d'Intégration Sociale (RIS)
 * ...
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

export const RIS_RULES_METADATA = { ... };

function createRISEngine(): Engine {
  const engine = new Engine();
  // TODO: Claude will generate rules here
  return engine;
}

// ... rest of template
```

### Claude Fills In
```typescript
function createRISEngine(): Engine {
  const engine = new Engine();
  
  // Rule 1: Age requirement
  engine.addRule({
    conditions: {
      all: [
        { fact: 'age', operator: 'greaterThanOrEqual', value: 18 },
        { fact: 'category', operator: 'equal', value: 'isolated' },
        { fact: 'nationality', operator: 'equal', value: 'belgian' },
      ],
    },
    event: {
      type: 'ris-eligible',
      params: { amount: 1070.49 },
    },
    priority: 10,
  });
  
  return engine;
}
```

## Benefits

### 1. Consistency
- All rule files follow the same structure
- Same imports, same metadata format
- Same function signatures

### 2. Type Safety
- Template ensures proper TypeScript types
- Function signatures are correct
- Domain types are imported correctly

### 3. Maintainability
- Easy to update template for all files
- Changes to structure propagate automatically
- Less code duplication

### 4. Quality
- Template prevents common errors
- Metadata is always included
- Legal references are structured

## Usage

The template approach is automatically used when calling:

```typescript
await generateRulesFromFeature(feature, config);
```

The function:
1. Generates template from feature context
2. Sends template + feature to Claude
3. Claude fills in business logic
4. Returns complete rule file

## Template Customization

To modify the template structure, edit:
- `src/ai/ruleTemplateGenerator.ts` → `generateRuleTemplate()`

The template uses context extracted from:
- Feature file path → `featureId`, `className`
- Feature content → `featureName`, `legalBasis`, `version`
- Metadata → `authority`, `effectiveDate`, `legalUrl`

## Comparison with Previous Approach

### Before (Manual)
- Developer writes entire file manually
- Inconsistent structure
- Easy to miss imports or metadata

### Before (AI without Template)
- Claude generates entire file
- Structure may vary
- May miss required exports

### Now (Template + AI)
- ✅ Template ensures structure
- ✅ Claude focuses on business logic
- ✅ Consistent across all files
- ✅ Type-safe by design

## Future Enhancements

1. **Template Variants**
   - Different templates for different benefit types
   - Complex vs simple rule structures

2. **Validation**
   - Validate template structure before Claude generation
   - Ensure all TODOs are filled

3. **Incremental Updates**
   - Update only business logic when feature changes
   - Keep template structure intact

---

**Status**: ✅ Implemented and ready for use

