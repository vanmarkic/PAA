/**
 * Business Rules for AccidentTravail
 *
 * Implements eligibility rules for AccidentTravail.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the AccidentTravail eligibility rules engine
 */
function createAccidentTravailEngine(): Engine {
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
      type: 'accidentTravail-eligible',
      params: {
        message: 'Éligible pour AccidentTravail',
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
      type: 'accidentTravail-ineligible',
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
 * Singleton instance of the AccidentTravail rules engine
 */
const accidentTravailEngineInstance = createAccidentTravailEngine();

/**
 * Calculate AccidentTravail amount
 */
export function calculateAccidentTravailAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check AccidentTravail eligibility
 */
export async function checkAccidentTravailEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await accidentTravailEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'accidentTravail-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'accidentTravail-eligible');

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
    throw new Error(`Error checking AccidentTravail eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const ACCIDENTTRAVAIL_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'accidentTravail-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
