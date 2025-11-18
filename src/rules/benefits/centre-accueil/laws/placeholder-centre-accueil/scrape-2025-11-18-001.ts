/**
 * Business Rules for CentreAccueil
 *
 * Implements eligibility rules for CentreAccueil.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

/**
 * Create the CentreAccueil eligibility rules engine
 */
function createCentreAccueilEngine(): Engine {
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
      type: 'centreAccueil-eligible',
      params: {
        message: 'Éligible pour CentreAccueil',
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
      type: 'centreAccueil-ineligible',
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
 * Singleton instance of the CentreAccueil rules engine
 */
const centreAccueilEngineInstance = createCentreAccueilEngine();

/**
 * Calculate CentreAccueil amount
 */
export function calculateCentreAccueilAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check CentreAccueil eligibility
 */
export async function checkCentreAccueilEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await centreAccueilEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'centreAccueil-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'centreAccueil-eligible');

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
    throw new Error(`Error checking CentreAccueil eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const CENTREACCUEIL_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'centreAccueil-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
