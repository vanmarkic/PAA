/**
 * Business Rules for PensionSurvie
 *
 * Implements eligibility rules for PensionSurvie.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the PensionSurvie eligibility rules engine
 */
function createPensionSurvieEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Basic eligibility check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'meetsBasicConditions',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'pensionSurvie-eligible',
      params: {
        message: 'Éligible pour PensionSurvie',
      },
    },
    priority: 5,
  });

  // Rule 2: Ineligibility check
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'meetsBasicConditions',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'pensionSurvie-ineligible',
      params: {
        reason: 'conditions de base non remplies',
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance of the PensionSurvie rules engine
 */
const pensionSurvieEngineInstance = createPensionSurvieEngine();

/**
 * Calculate PensionSurvie amount
 */
export function calculatePensionSurvieAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check PensionSurvie eligibility
 */
export async function checkPensionSurvieEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await pensionSurvieEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'pensionSurvie-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'pensionSurvie-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'housing-allowance', // To be updated with correct type
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      return {
        benefitType: 'housing-allowance', // To be updated with correct type
        isEligible: true,
        calculatedAmount: 0,
      };
    }

    return {
      benefitType: 'housing-allowance', // To be updated with correct type
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking PensionSurvie eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const PENSIONSURVIE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'pensionSurvie-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
