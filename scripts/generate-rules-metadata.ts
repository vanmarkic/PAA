/**
 * Script to generate rules metadata for documentation
 *
 * This script scans all rule files in src/rules/ and extracts:
 * - Rule definitions
 * - Conditions and facts
 * - Events and priorities
 * - Legal framework references
 * - Statistics and coverage
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

interface RuleCondition {
  fact: string;
  operator: string;
  value: any;
  path?: string;
  params?: any;
}

interface RuleConditions {
  all?: (RuleCondition | RuleConditions)[];
  any?: (RuleCondition | RuleConditions)[];
  not?: RuleConditions;
}

interface RuleEvent {
  type: string;
  params?: Record<string, any>;
}

interface RuleMeta {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: RuleConditions;
  event: RuleEvent;
  category?: string;
  legalBasis?: any;
  facts?: string[];
}

interface RuleFile {
  fileName: string;
  path: string;
  category: string;
  benefitType?: string;
  rules: RuleMeta[];
  metadata?: any;
  legalFramework?: any;
  constants?: Record<string, any>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine category from file name
 */
function determineCategoryFromFileName(fileName: string): string {
  const categories: Record<string, string[]> = {
    'social-benefits': [
      'ris', 'agr', 'allocations', 'aide', 'pension', 'grapa',
      'handicap', 'chomage', 'prime', 'bourse', 'garantie',
      'conge', 'assurance'
    ],
    'fiscal-rights': [
      'deduction', 'credit', 'exoneration', 'reduction', 'abattement',
      'tva', 'bonus', 'avantages', 'cheques', 'eco', 'frais',
      'quotient', 'rente', 'droits'
    ],
    'employment': [
      'contrat', 'travail', 'licenciement', 'demission', 'preavis',
      'harcelement', 'discrimination', 'egalite', 'stage', 'flexi',
      'temps', 'horaire', 'teletravail', 'greve', 'representation',
      'formation', 'outplacement', 'accident', 'maladie'
    ],
    'social-services': [
      'logement', 'inscription', 'repas', 'transport', 'banque',
      'restaurant', 'mediation', 'budget', 'fonds', 'protection',
      'accompagnement', 'insertion', 'service', 'soins', 'centre',
      'tele', 'sans-abri', 'victimes', 'enfance'
    ]
  };

  const lowerFileName = fileName.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerFileName.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

/**
 * Extract string value from code text
 */
function extractStringValue(text: string, key: string): string | undefined {
  const regex = new RegExp(`${key}:\\s*['"\`]([^'"\`]+)['"\`]`);
  const match = text.match(regex);
  return match ? match[1] : undefined;
}

/**
 * Extract number value from code text
 */
function extractNumberValue(text: string, key: string): number | undefined {
  const regex = new RegExp(`${key}:\\s*(\\d+)`);
  const match = text.match(regex);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Extract facts from rule text
 */
function extractFactsFromText(text: string): string[] {
  const facts: string[] = [];
  const factRegex = /fact:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = factRegex.exec(text)) !== null) {
    facts.push(match[1]);
  }
  return Array.from(new Set(facts));
}

/**
 * Parse a rule file and extract rule definitions using regex
 */
function parseRuleFile(filePath: string): RuleFile | null {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Skip index files
  if (fileName === 'index.ts') {
    return null;
  }

  const result: RuleFile = {
    fileName,
    path: filePath,
    category: determineCategoryFromFileName(fileName),
    rules: [],
  };

  // Extract benefit type from file name
  const benefitMatch = fileName.match(/^(.+?)Rules\.ts$/);
  if (benefitMatch) {
    result.benefitType = benefitMatch[1];
  }

  // Look for RULES_METADATA constant
  const metadataMatch = fileContent.match(/export\s+const\s+\w*RULES_METADATA\s*=\s*{([^}]+)}/s);
  if (metadataMatch) {
    result.metadata = {
      implementsSpecification: extractStringValue(metadataMatch[1], 'implementsSpecification'),
      implementationVersion: extractStringValue(metadataMatch[1], 'implementationVersion'),
      implementationStatus: extractStringValue(metadataMatch[1], 'implementationStatus'),
      effectiveDate: extractStringValue(metadataMatch[1], 'effectiveDate'),
    };
  }

  // Look for LEGAL_FRAMEWORK or primaryLegislation
  const legalMatch = fileContent.match(/legalFramework[:\s]*{([^}]+primaryLegislation[^}]+)}/s);
  if (legalMatch) {
    result.legalFramework = {
      primaryLegislation: {
        title: extractStringValue(legalMatch[1], 'title'),
        officialUrl: extractStringValue(legalMatch[1], 'officialUrl'),
        authority: extractStringValue(legalMatch[1], 'authority'),
      }
    };
  }

  // Look for constants definitions
  const constantsMatches = fileContent.match(/const\s+(\w*(?:CONSTANTS|AMOUNTS|THRESHOLD|RATE)\w*)\s*=/g);
  if (constantsMatches) {
    result.constants = {};
    constantsMatches.forEach(match => {
      const constName = match.match(/const\s+(\w+)/)?.[1];
      if (constName) {
        result.constants![constName] = true;
      }
    });
  }

  // Extract rules from engine.addRule() calls
  const ruleMatches = fileContent.matchAll(/engine\.addRule\s*\(\s*{([^}]+(?:{[^}]*}[^}]*)*[^}]+)}\s*\)/sg);
  let ruleCount = 0;

  for (const match of ruleMatches) {
    ruleCount++;
    const ruleText = match[1];

    // Extract basic rule properties
    const rule: RuleMeta = {
      id: `${result.benefitType || fileName.replace('.ts', '')}-rule-${ruleCount}`,
      name: '',
      description: '',
      priority: extractNumberValue(ruleText, 'priority') || 5,
      conditions: {} as RuleConditions,
      event: {
        type: 'unknown',
      },
      facts: [],
    };

    // Extract event type
    const eventMatch = ruleText.match(/event:\s*{[^}]*type:\s*['"`]([^'"`]+)['"`]/);
    if (eventMatch) {
      rule.event.type = eventMatch[1];
      rule.name = eventMatch[1];
    }

    // Extract event params (for description)
    const messageMatch = ruleText.match(/message:\s*['"`]([^'"`]+)['"`]/);
    const reasonMatch = ruleText.match(/reason:\s*['"`]([^'"`]+)['"`]/);
    rule.description = messageMatch?.[1] || reasonMatch?.[1] || rule.event.type;

    // Extract conditions structure
    if (ruleText.includes('all:')) {
      rule.conditions.all = [];
    }
    if (ruleText.includes('any:')) {
      rule.conditions.any = [];
    }

    // Extract facts
    rule.facts = extractFactsFromText(ruleText);

    result.rules.push(rule);
  }

  // Only return if we found some rules
  if (result.rules.length === 0) {
    return null;
  }

  return result;
}

// ============================================================================
// Main Script
// ============================================================================

async function generateRulesMetadata() {
  console.log('🔄 Starting rules metadata generation...');

  const rulesDir = path.join(__dirname, '../src/rules');
  const outputPath = path.join(__dirname, '../docs-astro/public/rules-metadata.json');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all TypeScript files in rules directory
  const ruleFiles = fs.readdirSync(rulesDir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(rulesDir, file));

  console.log(`📁 Found ${ruleFiles.length} rule files`);

  // Parse each file
  const ruleFileData: RuleFile[] = [];
  for (const filePath of ruleFiles) {
    const data = parseRuleFile(filePath);
    if (data) {
      ruleFileData.push(data);
    }
  }

  console.log(`📋 Processed ${ruleFileData.length} files with rules`);

  // Calculate statistics
  const totalRules = ruleFileData.reduce((sum, file) => sum + file.rules.length, 0);
  const categories = Array.from(new Set(ruleFileData.map(f => f.category)));

  // Count rules per category
  const rulesPerCategory: Record<string, number> = {};
  categories.forEach(cat => {
    rulesPerCategory[cat] = ruleFileData
      .filter(f => f.category === cat)
      .reduce((sum, f) => sum + f.rules.length, 0);
  });

  // Calculate average priority per category
  const averagePriorityPerCategory: Record<string, string> = {};
  categories.forEach(cat => {
    const categoryRules = ruleFileData
      .filter(f => f.category === cat)
      .flatMap(f => f.rules);
    const priorities = categoryRules.filter(r => r.priority).map(r => r.priority);
    if (priorities.length > 0) {
      const avg = priorities.reduce((sum, p) => sum + p, 0) / priorities.length;
      averagePriorityPerCategory[cat] = avg.toFixed(1);
    } else {
      averagePriorityPerCategory[cat] = '0';
    }
  });

  // Extract common facts
  const factCounts: Record<string, number> = {};
  ruleFileData.forEach(file => {
    file.rules.forEach(rule => {
      rule.facts?.forEach(fact => {
        factCounts[fact] = (factCounts[fact] || 0) + 1;
      });
    });
  });

  const commonFacts = Object.entries(factCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([fact, count]) => ({ fact, count }));

  // Extract common operators (simplified)
  const operatorCounts: Record<string, number> = {
    'equal': 0,
    'notEqual': 0,
    'lessThan': 0,
    'lessThanInclusive': 0,
    'greaterThan': 0,
    'greaterThanInclusive': 0,
    'contains': 0,
    'notIn': 0,
  };

  // Count operators in file contents (simplified approach)
  ruleFileData.forEach(file => {
    const content = fs.readFileSync(file.path, 'utf8');
    Object.keys(operatorCounts).forEach(op => {
      const regex = new RegExp(`operator:\\s*['"\`]${op}['"\`]`, 'g');
      const matches = content.match(regex);
      if (matches) {
        operatorCounts[op] += matches.length;
      }
    });
  });

  // Count files with metadata and legal basis
  const withMetadata = ruleFileData.filter(f => f.metadata && f.metadata.implementsSpecification).length;
  const withLegalBasis = ruleFileData.filter(f => f.legalFramework).length;
  const withConstants = ruleFileData.filter(f => f.constants && Object.keys(f.constants).length > 0).length;

  // Extract event types
  const eventTypeCounts: Record<string, number> = {};
  ruleFileData.forEach(file => {
    file.rules.forEach(rule => {
      const eventType = rule.event.type;
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
    });
  });

  const commonEventTypes = Object.entries(eventTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([type, count]) => ({ type, count }));

  // Build metadata object
  const metadata = {
    generated: new Date().toISOString(),
    totalFiles: ruleFileData.length,
    totalRules,
    categories,
    ruleFiles: ruleFileData,
    statistics: {
      totalRules,
      totalRuleFiles: ruleFileData.length,
      rulesPerCategory,
      averageRulesPerFile: (totalRules / Math.max(ruleFileData.length, 1)).toFixed(1),
      averagePriorityPerCategory,
      commonFacts,
      commonOperators: Object.entries(operatorCounts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([operator, count]) => ({ operator, count })),
      commonEventTypes,
    },
    coverage: {
      withLegalBasis,
      withMetadata,
      withConstants,
      percentageWithLegalBasis: ((withLegalBasis / Math.max(ruleFileData.length, 1)) * 100).toFixed(1) + '%',
      percentageWithMetadata: ((withMetadata / Math.max(ruleFileData.length, 1)) * 100).toFixed(1) + '%',
    }
  };

  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

  console.log('✅ Rules metadata generation complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Total files: ${ruleFileData.length}`);
  console.log(`   - Total rules: ${totalRules}`);
  console.log(`   - Categories: ${categories.join(', ')}`);
  console.log(`   - Files with metadata: ${withMetadata}`);
  console.log(`   - Files with legal basis: ${withLegalBasis}`);
  console.log(`   - Files with constants: ${withConstants}`);
  console.log(`📄 Output saved to: ${outputPath}`);
}

// Run the script
if (require.main === module) {
  generateRulesMetadata().catch(console.error);
}

export { generateRulesMetadata };