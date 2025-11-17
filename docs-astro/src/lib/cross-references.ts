/**
 * Cross-Reference Library for Workflows, Features, and Rules
 *
 * This library establishes relationships between different document types
 * based on benefit type, category, and keyword matching.
 */

import type { MachineMeta, MachinesMetadata } from './machines.ts';
import type { Feature, FeaturesMetadata } from './feature-types.ts';
import type { RuleMeta, RulesMetadata } from './rules.ts';
import { loadMachinesMetadata } from './machines.ts';
import { loadFeaturesMetadata } from './features.ts';
import { loadRulesMetadata, getAllRules } from './rules.ts';

// Benefit type extraction patterns
const BENEFIT_PATTERNS = {
  ris: /ris|revenu.*int[eé]gration|integration.*income/i,
  agr: /agr|allocation.*garantie.*revenus?|income.*guarantee/i,
  grapa: /grapa|garantie.*revenus.*personnes.*[aâ]g[eé]es/i,
  allocations_familiales: /allocations?.*familia|family.*allowance|kindergeld/i,
  chomage: /ch[oô]mage|unemployment|werkloosheid/i,
  pension: /pension|retirement|pensioen/i,
  handicap: /handicap|disability|invalidit[eé]|beperking/i,
  logement: /logement|housing|huisvesting|woning/i,
  energie: /[eé]nergie|energy|elektriciteit|gas/i,
  aide_sociale: /aide.*sociale|social.*assistance|sociale.*bijstand/i,
};

// Category mapping for cross-domain relationships
const CATEGORY_RELATIONSHIPS: Record<string, string[]> = {
  social: ['benefits', 'aide-sociale', 'allocations'],
  fiscal: ['tax', 'impots', 'fiscalite'],
  housing: ['logement', 'energie', 'habitat'],
  administrative: ['legal', 'conversion', 'workflow'],
  healthcare: ['sante', 'mutuelle', 'medical'],
};

interface CrossReferenceMatch {
  id: string;
  name: string;
  description?: string;
  category: string;
  matchScore: number;
  matchReasons: string[];
}

/**
 * Extract benefit type from ID, name, or file path
 */
function extractBenefitType(text: string): string[] {
  const benefitTypes: string[] = [];

  for (const [benefit, pattern] of Object.entries(BENEFIT_PATTERNS)) {
    if (pattern.test(text)) {
      benefitTypes.push(benefit);
    }
  }

  return benefitTypes;
}

/**
 * Calculate similarity score between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Check if categories are related
 */
function areCategoriesRelated(cat1: string, cat2: string): boolean {
  if (cat1 === cat2) return true;

  const cat1Lower = cat1.toLowerCase();
  const cat2Lower = cat2.toLowerCase();

  for (const [mainCat, related] of Object.entries(CATEGORY_RELATIONSHIPS)) {
    const allRelated = [mainCat, ...related];
    if (allRelated.includes(cat1Lower) && allRelated.includes(cat2Lower)) {
      return true;
    }
  }

  return false;
}

/**
 * Match keywords between different metadata types
 */
function matchKeywords(keywords1: string[], keywords2: string[]): number {
  if (!keywords1 || !keywords2) return 0;

  let matches = 0;
  for (const kw1 of keywords1) {
    for (const kw2 of keywords2) {
      const similarity = calculateSimilarity(kw1.toLowerCase(), kw2.toLowerCase());
      if (similarity > 0.8) {
        matches++;
      }
    }
  }

  return matches;
}

/**
 * Get related features for a workflow
 */
export async function getRelatedFeatures(workflowId: string): Promise<CrossReferenceMatch[]> {
  const [machinesMetadata, featuresMetadata] = await Promise.all([
    loadMachinesMetadata(),
    loadFeaturesMetadata()
  ]);

  const workflow = machinesMetadata.machines.find(m => m.id === workflowId);
  if (!workflow) return [];

  const workflowBenefits = extractBenefitType(`${workflow.id} ${workflow.name} ${workflow.description || ''}`);
  const matches: CrossReferenceMatch[] = [];

  for (const feature of featuresMetadata.features) {
    let score = 0;
    const reasons: string[] = [];

    // Check benefit type match
    const featureBenefits = extractBenefitType(`${feature.id} ${feature.name} ${feature.description || ''} ${feature.filePath}`);
    const benefitMatches = workflowBenefits.filter(b => featureBenefits.includes(b));
    if (benefitMatches.length > 0) {
      score += 30 * benefitMatches.length;
      reasons.push(`Benefit type match: ${benefitMatches.join(', ')}`);
    }

    // Check category relationship
    if (areCategoriesRelated(workflow.category, feature.category)) {
      score += 20;
      reasons.push(`Related category: ${feature.category}`);
    }

    // Check keyword matches
    const keywordMatches = matchKeywords(
      (workflow as any).keywords || [],
      feature.tags || []
    );
    if (keywordMatches > 0) {
      score += 10 * keywordMatches;
      reasons.push(`${keywordMatches} keyword matches`);
    }

    // Check name similarity
    const nameSimilarity = calculateSimilarity(
      workflow.name.toLowerCase(),
      feature.name.toLowerCase()
    );
    if (nameSimilarity > 0.5) {
      score += 15 * nameSimilarity;
      reasons.push(`Name similarity: ${Math.round(nameSimilarity * 100)}%`);
    }

    if (score > 20) {
      matches.push({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        matchScore: score,
        matchReasons: reasons
      });
    }
  }

  // Sort by score and return top matches
  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

/**
 * Get related rules for a workflow
 */
export async function getRelatedRules(workflowId: string): Promise<CrossReferenceMatch[]> {
  const [machinesMetadata, rulesMetadata] = await Promise.all([
    loadMachinesMetadata(),
    loadRulesMetadata()
  ]);

  const workflow = machinesMetadata.machines.find(m => m.id === workflowId);
  if (!workflow) return [];

  const workflowBenefits = extractBenefitType(`${workflow.id} ${workflow.name} ${workflow.description || ''}`);
  const allRules = getAllRules(rulesMetadata);
  const matches: CrossReferenceMatch[] = [];

  for (const rule of allRules) {
    let score = 0;
    const reasons: string[] = [];

    // Check benefit type match
    const ruleBenefits = extractBenefitType(
      `${rule.id} ${rule.fileName} ${rule.description || ''} ${rule.benefitType || ''}`
    );
    const benefitMatches = workflowBenefits.filter(b => ruleBenefits.includes(b));
    if (benefitMatches.length > 0) {
      score += 35 * benefitMatches.length;
      reasons.push(`Benefit type match: ${benefitMatches.join(', ')}`);
    }

    // Direct benefit type match
    if (rule.benefitType && workflowBenefits.includes(rule.benefitType.toLowerCase())) {
      score += 25;
      reasons.push(`Direct benefit type: ${rule.benefitType}`);
    }

    // Check category relationship
    if (areCategoriesRelated(workflow.category, rule.category)) {
      score += 20;
      reasons.push(`Related category: ${rule.category}`);
    }

    // Check if rule facts match workflow events
    const workflowEvents = workflow.events || [];
    const ruleFacts = rule.conditions.all?.map(c => c.fact) || [];
    ruleFacts.push(...(rule.conditions.any?.map(c => c.fact) || []));

    const factEventMatches = workflowEvents.filter(event =>
      ruleFacts.some(fact =>
        calculateSimilarity(event.toLowerCase(), fact.toLowerCase()) > 0.6
      )
    );

    if (factEventMatches.length > 0) {
      score += 15 * factEventMatches.length;
      reasons.push(`${factEventMatches.length} fact-event matches`);
    }

    // Check name/ID similarity
    const nameSimilarity = calculateSimilarity(
      workflow.id.toLowerCase(),
      rule.id.toLowerCase()
    );
    if (nameSimilarity > 0.4) {
      score += 10 * nameSimilarity;
      reasons.push(`ID similarity: ${Math.round(nameSimilarity * 100)}%`);
    }

    if (score > 20) {
      matches.push({
        id: rule.id,
        name: rule.id.replace(/([A-Z])/g, ' $1').trim(),
        description: rule.description,
        category: rule.category,
        matchScore: score,
        matchReasons: reasons
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

/**
 * Get related workflows for a feature
 */
export async function getRelatedWorkflows(featureId: string): Promise<CrossReferenceMatch[]> {
  const [machinesMetadata, featuresMetadata] = await Promise.all([
    loadMachinesMetadata(),
    loadFeaturesMetadata()
  ]);

  const feature = featuresMetadata.features.find(f => f.id === featureId);
  if (!feature) return [];

  const featureBenefits = extractBenefitType(
    `${feature.id} ${feature.name} ${feature.description || ''} ${feature.filePath}`
  );
  const matches: CrossReferenceMatch[] = [];

  for (const machine of machinesMetadata.machines) {
    let score = 0;
    const reasons: string[] = [];

    // Check benefit type match
    const machineBenefits = extractBenefitType(
      `${machine.id} ${machine.name} ${machine.description || ''}`
    );
    const benefitMatches = featureBenefits.filter(b => machineBenefits.includes(b));
    if (benefitMatches.length > 0) {
      score += 30 * benefitMatches.length;
      reasons.push(`Benefit type match: ${benefitMatches.join(', ')}`);
    }

    // Check category relationship
    if (areCategoriesRelated(feature.category, machine.category)) {
      score += 20;
      reasons.push(`Related category: ${machine.category}`);
    }

    // Check keyword/tag matches
    const keywordMatches = matchKeywords(
      feature.tags || [],
      (machine as any).keywords || []
    );
    if (keywordMatches > 0) {
      score += 10 * keywordMatches;
      reasons.push(`${keywordMatches} keyword matches`);
    }

    // Check if feature scenarios match workflow states
    const scenarioNames = feature.scenarios?.map(s => s.name.toLowerCase()) || [];
    const stateMatches = machine.states?.filter(state =>
      scenarioNames.some(scenario =>
        calculateSimilarity(state.toLowerCase(), scenario) > 0.5
      )
    ) || [];

    if (stateMatches.length > 0) {
      score += 8 * stateMatches.length;
      reasons.push(`${stateMatches.length} state-scenario matches`);
    }

    // Check name similarity
    const nameSimilarity = calculateSimilarity(
      feature.name.toLowerCase(),
      machine.name.toLowerCase()
    );
    if (nameSimilarity > 0.5) {
      score += 15 * nameSimilarity;
      reasons.push(`Name similarity: ${Math.round(nameSimilarity * 100)}%`);
    }

    if (score > 20) {
      matches.push({
        id: machine.id,
        name: machine.name,
        description: machine.description,
        category: machine.category,
        matchScore: score,
        matchReasons: reasons
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

/**
 * Get related rules for a feature
 */
export async function getRelatedRulesForFeature(featureId: string): Promise<CrossReferenceMatch[]> {
  const [featuresMetadata, rulesMetadata] = await Promise.all([
    loadFeaturesMetadata(),
    loadRulesMetadata()
  ]);

  const feature = featuresMetadata.features.find(f => f.id === featureId);
  if (!feature) return [];

  const featureBenefits = extractBenefitType(
    `${feature.id} ${feature.name} ${feature.description || ''} ${feature.filePath}`
  );
  const allRules = getAllRules(rulesMetadata);
  const matches: CrossReferenceMatch[] = [];

  for (const rule of allRules) {
    let score = 0;
    const reasons: string[] = [];

    // Check benefit type match
    const ruleBenefits = extractBenefitType(
      `${rule.id} ${rule.fileName} ${rule.description || ''} ${rule.benefitType || ''}`
    );
    const benefitMatches = featureBenefits.filter(b => ruleBenefits.includes(b));
    if (benefitMatches.length > 0) {
      score += 35 * benefitMatches.length;
      reasons.push(`Benefit type match: ${benefitMatches.join(', ')}`);
    }

    // Check category relationship
    if (areCategoriesRelated(feature.category, rule.category)) {
      score += 20;
      reasons.push(`Related category: ${rule.category}`);
    }

    // Check if rule conditions match feature scenarios
    const scenarioSteps = feature.scenarios?.flatMap(s =>
      s.steps?.map(step => step.text.toLowerCase()) || []
    ) || [];

    const ruleFacts = rule.conditions.all?.map(c => c.fact) || [];
    ruleFacts.push(...(rule.conditions.any?.map(c => c.fact) || []));

    const factMatches = ruleFacts.filter(fact =>
      scenarioSteps.some(step => step.includes(fact.toLowerCase()))
    );

    if (factMatches.length > 0) {
      score += 12 * factMatches.length;
      reasons.push(`${factMatches.length} fact matches in scenarios`);
    }

    // Check file path similarity (e.g., features/benefits/ris.feature -> risRules)
    const pathParts = feature.filePath.toLowerCase().split('/');
    const fileNameMatch = pathParts.some(part =>
      rule.fileName.toLowerCase().includes(part.replace('.feature', ''))
    );
    if (fileNameMatch) {
      score += 25;
      reasons.push('File path correlation');
    }

    if (score > 20) {
      matches.push({
        id: rule.id,
        name: rule.id.replace(/([A-Z])/g, ' $1').trim(),
        description: rule.description,
        category: rule.category,
        matchScore: score,
        matchReasons: reasons
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

/**
 * Get related workflows for a rule
 */
export async function getRelatedWorkflowsForRule(ruleId: string): Promise<CrossReferenceMatch[]> {
  const [machinesMetadata, rulesMetadata] = await Promise.all([
    loadMachinesMetadata(),
    loadRulesMetadata()
  ]);

  const rule = getAllRules(rulesMetadata).find(r => r.id === ruleId);
  if (!rule) return [];

  const ruleBenefits = extractBenefitType(
    `${rule.id} ${rule.fileName} ${rule.description || ''} ${rule.benefitType || ''}`
  );
  const matches: CrossReferenceMatch[] = [];

  for (const machine of machinesMetadata.machines) {
    let score = 0;
    const reasons: string[] = [];

    // Check benefit type match
    const machineBenefits = extractBenefitType(
      `${machine.id} ${machine.name} ${machine.description || ''}`
    );
    const benefitMatches = ruleBenefits.filter(b => machineBenefits.includes(b));
    if (benefitMatches.length > 0) {
      score += 35 * benefitMatches.length;
      reasons.push(`Benefit type match: ${benefitMatches.join(', ')}`);
    }

    // Check category relationship
    if (areCategoriesRelated(rule.category, machine.category)) {
      score += 20;
      reasons.push(`Related category: ${machine.category}`);
    }

    // Check if rule facts match workflow events
    const ruleFacts = rule.conditions.all?.map(c => c.fact) || [];
    ruleFacts.push(...(rule.conditions.any?.map(c => c.fact) || []));

    const eventMatches = machine.events?.filter(event =>
      ruleFacts.some(fact =>
        calculateSimilarity(event.toLowerCase(), fact.toLowerCase()) > 0.6
      )
    ) || [];

    if (eventMatches.length > 0) {
      score += 15 * eventMatches.length;
      reasons.push(`${eventMatches.length} event-fact matches`);
    }

    // Check rule event type against workflow ID
    if (rule.event?.type) {
      const eventTypeSimilarity = calculateSimilarity(
        rule.event.type.toLowerCase(),
        machine.id.toLowerCase()
      );
      if (eventTypeSimilarity > 0.5) {
        score += 20 * eventTypeSimilarity;
        reasons.push(`Event type match: ${Math.round(eventTypeSimilarity * 100)}%`);
      }
    }

    if (score > 20) {
      matches.push({
        id: machine.id,
        name: machine.name,
        description: machine.description,
        category: machine.category,
        matchScore: score,
        matchReasons: reasons
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

/**
 * Get related features for a rule
 */
export async function getRelatedFeaturesForRule(ruleId: string): Promise<CrossReferenceMatch[]> {
  const [featuresMetadata, rulesMetadata] = await Promise.all([
    loadFeaturesMetadata(),
    loadRulesMetadata()
  ]);

  const rule = getAllRules(rulesMetadata).find(r => r.id === ruleId);
  if (!rule) return [];

  const ruleBenefits = extractBenefitType(
    `${rule.id} ${rule.fileName} ${rule.description || ''} ${rule.benefitType || ''}`
  );
  const matches: CrossReferenceMatch[] = [];

  for (const feature of featuresMetadata.features) {
    let score = 0;
    const reasons: string[] = [];

    // Check benefit type match
    const featureBenefits = extractBenefitType(
      `${feature.id} ${feature.name} ${feature.description || ''} ${feature.filePath}`
    );
    const benefitMatches = ruleBenefits.filter(b => featureBenefits.includes(b));
    if (benefitMatches.length > 0) {
      score += 35 * benefitMatches.length;
      reasons.push(`Benefit type match: ${benefitMatches.join(', ')}`);
    }

    // Check category relationship
    if (areCategoriesRelated(rule.category, feature.category)) {
      score += 20;
      reasons.push(`Related category: ${feature.category}`);
    }

    // Check if rule facts appear in feature scenarios
    const ruleFacts = rule.conditions.all?.map(c => c.fact.toLowerCase()) || [];
    ruleFacts.push(...(rule.conditions.any?.map(c => c.fact.toLowerCase()) || []));

    const scenarioTexts = feature.scenarios?.flatMap(s => [
      s.name.toLowerCase(),
      ...(s.steps?.map(step => step.text.toLowerCase()) || [])
    ]) || [];

    const factMatches = ruleFacts.filter(fact =>
      scenarioTexts.some(text => text.includes(fact))
    );

    if (factMatches.length > 0) {
      score += 12 * factMatches.length;
      reasons.push(`${factMatches.length} facts found in scenarios`);
    }

    // Check file name correlation
    const ruleFileBase = rule.fileName.toLowerCase().replace('rules', '').replace('.ts', '');
    const featureFileBase = feature.filePath.toLowerCase();

    if (featureFileBase.includes(ruleFileBase) || ruleFileBase.includes(feature.id.toLowerCase())) {
      score += 25;
      reasons.push('File name correlation');
    }

    if (score > 20) {
      matches.push({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        matchScore: score,
        matchReasons: reasons
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

/**
 * Get all cross-references for a workflow
 */
export async function getAllCrossReferencesForWorkflow(workflowId: string) {
  const [features, rules] = await Promise.all([
    getRelatedFeatures(workflowId),
    getRelatedRules(workflowId)
  ]);

  return {
    features,
    rules,
    total: features.length + rules.length
  };
}

/**
 * Get all cross-references for a feature
 */
export async function getAllCrossReferencesForFeature(featureId: string) {
  const [workflows, rules] = await Promise.all([
    getRelatedWorkflows(featureId),
    getRelatedRulesForFeature(featureId)
  ]);

  return {
    workflows,
    rules,
    total: workflows.length + rules.length
  };
}

/**
 * Get all cross-references for a rule
 */
export async function getAllCrossReferencesForRule(ruleId: string) {
  const [workflows, features] = await Promise.all([
    getRelatedWorkflowsForRule(ruleId),
    getRelatedFeaturesForRule(ruleId)
  ]);

  return {
    workflows,
    features,
    total: workflows.length + features.length
  };
}

/**
 * Generate cross-reference statistics
 */
export async function generateCrossReferenceStats() {
  const [machinesMetadata, featuresMetadata, rulesMetadata] = await Promise.all([
    loadMachinesMetadata(),
    loadFeaturesMetadata(),
    loadRulesMetadata()
  ]);

  const allRules = getAllRules(rulesMetadata);

  let totalWorkflowLinks = 0;
  let totalFeatureLinks = 0;
  let totalRuleLinks = 0;

  // Count workflow cross-references
  for (const machine of machinesMetadata.machines) {
    const refs = await getAllCrossReferencesForWorkflow(machine.id);
    totalWorkflowLinks += refs.total;
  }

  // Count feature cross-references
  for (const feature of featuresMetadata.features) {
    const refs = await getAllCrossReferencesForFeature(feature.id);
    totalFeatureLinks += refs.total;
  }

  // Count rule cross-references
  for (const rule of allRules) {
    const refs = await getAllCrossReferencesForRule(rule.id);
    totalRuleLinks += refs.total;
  }

  return {
    totalWorkflows: machinesMetadata.machines.length,
    totalFeatures: featuresMetadata.features.length,
    totalRules: allRules.length,
    totalWorkflowCrossReferences: totalWorkflowLinks,
    totalFeatureCrossReferences: totalFeatureLinks,
    totalRuleCrossReferences: totalRuleLinks,
    averageWorkflowLinks: (totalWorkflowLinks / machinesMetadata.machines.length).toFixed(1),
    averageFeatureLinks: (totalFeatureLinks / featuresMetadata.features.length).toFixed(1),
    averageRuleLinks: (totalRuleLinks / allRules.length).toFixed(1),
    totalCrossReferences: totalWorkflowLinks + totalFeatureLinks + totalRuleLinks
  };
}