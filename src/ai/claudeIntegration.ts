/**
 * Claude AI Integration for Automated Feature & Rules Updates
 *
 * Uses Anthropic API to:
 * - Rewrite feature files when legal changes are detected
 * - Update rules to match new feature specifications
 * - Generate version-compliant code
 */

import { MonitoringReport, AmountChange, LegalTextChange } from '../utils/legalSourceMonitor';
import { ClaudeAPIClient } from './claudeAPIClient';
import { checkVersionCompliance } from '../utils/versionCompliance';
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
  componentType: 'feature' | 'rules' | 'machine';
  newContent?: string;
  newVersion?: string;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
  requiresHumanReview: boolean;
  warnings: string[];
}

export interface LegalSourceInput {
  authority: string;
  title: string;
  officialUrl: string;
  publicationDate?: string;
  effectiveDate?: string;
  text?: string;
  articles?: string[];
  referenceNumber?: string;
}

// ============================================================================
// CLAUDE API CLIENT
// ============================================================================

/**
 * Call Claude API with a prompt
 * Uses real Claude API client
 */
async function callClaudeAPI(
  prompt: string,
  config: ClaudeAPIConfig
): Promise<string> {
  const client = new ClaudeAPIClient(config);
  return client.callClaudeAPI(prompt, { maxTokens: config.maxTokens });
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
  const [year, minor, _patch] = currentVersion.split('.').map(Number);
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

// ============================================================================
// POST-PROCESSING (Strip Markdown Wrappers)
// ============================================================================

/**
 * Strip markdown code block wrappers from generated content
 * Safety net in case Claude still includes them despite instructions
 */
function stripMarkdownWrapper(content: string): string {
  if (!content) return content;
  
  // Remove markdown code block wrappers at the start
  let cleaned = content
    .replace(/^```(?:gherkin|typescript|ts|javascript|js)?\n?/gm, '')
    .replace(/\n?```\s*$/gm, '')
    .trim();
  
  // Also handle cases where there might be language tags
  cleaned = cleaned.replace(/^```[a-z]+\n/gm, '').replace(/\n```$/gm, '');
  
  return cleaned.trim();
}

// ============================================================================
// INITIAL GENERATION FUNCTIONS (NEW)
// ============================================================================

/**
 * Generate Gherkin feature from legal text (INITIAL GENERATION)
 */
export async function generateFeatureFromLegalText(
  legalText: string,
  legalSource: LegalSourceInput,
  config: ClaudeAPIConfig
): Promise<AIRewriteResult> {
  console.log(`🤖 Generating feature file from legal text...`);

  try {
    const prompt = generateFeatureGenerationPrompt(legalText, legalSource);
    const rawContent = await callClaudeAPI(prompt, config);
    
    // Strip markdown wrappers as safety net
    const featureContent = stripMarkdownWrapper(rawContent);
    
    const validation = validateFeatureContent(featureContent, '1.0.0');
    
    return {
      success: validation.isValid,
      benefitId: generateFeatureId(legalSource.title),
      componentType: 'feature',
      newContent: validation.isValid ? featureContent : undefined,
      newVersion: '1.0.0',
      confidence: validation.confidence,
      requiresHumanReview: true, // Always review initial generation
      warnings: validation.warnings,
    };
  } catch (error) {
    return {
      success: false,
      benefitId: generateFeatureId(legalSource.title),
      componentType: 'feature',
      error: error instanceof Error ? error.message : 'Unknown error',
      confidence: 'low',
      requiresHumanReview: true,
      warnings: ['AI generation failed'],
    };
  }
}

function generateFeatureGenerationPrompt(
  legalText: string,
  legalSource: LegalSourceInput
): string {
  return `# Task: Generate Gherkin Feature File from Belgian Legal Text

You are a legal-tech expert specialized in Belgian social security law.
Convert this legal text into a Gherkin feature file.

## Legal Source
- Authority: ${legalSource.authority}
- Title: ${legalSource.title}
- URL: ${legalSource.officialUrl}
- Publication: ${legalSource.publicationDate || 'N/A'}
- Effective: ${legalSource.effectiveDate || 'N/A'}
${legalSource.referenceNumber ? `- Reference: ${legalSource.referenceNumber}` : ''}
${legalSource.articles ? `- Articles: ${legalSource.articles.join(', ')}` : ''}

## Legal Text
${legalText}

## Instructions
1. Create a Gherkin feature file in French
2. Extract eligibility conditions as scenarios
3. Include monetary amounts if present
4. Add metadata:
   - @specification-version:1.0.0
   - @legal-basis:${legalSource.title}
   - @legal-url:${legalSource.officialUrl}
   - @effective-date:${legalSource.effectiveDate || new Date().toISOString().split('T')[0]}

5. Follow this structure (return RAW content, NO markdown code blocks):
   # language: fr
   # @specification-version:1.0.0
   # @legal-basis:${legalSource.title}
   # @legal-url:${legalSource.officialUrl}
   # @effective-date:${legalSource.effectiveDate || new Date().toISOString().split('T')[0]}

   Fonctionnalité: [Name]
     En tant que [user]
     Je veux [goal]
     Afin de [benefit]

     Contexte:
       Étant donné que [background]

     Scénario: [Scenario name]
       Étant donné que [condition]
       Quand [action]
       Alors [outcome]

## CRITICAL REQUIREMENTS
- Return RAW file content, NO markdown code blocks (\`\`\`gherkin or \`\`\`)
- Start directly with: # language: fr
- Use French language
- Include all eligibility conditions
- Preserve all monetary amounts exactly
- Maintain semantic accuracy
- Valid Gherkin syntax
- Do NOT wrap the content in markdown code blocks

Return ONLY the raw feature file content, no markdown, no explanation.`;
}

/**
 * Generate rules from feature (INITIAL GENERATION)
 * Uses template-based approach: template provides structure, Claude fills in business logic
 */
export async function generateRulesFromFeature(
  feature: {
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
  },
  config: ClaudeAPIConfig
): Promise<AIRewriteResult> {
  console.log(`🤖 Generating rules file from feature using template approach...`);

  try {
    // Import template generator
    const { generateRuleTemplate, extractTemplateContextFromFeature } = await import('./ruleTemplateGenerator');
    
    // Generate template structure
    const featurePath = path.join(process.cwd(), 'features', 'benefits', `${feature.id}.feature`);
    const templateContext = extractTemplateContextFromFeature(featurePath, feature.content);
    
    // Merge metadata from feature
    templateContext.legalBasis = feature.metadata.legalBasis || templateContext.legalBasis;
    templateContext.legalUrl = feature.metadata.legalUrl;
    templateContext.authority = feature.metadata.authority;
    templateContext.effectiveDate = feature.metadata.effectiveDate || templateContext.effectiveDate;
    
    const template = generateRuleTemplate(templateContext);
    
    // Read example rules to show business logic patterns
    const exampleRulesPath = path.join(process.cwd(), 'src', 'rules', 'risRules.ts');
    const exampleRules = fs.existsSync(exampleRulesPath)
      ? fs.readFileSync(exampleRulesPath, 'utf-8').substring(0, 3000)
      : '// Example rules pattern';

    const prompt = generateRulesGenerationPromptWithTemplate(feature, template, exampleRules);
    const rawContent = await callClaudeAPI(prompt, config);
    
    // Strip markdown wrappers as safety net
    const rulesContent = stripMarkdownWrapper(rawContent);
    
    const validation = validateRulesContent(
      rulesContent,
      feature.metadata.specificationVersion
    );
    
    // Check version compliance
    const compliance = checkVersionCompliance(feature.id);
    
    return {
      success: validation.isValid,
      benefitId: feature.id,
      componentType: 'rules',
      newContent: validation.isValid ? rulesContent : undefined,
      newVersion: feature.metadata.specificationVersion,
      confidence: validation.confidence,
      requiresHumanReview: true,
      warnings: [
        ...validation.warnings,
        ...(compliance.overallStatus !== 'compliant' ? compliance.issues : []),
      ],
    };
  } catch (error) {
    return {
      success: false,
      benefitId: feature.id,
      componentType: 'rules',
      error: error instanceof Error ? error.message : 'Unknown error',
      confidence: 'low',
      requiresHumanReview: true,
      warnings: ['AI generation failed'],
    };
  }
}

function _generateRulesGenerationPrompt(
  feature: any,
  exampleRules: string
): string {
  return `# Task: Generate TypeScript Rules File from Gherkin Feature

You are an expert TypeScript developer working on a Belgian social benefits system.
Generate a rules implementation file that follows the conversionService.ts patterns.

## Feature Specification
${feature.content}

## Example Rules Pattern (Follow This Structure - RAW TypeScript, NO markdown):
${exampleRules}

## Instructions
1. Create rules file: src/rules/${feature.id}Rules.ts
2. Follow json-rules-engine patterns from example
3. Extract conditions from "Étant donné" steps
4. Extract events from "Quand" steps
5. Extract outcomes from "Alors" steps
6. Add metadata:
   export const ${feature.id.toUpperCase()}_RULES_METADATA = {
     implementsSpecification: '${feature.metadata.specificationVersion}',
     implementationVersion: '${feature.metadata.specificationVersion}',
     implementationStatus: 'complete' as const,
     lastSyncedWith: 'features/benefits/${feature.id}.feature',
     generatedFrom: 'features/benefits/${feature.id}.feature@${feature.metadata.specificationVersion}',
   };

7. Include legal framework references:
   // BASE JURIDIQUE:
   // - ${feature.metadata.legalBasis || 'N/A'}
   //   ${feature.metadata.legalUrl || 'N/A'}

8. Use conversionService.ts patterns:
   - Extract structure
   - Identify concepts
   - Map vocabulary
   - Generate rules

## CRITICAL REQUIREMENTS
- Return RAW TypeScript file content, NO markdown code blocks (\`\`\`typescript or \`\`\`)
- Start directly with: import statements or comments
- TypeScript must compile
- Follow json-rules-engine patterns exactly
- All amounts must match feature file
- Version MUST be: ${feature.metadata.specificationVersion}
- Include proper imports and exports
- Do NOT wrap the content in markdown code blocks

Return ONLY the raw TypeScript file content, no markdown, no explanation.`;
}

/**
 * Generate rules generation prompt with template approach
 * Template provides structure, Claude fills in business logic
 */
function generateRulesGenerationPromptWithTemplate(
  feature: any,
  template: string,
  exampleRules: string
): string {
  return `# Task: Fill in Rule Template with Business Logic from Gherkin Feature

You are an expert TypeScript developer working on a Belgian social benefits system.
You will receive a TEMPLATE with the file structure already defined.
Your task is to FILL IN the business logic based on the Gherkin feature scenarios.

## Gherkin Feature Specification
${feature.content}

## Template Structure (DO NOT CHANGE - Only fill in TODO sections):
${template}

## Example Business Logic (See how rules are implemented):
${exampleRules.substring(0, 2000)}

## Your Task:
1. **Keep the template structure EXACTLY as provided** (imports, metadata, function signatures, exports)
2. **Fill in ONLY the TODO sections** with business logic:
   - Replace "TODO: Claude will generate rules here" with actual engine.addRule() calls
   - Extract conditions from "Étant donné" steps → map to json-rules-engine facts
   - Extract events from "Quand" steps → map to event types
   - Extract outcomes from "Alors" steps → map to event params
   - Implement calculate${feature.id.charAt(0).toUpperCase() + feature.id.slice(1)}Amount() based on scenarios
   - Implement check${feature.id.charAt(0).toUpperCase() + feature.id.slice(1)}Eligibility() facts mapping
   - Populate _RULES_JSON export with actual rules

3. **Follow json-rules-engine patterns**:
   - Use \`conditions.all\` for AND logic
   - Use \`conditions.any\` for OR logic
   - Use appropriate operators: 'equal', 'lessThan', 'greaterThan', etc.
   - Set priority (higher = checked first)
   - Include meaningful event params (reason, amount, etc.)

4. **Match amounts exactly** from Gherkin scenarios

5. **Use proper TypeScript types** from domain/types.ts

## CRITICAL REQUIREMENTS
- Return COMPLETE file content (template + filled business logic)
- NO markdown code blocks (\`\`\`typescript or \`\`\`)
- Start directly with: /** (file header comment)
- TypeScript must compile
- All TODO comments must be replaced with actual implementation
- Version MUST be: ${feature.metadata.specificationVersion}
- Do NOT wrap the content in markdown code blocks

Return ONLY the complete TypeScript file content, no markdown, no explanation.`;
}

/**
 * Generate machine from rules (INITIAL GENERATION)
 * Uses conversionMachine.ts as template
 */
export async function generateMachineFromRules(
  rules: {
    id: string;
    content: string;
    events: string[];
    conditions: any;
  },
  feature: {
    id: string;
    name: string;
  },
  config: ClaudeAPIConfig
): Promise<AIRewriteResult | null> {
  // Determine if machine is needed
  if (!needsWorkflow(rules)) {
    return null; // Skip if no workflow needed
  }

  console.log(`🤖 Generating machine file from rules...`);

  try {
    // Read example machine
    const exampleMachinePath = path.join(process.cwd(), 'src', 'workflows', 'conversionMachine.ts');
    const exampleMachine = fs.existsSync(exampleMachinePath)
      ? fs.readFileSync(exampleMachinePath, 'utf-8').substring(0, 2000)
      : '// Example machine pattern';

    const prompt = generateMachineGenerationPrompt(rules, feature, exampleMachine);
    const rawContent = await callClaudeAPI(prompt, config);
    
    // Strip markdown wrappers as safety net
    const machineContent = stripMarkdownWrapper(rawContent);
    
    const validation = validateMachineContent(machineContent);
    
    return {
      success: validation.isValid,
      benefitId: feature.id,
      componentType: 'machine',
      newContent: validation.isValid ? machineContent : undefined,
      confidence: validation.confidence,
      requiresHumanReview: true,
      warnings: validation.warnings,
    };
  } catch (error) {
    return {
      success: false,
      benefitId: feature.id,
      componentType: 'machine',
      error: error instanceof Error ? error.message : 'Unknown error',
      confidence: 'low',
      requiresHumanReview: true,
      warnings: ['AI generation failed'],
    };
  }
}

function needsWorkflow(rules: any): boolean {
  // Determine if workflow is needed based on:
  // - Multiple rules that need orchestration
  // - User interaction required
  // - Multi-step process
  
  // Simple heuristic: if rules have multiple events or complex conditions
  return rules.events.length > 1 || 
         (rules.conditions && Object.keys(rules.conditions).length > 3);
}

function generateMachineGenerationPrompt(
  rules: any,
  feature: any,
  exampleMachine: string
): string {
  return `# Task: Generate XState Machine from Rules

You are an expert TypeScript/XState developer.
Generate an XState state machine that orchestrates these rules.

## Rules
${rules.content.substring(0, 1500)}

## Feature Context
- Name: ${feature.name}
- ID: ${feature.id}

## Example Machine Pattern (Follow This Structure - RAW TypeScript, NO markdown):
${exampleMachine}

## Instructions
1. Create machine file: src/workflows/${feature.id}Machine.ts
2. Use XState createMachine
3. States should reflect rule evaluation flow
4. Events should match rule events: ${rules.events.join(', ')}
5. Guards should use rule conditions
6. Follow conversionMachine.ts patterns

## CRITICAL REQUIREMENTS
- Return RAW TypeScript file content, NO markdown code blocks (\`\`\`typescript or \`\`\`)
- Start directly with: import statements
- Valid XState machine syntax
- TypeScript must compile
- States must be meaningful
- Events must match rules
- Include proper imports
- Do NOT wrap the content in markdown code blocks

Return ONLY the raw TypeScript file content, no markdown, no explanation.`;
}

function validateMachineContent(content: string): {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
} {
  const warnings: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // Check for XState imports
  if (!content.includes('xstate') && !content.includes('XState')) {
    warnings.push('Missing XState import');
    confidence = 'low';
  }

  // Check for createMachine
  if (!content.includes('createMachine')) {
    warnings.push('Missing createMachine - invalid XState machine');
    return { isValid: false, confidence: 'low', warnings };
  }

  // Check for states
  if (!content.includes('states:')) {
    warnings.push('Missing states definition');
    confidence = 'low';
  }

  return {
    isValid: warnings.filter(w => w.includes('invalid') || w.includes('Missing') && w.includes('XState')).length === 0,
    confidence,
    warnings,
  };
}

function generateFeatureId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit length
}
