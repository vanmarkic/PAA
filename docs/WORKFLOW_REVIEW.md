# 🔄 Workflow Review: Adding New Features (Laws)

## Proposed Workflow

```
1. Dev wants to add a new feature (law)
   ↓
2. Run Claude agent/skill to:
   - Read law article/decree from web
   - Convert it into Gherkin feature
   - Write down the sources somewhere
   ↓
3. Rules and machines are generated (automatically)
   ↓
4. Lineage document is generated
```

## ✅ What's Correct

1. **Claude Agent for Web Reading**: ✅ Good idea - automates legal source extraction
2. **Gherkin Feature Generation**: ✅ Correct - features are the specification layer
3. **Source Documentation**: ✅ Critical - legal sources must be tracked
4. **Lineage Generation**: ✅ Correct - final step to build relationships

## ⚠️ What Needs Clarification/Enhancement

### Issue 1: Rules Generation - Partially Automated?

**Current State**: 
- `scripts/generateRules.ts` exists but generates **template** rules, not from features
- Rules are currently **manually written** to implement features

**Proposed Flow Says**: "Rules are generated automatically"

**Question**: Should rules be:
- **A) Fully automated** from Gherkin features? (Complex - requires AI/parsing)
- **B) Template-generated** with placeholders? (Current approach)
- **C) AI-assisted** but human-reviewed? (Recommended)

**Recommendation**: **Option C - AI-Assisted Generation**

```typescript
// Proposed: AI-assisted rule generation
1. Claude reads Gherkin feature
2. Claude generates rule template with:
   - Conditions extracted from scenarios
   - Events from "When" steps
   - Facts from "Given" steps
3. Developer reviews and refines
4. Rules are saved to src/rules/
```

### Issue 2: Machine Generation - When?

**Current State**:
- `scripts/generateMachines.ts` generates machines from **definitions**, not from features/rules
- Machines are **manually created** for workflows

**Proposed Flow Says**: "Machines are generated"

**Question**: Should machines be:
- **A) Generated immediately** after rules? (May not be needed for all features)
- **B) Generated on-demand** when workflow is needed? (Recommended)
- **C) Template-generated** with placeholders? (Current approach)

**Recommendation**: **Option B - On-Demand Generation**

Not all features need workflows. Machines should be generated when:
- A workflow/process is needed
- Multiple rules need orchestration
- User interaction is required

### Issue 3: Source Writing Location

**Proposed Flow Says**: "Write down the sources somewhere"

**Current Locations**:
1. `src/domain/legalMetadata.ts` - Central registry
2. Feature file metadata (`@legal-url`, `@legal-basis`)
3. Rule file comments (`BASE JURIDIQUE`)

**Recommendation**: **Multi-Location Strategy**

```typescript
// Claude agent should write to:
1. Feature file: @legal-url, @legal-basis (immediate)
2. legalMetadata.ts: Full structured metadata (centralized)
3. belgianLegalSources.ts: Detailed framework (if new law)
```

## 🔄 Revised Workflow (Recommended)

### Phase 1: Legal Source Extraction & Feature Creation

```
1. Developer provides:
   - URL to law/decree/article
   - Or pastes legal text
   ↓
2. Claude Agent/Skill:
   a) Fetches legal text from web (or uses provided text)
   b) Extracts key information:
      - Authority (SPF, ONEM, etc.)
      - Publication date
      - Effective date
      - Official URL
      - Key articles/sections
   c) Converts legal text to Gherkin feature:
      - Feature description from law summary
      - Scenarios from legal conditions
      - Background from legal context
   d) Writes feature file with metadata:
      - @specification-version
      - @legal-basis
      - @legal-url
      - @implemented-by (placeholder)
   e) Updates legalMetadata.ts:
      - Adds new machine entry
      - Includes all legal sources
      - Sets extraction date
   ↓
3. Output: features/benefits/new-law.feature
```

### Phase 2: Rule Generation (AI-Assisted)

```
1. Claude Agent reads generated feature
   ↓
2. Claude Agent generates rule template:
   a) Extracts conditions from scenarios:
      - "Given" steps → facts
      - "When" steps → events
      - "Then" steps → outcomes
   b) Creates rule structure:
      - conditions.all[] from "Given" steps
      - event.type from "When" steps
      - priority based on scenario order
   c) Adds metadata:
      - implementsSpecification
      - lastSyncedWith
   ↓
3. Developer reviews generated rules:
   - Validates logic
   - Adds calculations
   - Refines conditions
   - Tests edge cases
   ↓
4. Output: src/rules/newLawRules.ts
```

### Phase 3: Machine Generation (On-Demand)

```
1. Developer decides if workflow is needed:
   - Simple eligibility check? → Skip machine
   - Multi-step process? → Generate machine
   ↓
2. If needed, Claude Agent generates machine:
   a) Analyzes rules to determine workflow:
      - Single rule → Simple state machine
      - Multiple rules → Orchestration machine
   b) Creates XState machine:
      - States from rule evaluation flow
      - Events from rule events
      - Guards from rule conditions
   c) Adds metadata:
      - Links to rules
      - Links to feature
   ↓
3. Developer reviews and refines:
   - Validates state transitions
   - Adds error handling
   - Tests workflow
   ↓
4. Output: src/workflows/newLawMachine.ts (if needed)
```

### Phase 4: Metadata & Lineage Generation

```
1. Generate metadata files:
   npm run features:metadata
   npm run rules:metadata
   npm run docs:metadata
   ↓
2. Generate lineage:
   npm run docs:individual
   ↓
3. Verify lineage:
   - Check features/{id}.json has lineage
   - Verify legal sources are linked
   - Confirm rules → workflows relationships
```

## 🛠️ Implementation Requirements

### New Components Needed

#### 1. Claude Agent/Skill for Legal Text Processing

**Location**: `scripts/agents/legalTextProcessor.ts`

**Responsibilities**:
- Fetch legal text from URLs
- Parse legal documents (PDF, HTML, text)
- Extract structured information
- Convert to Gherkin format
- Update legal metadata registry

**Input**:
```typescript
interface LegalTextInput {
  url?: string;
  text?: string;
  language: 'fr' | 'nl' | 'de';
  authority?: string;
}
```

**Output**:
```typescript
interface LegalTextOutput {
  feature: GherkinFeature;
  legalSources: LegalSource[];
  metadata: FeatureMetadata;
}
```

#### 2. AI-Assisted Rule Generator

**Location**: `scripts/agents/ruleGenerator.ts`

**Responsibilities**:
- Parse Gherkin feature
- Extract conditions, events, facts
- Generate rule template
- Add metadata links

**Input**: `features/**/*.feature`

**Output**: `src/rules/*Rules.ts` (template)

#### 3. AI-Assisted Machine Generator

**Location**: `scripts/agents/machineGenerator.ts`

**Responsibilities**:
- Analyze rules to determine workflow needs
- Generate XState machine template
- Link to rules and features

**Input**: `src/rules/*Rules.ts`

**Output**: `src/workflows/*Machine.ts` (if needed)

### Integration Points

```typescript
// Proposed CLI command
npm run add-feature -- --url="https://..." --category="social"

// This would:
// 1. Call legalTextProcessor
// 2. Generate feature file
// 3. Call ruleGenerator
// 4. Generate rule template
// 5. Prompt: "Generate workflow? (y/n)"
// 6. If yes, call machineGenerator
// 7. Run metadata generation
// 8. Run lineage generation
```

## 📊 Workflow Comparison

### Current Workflow (Manual)

```
1. Developer reads law manually
2. Developer writes Gherkin feature manually
3. Developer writes rules manually
4. Developer writes machine manually (if needed)
5. Developer updates legalMetadata.ts manually
6. Run metadata generation
7. Run lineage generation
```

**Time**: ~2-4 hours per feature

### Proposed Workflow (AI-Assisted)

```
1. Developer provides URL
2. Claude agent generates feature (5 min)
3. Claude agent generates rule template (2 min)
4. Developer reviews/refines rules (30 min)
5. Claude agent generates machine (if needed) (2 min)
6. Developer reviews/refines machine (15 min)
7. Run metadata generation (automatic)
8. Run lineage generation (automatic)
```

**Time**: ~1 hour per feature (50-75% faster)

## ✅ Corrected Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. Developer: Provide legal source (URL/text)   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 2. Claude Agent: Legal Text Processor           │
│    - Fetch/parse legal text                     │
│    - Extract metadata (authority, dates, URL)   │
│    - Convert to Gherkin feature                 │
│    - Write feature file                         │
│    - Update legalMetadata.ts                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 3. Claude Agent: Rule Generator                 │
│    - Parse Gherkin feature                      │
│    - Extract conditions/events                  │
│    - Generate rule template                     │
│    - Write rule file                            │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 4. Developer: Review & Refine Rules             │
│    - Validate logic                             │
│    - Add calculations                           │
│    - Test edge cases                            │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 5. Claude Agent: Machine Generator (Optional)   │
│    - Analyze rules                               │
│    - Determine if workflow needed                │
│    - Generate machine template (if needed)       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 6. Developer: Review & Refine Machine            │
│    - Validate state transitions                  │
│    - Add error handling                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 7. Automated: Metadata Generation               │
│    npm run features:metadata                     │
│    npm run rules:metadata                        │
│    npm run docs:metadata                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 8. Automated: Lineage Generation                 │
│    npm run docs:individual                       │
└─────────────────────────────────────────────────┘
```

## 🎯 Key Corrections

1. **Rules are AI-assisted, not fully automated** - Human review is critical
2. **Machines are optional** - Not all features need workflows
3. **Sources are written to multiple locations** - Feature file + legalMetadata.ts
4. **Metadata & lineage are automated** - Final steps run automatically

## 📝 Summary

**Your proposed flow is mostly correct**, but needs these clarifications:

✅ **Correct**:
- Claude agent reads law from web
- Claude agent converts to Gherkin feature
- Claude agent writes sources
- Lineage is generated automatically

⚠️ **Needs Clarification**:
- Rules are **AI-assisted** (template generation + human review)
- Machines are **optional** (only if workflow needed)
- Sources are written to **multiple locations**

**Recommended Flow**: See "Corrected Workflow" above.

