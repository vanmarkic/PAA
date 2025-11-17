#!/usr/bin/env node

/**
 * Standalone script to generate features metadata from Gherkin files
 * This parses all .feature files and creates a metadata JSON for the documentation site
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a simple Gherkin feature file (without full Gherkin parser)
 */
function parseFeatureFile(filePath, content) {
  const lines = content.split('\n');
  const category = extractCategory(filePath);

  const feature = {
    id: '',
    name: '',
    description: '',
    category,
    tags: [],
    metadata: {},
    background: undefined,
    scenarios: [],
    filePath: path.relative(path.join(__dirname, '..'), filePath),
    language: 'fr'
  };

  let currentScenario = null;
  let inExamples = false;
  let featureDescription = [];
  let backgroundSteps = [];
  let inBackground = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Parse metadata comments
    if (line.startsWith('# @specification-version:')) {
      feature.metadata.specificationVersion = line.substring('# @specification-version:'.length).trim();
    } else if (line.startsWith('# @effective-date:')) {
      feature.metadata.effectiveDate = line.substring('# @effective-date:'.length).trim();
    } else if (line.startsWith('# @legal-basis:')) {
      feature.metadata.legalBasis = line.substring('# @legal-basis:'.length).trim();
    } else if (line.startsWith('# @legal-url:')) {
      feature.metadata.legalUrl = line.substring('# @legal-url:'.length).trim();
    } else if (line.startsWith('# @implemented-by:')) {
      feature.metadata.implementedBy = line.substring('# @implemented-by:'.length).trim();
    }

    // Parse language
    if (line.startsWith('# language:')) {
      feature.language = line.substring('# language:'.length).trim();
    }

    // Parse tags
    if (line.startsWith('@')) {
      feature.tags.push(...line.split(/\s+/).filter(tag => tag.startsWith('@')).map(t => t.substring(1)));
    }

    // Parse Feature
    if (line.startsWith('Fonctionnalité:') || line.startsWith('Feature:')) {
      feature.name = line.substring(line.indexOf(':') + 1).trim();
      // Generate ID from name
      feature.id = category + '-' + feature.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      continue;
    }

    // Parse Background/Context
    if (line.startsWith('Contexte:') || line.startsWith('Background:')) {
      inBackground = true;
      continue;
    }

    // Collect background steps
    if (inBackground &&
        (line.startsWith('Étant donné') || line.startsWith('Given') ||
         line.startsWith('Et') || line.startsWith('And'))) {
      backgroundSteps.push(line);
    }

    // Parse Scenario
    if (line.startsWith('Scénario:') || line.startsWith('Scenario:') ||
        line.startsWith('Plan du Scénario:') || line.startsWith('Scenario Outline:')) {
      inBackground = false;
      inExamples = false;

      // Save previous scenario if exists
      if (currentScenario) {
        feature.scenarios.push(currentScenario);
      }

      const isOutline = line.includes('Plan du Scénario') || line.includes('Scenario Outline');
      currentScenario = {
        id: `scenario-${feature.scenarios.length + 1}`,
        name: line.substring(line.indexOf(':') + 1).trim(),
        tags: [],
        steps: [],
        examples: isOutline ? [] : undefined,
        isOutline
      };
      continue;
    }

    // Parse Examples
    if ((line.startsWith('Exemples:') || line.startsWith('Examples:')) && currentScenario) {
      inExamples = true;
      if (!currentScenario.examples) currentScenario.examples = [];
      currentScenario.examples.push({
        name: '',
        tags: [],
        headers: [],
        rows: []
      });
      continue;
    }

    // Parse example table
    if (inExamples && line.startsWith('|') && currentScenario && currentScenario.examples) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      const lastExample = currentScenario.examples[currentScenario.examples.length - 1];

      if (lastExample.headers.length === 0) {
        lastExample.headers = cells;
      } else {
        const row = {};
        cells.forEach((cell, index) => {
          row[lastExample.headers[index]] = cell;
        });
        lastExample.rows.push({ values: row });
      }
      continue;
    }

    // Parse scenario steps
    if (currentScenario && !inExamples) {
      const stepKeywords = [
        'Étant donné', 'Given',
        'Quand', 'When',
        'Alors', 'Then',
        'Et', 'And',
        'Mais', 'But'
      ];

      for (const keyword of stepKeywords) {
        if (line.startsWith(keyword)) {
          let keywordEn = keyword;
          // Map French keywords to English
          if (keyword === 'Étant donné') keywordEn = 'Given';
          else if (keyword === 'Quand') keywordEn = 'When';
          else if (keyword === 'Alors') keywordEn = 'Then';
          else if (keyword === 'Et') keywordEn = 'And';
          else if (keyword === 'Mais') keywordEn = 'But';

          currentScenario.steps.push({
            keyword: keywordEn,
            text: line.substring(keyword.length).trim()
          });
          break;
        }
      }
    }

    // Collect feature description (lines between feature name and first scenario/background)
    if (feature.name && !currentScenario && !inBackground &&
        !line.startsWith('Version:') && !line.startsWith('#') && !line.startsWith('@')) {
      featureDescription.push(line);
    }
  }

  // Add last scenario if exists
  if (currentScenario) {
    feature.scenarios.push(currentScenario);
  }

  // Set feature description and background
  if (featureDescription.length > 0) {
    feature.description = featureDescription.join(' ').trim();
  }

  if (backgroundSteps.length > 0) {
    feature.background = { steps: backgroundSteps.map(step => ({ text: step })) };
  }

  return feature;
}

/**
 * Extract category from file path
 */
function extractCategory(filePath) {
  const parts = filePath.split(path.sep);
  const featuresIndex = parts.indexOf('features');

  if (featuresIndex !== -1 && featuresIndex < parts.length - 2) {
    return parts[featuresIndex + 1];
  }

  return 'uncategorized';
}

/**
 * Find all feature files recursively
 */
function findFeatureFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      findFeatureFiles(fullPath, files);
    } else if (entry.name.endsWith('.feature')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Generating features metadata...');

  const featuresDir = path.join(__dirname, '..', 'features');
  const outputFile = path.join(__dirname, '..', 'docs-astro', 'public', 'features-metadata.json');

  // Find all feature files
  console.log('📂 Searching for feature files...');
  const featureFiles = findFeatureFiles(featuresDir);
  console.log(`Found ${featureFiles.length} feature files`);

  // Parse all features
  console.log('⚙️  Parsing feature files...');
  const features = [];

  for (const filePath of featureFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const feature = parseFeatureFile(filePath, content);
      features.push(feature);
      console.log(`  ✓ ${feature.name || 'Unnamed feature'}`);
    } catch (error) {
      console.error(`  ✗ Error parsing ${filePath}: ${error.message}`);
    }
  }

  // Sort features by category and name
  features.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Calculate statistics
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

  // Collect all tags and count them
  const tagsDistribution = {};
  features.forEach(feature => {
    feature.tags.forEach(tag => {
      tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
    });
    feature.scenarios.forEach(scenario => {
      (scenario.tags || []).forEach(tag => {
        tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
      });
    });
  });

  // Get unique categories
  const categories = [...new Set(features.map(f => f.category))].sort();

  // Get unique languages
  const languages = [...new Set(features.map(f => f.language))].sort();

  // Create metadata object
  const metadata = {
    generated: new Date().toISOString(),
    totalFeatures: features.length,
    categories,
    features,
    statistics: {
      totalScenarios,
      totalSteps,
      averageScenariosPerFeature: features.length > 0 ? (totalScenarios / features.length).toFixed(2) : '0',
      averageStepsPerScenario: totalScenarios > 0 ? (totalSteps / totalScenarios).toFixed(2) : '0',
      totalExamples,
      tagsDistribution
    },
    languages
  };

  // Ensure public directory exists
  const publicDir = path.dirname(outputFile);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write to file
  console.log('💾 Writing metadata to file...');
  fs.writeFileSync(outputFile, JSON.stringify(metadata, null, 2));

  // Print summary
  console.log('\n✅ Features metadata generated successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Features: ${metadata.totalFeatures}`);
  console.log(`   - Categories: ${metadata.categories.length}`);
  console.log(`   - Scenarios: ${metadata.statistics.totalScenarios}`);
  console.log(`   - Steps: ${metadata.statistics.totalSteps}`);
  console.log(`   - Examples: ${metadata.statistics.totalExamples}`);
  console.log(`   - Languages: ${metadata.languages.join(', ')}`);
  console.log(`   - Output: ${outputFile}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Error generating features metadata:', error);
  process.exit(1);
});