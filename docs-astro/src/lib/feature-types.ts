/**
 * TypeScript types for Gherkin feature data structures
 */

/**
 * Represents a single example row in a scenario outline
 */
export interface Example {
  name?: string;
  values: Record<string, string>;
}

/**
 * Represents a table of examples for a scenario outline
 */
export interface ExampleTable {
  name?: string;
  tags: string[];
  headers: string[];
  rows: Example[];
}

/**
 * Represents a step in a scenario
 */
export interface Step {
  keyword: string; // Given, When, Then, And, But
  text: string;
  docString?: {
    content: string;
    contentType?: string;
  };
  dataTable?: {
    headers: string[];
    rows: Array<Record<string, string>>;
  };
}

/**
 * Represents a scenario or scenario outline
 */
export interface Scenario {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  steps: Step[];
  examples?: ExampleTable[];
  isOutline: boolean;
}

/**
 * Represents background steps that apply to all scenarios
 */
export interface Background {
  name?: string;
  description?: string;
  steps: Step[];
}

/**
 * Represents metadata extracted from feature file comments
 */
export interface FeatureMetadata {
  specificationVersion?: string;
  effectiveDate?: string;
  legalBasis?: string;
  legalUrl?: string;
  implementedBy?: string;
  language?: 'fr' | 'nl' | 'de';
  version?: string;
}

/**
 * Represents a complete feature
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string; // Extracted from file path
  tags: string[];
  metadata: FeatureMetadata;
  background?: Background;
  scenarios: Scenario[];
  filePath: string;
  language: string;
}

/**
 * Statistics about features
 */
export interface FeaturesStatistics {
  totalScenarios: number;
  totalSteps: number;
  averageScenariosPerFeature: string;
  averageStepsPerScenario: string;
  totalExamples: number;
  tagsDistribution: Record<string, number>;
}

/**
 * Complete metadata structure for all features
 */
export interface FeaturesMetadata {
  generated: string;
  totalFeatures: number;
  categories: string[];
  features: Feature[];
  statistics: FeaturesStatistics;
  languages: string[];
}

/**
 * Search options for filtering features
 */
export interface FeatureSearchOptions {
  category?: string;
  tags?: string[];
  language?: string;
  searchText?: string;
}