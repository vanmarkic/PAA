#!/usr/bin/env ts-node

/**
 * Generate features metadata from Gherkin feature files
 * Creates a JSON file with all feature information for the documentation site
 */

import * as path from 'path';
import * as fs from 'fs';
import * as gherkin from '@cucumber/gherkin';
import * as messages from '@cucumber/messages';

// Define types inline to avoid module issues
interface Step {
  keyword: string;
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

interface ExampleTable {
  name?: string;
  tags: string[];
  headers: string[];
  rows: Array<{ name?: string; values: Record<string, string> }>;
}

interface Scenario {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  steps: Step[];
  examples?: ExampleTable[];
  isOutline: boolean;
}

interface Background {
  name?: string;
  description?: string;
  steps: Step[];
}

interface FeatureMetadata {
  specificationVersion?: string;
  effectiveDate?: string;
  legalBasis?: string;
  legalUrl?: string;
  implementedBy?: string;
  language?: 'fr' | 'nl' | 'de';
  version?: string;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  metadata: FeatureMetadata;
  background?: Background;
  scenarios: Scenario[];
  filePath: string;
  language: string;
}

interface FeaturesStatistics {
  totalScenarios: number;
  totalSteps: number;
  averageScenariosPerFeature: string;
  averageStepsPerScenario: string;
  totalExamples: number;
  tagsDistribution: Record<string, number>;
}

interface FeaturesMetadata {
  generated: string;
  totalFeatures: number;
  categories: string[];
  features: Feature[];
  statistics: FeaturesStatistics;
  languages: string[];
}

/**
 * Extract metadata from feature file comments
 */
function extractMetadata(content: string): FeatureMetadata {
  const metadata: FeatureMetadata = {};

  // Extract specification version
  const specVersionMatch = content.match(/@specification-version:(.+)/);
  if (specVersionMatch) {
    metadata.specificationVersion = specVersionMatch[1].trim();
  }

  // Extract effective date
  const effectiveDateMatch = content.match(/@effective-date:(.+)/);
  if (effectiveDateMatch) {
    metadata.effectiveDate = effectiveDateMatch[1].trim();
  }

  // Extract legal basis
  const legalBasisMatch = content.match(/@legal-basis:(.+)/);
  if (legalBasisMatch) {
    metadata.legalBasis = legalBasisMatch[1].trim();
  }

  // Extract legal URL
  const legalUrlMatch = content.match(/@legal-url:(.+)/);
  if (legalUrlMatch) {
    metadata.legalUrl = legalUrlMatch[1].trim();
  }

  // Extract implementation file
  const implementedByMatch = content.match(/@implemented-by:(.+)/);
  if (implementedByMatch) {
    metadata.implementedBy = implementedByMatch[1].trim();
  }

  // Extract language directive
  const languageMatch = content.match(/# language: (\w+)/);
  if (languageMatch) {
    const lang = languageMatch[1].toLowerCase();
    if (lang === 'fr' || lang === 'nl' || lang === 'de') {
      metadata.language = lang;
    }
  }

  // Extract version from feature description
  const versionMatch = content.match(/Version:\s*(.+)/);
  if (versionMatch) {
    metadata.version = versionMatch[1].trim();
  }

  return metadata;
}

/**
 * Extract category from file path
 */
function extractCategory(filePath: string): string {
  const parts = filePath.split(path.sep);
  const featuresIndex = parts.indexOf('features');

  if (featuresIndex !== -1 && featuresIndex < parts.length - 2) {
    return parts[featuresIndex + 1];
  }

  return 'uncategorized';
}

/**
 * Generate a unique ID for the feature
 */
function generateFeatureId(filePath: string): string {
  const parts = filePath.split(path.sep);
  const fileName = parts[parts.length - 1];
  const category = extractCategory(filePath);

  return `${category}-${fileName.replace('.feature', '')}`;
}

/**
 * Extract tags from Gherkin tags
 */
function extractTags(tags?: readonly messages.Tag[]): string[] {
  if (!tags) return [];
  return tags.map(tag => tag.name.replace('@', ''));
}

/**
 * Convert Gherkin steps to our Step type
 */
function convertSteps(steps: readonly messages.Step[]): Step[] {
  return steps.map(step => {
    const result: Step = {
      keyword: step.keyword.trim(),
      text: step.text
    };

    if (step.docString) {
      result.docString = {
        content: step.docString.content,
        contentType: step.docString.mediaType
      };
    }

    if (step.dataTable) {
      const headers = step.dataTable.rows[0]?.cells.map(cell => cell.value) || [];
      const rows = step.dataTable.rows.slice(1).map(row => {
        const rowData: Record<string, string> = {};
        row.cells.forEach((cell, index) => {
          rowData[headers[index]] = cell.value;
        });
        return rowData;
      });

      result.dataTable = {
        headers,
        rows
      };
    }

    return result;
  });
}

/**
 * Convert Gherkin background to our Background type
 */
function convertBackground(children: readonly messages.FeatureChild[]): Background | undefined {
  const backgroundChild = children.find(child => child.background);

  if (!backgroundChild?.background) return undefined;

  const background = backgroundChild.background;

  return {
    name: background.name,
    description: background.description,
    steps: convertSteps(background.steps)
  };
}

/**
 * Convert Gherkin examples to our ExampleTable type
 */
function convertExamples(examples: readonly messages.Examples[]): ExampleTable[] {
  return examples.map(example => {
    const headers = example.tableHeader?.cells.map(cell => cell.value) || [];

    const rows = (example.tableBody || []).map(row => {
      const values: Record<string, string> = {};
      row.cells.forEach((cell, index) => {
        values[headers[index]] = cell.value;
      });

      return {
        name: row.id,
        values
      };
    });

    return {
      name: example.name,
      tags: extractTags(example.tags),
      headers,
      rows
    };
  });
}

/**
 * Convert Gherkin scenarios to our Scenario type
 */
function convertScenarios(children: readonly messages.FeatureChild[]): Scenario[] {
  const scenarios: Scenario[] = [];

  for (const child of children) {
    if (child.scenario) {
      const scenario = child.scenario;
      const isOutline = scenario.examples && scenario.examples.length > 0;

      scenarios.push({
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        tags: extractTags(scenario.tags),
        steps: convertSteps(scenario.steps),
        examples: isOutline ? convertExamples(scenario.examples) : undefined,
        isOutline
      });
    }
  }

  return scenarios;
}

/**
 * Parse Gherkin feature file
 */
function parseFeatureFile(filePath: string): Feature | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract metadata from comments at the top of the file
    const metadata = extractMetadata(content);

    // Parse Gherkin using the official parser
    const uuidFn = messages.IdGenerator.uuid();
    const builder = new gherkin.AstBuilder(uuidFn);
    const matcher = new gherkin.GherkinClassicTokenMatcher();
    const parser = new gherkin.Parser(builder, matcher);

    const gherkinDocument = parser.parse(content);

    if (!gherkinDocument.feature) {
      console.warn(`No feature found in ${filePath}`);
      return null;
    }

    const feature = gherkinDocument.feature;
    const category = extractCategory(filePath);
    const featureId = generateFeatureId(filePath);

    // Extract language from the document
    const language = feature.language || 'fr';

    // Convert Gherkin AST to our Feature type
    return {
      id: featureId,
      name: feature.name,
      description: feature.description || '',
      category,
      tags: extractTags(feature.tags),
      metadata: {
        ...metadata,
        language: metadata.language || (language as 'fr' | 'nl' | 'de')
      },
      background: convertBackground(feature.children),
      scenarios: convertScenarios(feature.children),
      filePath,
      language
    };
  } catch (error) {
    console.error(`Error parsing feature file ${filePath}:`, error);
    return null;
  }
}

/**
 * Find all feature files recursively in a directory
 */
function findFeatureFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '__tests__') {
      findFeatureFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.feature')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Calculate statistics from features
 */
function calculateStatistics(features: Feature[]): FeaturesStatistics {
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

  // Calculate tags distribution
  const tagsDistribution: Record<string, number> = {};
  features.forEach(feature => {
    // Count feature tags
    feature.tags.forEach(tag => {
      tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
    });
    // Count scenario tags
    feature.scenarios.forEach(scenario => {
      scenario.tags.forEach(tag => {
        tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
      });
    });
  });

  return {
    totalScenarios,
    totalSteps,
    averageScenariosPerFeature: features.length > 0
      ? (totalScenarios / features.length).toFixed(1)
      : '0',
    averageStepsPerScenario: totalScenarios > 0
      ? (totalSteps / totalScenarios).toFixed(1)
      : '0',
    totalExamples,
    tagsDistribution
  };
}

/**
 * Extract unique categories from features
 */
function extractCategories(features: Feature[]): string[] {
  const categories = new Set<string>();
  features.forEach(f => categories.add(f.category));
  return Array.from(categories).sort();
}

/**
 * Extract unique languages from features
 */
function extractLanguages(features: Feature[]): string[] {
  const languages = new Set<string>();
  features.forEach(f => languages.add(f.language));
  return Array.from(languages).sort();
}

/**
 * Pretty print category names
 */
function prettifyCategory(category: string): string {
  const categoryNames: Record<string, string> = {
    'benefits': 'Prestations Sociales',
    'conversion': 'Conversion de Textes',
    'tax': 'Fiscalité',
    'droits-civils': 'Droits Civils',
    'etrangers': 'Droit des Étrangers',
    'recours-etat': 'Recours État',
    'employment': 'Emploi',
    'health': 'Santé',
    'education': 'Éducation',
    'housing': 'Logement'
  };

  return categoryNames[category] || category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Génération des métadonnées des features Gherkin...\n');

  // Define paths
  const featuresDir = path.join(__dirname, '..', 'features');
  const outputPath = path.join(__dirname, '..', 'docs-astro', 'public', 'features-metadata.json');

  // Find all feature files
  console.log(`📂 Recherche de fichiers .feature dans ${featuresDir}...`);
  const featureFiles = findFeatureFiles(featuresDir);
  console.log(`📊 Trouvé ${featureFiles.length} fichiers feature\n`);

  // Parse all features
  console.log('🔍 Parsing des features...');
  const features: Feature[] = [];

  for (const filePath of featureFiles) {
    const feature = parseFeatureFile(filePath);
    if (feature) {
      features.push(feature);
      console.log(`  ✓ Parsed: ${feature.name} (${feature.scenarios.length} scenarios)`);
    }
  }

  console.log(`✅ Parsé ${features.length} features avec succès\n`);

  // Sort features by category then by name
  features.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Extract categories and languages
  const categories = extractCategories(features);
  const languages = extractLanguages(features);

  // Calculate statistics
  const statistics = calculateStatistics(features);

  // Print summary by category
  console.log('📁 Résumé par catégorie:');
  categories.forEach(category => {
    const categoryFeatures = features.filter(f => f.category === category);
    const categoryScenarios = categoryFeatures.reduce((sum, f) => sum + f.scenarios.length, 0);
    console.log(`  • ${prettifyCategory(category)}: ${categoryFeatures.length} features, ${categoryScenarios} scénarios`);
  });

  console.log('\n📊 Statistiques globales:');
  console.log(`  • Total features: ${features.length}`);
  console.log(`  • Total scénarios: ${statistics.totalScenarios}`);
  console.log(`  • Total étapes: ${statistics.totalSteps}`);
  console.log(`  • Total exemples: ${statistics.totalExamples}`);
  console.log(`  • Moyenne scénarios/feature: ${statistics.averageScenariosPerFeature}`);
  console.log(`  • Moyenne étapes/scénario: ${statistics.averageStepsPerScenario}`);

  // Count features with legal metadata
  const featuresWithLegal = features.filter(f => f.metadata.legalBasis && f.metadata.legalUrl);
  console.log(`  • Features avec référence légale: ${featuresWithLegal.length}/${features.length}`);

  // Show top tags
  const topTags = Object.entries(statistics.tagsDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (topTags.length > 0) {
    console.log('\n🏷️  Top 10 tags:');
    topTags.forEach(([tag, count]) => {
      console.log(`  • ${tag}: ${count} utilisations`);
    });
  }

  // Create metadata object
  const metadata: FeaturesMetadata = {
    generated: new Date().toISOString(),
    totalFeatures: features.length,
    categories,
    features,
    statistics,
    languages
  };

  // Write to file
  console.log(`\n📝 Écriture du fichier de métadonnées...`);
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');

  const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
  console.log(`✨ Fichier généré: ${outputPath}`);
  console.log(`📦 Taille: ${fileSize} KB`);

  console.log('\n✅ Génération terminée avec succès!');
}

// Execute with error handling
main().catch(error => {
  console.error('❌ Erreur lors de la génération:', error);
  process.exit(1);
});