/**
 * Business Rules for AideSansAbri
 *
 * Implements eligibility rules for AideSansAbri.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../../../../../domain/types';

/**
 * Create the AideSansAbri eligibility rules engine
 */
function createAideSansAbriEngine(): Engine {
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
      type: 'aideSansAbri-eligible',
      params: {
        message: 'Éligible pour AideSansAbri',
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
      type: 'aideSansAbri-ineligible',
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
 * Singleton instance of the AideSansAbri rules engine
 */
const aideSansAbriEngineInstance = createAideSansAbriEngine();

/**
 * Calculate AideSansAbri amount
 */
export function calculateAideSansAbriAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check AideSansAbri eligibility
 */
export async function checkAideSansAbriEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await aideSansAbriEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'aideSansAbri-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'aideSansAbri-eligible');

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
    throw new Error(`Error checking AideSansAbri eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const AIDESANSABRI_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'aideSansAbri-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
