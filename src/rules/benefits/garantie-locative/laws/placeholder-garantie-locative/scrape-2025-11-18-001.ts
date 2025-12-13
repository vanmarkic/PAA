/**
 * Business Rules for GarantieLocative
 *
 * Implements eligibility rules for GarantieLocative.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../../../../../domain/types';

/**
 * Create the GarantieLocative eligibility rules engine
 */
function createGarantieLocativeEngine(): Engine {
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
      type: 'garantieLocative-eligible',
      params: {
        message: 'Éligible pour GarantieLocative',
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
      type: 'garantieLocative-ineligible',
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
 * Singleton instance of the GarantieLocative rules engine
 */
const garantieLocativeEngineInstance = createGarantieLocativeEngine();

/**
 * Calculate GarantieLocative amount
 */
export function calculateGarantieLocativeAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check GarantieLocative eligibility
 */
export async function checkGarantieLocativeEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await garantieLocativeEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'garantieLocative-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'garantieLocative-eligible');

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
    throw new Error(`Error checking GarantieLocative eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const GARANTIELOCATIVE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'garantieLocative-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
