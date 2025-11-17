/**
 * Claude AI Integration for Automated Feature & Rules Updates
 *
 * Uses Anthropic API to:
 * - Rewrite feature files when legal changes are detected
 * - Update rules to match new feature specifications
 * - Generate version-compliant code
 */

import { MonitoringReport, AmountChange, LegalTextChange } from '../utils/legalSourceMonitor';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface ClaudeAPIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface FeatureRewriteRequest {
  benefitId: string;
  currentFeatureContent: string;
  changes: {
    amounts?: AmountChange[];
    legalTexts?: LegalTextChange[];
  };
  currentVersion: string;
  newVersion: string;
}

export interface RulesRewriteRequest {
  benefitId: string;
  currentRulesContent: string;
  newFeatureContent: string;
  currentVersion: string;
  newVersion: string;
}

export interface AIRewriteResult {
  success: boolean;
  benefitId: string;
  componentType: 'feature' | 'rules';
  newContent?: string;
  newVersion?: string;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
  requiresHumanReview: boolean;
  warnings: string[];
}

// ============================================================================
// CLAUDE API CLIENT
// ============================================================================

/**
 * Call Claude API with a prompt
 * NOTE: This is a placeholder. In production, use @anthropic-ai/sdk
 */
async function callClaudeAPI(
  prompt: string,
  config: ClaudeAPIConfig
): Promise<string> {
  // PLACEHOLDER: In production, use actual Anthropic SDK
  // Example:
  // const Anthropic = require('@anthropic-ai/sdk');
  // const client = new Anthropic({ apiKey: config.apiKey });
  //
  // const message = await client.messages.create({
  //   model: config.model,
  //   max_tokens: config.maxTokens,
  //   messages: [{ role: 'user', content: prompt }],
  // });
  //
  // return message.content[0].text;

  console.log('[PLACEHOLDER] Would call Claude API with prompt length:', prompt.length);
  console.log('[PLACEHOLDER] Model:', config.model);

  // Return placeholder response
  return `PLACEHOLDER: AI-generated content would appear here.\n\n${prompt.substring(0, 200)}...`;
}

// ============================================================================
// SPECIALIZED PROMPTS
// ============================================================================

/**
 * Generate prompt for rewriting feature file
 */
function generateFeatureRewritePrompt(request: FeatureRewriteRequest): string {
  const lines: string[] = [];

  lines.push('# Task: Update Gherkin Feature File for Belgian Social Benefit');
  lines.push('');
  lines.push('You are a legal-tech expert specialized in Belgian social security law.');
  lines.push('Your task is to update a Gherkin feature file based on detected legal changes.');
  lines.push('');

  lines.push('## Context');
  lines.push(`- Benefit: ${request.benefitId.toUpperCase()}`);
  lines.push(`- Current version: ${request.currentVersion}`);
  lines.push(`- New version: ${request.newVersion}`);
  lines.push('');

  lines.push('## Detected Changes');
  lines.push('');

  if (request.changes.amounts && request.changes.amounts.length > 0) {
    lines.push('### Amount Changes (Indexation)');
    lines.push('');
    lines.push('| Type | Old Value | New Value | Effective Date |');
    lines.push('|------|-----------|-----------|----------------|');

    for (const change of request.changes.amounts) {
      lines.push(
        `| ${change.amountType} | ${change.oldValue}€ | ${change.newValue}€ | ${change.effectiveDate} |`
      );
    }
    lines.push('');
  }

  if (request.changes.legalTexts && request.changes.legalTexts.length > 0) {
    lines.push('### Legal Text Changes');
    lines.push('');

    for (const change of request.changes.legalTexts) {
      lines.push(`- **Type**: ${change.changeType}`);
      lines.push(`- **Description**: ${change.description}`);
      lines.push(`- **Effective Date**: ${change.effectiveDate || 'TBD'}`);
      lines.push(`- **Articles**: ${change.articleNumbers?.join(', ') || 'N/A'}`);
      lines.push('');
    }
  }

  lines.push('## Current Feature File');
  lines.push('');
  lines.push('```gherkin');
  lines.push(request.currentFeatureContent);
  lines.push('```');
  lines.push('');

  lines.push('## Instructions');
  lines.push('');
  lines.push('1. Update the feature file header metadata:');
  lines.push(`   - Change @specification-version to: ${request.newVersion}`);
  lines.push(`   - Update @effective-date to match the changes`);
  lines.push(`   - Add @change-reason describing what changed`);
  lines.push('');
  lines.push('2. Update all monetary amounts in scenarios to reflect the new values');
  lines.push('3. Update the "Contexte" section with new amounts if applicable');
  lines.push('4. If legal conditions changed, add/modify scenarios accordingly');
  lines.push('5. Preserve all existing structure and formatting');
  lines.push('6. Keep the language in French (fr)');
  lines.push('');

  lines.push('## CRITICAL REQUIREMENTS');
  lines.push('');
  lines.push('- The version MUST be: ' + request.newVersion);
  lines.push('- ALL amounts must be updated consistently');
  lines.push('- Maintain Gherkin syntax validity');
  lines.push('- Keep semantic accuracy with Belgian legal framework');
  lines.push('- Add a @change-reason tag explaining the update');
  lines.push('');

  lines.push('## Output Format');
  lines.push('');
  lines.push('Return ONLY the updated feature file content, with NO additional explanation.');
  lines.push('Start with: # language: fr');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate prompt for rewriting rules file
 */
function generateRulesRewritePrompt(request: RulesRewriteRequest): string {
  const lines: string[] = [];

  lines.push('# Task: Update TypeScript Rules File to Match Feature Specification');
  lines.push('');
  lines.push('You are an expert TypeScript developer working on a Belgian social benefits system.');
  lines.push('Your task is to update a rules implementation file to match an updated feature specification.');
  lines.push('');

  lines.push('## Context');
  lines.push(`- Benefit: ${request.benefitId.toUpperCase()}`);
  lines.push(`- Current version: ${request.currentVersion}`);
  lines.push(`- New version: ${request.newVersion}`);
  lines.push('');

  lines.push('## Updated Feature Specification');
  lines.push('');
  lines.push('```gherkin');
  lines.push(request.newFeatureContent);
  lines.push('```');
  lines.push('');

  lines.push('## Current Rules Implementation');
  lines.push('');
  lines.push('```typescript');
  lines.push(request.currentRulesContent);
  lines.push('```');
  lines.push('');

  lines.push('## Instructions');
  lines.push('');
  lines.push('1. Update the metadata object to reflect the new version:');
  lines.push('   ```typescript');
  lines.push('   export const XXX_RULES_METADATA = {');
  lines.push(`     implementsSpecification: '${request.newVersion}',`);
  lines.push(`     implementationVersion: '${request.newVersion}',`);
  lines.push('     implementationStatus: \'complete\' as const,');
  lines.push('     // ... update other fields');
  lines.push('   };');
  lines.push('   ```');
  lines.push('');
  lines.push('2. Update all amount constants to match the feature file');
  lines.push('3. Update any calculation logic if conditions changed');
  lines.push('4. Maintain all existing TypeScript patterns and types');
  lines.push('5. Preserve legal references and comments');
  lines.push('6. Ensure the rules correctly implement the feature scenarios');
  lines.push('');

  lines.push('## CRITICAL REQUIREMENTS');
  lines.push('');
  lines.push('- Rules MUST implement specification version: ' + request.newVersion);
  lines.push('- All amounts MUST match the feature file exactly');
  lines.push('- TypeScript must compile without errors');
  lines.push('- Preserve all imports and exports');
  lines.push('- Maintain json-rules-engine patterns');
  lines.push('- Update `effectiveDate` in metadata');
  lines.push('');

  lines.push('## Output Format');
  lines.push('');
  lines.push('Return ONLY the updated TypeScript file content, with NO additional explanation.');
  lines.push('Preserve all file structure, imports, and exports.');
  lines.push('');

  return lines.join('\n');
}

// ============================================================================
// REWRITING FUNCTIONS
// ============================================================================

/**
 * Rewrite feature file using Claude AI
 */
export async function rewriteFeatureWithAI(
  request: FeatureRewriteRequest,
  config: ClaudeAPIConfig
): Promise<AIRewriteResult> {
  console.log(`🤖 Rewriting feature file for ${request.benefitId} using Claude AI...`);

  try {
    const prompt = generateFeatureRewritePrompt(request);
    const newContent = await callClaudeAPI(prompt, config);

    // Validate the response
    const validation = validateFeatureContent(newContent, request.newVersion);

    return {
      success: validation.isValid,
      benefitId: request.benefitId,
      componentType: 'feature',
      newContent: validation.isValid ? newContent : undefined,
      newVersion: request.newVersion,
      confidence: validation.confidence,
      requiresHumanReview: validation.warnings.length > 0 || !validation.isValid,
      warnings: validation.warnings,
    };
  } catch (error) {
    return {
      success: false,
      benefitId: request.benefitId,
      componentType: 'feature',
      error: error instanceof Error ? error.message : 'Unknown error',
      confidence: 'low',
      requiresHumanReview: true,
      warnings: ['AI rewrite failed'],
    };
  }
}

/**
 * Rewrite rules file using Claude AI
 */
export async function rewriteRulesWithAI(
  request: RulesRewriteRequest,
  config: ClaudeAPIConfig
): Promise<AIRewriteResult> {
  console.log(`🤖 Rewriting rules file for ${request.benefitId} using Claude AI...`);

  try {
    const prompt = generateRulesRewritePrompt(request);
    const newContent = await callClaudeAPI(prompt, config);

    // Validate the response
    const validation = validateRulesContent(newContent, request.newVersion);

    return {
      success: validation.isValid,
      benefitId: request.benefitId,
      componentType: 'rules',
      newContent: validation.isValid ? newContent : undefined,
      newVersion: request.newVersion,
      confidence: validation.confidence,
      requiresHumanReview: validation.warnings.length > 0 || !validation.isValid,
      warnings: validation.warnings,
    };
  } catch (error) {
    return {
      success: false,
      benefitId: request.benefitId,
      componentType: 'rules',
      error: error instanceof Error ? error.message : 'Unknown error',
      confidence: 'low',
      requiresHumanReview: true,
      warnings: ['AI rewrite failed'],
    };
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate generated feature content
 */
function validateFeatureContent(
  content: string,
  expectedVersion: string
): {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
} {
  const warnings: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // Check if starts with # language: fr
  if (!content.startsWith('# language: fr')) {
    warnings.push('Missing Gherkin language declaration');
    confidence = 'medium';
  }

  // Check if version is present
  if (!content.includes(expectedVersion)) {
    warnings.push(`Expected version ${expectedVersion} not found in content`);
    confidence = 'low';
  }

  // Check for @specification-version tag
  if (!content.includes('@specification-version:')) {
    warnings.push('Missing @specification-version metadata tag');
    confidence = 'low';
  }

  // Check for "Fonctionnalité:" keyword
  if (!content.includes('Fonctionnalité:')) {
    warnings.push('Missing "Fonctionnalité:" keyword - invalid Gherkin');
    return { isValid: false, confidence: 'low', warnings };
  }

  // Check for monetary amounts (should have € symbol)
  if (!content.includes('€')) {
    warnings.push('No monetary amounts found (missing € symbol)');
    confidence = 'medium';
  }

  const isValid = warnings.filter(w =>
    w.includes('invalid') || w.includes('not found')
  ).length === 0;

  return { isValid, confidence, warnings };
}

/**
 * Validate generated rules content
 */
function validateRulesContent(
  content: string,
  expectedVersion: string
): {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
} {
  const warnings: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // Check for TypeScript import statements
  if (!content.includes('import')) {
    warnings.push('Missing import statements - likely invalid TypeScript');
    return { isValid: false, confidence: 'low', warnings };
  }

  // Check for metadata export
  if (!content.includes('_RULES_METADATA')) {
    warnings.push('Missing RULES_METADATA export');
    confidence = 'low';
  }

  // Check if version is present in metadata
  if (!content.includes(`implementsSpecification: '${expectedVersion}'`)) {
    warnings.push(`Expected version ${expectedVersion} not found in metadata`);
    confidence = 'low';
  }

  // Check for json-rules-engine imports
  if (!content.includes('json-rules-engine')) {
    warnings.push('Missing json-rules-engine import');
    confidence = 'medium';
  }

  // Check for export statements
  if (!content.includes('export')) {
    warnings.push('Missing export statements');
    return { isValid: false, confidence: 'low', warnings };
  }

  const isValid = warnings.filter(w =>
    w.includes('invalid') || w.includes('Missing') && w.includes('TypeScript')
  ).length === 0;

  return { isValid, confidence, warnings };
}

// ============================================================================
// ORCHESTRATION
// ============================================================================

/**
 * Process monitoring report and generate AI rewrites for all affected benefits
 */
export async function processMonitoringReportWithAI(
  report: MonitoringReport,
  config: ClaudeAPIConfig
): Promise<Map<string, { feature: AIRewriteResult; rules: AIRewriteResult }>> {
  const results = new Map();

  for (const benefitId of report.affectedBenefits) {
    console.log(`\n📝 Processing ${benefitId.toUpperCase()}...`);

    // Determine version bump
    const currentVersion = getCurrentVersion(benefitId);
    const newVersion = bumpVersion(currentVersion);

    // Read current files
    const featurePath = getFeaturePath(benefitId);
    const rulesPath = getRulesPath(benefitId);

    const currentFeature = fs.existsSync(featurePath)
      ? fs.readFileSync(featurePath, 'utf-8')
      : '';
    const currentRules = fs.existsSync(rulesPath)
      ? fs.readFileSync(rulesPath, 'utf-8')
      : '';

    // Get changes for this benefit
    const benefitChanges = {
      amounts: report.amountChanges.filter(c => c.benefitId === benefitId),
      legalTexts: report.legalTextChanges.filter(c => c.benefitId === benefitId),
    };

    // Rewrite feature
    const featureResult = await rewriteFeatureWithAI(
      {
        benefitId,
        currentFeatureContent: currentFeature,
        changes: benefitChanges,
        currentVersion,
        newVersion,
      },
      config
    );

    console.log(`  Feature rewrite: ${featureResult.success ? '✅' : '❌'}`);
    if (featureResult.warnings.length > 0) {
      console.log(`  Warnings: ${featureResult.warnings.join(', ')}`);
    }

    // Rewrite rules (using new feature content)
    const rulesResult = await rewriteRulesWithAI(
      {
        benefitId,
        currentRulesContent: currentRules,
        newFeatureContent: featureResult.newContent || currentFeature,
        currentVersion,
        newVersion,
      },
      config
    );

    console.log(`  Rules rewrite: ${rulesResult.success ? '✅' : '❌'}`);
    if (rulesResult.warnings.length > 0) {
      console.log(`  Warnings: ${rulesResult.warnings.join(', ')}`);
    }

    results.set(benefitId, { feature: featureResult, rules: rulesResult });
  }

  return results;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentVersion(benefitId: string): string {
  // Read current version from feature file
  const featurePath = getFeaturePath(benefitId);
  if (!fs.existsSync(featurePath)) return '1.0.0';

  const content = fs.readFileSync(featurePath, 'utf-8');
  const match = content.match(/@specification-version:([^\n]+)/);
  return match ? match[1].trim() : '1.0.0';
}

function bumpVersion(currentVersion: string): string {
  const [year, minor, patch] = currentVersion.split('.').map(Number);
  const currentYear = new Date().getFullYear();

  // If same year, bump minor
  if (year === currentYear) {
    return `${year}.${minor + 1}.0`;
  }

  // New year, reset to .1.0
  return `${currentYear}.1.0`;
}

function getFeaturePath(benefitId: string): string {
  const aliases: Record<string, string> = {
    'agr': 'income-guarantee',
    'ris': 'ris',
  };

  const fileName = aliases[benefitId] || benefitId;
  return path.join(process.cwd(), 'features', 'benefits', `${fileName}.feature`);
}

function getRulesPath(benefitId: string): string {
  return path.join(process.cwd(), 'src', 'rules', `${benefitId}Rules.ts`);
}
