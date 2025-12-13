/**
 * Business Rules for HoraireFlexible
 *
 * Implements eligibility rules for HoraireFlexible.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../../../../../domain/types';

/**
 * Create the HoraireFlexible eligibility rules engine
 */
function createHoraireFlexibleEngine(): Engine {
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
      type: 'horaireFlexible-eligible',
      params: {
        message: 'Éligible pour HoraireFlexible',
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
      type: 'horaireFlexible-ineligible',
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
 * Singleton instance of the HoraireFlexible rules engine
 */
const horaireFlexibleEngineInstance = createHoraireFlexibleEngine();

/**
 * Calculate HoraireFlexible amount
 */
export function calculateHoraireFlexibleAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check HoraireFlexible eligibility
 */
export async function checkHoraireFlexibleEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await horaireFlexibleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'horaireFlexible-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'horaireFlexible-eligible');

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
    throw new Error(`Error checking HoraireFlexible eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const HORAIREFLEXIBLE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'horaireFlexible-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
