#!/usr/bin/env ts-node
/**
 * Generate metadata for all business rules
 * This script extracts rule definitions from the rules directory
 * and generates a JSON file for documentation purposes
 */

import * as fs from 'fs';
import * as path from 'path';

interface RuleCondition {
  fact: string;
  operator: string;
  value: any;
  path?: string;
}

interface RuleMeta {
  id: string;
  fileName: string;
  category: string;
  benefitType?: string;
  description: string;
  priority: number;
  conditions: {
    all?: RuleCondition[];
    any?: RuleCondition[];
  };
  event: {
    type: string;
    params?: any;
  };
}

interface RulesMetadata {
  generated: string;
  totalRules: number;
  categories: string[];
  rulesByCategory: Record<string, RuleMeta[]>;
  statistics: {
    totalConditions: number;
    uniqueFacts: string[];
    uniqueOperators: string[];
    averageConditionsPerRule: string;
  };
}

function categorizeRule(fileName: string): string {
  const name = fileName.toLowerCase();

  if (name.includes('agr') || name.includes('chomage') || name.includes('employment')) {
    return 'emploi';
  }
  if (name.includes('ris') || name.includes('cpas') || name.includes('sociale') || name.includes('grapa')) {
    return 'social';
  }
  if (name.includes('logement') || name.includes('housing') || name.includes('energie')) {
    return 'logement';
  }
  if (name.includes('allocation') && name.includes('familia')) {
    return 'famille';
  }
  if (name.includes('handicap') || name.includes('integration')) {
    return 'handicap';
  }
  if (name.includes('pension') || name.includes('retraite')) {
    return 'pension';
  }
  if (name.includes('credit') || name.includes('impot') || name.includes('deduction') || name.includes('fiscal')) {
    return 'fiscal';
  }
  if (name.includes('sante') || name.includes('maladie') || name.includes('medical')) {
    return 'sante';
  }
  if (name.includes('formation') || name.includes('etude') || name.includes('bourse')) {
    return 'education';
  }

  return 'autre';
}

function extractRulesFromFile(filePath: string): RuleMeta[] {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, '.ts');
  const category = categorizeRule(fileName);
  const rules: RuleMeta[] = [];

  // Extract benefit type from filename (e.g., agrRules -> agr)
  const benefitType = fileName.replace('Rules', '').toLowerCase();

  // Improved regex to find rule definitions - handle multiline
  const ruleRegex = /engine\.addRule\(\{[\s\S]*?\}\)(?=\s*;|\s*\n|\s*$)/g;
  const matches = fileContent.match(ruleRegex) || [];

  let ruleIndex = 0;
  for (const match of matches) {
    // Extract priority
    const priorityMatch = match.match(/priority:\s*(\d+)/);
    const priority = priorityMatch ? parseInt(priorityMatch[1]) : 5;

    // Extract event type and params
    const eventTypeMatch = match.match(/type:\s*['"`]([^'"`]+)['"`]/);
    const eventType = eventTypeMatch ? eventTypeMatch[1] : 'unknown';

    // Extract description from event params or generate one
    let description = '';
    const messageMatch = match.match(/message:\s*['"`]([^'"`]+)['"`]/);
    const reasonMatch = match.match(/reason:\s*['"`]([^'"`]+)['"`]/);

    if (messageMatch) {
      description = messageMatch[1];
    } else if (reasonMatch) {
      description = `Ineligible: ${reasonMatch[1]}`;
    } else {
      description = `Rule ${ruleIndex + 1} for ${benefitType}`;
    }

    // Extract conditions - improved parsing
    const conditionsAll = match.includes('all:');
    const conditionsAny = match.includes('any:');
    const factMatches = Array.from(match.matchAll(/fact:\s*['"`]([^'"`]+)['"`]/g));
    const operatorMatches = Array.from(match.matchAll(/operator:\s*['"`]([^'"`]+)['"`]/g));
    const valueMatches = Array.from(match.matchAll(/value:\s*(['"`])?([^,\n}]+)\1?/g));

    const facts: string[] = factMatches.map(m => m[1]);
    const operators: string[] = operatorMatches.map(m => m[1]);
    const values: any[] = valueMatches.map(m => {
      const val = m[2].trim();
      // Try to parse as number or boolean
      if (val === 'true' || val === 'false') return val === 'true';
      if (!isNaN(Number(val))) return Number(val);
      return val.replace(/['"`]/g, '');
    });

    // Build conditions object
    const conditions: any = {};
    if (conditionsAll) {
      conditions.all = facts.map((fact, i) => ({
        fact,
        operator: operators[i] || 'unknown',
        value: values[i] || 'see_code'
      }));
    } else if (conditionsAny) {
      conditions.any = facts.map((fact, i) => ({
        fact,
        operator: operators[i] || 'unknown',
        value: values[i] || 'see_code'
      }));
    }

    rules.push({
      id: `${fileName}-${ruleIndex}`,
      fileName,
      category,
      benefitType,
      description,
      priority,
      conditions,
      event: {
        type: eventType
      }
    });

    ruleIndex++;
  }

  // If no rules found via regex, try to extract metadata if available
  if (rules.length === 0) {
    // Look for exported rule JSON or metadata
    const metadataMatch = fileContent.match(/export const \w+_RULES_JSON = (\{[\s\S]*?\});/);
    if (metadataMatch) {
      // Add a placeholder rule with metadata
      rules.push({
        id: `${fileName}-metadata`,
        fileName,
        category,
        benefitType,
        description: `Business rules for ${benefitType}`,
        priority: 5,
        conditions: {},
        event: {
          type: `${benefitType}-check`
        }
      });
    }
  }

  return rules;
}

function generateRulesMetadata() {
  const rulesDir = path.join(__dirname, '..', 'src', 'rules');
  const outputPath = path.join(__dirname, '..', 'docs-astro', 'public', 'rules-metadata.json');

  const allRules: RuleMeta[] = [];
  const uniqueFacts = new Set<string>();
  const uniqueOperators = new Set<string>();

  // Read all TypeScript files in the rules directory
  const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

  for (const file of files) {
    const filePath = path.join(rulesDir, file);

    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      continue;
    }

    try {
      const rules = extractRulesFromFile(filePath);
      allRules.push(...rules);

      // Collect unique facts and operators
      rules.forEach(rule => {
        if (rule.conditions.all) {
          rule.conditions.all.forEach(cond => {
            uniqueFacts.add(cond.fact);
            uniqueOperators.add(cond.operator);
          });
        }
        if (rule.conditions.any) {
          rule.conditions.any.forEach(cond => {
            uniqueFacts.add(cond.fact);
            uniqueOperators.add(cond.operator);
          });
        }
      });
    } catch (error) {
      console.warn(`Could not extract rules from ${file}:`, error);
    }
  }

  // Group rules by category
  const rulesByCategory: Record<string, RuleMeta[]> = {};
  const categories = new Set<string>();

  allRules.forEach(rule => {
    categories.add(rule.category);
    if (!rulesByCategory[rule.category]) {
      rulesByCategory[rule.category] = [];
    }
    rulesByCategory[rule.category].push(rule);
  });

  // Calculate statistics
  let totalConditions = 0;
  allRules.forEach(rule => {
    if (rule.conditions.all) {
      totalConditions += rule.conditions.all.length;
    }
    if (rule.conditions.any) {
      totalConditions += rule.conditions.any.length;
    }
  });

  const metadata: RulesMetadata = {
    generated: new Date().toISOString(),
    totalRules: allRules.length,
    categories: Array.from(categories).sort(),
    rulesByCategory,
    statistics: {
      totalConditions,
      uniqueFacts: Array.from(uniqueFacts).sort(),
      uniqueOperators: Array.from(uniqueOperators).sort(),
      averageConditionsPerRule: (totalConditions / allRules.length).toFixed(2)
    }
  };

  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

  console.log(`✅ Generated rules metadata:`);
  console.log(`   - Total rules: ${metadata.totalRules}`);
  console.log(`   - Categories: ${metadata.categories.join(', ')}`);
  console.log(`   - Unique facts: ${metadata.statistics.uniqueFacts.length}`);
  console.log(`   - Unique operators: ${metadata.statistics.uniqueOperators.length}`);
  console.log(`   - Output: ${outputPath}`);
}

// Run the generator
generateRulesMetadata();