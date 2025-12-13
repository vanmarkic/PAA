#!/usr/bin/env ts-node
/**
 * Generate Rules from Existing Features
 *
 * This script finds all .feature files without corresponding rules
 * and generates them using Claude AI.
 *
 * Usage:
 *   npm run generate:rules                    # Show status
 *   npm run generate:rules -- --all           # Generate all missing rules
 *   npm run generate:rules -- --feature=ris   # Generate for specific feature
 *   npm run generate:rules -- --dry-run       # Show what would be generated
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} else if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

import { generateRulesFromFeature } from '../src/ai/claudeIntegration';

interface FeatureInfo {
  id: string;
  name: string;
  featurePath: string;
  rulesPath: string;
  hasRules: boolean;
}

interface ParsedFeature {
  id: string;
  name: string;
  content: string;
  metadata: {
    specificationVersion: string;
    legalBasis?: string;
    legalUrl?: string;
    authority?: string;
    effectiveDate?: string;
  };
}

/**
 * Parse a feature file to extract metadata
 */
function parseFeatureFile(filePath: string): ParsedFeature | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.feature');

    // Extract feature name from content
    const featureMatch = content.match(/Feature:\s*(.+)/);
    const name = featureMatch ? featureMatch[1].trim() : fileName;

    // Extract version from @version tag or default to 0.0.0
    const versionMatch = content.match(/@version[:\s]+(\d+\.\d+\.\d+)/);
    const version = versionMatch ? versionMatch[1] : '0.0.0';

    // Extract legal basis if present
    const legalBasisMatch = content.match(/@legal[_-]?basis[:\s]+(.+)/i);
    const legalUrlMatch = content.match(/@legal[_-]?url[:\s]+(.+)/i);

    return {
      id: fileName,
      name,
      content,
      metadata: {
        specificationVersion: version,
        legalBasis: legalBasisMatch ? legalBasisMatch[1].trim() : undefined,
        legalUrl: legalUrlMatch ? legalUrlMatch[1].trim() : undefined,
      },
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Find all features and check if they have corresponding rules
 */
function findFeatures(): FeatureInfo[] {
  const featuresDir = path.join(process.cwd(), 'features/benefits');
  const rulesDir = path.join(process.cwd(), 'src/rules');

  if (!fs.existsSync(featuresDir)) {
    console.error(`Features directory not found: ${featuresDir}`);
    return [];
  }

  const featureFiles = fs.readdirSync(featuresDir).filter(f => f.endsWith('.feature'));

  return featureFiles.map(file => {
    const featurePath = path.join(featuresDir, file);
    const featureId = path.basename(file, '.feature');

    // Check for rules file (kebab-case)
    const rulesFileNameKebab = `${featureId}Rules.ts`;
    const rulesPathKebab = path.join(rulesDir, rulesFileNameKebab);

    const hasRules = fs.existsSync(rulesPathKebab);

    const parsed = parseFeatureFile(featurePath);

    return {
      id: featureId,
      name: parsed?.name || featureId,
      featurePath,
      rulesPath: rulesPathKebab,
      hasRules,
    };
  });
}

/**
 * Generate rules for a single feature
 */
async function generateRulesForFeature(feature: FeatureInfo): Promise<boolean> {
  const parsed = parseFeatureFile(feature.featurePath);
  if (!parsed) {
    console.error(`  ❌ Could not parse feature file`);
    return false;
  }

  try {
    console.log(`  🔄 Generating rules with Claude AI...`);

    const result = await generateRulesFromFeature(parsed, {
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: 'claude-opus-4-5',
      maxTokens: 8192,
    });

    if (result.success && result.newContent) {
      // Write the generated rules
      fs.writeFileSync(feature.rulesPath, result.newContent, 'utf-8');
      console.log(`  ✅ Generated: ${path.basename(feature.rulesPath)}`);
      if (result.warnings.length > 0) {
        console.log(`  ⚠️  Warnings: ${result.warnings.join(', ')}`);
      }
      if (result.requiresHumanReview) {
        console.log(`  👀 Human review recommended`);
      }
      return true;
    } else {
      console.error(`  ❌ Generation failed: ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  const specificFeature = args.find(a => a.startsWith('--feature='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  const all = args.includes('--all');

  console.log('═'.repeat(60));
  console.log('🔍 Scanning features...');
  console.log('═'.repeat(60));

  const features = findFeatures();

  // Filter features
  let targetFeatures: FeatureInfo[];

  if (specificFeature) {
    targetFeatures = features.filter(f => f.id === specificFeature || f.id.includes(specificFeature));
    if (targetFeatures.length === 0) {
      console.error(`❌ No feature found matching: ${specificFeature}`);
      console.log('\nAvailable features:');
      features.forEach(f => console.log(`  - ${f.id}`));
      process.exit(1);
    }
  } else if (all) {
    targetFeatures = features.filter(f => !f.hasRules);
  } else {
    // Show status only
    const withRules = features.filter(f => f.hasRules);
    const withoutRules = features.filter(f => !f.hasRules);

    console.log(`\n📊 Status:`);
    console.log(`   ✅ With rules: ${withRules.length}`);
    console.log(`   ❌ Without rules: ${withoutRules.length}`);

    if (withoutRules.length === 0) {
      console.log('\n✅ All features have rules!');
      process.exit(0);
    }

    console.log('\n❌ Features without rules:');
    withoutRules.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.id}`);
    });

    console.log('\n💡 Usage:');
    console.log('   npm run generate:rules -- --all              # Generate all missing');
    console.log('   npm run generate:rules -- --feature=NAME     # Generate specific');
    console.log('   npm run generate:rules -- --dry-run --all    # Preview only');
    process.exit(0);
  }

  // Check API key for actual generation
  if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY not set');
    console.error('   Set it in .env.local or as environment variable');
    process.exit(1);
  }

  if (dryRun) {
    console.log('\n🏃 DRY RUN - Would generate rules for:');
    targetFeatures.forEach(f => {
      console.log(`   📄 ${f.id} → src/rules/${f.id}Rules.ts`);
    });
    process.exit(0);
  }

  // Generate rules
  console.log(`\n🚀 Generating rules for ${targetFeatures.length} feature(s)...\n`);

  let success = 0;
  let failed = 0;

  for (const feature of targetFeatures) {
    console.log(`\n📄 ${feature.id}`);

    const result = await generateRulesForFeature(feature);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Rate limiting
    if (targetFeatures.indexOf(feature) < targetFeatures.length - 1) {
      console.log('   ⏳ Waiting 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`   ✅ Generated: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
