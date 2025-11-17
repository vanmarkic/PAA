/**
 * Astro Integration for Build-Time Metadata Generation
 *
 * This integration generates metadata for machines, rules, and features
 * during the Astro build process, making it available to all pages at build time.
 */

import type { AstroIntegration, AstroConfig } from 'astro';
import * as fs from 'fs';
import * as path from 'path';
import * as gherkin from '@cucumber/gherkin';
import * as messages from '@cucumber/messages';
import {
  getMachineLegalMetadata,
  isMachineDataCurrent,
  getMachineSources,
  generateAuditReport
} from '../../src/domain/legalMetadata';
import type { MachineLegalMetadata, LegalSource } from '../../src/domain/legalMetadata';

// ============================================================================
// Type Definitions
// ============================================================================

export interface MachineMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  states: string[];
  events: string[];
  initial: string;
  // Legal metadata
  legalMetadata?: MachineLegalMetadata;
  dataFreshness?: {
    status: 'current' | 'needs-review' | 'outdated' | 'unknown';
    label: string;
    daysOld: number;
  };
  // Lineage information
  parentMachines?: string[];
  childMachines?: string[];
  siblingMachines?: string[];
  version?: string;
  lastModified?: string;
}

export interface RuleMeta {
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
  // Lineage information
  relatedMachines?: string[];
  relatedFeatures?: string[];
  version?: string;
  lastModified?: string;
}

export interface RuleCondition {
  fact: string;
  operator: string;
  value: any;
  path?: string;
}

export interface Feature {
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
  // Lineage information
  relatedMachines?: string[];
  relatedRules?: string[];
  version?: string;
  lastModified?: string;
}

export interface FeatureMetadata {
  specificationVersion?: string;
  effectiveDate?: string;
  legalBasis?: string;
  legalUrl?: string;
  implementedBy?: string;
  language?: 'fr' | 'nl' | 'de';
  version?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  steps: Step[];
  examples?: ExampleTable[];
  isOutline: boolean;
}

export interface Step {
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

export interface ExampleTable {
  name?: string;
  tags: string[];
  headers: string[];
  rows: Array<{ name?: string; values: Record<string, string> }>;
}

export interface Background {
  name?: string;
  description?: string;
  steps: Step[];
}

export interface CompleteMetadata {
  generated: string;
  machines: {
    totalMachines: number;
    categories: string[];
    machines: MachineMeta[];
    statistics: {
      totalStates: number;
      totalEvents: number;
      averageStatesPerMachine: string;
      averageEventsPerMachine: string;
      legalCompliance: {
        upToDate: number;
        needsReview: number;
        outdated: number;
        missingMetadata: number;
      };
    };
  };
  rules: {
    totalRules: number;
    categories: string[];
    rulesByCategory: Record<string, RuleMeta[]>;
    statistics: {
      totalConditions: number;
      uniqueFacts: string[];
      uniqueOperators: string[];
      averageConditionsPerRule: string;
    };
  };
  features: {
    totalFeatures: number;
    categories: string[];
    features: Feature[];
    statistics: {
      totalScenarios: number;
      totalSteps: number;
      averageScenariosPerFeature: string;
      averageStepsPerScenario: string;
      totalExamples: number;
      tagsDistribution: Record<string, number>;
    };
    languages: string[];
  };
  lineage: {
    machineRelationships: Record<string, {
      parents: string[];
      children: string[];
      siblings: string[];
    }>;
    featureMachineMapping: Record<string, string[]>;
    ruleMachineMapping: Record<string, string[]>;
  };
}

// ============================================================================
// Machine Metadata Extraction
// ============================================================================

function extractMachineLineage(content: string, machineId: string, allMachineIds: string[]): {
  parents: string[];
  children: string[];
  siblings: string[];
} {
  const parents: string[] = [];
  const children: string[] = [];
  const siblings: string[] = [];

  // Look for references to other machines in the file
  allMachineIds.forEach(otherId => {
    if (otherId === machineId) return;

    // Check if this machine invokes or references the other machine
    if (content.includes(`invoke.*${otherId}`) || content.includes(`spawn.*${otherId}`)) {
      children.push(otherId);
    }

    // Check if this machine is invoked by looking for parent patterns
    if (content.includes(`parent.*${otherId}`) || content.includes(`from.*${otherId}`)) {
      parents.push(otherId);
    }

    // Check for sibling relationships (same category or similar names)
    const machineBaseName = machineId.replace(/Machine$/, '');
    const otherBaseName = otherId.replace(/Machine$/, '');
    if (machineBaseName.includes(otherBaseName) || otherBaseName.includes(machineBaseName)) {
      siblings.push(otherId);
    }
  });

  return { parents, children, siblings };
}

function parseMachineFile(filePath: string, allMachineIds: string[]): MachineMeta | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract machine ID and initial state
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const initialMatch = content.match(/initial:\s*['"]([^'"]+)['"]/);

  if (!idMatch || !initialMatch) return null;

  const id = idMatch[1];
  const initial = initialMatch[1];

  // Extract states
  const states: string[] = [];
  const statesStart = content.indexOf('states:');
  if (statesStart !== -1) {
    const openBraceIdx = content.indexOf('{', statesStart);
    if (openBraceIdx !== -1) {
      let braceCount = 0;
      let endIdx = openBraceIdx;
      for (let i = openBraceIdx; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
      const statesContent = content.substring(openBraceIdx + 1, endIdx);
      const lines = statesContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s+(\w+):\s*\{/);
        if (match && match[1] !== 'on' && match[1] !== 'meta' && match[1] !== 'entry' && match[1] !== 'exit') {
          if (!states.includes(match[1])) {
            states.push(match[1]);
          }
        }
      }
    }
  }

  // Extract events
  const events: string[] = [];
  const eventMatches = content.matchAll(/type:\s*['"]([A-Z_]+)['"]/g);
  for (const match of eventMatches) {
    if (!events.includes(match[1])) {
      events.push(match[1]);
    }
  }

  // Extract name and description from comments
  const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
  let name = id;
  let description = '';

  if (commentMatch) {
    const comment = commentMatch[1];
    const nameMatch = comment.match(/\*\s*(.+)/);
    if (nameMatch) {
      name = nameMatch[1].replace(/^(Machine XState pour|XState machine for)\s+/i, '').trim();
    }
    const descMatch = comment.match(/\*\s*\n\s*\*\s*(.+)/);
    if (descMatch) {
      description = descMatch[1].trim();
    }
  }

  const category = path.basename(path.dirname(filePath));

  // Get file stats for last modified
  const stats = fs.statSync(filePath);
  const lastModified = stats.mtime.toISOString();

  // Extract version from comments if available
  const versionMatch = content.match(/@version\s+(\d+\.\d+\.\d+)/);
  const version = versionMatch ? versionMatch[1] : '1.0.0';

  // Get legal metadata
  const legalMetadata = getMachineLegalMetadata(id);

  // Calculate data freshness
  let dataFreshness = undefined;
  if (legalMetadata) {
    const { isCurrent, daysOld, needsReview } = isMachineDataCurrent(id);
    dataFreshness = {
      status: needsReview ? 'needs-review' : (isCurrent ? 'current' : 'outdated') as any,
      label: needsReview
        ? `Révision nécessaire (${daysOld} jours)`
        : (isCurrent ? `À jour (${daysOld} jours)` : `Anciennes (${daysOld} jours)`),
      daysOld
    };
  }

  // Extract lineage
  const lineage = extractMachineLineage(content, id, allMachineIds);

  return {
    id,
    name,
    category: category === 'workflows' ? 'general' : category,
    description,
    states,
    events,
    initial,
    legalMetadata,
    dataFreshness,
    parentMachines: lineage.parents,
    childMachines: lineage.children,
    siblingMachines: lineage.siblings,
    version,
    lastModified,
  };
}

// ============================================================================
// Rules Metadata Extraction
// ============================================================================

function extractRuleLineage(content: string, fileName: string): {
  relatedMachines: string[];
  relatedFeatures: string[];
} {
  const relatedMachines: string[] = [];
  const relatedFeatures: string[] = [];

  // Look for machine references
  const machineMatches = content.matchAll(/machine[:\s]+['"]([^'"]+Machine)['"]/gi);
  for (const match of machineMatches) {
    if (!relatedMachines.includes(match[1])) {
      relatedMachines.push(match[1]);
    }
  }

  // Look for feature references
  const featureMatches = content.matchAll(/feature[:\s]+['"]([^'"]+\.feature)['"]/gi);
  for (const match of featureMatches) {
    if (!relatedFeatures.includes(match[1])) {
      relatedFeatures.push(match[1]);
    }
  }

  // Infer from filename
  const baseName = fileName.replace('Rules', '').toLowerCase();
  relatedMachines.push(`${baseName}Machine`);
  relatedFeatures.push(`${baseName}.feature`);

  return { relatedMachines, relatedFeatures };
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

  // Get file stats for last modified
  const stats = fs.statSync(filePath);
  const lastModified = stats.mtime.toISOString();

  // Extract version from comments if available
  const versionMatch = fileContent.match(/@version\s+(\d+\.\d+\.\d+)/);
  const version = versionMatch ? versionMatch[1] : '1.0.0';

  // Extract lineage
  const lineage = extractRuleLineage(fileContent, fileName);

  // Extract benefit type from filename
  const benefitType = fileName.replace('Rules', '').toLowerCase();

  // Find rule definitions
  const ruleRegex = /engine\.addRule\(\{[\s\S]*?\}\)(?=\s*;|\s*\n|\s*$)/g;
  const matches = fileContent.match(ruleRegex) || [];

  let ruleIndex = 0;
  for (const match of matches) {
    // Extract priority
    const priorityMatch = match.match(/priority:\s*(\d+)/);
    const priority = priorityMatch ? parseInt(priorityMatch[1]) : 5;

    // Extract event type
    const eventTypeMatch = match.match(/type:\s*['"`]([^'"`]+)['"`]/);
    const eventType = eventTypeMatch ? eventTypeMatch[1] : 'unknown';

    // Extract description
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

    // Extract conditions
    const conditionsAll = match.includes('all:');
    const conditionsAny = match.includes('any:');
    const factMatches = Array.from(match.matchAll(/fact:\s*['"`]([^'"`]+)['"`]/g));
    const operatorMatches = Array.from(match.matchAll(/operator:\s*['"`]([^'"`]+)['"`]/g));
    const valueMatches = Array.from(match.matchAll(/value:\s*(['"`])?([^,\n}]+)\1?/g));

    const facts: string[] = factMatches.map(m => m[1]);
    const operators: string[] = operatorMatches.map(m => m[1]);
    const values: any[] = valueMatches.map(m => {
      const val = m[2].trim();
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
      },
      relatedMachines: lineage.relatedMachines,
      relatedFeatures: lineage.relatedFeatures,
      version,
      lastModified,
    });

    ruleIndex++;
  }

  return rules;
}

// ============================================================================
// Feature Metadata Extraction
// ============================================================================

function extractFeatureLineage(content: string, featureId: string): {
  relatedMachines: string[];
  relatedRules: string[];
} {
  const relatedMachines: string[] = [];
  const relatedRules: string[] = [];

  // Look for @implemented-by tags
  const implementedByMatch = content.match(/@implemented-by:\s*(.+)/);
  if (implementedByMatch) {
    const implFile = implementedByMatch[1].trim();
    if (implFile.includes('Machine')) {
      relatedMachines.push(path.basename(implFile, '.ts'));
    }
    if (implFile.includes('Rules')) {
      relatedRules.push(path.basename(implFile, '.ts'));
    }
  }

  // Look for machine references in scenarios
  const machineMatches = content.matchAll(/machine[:\s]+['"]([^'"]+Machine)['"]/gi);
  for (const match of machineMatches) {
    if (!relatedMachines.includes(match[1])) {
      relatedMachines.push(match[1]);
    }
  }

  // Infer from feature ID
  const baseName = featureId.replace(/^.*-/, '').replace('.feature', '');
  relatedMachines.push(`${baseName}Machine`);
  relatedRules.push(`${baseName}Rules`);

  return { relatedMachines, relatedRules };
}

function extractFeatureMetadata(content: string): FeatureMetadata {
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

function extractCategory(filePath: string): string {
  const parts = filePath.split(path.sep);
  const featuresIndex = parts.indexOf('features');

  if (featuresIndex !== -1 && featuresIndex < parts.length - 2) {
    return parts[featuresIndex + 1];
  }

  return 'uncategorized';
}

function generateFeatureId(filePath: string): string {
  const parts = filePath.split(path.sep);
  const fileName = parts[parts.length - 1];
  const category = extractCategory(filePath);

  return `${category}-${fileName.replace('.feature', '')}`;
}

function extractTags(tags?: readonly messages.Tag[]): string[] {
  if (!tags) return [];
  return tags.map(tag => tag.name.replace('@', ''));
}

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

function parseFeatureFile(filePath: string): Feature | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Get file stats for last modified
    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime.toISOString();

    // Extract metadata from comments
    const metadata = extractFeatureMetadata(content);

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

    // Extract lineage
    const lineage = extractFeatureLineage(content, featureId);

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
      language,
      relatedMachines: lineage.relatedMachines,
      relatedRules: lineage.relatedRules,
      version: metadata.version || '1.0.0',
      lastModified,
    };
  } catch (error) {
    console.error(`Error parsing feature file ${filePath}:`, error);
    return null;
  }
}

// ============================================================================
// File Discovery Functions
// ============================================================================

function findFiles(dir: string, pattern: RegExp, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '__tests__') {
      findFiles(fullPath, pattern, files);
    } else if (entry.isFile() && pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// ============================================================================
// Metadata Generation
// ============================================================================

async function generateCompleteMetadata(rootPath: string): Promise<CompleteMetadata> {
  console.log('🔄 Generating complete metadata...');

  const machinesPath = path.join(rootPath, 'src', 'workflows');
  const rulesPath = path.join(rootPath, 'src', 'rules');
  const featuresPath = path.join(rootPath, 'features');

  // Find all files
  const machineFiles = findFiles(machinesPath, /Machine\.ts$/);
  const ruleFiles = findFiles(rulesPath, /\.ts$/);
  const featureFiles = findFiles(featuresPath, /\.feature$/);

  console.log(`  📊 Found ${machineFiles.length} machines, ${ruleFiles.length} rule files, ${featureFiles.length} features`);

  // Extract all machine IDs first (for lineage detection)
  const allMachineIds = machineFiles
    .map(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
      return idMatch ? idMatch[1] : null;
    })
    .filter(Boolean) as string[];

  // Parse machines
  const machines: MachineMeta[] = [];
  for (const file of machineFiles) {
    const meta = parseMachineFile(file, allMachineIds);
    if (meta) {
      machines.push(meta);
    }
  }

  // Parse rules
  const allRules: RuleMeta[] = [];
  for (const file of ruleFiles) {
    if (path.basename(file) !== 'index.ts') {
      const rules = extractRulesFromFile(file);
      allRules.push(...rules);
    }
  }

  // Parse features
  const features: Feature[] = [];
  for (const file of featureFiles) {
    const feature = parseFeatureFile(file);
    if (feature) {
      features.push(feature);
    }
  }

  // Sort everything
  machines.sort((a, b) => a.category !== b.category
    ? a.category.localeCompare(b.category)
    : a.name.localeCompare(b.name)
  );

  features.sort((a, b) => a.category !== b.category
    ? a.category.localeCompare(b.category)
    : a.name.localeCompare(b.name)
  );

  // Calculate statistics
  const machineCategories = [...new Set(machines.map(m => m.category))].sort();
  const totalStates = machines.reduce((sum, m) => sum + m.states.length, 0);
  const totalEvents = machines.reduce((sum, m) => sum + m.events.length, 0);

  // Legal compliance statistics
  const legalCompliance = {
    upToDate: machines.filter(m => m.dataFreshness?.status === 'current').length,
    needsReview: machines.filter(m => m.dataFreshness?.status === 'needs-review').length,
    outdated: machines.filter(m => m.dataFreshness?.status === 'outdated').length,
    missingMetadata: machines.filter(m => !m.legalMetadata).length,
  };

  // Rule statistics
  const ruleCategories = [...new Set(allRules.map(r => r.category))].sort();
  const rulesByCategory: Record<string, RuleMeta[]> = {};
  allRules.forEach(rule => {
    if (!rulesByCategory[rule.category]) {
      rulesByCategory[rule.category] = [];
    }
    rulesByCategory[rule.category].push(rule);
  });

  let totalConditions = 0;
  const uniqueFacts = new Set<string>();
  const uniqueOperators = new Set<string>();

  allRules.forEach(rule => {
    if (rule.conditions.all) {
      totalConditions += rule.conditions.all.length;
      rule.conditions.all.forEach(cond => {
        uniqueFacts.add(cond.fact);
        uniqueOperators.add(cond.operator);
      });
    }
    if (rule.conditions.any) {
      totalConditions += rule.conditions.any.length;
      rule.conditions.any.forEach(cond => {
        uniqueFacts.add(cond.fact);
        uniqueOperators.add(cond.operator);
      });
    }
  });

  // Feature statistics
  const featureCategories = [...new Set(features.map(f => f.category))].sort();
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

  const tagsDistribution: Record<string, number> = {};
  features.forEach(feature => {
    feature.tags.forEach(tag => {
      tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
    });
    feature.scenarios.forEach(scenario => {
      scenario.tags.forEach(tag => {
        tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
      });
    });
  });

  const languages = [...new Set(features.map(f => f.language))].sort();

  // Build lineage relationships
  const machineRelationships: Record<string, { parents: string[]; children: string[]; siblings: string[] }> = {};
  machines.forEach(machine => {
    machineRelationships[machine.id] = {
      parents: machine.parentMachines || [],
      children: machine.childMachines || [],
      siblings: machine.siblingMachines || [],
    };
  });

  const featureMachineMapping: Record<string, string[]> = {};
  features.forEach(feature => {
    featureMachineMapping[feature.id] = feature.relatedMachines || [];
  });

  const ruleMachineMapping: Record<string, string[]> = {};
  allRules.forEach(rule => {
    if (!ruleMachineMapping[rule.fileName]) {
      ruleMachineMapping[rule.fileName] = [];
    }
    (rule.relatedMachines || []).forEach(machine => {
      if (!ruleMachineMapping[rule.fileName].includes(machine)) {
        ruleMachineMapping[rule.fileName].push(machine);
      }
    });
  });

  return {
    generated: new Date().toISOString(),
    machines: {
      totalMachines: machines.length,
      categories: machineCategories,
      machines,
      statistics: {
        totalStates,
        totalEvents,
        averageStatesPerMachine: machines.length > 0 ? (totalStates / machines.length).toFixed(1) : '0',
        averageEventsPerMachine: machines.length > 0 ? (totalEvents / machines.length).toFixed(1) : '0',
        legalCompliance,
      },
    },
    rules: {
      totalRules: allRules.length,
      categories: ruleCategories,
      rulesByCategory,
      statistics: {
        totalConditions,
        uniqueFacts: Array.from(uniqueFacts).sort(),
        uniqueOperators: Array.from(uniqueOperators).sort(),
        averageConditionsPerRule: allRules.length > 0 ? (totalConditions / allRules.length).toFixed(2) : '0',
      },
    },
    features: {
      totalFeatures: features.length,
      categories: featureCategories,
      features,
      statistics: {
        totalScenarios,
        totalSteps,
        averageScenariosPerFeature: features.length > 0
          ? (totalScenarios / features.length).toFixed(1)
          : '0',
        averageStepsPerScenario: totalScenarios > 0
          ? (totalSteps / totalScenarios).toFixed(1)
          : '0',
        totalExamples,
        tagsDistribution,
      },
      languages,
    },
    lineage: {
      machineRelationships,
      featureMachineMapping,
      ruleMachineMapping,
    },
  };
}

// ============================================================================
// Astro Integration
// ============================================================================

interface MetadataIntegrationOptions {
  /**
   * Whether to write metadata files to disk (for debugging)
   */
  writeFiles?: boolean;

  /**
   * Custom output directory for metadata files
   */
  outputDir?: string;

  /**
   * Whether to include legal metadata
   */
  includeLegalMetadata?: boolean;
}

export default function metadataIntegration(options: MetadataIntegrationOptions = {}): AstroIntegration {
  const {
    writeFiles = false,
    outputDir = 'public',
    includeLegalMetadata = true,
  } = options;

  let metadata: CompleteMetadata | null = null;
  let astroConfig: AstroConfig;

  return {
    name: 'paa-metadata-integration',

    hooks: {
      'astro:config:setup': async ({ config, command, updateConfig, injectScript }) => {
        astroConfig = config;
        console.log('📦 PAA Metadata Integration: Initializing...');

        // Generate metadata at the start of the build
        if (command === 'build' || command === 'dev') {
          const rootPath = path.resolve(config.root.pathname, '..');
          metadata = await generateCompleteMetadata(rootPath);

          console.log('✅ PAA Metadata Integration: Generated metadata');
          console.log(`   - ${metadata.machines.totalMachines} machines`);
          console.log(`   - ${metadata.rules.totalRules} rules`);
          console.log(`   - ${metadata.features.totalFeatures} features`);

          // Write files if requested (for debugging)
          if (writeFiles) {
            const outDir = path.join(config.root.pathname, outputDir);

            // Ensure directory exists
            if (!fs.existsSync(outDir)) {
              fs.mkdirSync(outDir, { recursive: true });
            }

            // Write individual metadata files for backward compatibility
            fs.writeFileSync(
              path.join(outDir, 'machines-metadata.json'),
              JSON.stringify(metadata.machines, null, 2)
            );

            fs.writeFileSync(
              path.join(outDir, 'rules-metadata.json'),
              JSON.stringify(metadata.rules, null, 2)
            );

            fs.writeFileSync(
              path.join(outDir, 'features-metadata.json'),
              JSON.stringify(metadata.features, null, 2)
            );

            // Write complete metadata
            fs.writeFileSync(
              path.join(outDir, 'complete-metadata.json'),
              JSON.stringify(metadata, null, 2)
            );

            console.log(`   📝 Written metadata files to ${outDir}`);
          }
        }
      },

      'astro:config:done': async ({ config }) => {
        // Make metadata available globally via virtual module
        if (metadata) {
          // Store metadata in a way that pages can access it
          (global as any).__PAA_METADATA__ = metadata;
        }
      },

      'astro:build:start': async ({ logger }) => {
        logger.info('📊 PAA Metadata available for build');

        if (metadata) {
          // Log legal compliance status
          const compliance = metadata.machines.statistics.legalCompliance;
          const total = metadata.machines.totalMachines;
          const percentCompliant = ((compliance.upToDate / total) * 100).toFixed(1);

          logger.info(`   Legal compliance: ${percentCompliant}% up to date`);
          if (compliance.needsReview > 0) {
            logger.warn(`   ⚠️  ${compliance.needsReview} machines need review`);
          }
          if (compliance.missingMetadata > 0) {
            logger.warn(`   ⚠️  ${compliance.missingMetadata} machines missing legal metadata`);
          }
        }
      },

      'astro:build:done': async ({ logger }) => {
        logger.info('✨ PAA Metadata Integration: Build completed');
      },
    },
  };
}

// ============================================================================
// Helper Functions for Pages
// ============================================================================

/**
 * Get the complete metadata from the global store
 * This function should be called in Astro components/pages
 */
export function getMetadata(): CompleteMetadata | null {
  return (global as any).__PAA_METADATA__ || null;
}

/**
 * Get machines metadata
 */
export function getMachinesMetadata() {
  const metadata = getMetadata();
  return metadata?.machines || null;
}

/**
 * Get rules metadata
 */
export function getRulesMetadata() {
  const metadata = getMetadata();
  return metadata?.rules || null;
}

/**
 * Get features metadata
 */
export function getFeaturesMetadata() {
  const metadata = getMetadata();
  return metadata?.features || null;
}

/**
 * Get lineage information
 */
export function getLineageData() {
  const metadata = getMetadata();
  return metadata?.lineage || null;
}

/**
 * Get machine by ID with full metadata
 */
export function getMachineById(id: string): MachineMeta | null {
  const metadata = getMachinesMetadata();
  return metadata?.machines.find(m => m.id === id) || null;
}

/**
 * Get rule by ID with full metadata
 */
export function getRuleById(id: string): RuleMeta | null {
  const metadata = getRulesMetadata();
  if (!metadata) return null;

  for (const rules of Object.values(metadata.rulesByCategory)) {
    const rule = rules.find(r => r.id === id);
    if (rule) return rule;
  }

  return null;
}

/**
 * Get feature by ID with full metadata
 */
export function getFeatureById(id: string): Feature | null {
  const metadata = getFeaturesMetadata();
  return metadata?.features.find(f => f.id === id) || null;
}

/**
 * Get related entities for a machine
 */
export function getMachineRelations(machineId: string) {
  const lineage = getLineageData();
  const features = getFeaturesMetadata();
  const rules = getRulesMetadata();

  if (!lineage || !features || !rules) return null;

  // Get direct relationships
  const relationships = lineage.machineRelationships[machineId] || {
    parents: [],
    children: [],
    siblings: [],
  };

  // Find related features
  const relatedFeatures = features.features.filter(f =>
    f.relatedMachines?.includes(machineId)
  );

  // Find related rules
  const relatedRules: RuleMeta[] = [];
  for (const ruleList of Object.values(rules.rulesByCategory)) {
    relatedRules.push(...ruleList.filter(r =>
      r.relatedMachines?.includes(machineId)
    ));
  }

  return {
    ...relationships,
    features: relatedFeatures,
    rules: relatedRules,
  };
}