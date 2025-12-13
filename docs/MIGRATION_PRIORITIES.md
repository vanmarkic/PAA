# Frontend to Astro Migration - Priority Guide

## Quick Summary

| Aspect | Status | Priority |
|--------|--------|----------|
| Route coverage | Astro has 2.5x more pages | Medium |
| Interactive features | React has more | High |
| Documentation coverage | Astro has Rules + Features browser | Medium |
| Performance | Astro has advantage | Medium |
| Feature parity | ~70% achieved | High |

---

## Critical Missing Features (Must Implement)

### 1. Workflow Detail Page Tabs (React-only feature)
**Location**: `/workflows/:id` detail page in Astro  
**Impact**: HIGH - Users can't view detailed workflow information  
**Effort**: 2-3 days

**What's missing:**
- Overview tab (basic info)
- Simulation tab (interactive state machine)
- Technical Reference tab (code, states, events)
- Legal Context tab (references, citations)
- Examples & Use Cases tab

**Implementation approach:**
```astro
// docs-astro/src/pages/workflows/[id].astro
import MachineDetailTabs from '../../components/MachineDetailTabs.tsx';

export const prerender = true;

const { id } = Astro.params;
const workflow = await loadWorkflowDetail(id);
---

<MainLayout>
  <MachineDetailTabs 
    workflow={workflow}
    client:load
  />
</MainLayout>
```

---

### 2. Advanced Search & Multi-Filter (React-only feature)
**Location**: Home page & `/workflows` listing  
**Impact**: HIGH - Users can't efficiently find workflows  
**Effort**: 2-3 days

**What's missing:**
- Real-time search across name, description, keywords
- Category multi-select filter
- Complexity filter (Simple/Medium/Complex)
- Instant results filtering

**Implementation approach:**
```astro
// docs-astro/src/pages/workflows/index.astro
import WorkflowSearch from '../../components/WorkflowSearch.tsx';

const metadata = await loadMachinesMetadata();
---

<MainLayout>
  <WorkflowSearch 
    machines={metadata.machines}
    categories={metadata.categories}
    client:load
  />
</MainLayout>
```

---

### 3. Enhanced Wizard Experience (Astro version is too simple)
**Location**: `/wizard` page  
**Impact**: MEDIUM-HIGH - Key user journey feature  
**Effort**: 2-3 days

**Current gaps in Astro version:**
- Only 3 steps vs React's multi-step questionnaire
- No confidence scoring
- No personalized recommendations
- Missing contextual questions

**React version has:**
- 5+ contextual questions
- Employment status questionnaire
- Income assessment
- Household situation evaluation
- Confidence levels (high/medium)
- Personalized reasoning

**Implementation approach:** Enhance existing React island with more logic

---

### 4. Comparison Tool Refinement (Partially done)
**Location**: `/comparison` page  
**Impact**: MEDIUM - Important feature but React version already exists as island  
**Effort**: 1-2 days

**What needs expansion:**
- More comparison fields (keywords, legal references)
- Better row type handling
- Export to PDF/CSV functionality
- Selection management improvements

---

## Important Astro-Only Features (React doesn't have)

### 1. Rules Explorer (/rules)
**Status**: Exists in Astro, NOT in React  
**Impact**: For developers/legal experts  
**Value**: 300+ rules with filtering

### 2. Gherkin Features Browser (/features)
**Status**: Exists in Astro, NOT in React  
**Impact**: BDD specifications viewer  
**Value**: 100+ feature files with scenarios

### 3. Design System Showcase (/design-system)
**Status**: Exists in Astro, NOT in React  
**Impact**: Component documentation  
**Value**: 50+ Radix UI components

**Decision Point**: These are documentation features, not user-facing features. React doesn't need them.

---

## Feature Implementation Checklist

### Priority 1: Feature Parity (Do First)
- [ ] **Workflow Detail Tabs Component**
  - [ ] Create MachineDetailTabs.tsx (React island)
  - [ ] Implement Overview tab
  - [ ] Implement Simulation tab (state machine interaction)
  - [ ] Implement Technical tab (code display)
  - [ ] Implement Legal References tab
  - [ ] Implement Examples tab
  - [ ] Add to /workflows/[id].astro
  - [ ] Estimated time: 2-3 days

- [ ] **Advanced Search & Filter**
  - [ ] Create WorkflowSearch.tsx (React island)
  - [ ] Implement real-time search
  - [ ] Implement category filter
  - [ ] Implement complexity filter
  - [ ] Add to home and /workflows pages
  - [ ] Estimated time: 2-3 days

- [ ] **Enhanced Wizard**
  - [ ] Add more contextual questions
  - [ ] Implement confidence scoring
  - [ ] Add personalized reasoning
  - [ ] Update existing React island
  - [ ] Test user flow
  - [ ] Estimated time: 2-3 days

- [ ] **Comparison Tool Expansion**
  - [ ] Add more comparison fields
  - [ ] Implement export functionality
  - [ ] Add selection indicators
  - [ ] Test with multiple selections
  - [ ] Estimated time: 1-2 days

**Total Estimated Time: 7-11 days**

### Priority 2: Enhancements (Nice to have)
- [ ] **State Machine Visualization**
  - [ ] Choose visualization library (Mermaid/SVG/D3)
  - [ ] Create visual state diagrams
  - [ ] Add interactive state transitions
  - [ ] Estimated time: 2-3 days

- [ ] **Download/Export Features**
  - [ ] Implement PDF export for workflows
  - [ ] Implement JSON export for rules
  - [ ] Implement CSV export for comparisons
  - [ ] Estimated time: 1-2 days

- [ ] **Interactive Rule Simulator**
  - [ ] Create rule condition builder
  - [ ] Add fact value input
  - [ ] Show evaluation results
  - [ ] Estimated time: 2 days

**Total Estimated Time: 5-7 days**

---

## Routes Not Yet Implemented in Astro (From React)

| React Route | Astro Route | Status | Effort |
|------------|------------|--------|--------|
| `/workflows/:id` | `/workflows/[id].astro` | Basic, needs tabs | 2-3 days |
| `/comparison` | `/comparison.astro` | Partial, has island | 1-2 days |
| `/benefits` | `/benefits.astro` | Basic, adequate | Done |
| `/wizard` | `/wizard.astro` | Simplified, needs enhancement | 2-3 days |
| `/developer` | `/developer.astro` | Basic, adequate | Done |

---

## Data Synchronization Strategy

### Current Issue
- React fetches from API at runtime
- Astro loads from build-time metadata
- Data can drift between the two

### Solutions
1. **Shared API**: Both use same API endpoint
   - React: Direct fetch in hooks
   - Astro: Fetch during build, embed in HTML
   - Advantage: Single source of truth
   - Disadvantage: Astro rebuild needed for updates

2. **Shared Metadata Files**: Both read from same JSON/metadata
   - React: Load metadata.json at startup
   - Astro: Load metadata.json at build time
   - Advantage: Single source of truth
   - Disadvantage: Manual sync needed

3. **Database Backend**: Both use database
   - React: API calls to fetch data
   - Astro: Database queries at build time
   - Advantage: Real-time data
   - Disadvantage: Complex setup

**Recommendation**: Use approach #2 (shared metadata files) for now, move to #3 later

---

## Component Reusability Matrix

| Component | React Version | Astro Version | Reusable as Island | Notes |
|-----------|---------------|----------------|-------------------|-------|
| MachineCard | Yes | Partial | Yes | Display workflow card |
| ComparisonTool | Yes | Yes | Yes | Already in Astro as island |
| WorkflowWizard | Yes | Simplified | Yes | Needs enhancement |
| Home | Yes | Basic | Partially | Large component, split out search |
| Footer | Yes | Yes | No | Static content |
| Navigation | Yes | Yes | No | Static content |

---

## Testing Strategy

### Unit Tests
- Test search filtering logic
- Test filter combinations
- Test comparison row rendering
- Test wizard scoring algorithm

### Integration Tests
- Test home page with search
- Test workflow detail with all tabs
- Test wizard flow end-to-end
- Test comparison with exports

### E2E Tests (Playwright)
- User search for workflow
- User compares workflows
- User takes wizard
- User exports results

---

## Browser Support Considerations

### React Frontend
- Uses modern ES6+ features
- Requires JavaScript enabled
- Targets modern browsers (last 2 versions)

### Astro Docs
- Progressive enhancement approach
- Works better without JavaScript (static content)
- React islands only load when needed

**For migration:**
- Ensure React islands gracefully degrade
- Provide fallback static content for critical paths
- Test in older browsers if legacy support needed

---

## Performance Implications

| Feature | React | Astro | Winner |
|---------|-------|-------|--------|
| Initial Load | Slow (JS bundle) | Fast (HTML) | Astro |
| Search Performance | Real-time filter | Static content | React |
| Workflow Loading | API call | Pre-rendered | Astro |
| Comparison | Client-side | Pre-rendered + island | Astro |
| State Machine Viz | Animated | Static + hydrate | React (better animation) |

---

## Deployment Considerations

### React Frontend
- Requires Node.js runtime
- Build step: `npm run build`
- Deployment: `npm start` or serverless

### Astro Docs
- Can be fully static (no runtime)
- Build step: `npm run build` → generates /dist folder
- Deployment: CDN (very fast)

**Recommendation after migration:**
- Keep Astro for documentation (rules, features, design system)
- Keep React for interactive features (wizard, comparison, search)
- Or unify on Astro with React islands for interactivity

---

