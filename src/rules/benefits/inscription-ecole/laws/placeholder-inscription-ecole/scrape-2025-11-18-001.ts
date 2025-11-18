/**
 * Business Rules for InscriptionEcole
 *
 * Implements eligibility rules for InscriptionEcole.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

/**
 * Create the InscriptionEcole eligibility rules engine
 */
function createInscriptionEcoleEngine(): Engine {
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
      type: 'inscriptionEcole-eligible',
      params: {
        message: 'Éligible pour InscriptionEcole',
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
      type: 'inscriptionEcole-ineligible',
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
 * Singleton instance of the InscriptionEcole rules engine
 */
const inscriptionEcoleEngineInstance = createInscriptionEcoleEngine();

/**
 * Calculate InscriptionEcole amount
 */
export function calculateInscriptionEcoleAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check InscriptionEcole eligibility
 */
export async function checkInscriptionEcoleEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await inscriptionEcoleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'inscriptionEcole-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'inscriptionEcole-eligible');

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
    throw new Error(`Error checking InscriptionEcole eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const INSCRIPTIONECOLE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'inscriptionEcole-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
