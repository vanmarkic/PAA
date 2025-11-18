/**
 * Template-based rule generator
 * 
 * Generates rule file templates that Claude API can fill in with business logic
 * based on Gherkin features.
 */

import * as path from 'path';
import * as fs from 'fs';

export interface RuleTemplateContext {
  featureId: string;
  featureName: string;
  className: string;
  functionName: string;
  legalBasis?: string;
  legalUrl?: string;
  authority?: string;
  specificationVersion: string;
  effectiveDate?: string;
}

/**
 * Generate rule file template structure
 * Claude will fill in the business logic based on the Gherkin feature
 */
export function generateRuleTemplate(context: RuleTemplateContext): string {
  const {
    featureId,
    featureName,
    className,
    functionName,
    legalBasis,
    legalUrl,
    authority,
    specificationVersion,
    effectiveDate,
  } = context;

  const legalBasisSection = legalBasis
    ? ` * BASE JURIDIQUE:
 * - ${legalBasis}
${legalUrl ? ` *   ${legalUrl}` : ''}
${authority ? ` * - Autorité: ${authority}` : ''}
${effectiveDate ? ` * - Dernière modification: ${effectiveDate}` : ''}`
    : ` * BASE JURIDIQUE:
 * - To be completed with specific legal references`;

  return `/**
 * Business Rules for ${featureName}
 *
 * Implements the Gherkin specifications from features/benefits/${featureId}.feature
 * Using json-rules-engine for runtime evaluation.
 *
${legalBasisSection}
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * ${className} Rules Version Metadata
 * This version MUST match the specification version in features/benefits/${featureId}.feature
 */
export const ${featureId.toUpperCase().replace(/-/g, '_')}_RULES_METADATA = {
  implementsSpecification: '${specificationVersion}',
  implementationVersion: '${specificationVersion}',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/${featureId}.feature',
  generatedFrom: 'features/benefits/${featureId}.feature@${specificationVersion}',
  divergences: [] as string[],
  effectiveDate: '${effectiveDate || new Date().toISOString().split('T')[0]}',
};

// Constants from Belgian social law
// TODO: Add specific constants based on legal framework

/**
 * Create the ${className} eligibility rules engine
 * 
 * IMPLEMENTATION NOTES:
 * - Extract conditions from "Étant donné" steps in Gherkin scenarios
 * - Map conditions to json-rules-engine facts
 * - Extract events from "Quand" steps
 * - Extract outcomes from "Alors" steps
 * - Use priority to order rule evaluation (higher = checked first)
 */
function create${className}Engine(): Engine {
  const engine = new Engine();

  // TODO: Claude will generate rules here based on Gherkin scenarios
  // Example structure:
  // engine.addRule({
  //   conditions: {
  //     all: [
  //       {
  //         fact: 'factName',
  //         operator: 'equal',
  //         value: expectedValue,
  //       },
  //     ],
  //   },
  //   event: {
  //     type: '${functionName}-eligible',
  //     params: {
  //       message: 'Éligible pour ${featureName}',
  //     },
  //   },
  //   priority: 10,
  // });

  return engine;
}

/**
 * Singleton instance of the ${className} rules engine
 */
const ${functionName}EngineInstance = create${className}Engine();

/**
 * Calculate ${featureName} amount
 * 
 * TODO: Claude will implement calculation logic based on Gherkin scenarios
 */
export function calculate${className}Amount(
  // Parameters to be defined based on Gherkin scenarios
): number {
  // Calculation logic to be implemented by Claude based on feature scenarios
  return 0;
}

/**
 * Check ${featureName} eligibility
 * 
 * TODO: Claude will implement eligibility check based on Gherkin scenarios
 */
export async function check${className}Eligibility(
  // Parameters to be defined based on Gherkin scenarios
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined by Claude based on Gherkin "Étant donné" steps
  };

  try {
    const results = await ${functionName}EngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === '${functionName}-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === '${functionName}-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: '${featureId}', // TODO: Update with correct BenefitType enum value
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      return {
        benefitType: '${featureId}', // TODO: Update with correct BenefitType enum value
        isEligible: true,
        calculatedAmount: calculate${className}Amount(/* parameters */),
      };
    }

    return {
      benefitType: '${featureId}', // TODO: Update with correct BenefitType enum value
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(\`Error checking ${featureName} eligibility: \${error}\`);
  }
}

/**
 * Export rules in JSON format for transparency
 * 
 * TODO: Claude will populate this based on generated rules
 */
export const ${featureId.toUpperCase().replace(/-/g, '_')}_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    // Rules to be populated by Claude based on Gherkin scenarios
  ],
};
`;
}

/**
 * Extract template context from feature file
 */
export function extractTemplateContextFromFeature(
  featurePath: string,
  featureContent: string
): RuleTemplateContext {
  // Extract feature name from Gherkin
  const featureMatch = featureContent.match(/Fonctionnalité:\s*(.+)/);
  const featureName = featureMatch ? featureMatch[1].trim() : 'Unknown Benefit';

  // Extract feature ID from file path
  const featureId = path.basename(featurePath, '.feature');

  // Generate class and function names
  const className = featureId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');

  const functionName = featureId
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');

  // Extract version from metadata if present
  const versionMatch = featureContent.match(/@version\s+(\S+)/);
  const specificationVersion = versionMatch ? versionMatch[1] : '1.0.0';

  // Extract legal basis if present in comments
  const legalBasisMatch = featureContent.match(/BASE JURIDIQUE[:\s]*(.+?)(?:\n|$)/i);
  const legalBasis = legalBasisMatch ? legalBasisMatch[1].trim() : undefined;

  return {
    featureId,
    featureName,
    className,
    functionName,
    legalBasis,
    specificationVersion,
  };
}

