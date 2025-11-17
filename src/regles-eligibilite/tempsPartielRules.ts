/**
 * Business Rules for TempsPartiel
 *
 * Implements eligibility rules for TempsPartiel.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

/**
 * Create the TempsPartiel eligibility rules engine
 */
function createTempsPartielEngine(): Engine {
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
      type: 'tempsPartiel-eligible',
      params: {
        message: 'Éligible pour TempsPartiel',
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
      type: 'tempsPartiel-ineligible',
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
 * Singleton instance of the TempsPartiel rules engine
 */
const tempsPartielEngineInstance = createTempsPartielEngine();

/**
 * Calculate TempsPartiel amount
 */
export function calculateTempsPartielAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check TempsPartiel eligibility
 */
export async function checkTempsPartielEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await tempsPartielEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'tempsPartiel-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'tempsPartiel-eligible');

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
    throw new Error(`Error checking TempsPartiel eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const TEMPSPARTIEL_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'tempsPartiel-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
