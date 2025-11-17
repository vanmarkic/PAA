/**
 * Business Rules for CongeMaternite
 *
 * Implements eligibility rules for CongeMaternite.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

/**
 * Create the CongeMaternite eligibility rules engine
 */
function createCongeMaterniteEngine(): Engine {
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
      type: 'congeMaternite-eligible',
      params: {
        message: 'Éligible pour CongeMaternite',
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
      type: 'congeMaternite-ineligible',
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
 * Singleton instance of the CongeMaternite rules engine
 */
const congeMaterniteEngineInstance = createCongeMaterniteEngine();

/**
 * Calculate CongeMaternite amount
 */
export function calculateCongeMaterniteAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check CongeMaternite eligibility
 */
export async function checkCongeMaterniteEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await congeMaterniteEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'congeMaternite-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'congeMaternite-eligible');

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
    throw new Error(`Error checking CongeMaternite eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const CONGEMATERNITE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'congeMaternite-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
