/**
 * Gherkin feature file parser
 * Parses .feature files and extracts structured data
 */

import * as fs from 'fs';
import * as path from 'path';
import * as gherkin from '@cucumber/gherkin';
import * as messages from '@cucumber/messages';
import type {
  Feature,
  Scenario,
  Step,
  Background,
  ExampleTable,
  Example,
  FeatureMetadata
} from './feature-types';

/**
 * Parse Gherkin feature file using @cucumber/gherkin
 */
export function parseFeatureFile(filePath: string): Feature | null {
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
 * Convert Gherkin examples to our ExampleTable type
 */
function convertExamples(examples: readonly messages.Examples[]): ExampleTable[] {
  return examples.map(example => {
    const headers = example.tableHeader?.cells.map(cell => cell.value) || [];

    const rows: Example[] = (example.tableBody || []).map(row => {
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
 * Parse multiple feature files
 */
export function parseMultipleFeatures(filePaths: string[]): Feature[] {
  const features: Feature[] = [];

  for (const filePath of filePaths) {
    const feature = parseFeatureFile(filePath);
    if (feature) {
      features.push(feature);
      console.log(`  ✓ Parsed: ${feature.name} (${feature.scenarios.length} scenarios)`);
    }
  }

  return features;
}

/**
 * Find all feature files recursively in a directory
 */
export function findFeatureFiles(dir: string, files: string[] = []): string[] {
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