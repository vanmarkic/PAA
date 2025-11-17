/**
 * Data loader for features metadata
 * Loads the generated features-metadata.json
 */

import type {
  Feature,
  FeaturesMetadata,
  FeatureSearchOptions,
  Scenario
} from './feature-types';

// Dynamic import to avoid build errors if file doesn't exist yet
let metadata: FeaturesMetadata | null = null;

/**
 * Load features metadata from JSON
 */
export async function loadFeaturesMetadata(): Promise<FeaturesMetadata> {
  if (!metadata) {
    try {
      // Dynamically import the metadata file
      const imported = await import('../../public/features-metadata.json');
      metadata = imported.default as FeaturesMetadata;
    } catch (error) {
      console.warn('Features metadata not found. Run npm run generate:features-metadata first.');
      // Return empty metadata structure
      return {
        generated: new Date().toISOString(),
        totalFeatures: 0,
        categories: [],
        features: [],
        statistics: {
          totalScenarios: 0,
          totalSteps: 0,
          averageScenariosPerFeature: '0',
          averageStepsPerScenario: '0',
          totalExamples: 0,
          tagsDistribution: {}
        },
        languages: []
      };
    }
  }
  return metadata;
}

/**
 * Get a single feature by ID
 */
export function getFeatureById(
  metadata: FeaturesMetadata,
  id: string
): Feature | undefined {
  return metadata.features.find(f => f.id === id);
}

/**
 * Get all features in a category
 */
export function getFeaturesByCategory(
  metadata: FeaturesMetadata,
  category: string
): Feature[] {
  return metadata.features.filter(f => f.category === category);
}

/**
 * Search features with various filters
 */
export function searchFeatures(
  metadata: FeaturesMetadata,
  options: FeatureSearchOptions
): Feature[] {
  let features = [...metadata.features];

  // Filter by category
  if (options.category) {
    features = features.filter(f => f.category === options.category);
  }

  // Filter by tags (feature should have all specified tags)
  if (options.tags && options.tags.length > 0) {
    features = features.filter(f =>
      options.tags!.every(tag => f.tags.includes(tag))
    );
  }

  // Filter by language
  if (options.language) {
    features = features.filter(f => f.language === options.language);
  }

  // Filter by search text (search in name, description, and scenario names)
  if (options.searchText) {
    const searchLower = options.searchText.toLowerCase();
    features = features.filter(f => {
      // Search in feature name and description
      if (f.name.toLowerCase().includes(searchLower)) return true;
      if (f.description.toLowerCase().includes(searchLower)) return true;

      // Search in scenario names
      const hasMatchingScenario = f.scenarios.some(s =>
        s.name.toLowerCase().includes(searchLower)
      );
      if (hasMatchingScenario) return true;

      // Search in tags
      const hasMatchingTag = f.tags.some(tag =>
        tag.toLowerCase().includes(searchLower)
      );
      if (hasMatchingTag) return true;

      return false;
    });
  }

  return features;
}

/**
 * Get category statistics
 */
export function getCategoryStats(
  metadata: FeaturesMetadata,
  category: string
): {
  count: number;
  totalScenarios: number;
  totalSteps: number;
  totalExamples: number;
  tags: string[];
} {
  const features = getFeaturesByCategory(metadata, category);

  const totalScenarios = features.reduce((sum, f) => sum + f.scenarios.length, 0);
  const totalSteps = features.reduce((sum, f) =>
    sum + f.scenarios.reduce((s, sc) => s + sc.steps.length, 0), 0
  );
  const totalExamples = features.reduce((sum, f) =>
    sum + f.scenarios.reduce((s, sc) => {
      if (!sc.examples) return s;
      return s + sc.examples.reduce((ex, table) => ex + table.rows.length, 0);
    }, 0), 0
  );

  // Collect all unique tags in this category
  const tagSet = new Set<string>();
  features.forEach(f => {
    f.tags.forEach(tag => tagSet.add(tag));
    f.scenarios.forEach(s => {
      s.tags.forEach(tag => tagSet.add(tag));
    });
  });

  return {
    count: features.length,
    totalScenarios,
    totalSteps,
    totalExamples,
    tags: Array.from(tagSet).sort()
  };
}

/**
 * Get all unique tags from all features
 */
export function getAllTags(metadata: FeaturesMetadata): string[] {
  const tags = new Set<string>();

  metadata.features.forEach(feature => {
    feature.tags.forEach(tag => tags.add(tag));
    feature.scenarios.forEach(scenario => {
      scenario.tags.forEach(tag => tags.add(tag));
    });
  });

  return Array.from(tags).sort();
}

/**
 * Get features with specific legal metadata
 */
export function getFeaturesWithLegalBasis(metadata: FeaturesMetadata): Feature[] {
  return metadata.features.filter(f => f.metadata.legalBasis && f.metadata.legalUrl);
}

/**
 * Get features by implementation file
 */
export function getFeaturesByImplementation(
  metadata: FeaturesMetadata,
  implementationFile: string
): Feature[] {
  return metadata.features.filter(f =>
    f.metadata.implementedBy === implementationFile
  );
}

/**
 * Group features by category
 */
export function groupFeaturesByCategory(
  metadata: FeaturesMetadata
): Record<string, Feature[]> {
  const grouped: Record<string, Feature[]> = {};

  metadata.features.forEach(feature => {
    if (!grouped[feature.category]) {
      grouped[feature.category] = [];
    }
    grouped[feature.category].push(feature);
  });

  // Sort features within each category alphabetically
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

/**
 * Get recently updated features (based on effective date)
 */
export function getRecentFeatures(
  metadata: FeaturesMetadata,
  limit: number = 10
): Feature[] {
  const featuresWithDates = metadata.features.filter(f => f.metadata.effectiveDate);

  // Sort by effective date (newest first)
  featuresWithDates.sort((a, b) => {
    const dateA = new Date(a.metadata.effectiveDate!);
    const dateB = new Date(b.metadata.effectiveDate!);
    return dateB.getTime() - dateA.getTime();
  });

  return featuresWithDates.slice(0, limit);
}

/**
 * Calculate feature complexity score
 */
export function getFeatureComplexity(feature: Feature): {
  score: number;
  level: 'simple' | 'moderate' | 'complex';
  factors: {
    scenarios: number;
    totalSteps: number;
    hasExamples: boolean;
    hasBackground: boolean;
    avgStepsPerScenario: number;
  };
} {
  const totalSteps = feature.scenarios.reduce((sum, s) => sum + s.steps.length, 0);
  const hasExamples = feature.scenarios.some(s => s.examples && s.examples.length > 0);
  const avgStepsPerScenario = totalSteps / feature.scenarios.length;

  const factors = {
    scenarios: feature.scenarios.length,
    totalSteps,
    hasExamples,
    hasBackground: !!feature.background,
    avgStepsPerScenario
  };

  // Calculate complexity score
  let score = 0;
  score += factors.scenarios * 10; // Each scenario adds 10 points
  score += factors.totalSteps * 2; // Each step adds 2 points
  if (factors.hasExamples) score += 20; // Examples add complexity
  if (factors.hasBackground) score += 10; // Background adds complexity

  // Determine complexity level
  let level: 'simple' | 'moderate' | 'complex';
  if (score < 50) {
    level = 'simple';
  } else if (score < 150) {
    level = 'moderate';
  } else {
    level = 'complex';
  }

  return {
    score,
    level,
    factors
  };
}