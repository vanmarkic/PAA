/**
 * Business Rules for EcoCheque
 *
 * Implements eligibility rules for EcoCheque.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../../../../../domain/types';

/**
 * Create the EcoCheque eligibility rules engine
 */
function createEcoChequeEngine(): Engine {
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
      type: 'ecoCheque-eligible',
      params: {
        message: 'Éligible pour EcoCheque',
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
      type: 'ecoCheque-ineligible',
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
 * Singleton instance of the EcoCheque rules engine
 */
const ecoChequeEngineInstance = createEcoChequeEngine();

/**
 * Calculate EcoCheque amount
 */
export function calculateEcoChequeAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check EcoCheque eligibility
 */
export async function checkEcoChequeEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await ecoChequeEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'ecoCheque-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'ecoCheque-eligible');

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
    throw new Error(`Error checking EcoCheque eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const ECOCHEQUE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'ecoCheque-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
