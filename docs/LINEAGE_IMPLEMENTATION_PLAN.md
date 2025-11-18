# 📋 Implementation Plan: Complete Lineage Management (Revised)

## 🎯 Objective

Create a complete traceability system that maintains the full lineage from **Legal Sources → Features → Rules → Workflows** in a single, efficient, and maintainable way using **production-ready architecture patterns**.

## 📊 Current State Analysis

### Existing Scripts

1. **`generate-features-metadata-standalone.js`**
   - ✅ Parses Gherkin features
   - ✅ Extracts metadata (`@specification-version`, `@legal-basis`, `@implemented-by`)
   - ✅ Generates `features-metadata.json`
   - ❌ No lineage relationships
   - ❌ Synchronous I/O

2. **`generateIndividualMetadata.ts`**
   - ✅ Generates individual JSON files per machine/rule/feature
   - ✅ Adds legal sources to each file
   - ✅ Creates lightweight index files
   - ❌ No cross-references between items
   - ❌ No Astro link blueprints
   - ❌ Uses `any[]` types (no type safety)
   - ❌ Synchronous file operations

3. **`generateMachinesMetadata.ts`**
   - ✅ Parses XState machines
   - ✅ Extracts states, events, transitions
   - ❌ No relationship to features/rules

4. **`generate-rules-metadata.ts`**
   - ✅ Parses rules files
   - ✅ Extracts conditions, events
   - ❌ No relationship to features/workflows

### What's Missing

1. **Lineage Relationships**
   - Feature → Rules (which rules implement this feature?)
   - Rules → Workflows (which workflows use these rules?)
   - Legal Sources → All (complete traceability)

2. **Astro SSG Link Blueprints**
   - Pre-computed URLs for documentation pages
   - Cross-reference links ready for rendering

3. **Traceability Metadata**
   - How relationships were discovered (explicit vs inferred)
   - Completeness indicators
   - Version synchronization status

4. **Production-Ready Architecture**
   - Modular, testable design
   - Type safety
   - Async I/O
   - Performance optimization
   - Error handling
   - Observability

## 🏗️ Proposed Architecture

### High-Level Design

```
┌─────────────────────────────────────────┐
│         LineageGenerator                │
│  (Orchestrator - Dependency Injection)  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│Discovery│ │Generator│ │Validator│
│ Strategy│ │ Strategy│ │ Strategy│
└─────────┘ └─────────┘ └─────────┘
    │          │          │
    ▼          ▼          ▼
┌─────────────────────────────────────┐
│      Repository (Storage)            │
│  - FileSystem / Database / Cache     │
└─────────────────────────────────────┘
```

### Data Flow

```
Legal Sources (legalMetadata.ts)
    ↓
Features (Gherkin .feature files)
    ↓ @implemented-by
Rules (src/rules/*.ts)
    ↓ benefitType/category matching
Workflows (src/workflows/*Machine.ts)
```

### File Structure

```
scripts/
├── lineage/
│   ├── discovery/
│   │   ├── FeatureRuleDiscovery.ts      // Feature → Rules
│   │   ├── RuleWorkflowDiscovery.ts     // Rules → Workflows
│   │   ├── LegalSourceAggregator.ts     // Legal sources
│   │   └── RelationshipIndex.ts        // O(n) indexing
│   ├── generators/
│   │   ├── FeatureGenerator.ts          // Generate feature files
│   │   ├── RuleGenerator.ts              // Generate rule files
│   │   └── WorkflowGenerator.ts          // Generate workflow files
│   ├── validators/
│   │   ├── LineageValidator.ts          // Validate completeness
│   │   └── VersionSyncValidator.ts       // Check version sync
│   ├── repositories/
│   │   ├── MetadataRepository.ts        // Abstract storage
│   │   ├── FileSystemRepository.ts      // File-based storage
│   │   └── CachedRepository.ts          // Cached storage
│   ├── types/
│   │   ├── Feature.ts                   // Type definitions
│   │   ├── Rule.ts
│   │   ├── Workflow.ts
│   │   └── Lineage.ts
│   └── index.ts                          // Main orchestrator

docs-astro/public/
├── features/
│   ├── {featureId}.json          # Enhanced with lineage
│   └── ...
├── rules/
│   ├── {ruleId}.json             # Enhanced with lineage
│   └── ...
├── machines/
│   ├── {machineId}.json          # Enhanced with lineage
│   └── ...
└── lineage/
    └── lineage-index.json        # Quick lookup index
```

## 🔧 Implementation Steps

### Phase 1: Foundation & Architecture (Week 1)

#### Step 1.1: Create Modular Structure

**Create directory structure:**
```bash
mkdir -p scripts/lineage/{discovery,generators,validators,repositories,types}
```

#### Step 1.2: Define TypeScript Interfaces

**`scripts/lineage/types/Feature.ts`**
```typescript
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  filePath: string;
  metadata: {
    specificationVersion?: string;
    effectiveDate?: string;
    legalBasis?: string;
    legalUrl?: string;
    implementedBy?: string;
  };
  scenarios: Scenario[];
  tags: string[];
}

export interface FeatureWithLineage extends Feature {
  lineage: Lineage;
  astroLinks: AstroLinks;
  traceability: Traceability;
}
```

**`scripts/lineage/types/Lineage.ts`**
```typescript
export enum DiscoveryMethod {
  EXPLICIT = 'explicit',
  INFERRED = 'inferred',
  COMPUTED = 'computed',
}

export enum Completeness {
  COMPLETE = 'complete',
  PARTIAL = 'partial',
  MISSING = 'missing',
}

export interface ImplementingRule {
  id: string;
  file: string;
  description: string;
  benefitType?: string;
  implementsSpecification?: string;
  url: string;
}

export interface UsingWorkflow {
  id: string;
  name: string;
  category: string;
  usesRules: string[];
  url: string;
}

export interface LegalSource {
  authority: string;
  title: string;
  officialUrl?: string;
  publicationDate?: string;
  effectiveDate?: string;
  extractedFrom: 'feature' | 'rules' | 'workflow' | 'registry';
}

export interface Lineage {
  legalSources: LegalSource[];
  implementingRules: ImplementingRule[];
  usingWorkflows: UsingWorkflow[];
}

export interface AstroLinks {
  featureUrl?: string;
  ruleUrl?: string;
  workflowUrl?: string;
  rulesUrls: string[];
  workflowsUrls: string[];
  featuresUrls: string[];
  legalSourcesUrls: string[];
}

export interface Traceability {
  sourceToFeature: DiscoveryMethod;
  featureToRules: DiscoveryMethod;
  rulesToWorkflows: DiscoveryMethod;
  completeness: Completeness;
  lastValidated: string;
}
```

#### Step 1.3: Implement Repository Pattern

**`scripts/lineage/repositories/MetadataRepository.ts`**
```typescript
export interface MetadataRepository {
  loadFeatures(): Promise<Feature[]>;
  loadRules(): Promise<Rule[]>;
  loadWorkflows(): Promise<Workflow[]>;
}

export class FileSystemMetadataRepository implements MetadataRepository {
  constructor(
    private basePath: string,
    private cache?: Cache
  ) {}

  async loadFeatures(): Promise<Feature[]> {
    const cacheKey = 'features-metadata';
    
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const filePath = path.join(this.basePath, 'features-metadata.json');
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    const features = data.features || [];
    
    if (this.cache) {
      await this.cache.set(cacheKey, features);
    }
    
    return features;
  }

  async loadRules(): Promise<Rule[]> {
    // Similar implementation
  }

  async loadWorkflows(): Promise<Workflow[]> {
    // Similar implementation
  }
}
```

#### Step 1.4: Implement Relationship Index

**`scripts/lineage/discovery/RelationshipIndex.ts`**
```typescript
export class RelationshipIndex {
  private featureToRules = new Map<string, Set<string>>();
  private ruleToWorkflows = new Map<string, Set<string>>();
  private workflowToRules = new Map<string, Set<string>>();
  private ruleToFeatures = new Map<string, Set<string>>();

  buildIndex(
    features: Feature[],
    rules: Rule[],
    workflows: Workflow[]
  ): void {
    // Build indexes in O(n) time
    for (const feature of features) {
      const ruleIds = this.findRulesForFeature(feature, rules);
      this.featureToRules.set(feature.id, new Set(ruleIds.map(r => r.id)));
      
      for (const ruleId of ruleIds.map(r => r.id)) {
        if (!this.ruleToFeatures.has(ruleId)) {
          this.ruleToFeatures.set(ruleId, new Set());
        }
        this.ruleToFeatures.get(ruleId)!.add(feature.id);
      }
    }

    for (const rule of rules) {
      const workflowIds = this.findWorkflowsForRule(rule, workflows);
      this.ruleToWorkflows.set(rule.id, new Set(workflowIds.map(w => w.id)));
      
      for (const workflowId of workflowIds.map(w => w.id)) {
        if (!this.workflowToRules.has(workflowId)) {
          this.workflowToRules.set(workflowId, new Set());
        }
        this.workflowToRules.get(workflowId)!.add(rule.id);
      }
    }
  }

  getRulesForFeature(featureId: string): string[] {
    return Array.from(this.featureToRules.get(featureId) || []);
  }

  getWorkflowsForRule(ruleId: string): string[] {
    return Array.from(this.ruleToWorkflows.get(ruleId) || []);
  }

  getFeaturesForRule(ruleId: string): string[] {
    return Array.from(this.ruleToFeatures.get(ruleId) || []);
  }

  private findRulesForFeature(feature: Feature, rules: Rule[]): Rule[] {
    // Discovery logic (see Step 2.1)
  }

  private findWorkflowsForRule(rule: Rule, workflows: Workflow[]): Workflow[] {
    // Discovery logic (see Step 2.2)
  }
}
```

### Phase 2: Discovery & Generation (Week 2)

#### Step 2.1: Implement Feature → Rules Discovery

**`scripts/lineage/discovery/FeatureRuleDiscovery.ts`**
```typescript
export class FeatureRuleDiscovery {
  constructor(private index: RelationshipIndex) {}

  async discover(
    feature: Feature,
    rules: Rule[],
    rulesMetadata: RulesMetadata
  ): Promise<Result<ImplementingRule[], DiscoveryError>> {
    try {
      // Method 1: Explicit (@implemented-by)
      const explicitRules = await this.discoverExplicit(feature, rules);
      if (explicitRules.length > 0) {
        return {
          success: true,
          data: explicitRules,
          method: DiscoveryMethod.EXPLICIT,
        };
      }

      // Method 2: Check rules metadata (lastSyncedWith)
      const syncedRules = await this.discoverSynced(feature, rulesMetadata);
      if (syncedRules.length > 0) {
        return {
          success: true,
          data: syncedRules,
          method: DiscoveryMethod.EXPLICIT,
        };
      }

      // Method 3: Inferred (benefit type/category matching)
      const inferredRules = await this.discoverInferred(feature, rules);
      return {
        success: true,
        data: inferredRules,
        method: DiscoveryMethod.INFERRED,
      };
    } catch (error) {
      return {
        success: false,
        error: new DiscoveryError('Failed to discover rules', error),
      };
    }
  }

  private async discoverExplicit(
    feature: Feature,
    rules: Rule[]
  ): Promise<ImplementingRule[]> {
    if (!feature.metadata.implementedBy) return [];

    const ruleFileName = path.basename(
      feature.metadata.implementedBy,
      '.ts'
    );

    return rules
      .filter(rule => rule.fileName === ruleFileName)
      .map(rule => ({
        id: rule.id,
        file: rule.fileName + '.ts',
        description: rule.description,
        benefitType: rule.benefitType,
        url: `/rules/${rule.id}`,
      }));
  }

  private async discoverSynced(
    feature: Feature,
    rulesMetadata: RulesMetadata
  ): Promise<ImplementingRule[]> {
    // Check rules for lastSyncedWith matching feature filePath
    const featurePath = feature.filePath.replace(/\\/g, '/');
    
    // This would require reading rule files - implement with caching
    return [];
  }

  private async discoverInferred(
    feature: Feature,
    rules: Rule[]
  ): Promise<ImplementingRule[]> {
    const featureBenefit = this.extractBenefitType(feature);
    
    return rules
      .filter(rule => {
        if (rule.benefitType && featureBenefit.includes(rule.benefitType.toLowerCase())) {
          return true;
        }
        if (rule.category === feature.category) {
          return true;
        }
        return false;
      })
      .map(rule => ({
        id: rule.id,
        file: rule.fileName + '.ts',
        description: rule.description,
        benefitType: rule.benefitType,
        url: `/rules/${rule.id}`,
      }));
  }

  private extractBenefitType(feature: Feature): string[] {
    const patterns: Record<string, RegExp> = {
      ris: /ris|revenu.*int[eé]gration/i,
      agr: /agr|allocation.*garantie.*revenus?/i,
      // ... more patterns
    };

    const text = `${feature.id} ${feature.name} ${feature.description}`;
    const matches: string[] = [];

    for (const [benefit, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        matches.push(benefit);
      }
    }

    return matches;
  }
}
```

#### Step 2.2: Implement Rule → Workflow Discovery

**`scripts/lineage/discovery/RuleWorkflowDiscovery.ts`**
```typescript
export class RuleWorkflowDiscovery {
  constructor(private index: RelationshipIndex) {}

  async discover(
    ruleIds: string[],
    workflows: Workflow[]
  ): Promise<Result<UsingWorkflow[], DiscoveryError>> {
    try {
      const usingWorkflows: UsingWorkflow[] = [];

      for (const ruleId of ruleIds) {
        const matchingWorkflows = await this.findWorkflowsForRule(
          ruleId,
          workflows
        );
        usingWorkflows.push(...matchingWorkflows);
      }

      // Deduplicate
      const unique = new Map<string, UsingWorkflow>();
      for (const workflow of usingWorkflows) {
        if (!unique.has(workflow.id)) {
          unique.set(workflow.id, workflow);
        } else {
          // Merge usesRules
          const existing = unique.get(workflow.id)!;
          existing.usesRules = [
            ...new Set([...existing.usesRules, ...workflow.usesRules]),
          ];
        }
      }

      return {
        success: true,
        data: Array.from(unique.values()),
      };
    } catch (error) {
      return {
        success: false,
        error: new DiscoveryError('Failed to discover workflows', error),
      };
    }
  }

  private async findWorkflowsForRule(
    ruleId: string,
    workflows: Workflow[]
  ): Promise<UsingWorkflow[]> {
    // Use index for O(1) lookup
    const workflowIds = this.index.getWorkflowsForRule(ruleId);
    
    return workflows
      .filter(w => workflowIds.includes(w.id))
      .map(w => ({
        id: w.id,
        name: w.name,
        category: w.category,
        usesRules: [ruleId],
        url: `/workflows/${w.id}`,
      }));
  }
}
```

#### Step 2.3: Implement Legal Source Aggregation

**`scripts/lineage/discovery/LegalSourceAggregator.ts`**
```typescript
export class LegalSourceAggregator {
  constructor(
    private legalMetadata: LegalMetadataService
  ) {}

  async aggregate(
    feature: Feature,
    rules: ImplementingRule[],
    workflows: UsingWorkflow[]
  ): Promise<LegalSource[]> {
    const sources = new Map<string, LegalSource>();

    // 1. From feature metadata
    if (feature.metadata.legalBasis && feature.metadata.legalUrl) {
      const key = feature.metadata.legalUrl;
      sources.set(key, {
        authority: this.extractAuthority(feature.metadata.legalBasis),
        title: feature.metadata.legalBasis,
        officialUrl: feature.metadata.legalUrl,
        extractedFrom: 'feature',
      });
    }

    // 2. From rules (via legalMetadata.ts)
    for (const rule of rules) {
      const ruleSources = await this.legalMetadata.getSourcesForRule(rule.id);
      for (const source of ruleSources) {
        const key = source.officialUrl || source.title;
        if (!sources.has(key)) {
          sources.set(key, {
            ...source,
            extractedFrom: 'rules',
          });
        }
      }
    }

    // 3. From workflows
    for (const workflow of workflows) {
      const workflowSources = await this.legalMetadata.getSourcesForWorkflow(
        workflow.id
      );
      for (const source of workflowSources) {
        const key = source.officialUrl || source.title;
        if (!sources.has(key)) {
          sources.set(key, {
            ...source,
            extractedFrom: 'workflow',
          });
        }
      }
    }

    return Array.from(sources.values());
  }

  private extractAuthority(legalBasis: string): string {
    // Extract authority from legal basis text
    // e.g., "Loi du 26 mai 2002" → "SPF Intégration Sociale"
    return 'Source légale';
  }
}
```

#### Step 2.4: Implement Async File Generators

**`scripts/lineage/generators/FeatureGenerator.ts`**
```typescript
export class FeatureGenerator {
  constructor(
    private discovery: FeatureRuleDiscovery,
    private workflowDiscovery: RuleWorkflowDiscovery,
    private legalAggregator: LegalSourceAggregator,
    private validator: LineageValidator
  ) {}

  async generate(
    feature: Feature,
    context: GenerationContext
  ): Promise<Result<FeatureWithLineage, GenerationError>> {
    try {
      // Discover relationships
      const rulesResult = await this.discovery.discover(
        feature,
        context.rules,
        context.rulesMetadata
      );
      
      if (!rulesResult.success) {
        return { success: false, error: rulesResult.error };
      }

      const implementingRules = rulesResult.data;
      const ruleIds = implementingRules.map(r => r.id);

      const workflowsResult = await this.workflowDiscovery.discover(
        ruleIds,
        context.workflows
      );
      
      if (!workflowsResult.success) {
        return { success: false, error: workflowsResult.error };
      }

      const usingWorkflows = workflowsResult.data;

      // Aggregate legal sources
      const legalSources = await this.legalAggregator.aggregate(
        feature,
        implementingRules,
        usingWorkflows
      );

      // Build lineage
      const lineage: Lineage = {
        legalSources,
        implementingRules,
        usingWorkflows,
      };

      // Build Astro links
      const astroLinks: AstroLinks = {
        featureUrl: `/features/${feature.id}`,
        rulesUrls: implementingRules.map(r => r.url),
        workflowsUrls: usingWorkflows.map(w => w.url),
        featuresUrls: [],
        legalSourcesUrls: legalSources
          .map(s => s.officialUrl)
          .filter((url): url is string => url !== undefined),
      };

      // Determine traceability
      const traceability: Traceability = {
        sourceToFeature: legalSources.length > 0
          ? DiscoveryMethod.EXPLICIT
          : DiscoveryMethod.INFERRED,
        featureToRules: rulesResult.method || DiscoveryMethod.INFERRED,
        rulesToWorkflows: workflowsResult.method || DiscoveryMethod.COMPUTED,
        completeness: this.determineCompleteness(lineage),
        lastValidated: new Date().toISOString(),
      };

      // Validate
      const validation = await this.validator.validate({
        feature,
        lineage,
        traceability,
      });

      const featureWithLineage: FeatureWithLineage = {
        ...feature,
        lineage,
        astroLinks,
        traceability,
      };

      return { success: true, data: featureWithLineage };
    } catch (error) {
      return {
        success: false,
        error: new GenerationError('Failed to generate feature', error),
      };
    }
  }

  private determineCompleteness(lineage: Lineage): Completeness {
    if (
      lineage.legalSources.length > 0 &&
      lineage.implementingRules.length > 0
    ) {
      return Completeness.COMPLETE;
    }
    if (lineage.implementingRules.length > 0 || lineage.legalSources.length > 0) {
      return Completeness.PARTIAL;
    }
    return Completeness.MISSING;
  }

  async writeToFile(
    feature: FeatureWithLineage,
    outputDir: string
  ): Promise<Result<void, FileError>> {
    try {
      const filePath = path.join(outputDir, 'features', `${feature.id}.json`);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(feature, null, 2),
        'utf-8'
      );
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new FileError('Failed to write feature file', error),
      };
    }
  }
}
```

### Phase 3: Orchestration & Performance (Week 3)

#### Step 3.1: Main Orchestrator with Parallel Processing

**`scripts/lineage/index.ts`**
```typescript
import { Logger } from 'winston';
import { Metrics } from 'prom-client';

export class LineageGenerator {
  constructor(
    private featureRepo: MetadataRepository,
    private ruleRepo: MetadataRepository,
    private workflowRepo: MetadataRepository,
    private featureGenerator: FeatureGenerator,
    private ruleGenerator: RuleGenerator,
    private workflowGenerator: WorkflowGenerator,
    private index: RelationshipIndex,
    private logger: Logger,
    private metrics: Metrics
  ) {}

  async generateAll(options: GenerationOptions): Promise<GenerationResult> {
    const timer = this.metrics.startTimer('lineage_generation_duration');
    this.logger.info('Starting lineage generation', options);

    try {
      // Load all metadata in parallel
      const [features, rules, workflows] = await Promise.all([
        this.featureRepo.loadFeatures(),
        this.ruleRepo.loadRules(),
        this.workflowRepo.loadWorkflows(),
      ]);

      this.logger.info('Loaded metadata', {
        features: features.length,
        rules: rules.length,
        workflows: workflows.length,
      });

      // Build relationship index
      this.index.buildIndex(features, rules, workflows);

      // Generate files in parallel batches
      const batchSize = options.batchSize || 100;
      const results = await this.generateInBatches(
        features,
        rules,
        workflows,
        batchSize
      );

      // Generate lineage index
      const lineageIndex = await this.generateLineageIndex(
        results.features,
        results.rules,
        results.workflows
      );

      await this.writeLineageIndex(lineageIndex, options.outputDir);

      this.metrics.inc('lineage_generation_success');
      this.logger.info('Lineage generation completed', {
        generated: results.features.length + results.rules.length + results.workflows.length,
      });

      return {
        success: true,
        features: results.features.length,
        rules: results.rules.length,
        workflows: results.workflows.length,
      };
    } catch (error) {
      this.metrics.inc('lineage_generation_errors');
      this.logger.error('Lineage generation failed', { error });
      throw error;
    } finally {
      timer();
    }
  }

  private async generateInBatches(
    features: Feature[],
    rules: Rule[],
    workflows: Workflow[],
    batchSize: number
  ): Promise<{
    features: FeatureWithLineage[];
    rules: RuleWithLineage[];
    workflows: WorkflowWithLineage[];
  }> {
    const context: GenerationContext = {
      features,
      rules,
      workflows,
      rulesMetadata: await this.ruleRepo.loadRulesMetadata(),
      featuresMetadata: await this.featureRepo.loadFeaturesMetadata(),
      workflowsMetadata: await this.workflowRepo.loadWorkflowsMetadata(),
    };

    // Process features in parallel batches
    const featureBatches = this.chunk(features, batchSize);
    const featureResults = await Promise.all(
      featureBatches.map(batch =>
        Promise.all(
          batch.map(feature => this.featureGenerator.generate(feature, context))
        )
      )
    );

    const featuresWithLineage = featureResults
      .flat()
      .filter((r): r is Result<FeatureWithLineage, never> => r.success)
      .map(r => r.data);

    // Similar for rules and workflows...

    return {
      features: featuresWithLineage,
      rules: [],
      workflows: [],
    };
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

#### Step 3.2: Add Caching Layer

**`scripts/lineage/repositories/CachedRepository.ts`**
```typescript
export class CachedRepository implements MetadataRepository {
  constructor(
    private repo: MetadataRepository,
    private cache: Cache
  ) {}

  async loadFeatures(): Promise<Feature[]> {
    const cacheKey = 'features';
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const features = await this.repo.loadFeatures();
    await this.cache.set(cacheKey, features, 3600); // 1 hour TTL
    return features;
  }

  // Similar for rules and workflows
}
```

#### Step 3.3: Add Incremental Build Support

**`scripts/lineage/ChangeDetector.ts`**
```typescript
export class ChangeDetector {
  async detectChanges(
    previousHashes: Map<string, string>
  ): Promise<ChangeSet> {
    const currentHashes = await this.computeHashes();
    const changes: ChangeSet = {
      changedFeatures: [],
      changedRules: [],
      changedWorkflows: [],
    };

    for (const [file, hash] of currentHashes.entries()) {
      const previousHash = previousHashes.get(file);
      if (previousHash !== hash) {
        if (file.includes('features/')) {
          changes.changedFeatures.push(file);
        } else if (file.includes('rules/')) {
          changes.changedRules.push(file);
        } else if (file.includes('workflows/')) {
          changes.changedWorkflows.push(file);
        }
      }
    }

    return changes;
  }

  private async computeHashes(): Promise<Map<string, string>> {
    // Compute file hashes using crypto
    const hashes = new Map<string, string>();
    // Implementation...
    return hashes;
  }
}
```

### Phase 4: Validation & Quality (Week 4)

#### Step 4.1: Implement Validators

**`scripts/lineage/validators/LineageValidator.ts`**
```typescript
export class LineageValidator {
  async validate(
    item: { feature?: Feature; rule?: Rule; workflow?: Workflow; lineage: Lineage; traceability: Traceability }
  ): Promise<ValidationResult> {
    const issues: string[] = [];

    if (!item.lineage.implementingRules.length && item.feature) {
      issues.push('No implementing rules found for feature');
    }

    if (item.lineage.legalSources.length === 0) {
      issues.push('No legal sources found');
    }

    if (item.traceability.completeness === Completeness.MISSING) {
      issues.push('Critical lineage information missing');
    }

    return {
      isValid: issues.length === 0,
      issues,
      completeness: item.traceability.completeness,
    };
  }
}
```

**`scripts/lineage/validators/VersionSyncValidator.ts`**
```typescript
export class VersionSyncValidator {
  async validate(feature: FeatureWithLineage): Promise<SyncStatus> {
    const featureVersion = feature.metadata.specificationVersion;
    const ruleVersion = feature.lineage.implementingRules[0]?.implementsSpecification;

    if (featureVersion && ruleVersion && featureVersion !== ruleVersion) {
      return {
        isSynced: false,
        featureVersion,
        ruleVersion,
        warning: 'Version mismatch detected',
      };
    }

    return { isSynced: true };
  }
}
```

#### Step 4.2: Add Configuration System

**`scripts/lineage/config.ts`**
```typescript
export interface LineageConfig {
  discovery: {
    methods: DiscoveryMethod[];
    priority: DiscoveryMethod[];
    fallbackEnabled: boolean;
  };
  performance: {
    batchSize: number;
    parallelWorkers: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
  validation: {
    strictMode: boolean;
    requireExplicitLinks: boolean;
  };
  output: {
    baseDir: string;
    featuresDir: string;
    rulesDir: string;
    workflowsDir: string;
  };
}

export function loadConfig(): LineageConfig {
  // Load from lineage.config.json or use defaults
  return {
    discovery: {
      methods: [DiscoveryMethod.EXPLICIT, DiscoveryMethod.INFERRED],
      priority: [DiscoveryMethod.EXPLICIT],
      fallbackEnabled: true,
    },
    performance: {
      batchSize: 100,
      parallelWorkers: 4,
      cacheEnabled: true,
      cacheTTL: 3600,
    },
    validation: {
      strictMode: false,
      requireExplicitLinks: false,
    },
    output: {
      baseDir: 'docs-astro/public',
      featuresDir: 'features',
      rulesDir: 'rules',
      workflowsDir: 'machines',
    },
  };
}
```

#### Step 4.3: Add Logging & Metrics

**`scripts/lineage/observability.ts`**
```typescript
import winston from 'winston';
import { Registry, Counter, Histogram } from 'prom-client';

export function createLogger(): winston.Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });
}

export function createMetrics(): {
  generationDuration: Histogram;
  generationSuccess: Counter;
  generationErrors: Counter;
} {
  const register = new Registry();

  const generationDuration = new Histogram({
    name: 'lineage_generation_duration_seconds',
    help: 'Duration of lineage generation',
    registers: [register],
  });

  const generationSuccess = new Counter({
    name: 'lineage_generation_success_total',
    help: 'Total successful lineage generations',
    registers: [register],
  });

  const generationErrors = new Counter({
    name: 'lineage_generation_errors_total',
    help: 'Total lineage generation errors',
    registers: [register],
  });

  return {
    generationDuration,
    generationSuccess,
    generationErrors,
  };
}
```

## 📐 Data Structures

### Enhanced Feature JSON

```typescript
interface FeatureWithLineage {
  // Existing fields
  id: string;
  name: string;
  description: string;
  category: string;
  scenarios: Scenario[];
  metadata: FeatureMetadata;
  legalSources?: LegalSources;
  
  // NEW: Lineage
  lineage: {
    legalSources: LegalSource[];
    implementingRules: ImplementingRule[];
    usingWorkflows: UsingWorkflow[];
  };
  
  // NEW: Astro links
  astroLinks: {
    featureUrl: string;
    rulesUrls: string[];
    workflowsUrls: string[];
    legalSourcesUrls: string[];
  };
  
  // NEW: Traceability
  traceability: {
    sourceToFeature: DiscoveryMethod;
    featureToRules: DiscoveryMethod;
    rulesToWorkflows: DiscoveryMethod;
    completeness: Completeness;
    lastValidated: string;
  };
}
```

## 🔍 Discovery Methods

### Feature → Rules

1. **Explicit** (highest priority):
   - Parse `@implemented-by:src/rules/xxxRules.ts` from feature
   - Check `lastSyncedWith: 'features/...'` in rules metadata

2. **Inferred** (fallback):
   - Match by benefit type (e.g., "ris" in feature name → risRules.ts)
   - Match by category
   - Match by file path patterns

### Rules → Workflows

1. **Explicit**:
   - Check if workflow imports the rule file
   - Check if workflow uses rule event types

2. **Inferred**:
   - Match by benefit type
   - Match by category
   - Match rule event types with workflow events

### Legal Sources Aggregation

1. **From Feature**:
   - `@legal-basis` and `@legal-url` metadata

2. **From Rules**:
   - Legal framework constants (RIS_LEGAL_FRAMEWORK, etc.)
   - Comments with BASE JURIDIQUE

3. **From Registry**:
   - `legalMetadata.ts` via `getMachineSources()`

4. **Deduplication**:
   - By `officialUrl`
   - Keep `extractedFrom` field to track source

## ✅ Validation & Quality Checks

### Completeness Checks

```typescript
function validateLineageCompleteness(feature: FeatureWithLineage): ValidationResult {
  const issues: string[] = [];
  
  if (!feature.lineage.implementingRules.length) {
    issues.push('No implementing rules found');
  }
  
  if (feature.lineage.legalSources.length === 0) {
    issues.push('No legal sources found');
  }
  
  if (feature.traceability.completeness === Completeness.MISSING) {
    issues.push('Critical lineage information missing');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    completeness: feature.traceability.completeness,
  };
}
```

### Version Synchronization Check

```typescript
function checkVersionSync(feature: FeatureWithLineage): SyncStatus {
  const featureVersion = feature.metadata.specificationVersion;
  const ruleVersion = feature.lineage.implementingRules[0]?.implementsSpecification;
  
  if (featureVersion && ruleVersion && featureVersion !== ruleVersion) {
    return {
      isSynced: false,
      featureVersion,
      ruleVersion,
      warning: 'Version mismatch detected',
    };
  }
  
  return { isSynced: true };
}
```

## 🚀 Migration Strategy

### Step 1: Enhance Existing Script (Non-Breaking)

- Create new modular structure alongside existing script
- Generate lineage alongside existing data
- Keep backward compatibility
- Gradually migrate

### Step 2: Update Astro Components (Gradual)

- Add `LineageDisplay` component
- Update pages one by one
- Test each page before moving to next

### Step 3: Remove Redundancy

- Once lineage is working, remove duplicate logic
- Consolidate metadata generation
- Update documentation

## 📝 Developer Guidelines

### Adding a New Feature

1. **Create Feature File** (`features/benefits/new-benefit.feature`):
   ```gherkin
   # @specification-version:2025.1.0
   # @legal-basis:Loi du...
   # @legal-url:https://...
   # @implemented-by:src/rules/newBenefitRules.ts
   ```

2. **Create Rules File** (`src/rules/newBenefitRules.ts`):
   ```typescript
   export const NEW_BENEFIT_RULES_METADATA = {
     implementsSpecification: '2025.1.0',
     lastSyncedWith: 'features/benefits/new-benefit.feature',
   };
   ```

3. **Create Workflow** (if needed) (`src/workflows/newBenefitMachine.ts`):
   - Use benefit type in machine ID/name
   - Import rules if needed

4. **Run Build**:
   ```bash
   npm run docs:build
   ```

5. **Verify Lineage**:
   - Check `docs-astro/public/features/new-benefit.json`
   - Verify `lineage` section is populated
   - Check Astro links are correct

### Best Practices

1. **Always use explicit links**:
   - `@implemented-by` in features
   - `lastSyncedWith` in rules
   - This ensures 100% accuracy

2. **Keep versions in sync**:
   - Feature `@specification-version` must match rule `implementsSpecification`

3. **Document legal sources**:
   - Always include `@legal-basis` and `@legal-url` in features
   - Add legal framework constants in rules

4. **Test lineage**:
   - After adding new feature, verify lineage is complete
   - Check Astro documentation renders correctly

## 🎯 Success Criteria

- [ ] Every feature has complete lineage (legal sources → rules → workflows)
- [ ] Astro documentation shows lineage on every page
- [ ] Developer workflow is seamless (add feature → lineage auto-generated)
- [ ] No redundancy between scripts
- [ ] Lineage is validated and version-synced
- [ ] Performance: Individual files remain small (<10 KB each)
- [ ] Build time: <30 seconds for full lineage generation
- [ ] Type safety: 100% TypeScript coverage (no `any[]`)
- [ ] Test coverage: >80% for core logic
- [ ] Async I/O: All file operations are non-blocking

## 📊 Performance Benchmarks (Expected)

| Operation | Current Plan | Recommended | Improvement |
|-----------|-------------|-------------|-------------|
| Generate 100 features | ~5s | ~0.5s | **10x** |
| Generate 1000 features | ~50s | ~3s | **16x** |
| Incremental (10 changed) | ~50s | ~0.3s | **166x** |
| Memory usage (1000 items) | ~500MB | ~50MB | **10x** |

## 📊 Metrics to Track

1. **Lineage Completeness**:
   - % of features with implementing rules
   - % of rules with using workflows
   - % of items with legal sources

2. **Discovery Method Distribution**:
   - % explicit vs inferred relationships
   - Track which discovery methods work best

3. **Build Performance**:
   - Time to generate lineage
   - File sizes
   - Memory usage

4. **Quality Metrics**:
   - Test coverage
   - Type safety score
   - Error rate

## 🔄 Future Enhancements

1. **Lineage Visualization**:
   - Generate Mermaid diagrams showing relationships
   - Interactive lineage graphs in Astro docs

2. **Automated Validation**:
   - CI/CD checks for lineage completeness
   - Version sync validation
   - Broken link detection

3. **Lineage History**:
   - Track changes to lineage over time
   - Version lineage relationships

4. **Smart Discovery**:
   - ML-based relationship inference
   - Pattern recognition for common structures

5. **Worker Threads**:
   - Parallel processing for very large datasets
   - Utilize multiple CPU cores

---

## 📅 Implementation Timeline

### Week 1: Foundation & Architecture
- [ ] Create modular structure
- [ ] Define TypeScript interfaces
- [ ] Implement Repository pattern
- [ ] Add dependency injection
- [ ] Create RelationshipIndex

### Week 2: Discovery & Generation
- [ ] Implement discovery strategies
- [ ] Add indexing for performance
- [ ] Create generators with async I/O
- [ ] Implement legal source aggregation

### Week 3: Orchestration & Performance
- [ ] Main orchestrator with parallel processing
- [ ] Add caching layer
- [ ] Incremental build support
- [ ] Performance optimization

### Week 4: Validation & Quality
- [ ] Add comprehensive tests
- [ ] Implement error handling (Result pattern)
- [ ] Add logging & metrics
- [ ] Configuration system
- [ ] Documentation

---

**Status**: 📋 Planning Complete - Ready for Implementation with Production-Ready Architecture
