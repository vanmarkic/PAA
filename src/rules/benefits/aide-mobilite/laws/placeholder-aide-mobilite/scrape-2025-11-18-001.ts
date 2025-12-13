/**
 * Business Rules for AideMobilite
 *
 * Implements eligibility rules for AideMobilite.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../../../../../domain/types';

/**
 * Create the AideMobilite eligibility rules engine
 */
function createAideMobiliteEngine(): Engine {
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
      type: 'aideMobilite-eligible',
      params: {
        message: 'Éligible pour AideMobilite',
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
      type: 'aideMobilite-ineligible',
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
 * Singleton instance of the AideMobilite rules engine
 */
const aideMobiliteEngineInstance = createAideMobiliteEngine();

/**
 * Calculate AideMobilite amount
 */
export function calculateAideMobiliteAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check AideMobilite eligibility
 */
export async function checkAideMobiliteEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await aideMobiliteEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'aideMobilite-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'aideMobilite-eligible');

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
    throw new Error(`Error checking AideMobilite eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const AIDEMOBILITE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'aideMobilite-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
