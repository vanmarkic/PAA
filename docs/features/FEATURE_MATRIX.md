# Complete Feature Matrix - React Frontend vs Astro Docs

## Visual Feature Comparison

### REACT FRONTEND (frontend/)
```
Home Page
├── Advanced Search ✓ UNIQUE
├── Multi-Filter UI ✓ UNIQUE
│   ├── Category filter
│   ├── Complexity filter
│   └── Real-time results
├── Compare Selection ✓ UNIQUE
├── Stats Dashboard ✓
└── Machine Cards

Workflow Detail (/workflows/:id)
├── Tabbed Interface ✓ UNIQUE
│   ├── Overview
│   ├── Simulation (Interactive) ✓ UNIQUE
│   ├── Technical Reference
│   ├── Legal Context
│   └── Examples & Use Cases
├── Download/Share ✓
├── Compare Action
└── Related Workflows

Comparison Tool (/comparison)
├── Selection Interface ✓
├── Advanced Filtering ✓
├── Detailed Comparison Table ✓
│   ├── Name
│   ├── Category
│   ├── Complexity
│   ├── States Count
│   ├── Events Count
│   ├── Keywords
│   ├── Gherkin File
│   └── Legal References
├── Remove Machines ✓
└── Export/Download ✓

Wizard (/wizard)
├── Multi-Step Form ✓ COMPLEX
│   ├── Category selection
│   ├── Status questions (5+ options)
│   ├── Income assessment
│   └── Household situation
├── Intelligent Matching ✓
├── Confidence Scoring ✓
├── Personalized Reasons ✓
└── Result Details

Benefits Guide (/benefits)
├── Static Content
├── Category Browsing
├── Details Navigation
└── Feature Comparison

Developer Docs (/developer)
├── API Documentation
├── Code Examples
├── Integration Guide
└── Resources

Architecture
├── React Router (Client-side routing)
├── Context API (State management)
├── Custom Hooks (Data fetching)
├── Error Boundaries
├── Loading States
├── TypeScript
├── i18n/i18next
└── Radix UI Components (50+)
```

### ASTRO DOCS SITE (docs-astro/)
```
Home Page (/)
├── Basic Navigation
├── Stats Dashboard
├── Featured Workflows
├── Rules Overview
└── CTA Buttons

Wizard (/wizard)
├── Simplified Flow (3 steps) ⚠ LIMITED
└── React Island component

Comparison (/comparison)
├── React Island Component
├── Selection Interface
├── Static Comparison Table
└── Export Buttons (stubs)

Benefits (/benefits)
├── Static Categories
├── Featured Benefits
├── Category Grid
└── Help Section

Developer (/developer)
├── Static Documentation
├── Code Snippets
├── API Reference
└── Resources

Workflows Listing (/workflows)
├── Category Filtering ✓ UNIQUE (vs React)
├── Workflow Cards
└── Links to Detail

Workflow Detail (/workflows/[id])
├── Basic Information
├── States/Events Count
├── Metadata
└── Links (LIMITED - no tabs)

Rules Explorer (/rules) ✓ UNIQUE
├── All Rules Listing
├── Search & Filter
├── Priority Filtering
├── Category Stats
├── Operators Reference
└── Facts Overview

Rule Details (/rules/[id]) ✓ UNIQUE
├── Full Rule Definition
├── Conditions Breakdown
├── Associated Features
├── Metadata
└── Links

Gherkin Features (/features) ✓ UNIQUE
├── Feature Listing
├── Search & Filter
├── Scenario Counts
├── Category Browser
└── BDD Explanation

Feature Details (/features/[id]) ✓ UNIQUE
├── Gherkin Text
├── Scenarios
├── Associated Rules
└── Tags

Design System (/design-system) ✓ UNIQUE
├── Color Palette
├── 50+ Component Examples
├── Usage Instructions
├── Design Tokens
└── Tailwind v4 Features

Category Browser (/category/[slug]) ✓ UNIQUE
└── Filtered Workflows

Test Components (/test-components) ✓ UNIQUE
└── Component Sandbox

Metadata Example (/metadata-example) ✓ UNIQUE
└── Metadata Showcase

Architecture
├── Astro Static Generation (SSR)
├── React Islands (client:load)
├── Build-time Data Loading
├── Static Output
├── CDN-friendly
├── Minimal JavaScript
└── Radix UI Components (50+)
```

---

## Feature Comparison Matrix

| Feature | React | Astro | Notes |
|---------|:-----:|:-----:|-------|
| **Search** | ✓ Advanced | ✗ | Real-time search missing |
| **Multi-Filter** | ✓ | ✗ | Category, Complexity only in React |
| **Workflow Tabs** | ✓ | ✗ | Critical feature gap |
| **Simulation** | ✓ | ✗ | Interactive state machine |
| **Comparison Tool** | ✓ Full | ~ Partial | Astro has React island |
| **Wizard** | ✓ Complex | ~ Simplified | Astro needs enhancement |
| **Rules Browser** | ✗ | ✓ | Astro-only, 300+ rules |
| **Gherkin Viewer** | ✗ | ✓ | Astro-only, 100+ features |
| **Design System** | ✗ | ✓ | Astro-only showcase |
| **Category Filter** | ✗ | ✓ | Astro-only, uses query params |
| **Benefits Guide** | ✓ | ✓ | Both have it |
| **Developer Docs** | ✓ | ✓ | Both have it |
| **Home Page** | ✓ Full | ~ Basic | React more interactive |
| **Client Routing** | ✓ | ✗ | React Router vs Astro static |
| **API Integration** | ✓ Runtime | ~ Build-time | Different data models |
| **State Management** | ✓ | Minimal | React more complex |
| **Download/Export** | ✓ Potential | ~ Stubs | Neither fully implemented |
| **Responsive Design** | ✓ | ✓ | Both use Tailwind |
| **i18n Support** | ✓ Full | ~ Partial | React has i18next |
| **TypeScript** | ✓ Strict | ~ Partial | React fully typed |

**Legend**: ✓ = Implemented | ~ = Partial | ✗ = Missing

---

## Quick Win Migrations (Easy → Hard)

### Tier 1: Easy (1 day each)
1. Copy static footer and navigation to Astro layouts
2. Port design tokens and color schemes
3. Copy localization strings (if unified i18n)

### Tier 2: Medium (2-3 days each)
1. **Workflow Detail Tabs** - Most important
2. **Advanced Search Component** - High value
3. **Enhanced Wizard** - Improves UX significantly
4. **Comparison Tool Expansion** - Completes feature

### Tier 3: Complex (2-3 days each)
1. **State Machine Visualization** - Nice to have
2. **PDF/Export Features** - Infrastructure needed
3. **Interactive Rule Simulator** - Complex logic

### Tier 4: Large (Entire rewrite)
1. Merge React frontend into Astro entirely
2. Convert all pages to Astro + React islands
3. Unify data loading strategy

---

## Component Dependencies

### React Components Needed in Astro

```
Core Components:
├── MachineDetailTabs (PRIORITY 1)
│   ├── OverviewTab
│   ├── SimulationTab
│   ├── TechnicalTab
│   ├── LegalTab
│   └── ExamplesTab
│
├── WorkflowSearch (PRIORITY 1)
│   ├── SearchInput
│   ├── CategoryFilter
│   ├── ComplexityFilter
│   └── ResultsList
│
├── EnhancedWizard (PRIORITY 1)
│   ├── CategoryStep
│   ├── QuestionsStep
│   ├── ResultsStep
│   └── RecommendationCard
│
├── ComparisonToolExpanded (PRIORITY 2)
│   ├── SelectionPanel
│   ├── ComparisonTable
│   ├── ExportButton
│   └── FilterPanel
│
├── StateMachineVisualizer (PRIORITY 3)
│   ├── StateNodes
│   ├── Transitions
│   └── LegendPanel
│
└── RuleSimulator (PRIORITY 3)
    ├── ConditionBuilder
    ├── FactInput
    └── ResultsDisplay
```

---

## Data Structure Alignment

### React API Model
```typescript
interface Workflow {
  id: string;
  name: string;
  category: string;
  description: string;
  plainLanguage: string;
  states: string[];
  events: string[];
  stateCount: number;
  eventCount: number;
  complexity: 'Simple' | 'Medium' | 'Complex';
  keywords?: string[];
  legalReferences?: LegalReference[];
  lastModified?: string;
  version?: string;
  gherkinFile?: string;
}
```

### Astro Metadata Model
```typescript
interface Machine {
  id: string;
  name: string;
  category: string;
  description?: string;
  plainLanguage?: string;
  states?: string[];
  events?: string[];
  complexity?: string;
  keywords?: string[];
  legalReferences?: any[];
  lastModified?: string;
  version?: string;
}
```

**Alignment Status**: ~90% compatible, minor fixes needed

---

## Implementation Order (Recommended)

### Week 1: Foundation
- Day 1-2: Create MachineDetailTabs component (CRITICAL)
- Day 3: Create WorkflowSearch component (CRITICAL)
- Day 4: Integrate both into Astro pages
- Day 5: Testing and refinement

### Week 2: Enhancement
- Day 1-2: Enhance Wizard component
- Day 3: Expand Comparison Tool
- Day 4: Add state machine visualization
- Day 5: Testing and documentation

### Week 3: Polish & Optimization
- Day 1: PDF/Export implementation
- Day 2: Performance optimization
- Day 3: SEO improvements
- Day 4-5: Testing and deployment preparation

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Workflow detail page has 5 functional tabs
- [ ] Home page has working search + filters
- [ ] Wizard has 5+ contextual questions
- [ ] Comparison tool compares 5+ fields
- [ ] All pages render without errors in Astro
- [ ] Feature parity with React achieved

### Phase 2 Complete When:
- [ ] State machine visualization working
- [ ] PDF export functional
- [ ] Rule simulator interactive
- [ ] Performance metrics meet targets
- [ ] 100% test coverage of new features

### Phase 3 Complete When:
- [ ] Unified data loading strategy
- [ ] Complete migration decision made
- [ ] Deployment infrastructure ready
- [ ] Documentation complete

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Data drift between React and Astro | High | Shared metadata files, automated sync |
| Component incompatibility | Medium | Thorough testing, type safety |
| Performance regression | Medium | Benchmarking, optimization |
| User disruption | Medium | Phased rollout, feature flags |
| Browser compatibility | Low | Progressive enhancement |

---

## Resource Estimates

| Task | Dev Hours | QA Hours | Total |
|------|-----------|----------|-------|
| MachineDetail Tabs | 16 | 4 | 20 |
| Advanced Search | 16 | 4 | 20 |
| Enhanced Wizard | 16 | 4 | 20 |
| Comparison Expansion | 8 | 2 | 10 |
| State Machine Viz | 12 | 3 | 15 |
| Export Features | 8 | 2 | 10 |
| Rule Simulator | 12 | 3 | 15 |
| Testing & Optimization | 16 | 8 | 24 |
| **TOTAL** | **104** | **30** | **134** |

**Estimated Timeline**: 3-4 weeks (full-time 1-2 developers)

---

